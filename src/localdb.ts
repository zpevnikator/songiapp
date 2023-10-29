import { openDB, deleteDB, wrap, unwrap, DBSchema, IDBPTransaction } from "idb";
import type {
  LocalArtist,
  LocalDatabase,
  LocalRecentObject,
  LocalSong,
  SongDatabase,
  SongDbListItem,
} from "./types";
import _ from "lodash";
import {
  compileSearchCriteria,
  localeSortByKey,
  matchMandatorySearchCriteria,
  matchSearchCriteria,
} from "./utils";
import { removeChords } from "./chordTools";

interface LocalDb extends DBSchema {
  songs: {
    key: string;
    value: LocalSong;
    indexes: {
      "by-artist": string;
      "by-databaseId": string;
      "by-isActive": number;
    };
  };
  databases: {
    key: string;
    value: LocalDatabase;
  };
  artists: {
    key: string;
    value: LocalArtist;
    indexes: {
      "by-databaseId": string;
      "by-isActive": number;
    };
  };
  recents: {
    key: string;
    value: LocalRecentObject;
  };
}

const localDbPromise = openDB<LocalDb>("songiapp", 5, {
  upgrade(db, oldVersion, newVersion, transaction, event) {
    if (oldVersion < 5) {
      db.deleteObjectStore("songs");
      db.deleteObjectStore("databases");
      db.deleteObjectStore("recents");
    }

    if (oldVersion < 5) {
      const songStore = db.createObjectStore("songs", { keyPath: "id" });
      songStore.createIndex("by-artist", "artistId");
      songStore.createIndex("by-databaseId", "databaseId");
      songStore.createIndex("by-isActive", "isActive");

      db.createObjectStore("databases", { keyPath: "id" });

      db.createObjectStore("recents", { keyPath: "id" });

      const artistStore = db.createObjectStore("artists", { keyPath: "id" });
      artistStore.createIndex("by-databaseId", "databaseId");
      artistStore.createIndex("by-isActive", "isActive");
    }
  },
  blocked(currentVersion, blockedVersion, event) {
    // …
  },
  blocking(currentVersion, blockedVersion, event) {
    // …
  },
  terminated() {
    // …
  },
});

// async function getSongsTransaction(mode: "readonly" | "readwrite") {
//   if (!localDbPromise) return null;
//   const tx = (await localDbPromise).transaction("songs", mode);
//   return tx;
// }

// async function getDatabasesTransaction(mode: "readonly" | "readwrite") {
//   if (!localDbPromise) return null;
//   const tx = (await localDbPromise).transaction("databases", mode);
//   return tx;
// }

export async function saveSongDb(db: SongDbListItem, data: SongDatabase) {
  const tx = (await localDbPromise).transaction(
    ["songs", "databases", "artists"],
    "readwrite"
  );

  const artistMap = _.keyBy(data.artists, (x) => x.id);

  const storeSongs = tx?.objectStore("songs");
  for (const song of data.songs) {
    await storeSongs?.put?.({
      ...song,
      artistName: artistMap[song.artistId]?.name ?? song.artistId,
      databaseId: db.id,
      id: `${db.id}-${song.id}`,
      artistId: `${db.id}-${song.artistId}`,
      isActive: 1,
    });
  }

  const storeArtists = tx?.objectStore("artists");
  for (const artist of data.artists) {
    await storeArtists?.put?.({
      ...artist,
      id: `${db.id}-${artist.id}`,
      databaseId: db.id,
      databaseTitle: db.title,
      songCount: data.songs.filter((x) => x.artistId == artist.id).length,
      isActive: 1,
    });
  }

  const storeDatabases = tx?.objectStore("databases");
  storeDatabases?.put?.({
    ...db,
    isActive: true,
    songCount: data.songs.length,
    artistCount: data.artists.length,
  });
  await tx?.done;
}

export async function deleteSongDb(db: SongDbListItem) {
  const tx = (await localDbPromise).transaction(
    ["songs", "databases", "artists"],
    "readwrite"
  );

  const songStore = tx.objectStore("songs");
  const deletedSongs = await songStore.index("by-databaseId").getAllKeys(db.id);
  for (const key of deletedSongs) {
    await songStore.delete(key);
  }

  const artistStore = tx.objectStore("artists");
  const deletedArtists = await artistStore
    .index("by-databaseId")
    .getAllKeys(db.id);
  for (const key of deletedArtists) {
    await artistStore.delete(key);
  }

  await tx.objectStore("databases").delete(db.id);

  await tx?.done;
}

export async function findArtists(): Promise<LocalArtist[]> {
  const tx = (await localDbPromise).transaction("artists", "readonly");

  const res = await tx.objectStore("artists").index("by-isActive").getAll(1);

  await tx?.done;
  return localeSortByKey(res, "name");
}

export async function findDatabases(): Promise<LocalDatabase[]> {
  const tx = (await localDbPromise).transaction("databases", "readonly");

  const res = await tx.objectStore("databases").getAll();

  await tx?.done;
  return res;
}

// export async function getActiveDatabaseIds(): Promise<string[]> {
//   const dbs = await findDatabases();
//   return dbs.filter((x) => x.isActive).map((x) => x.id);
// }

export async function findSongsByArtist(
  artistId: string
): Promise<LocalSong[]> {
  const tx = (await localDbPromise).transaction("songs", "readonly");

  const res = await tx.objectStore("songs").index("by-artist").getAll(artistId);

  await tx?.done;
  return localeSortByKey(res, "title");
}

export async function getSong(songid: string): Promise<LocalSong | undefined> {
  const tx = (await localDbPromise).transaction("songs", "readonly");

  const res = await tx.objectStore("songs").get(songid);

  await tx?.done;
  return res;
}

export async function getArtist(artistid: string): Promise<LocalArtist | undefined> {
  const tx = (await localDbPromise).transaction("artists", "readonly");

  const res = await tx.objectStore("artists").get(artistid);

  await tx?.done;
  return res;
}

export async function setLocalDbActive(dbid: string, isActive: boolean) {
  const tx = (await localDbPromise).transaction(
    ["databases", "songs", "artists"],
    "readwrite"
  );

  const db = await tx.objectStore("databases").get(dbid);

  if (!db) {
    await tx?.done;
    return;
  }

  db.isActive = isActive;
  await tx.objectStore("databases").put(db);

  let cursorSongs = await tx
    .objectStore("songs")
    .index("by-databaseId")
    .openCursor(dbid);

  while (cursorSongs) {
    tx.objectStore("songs").put({
      ...cursorSongs.value,
      isActive: isActive ? 1 : 0,
    });

    cursorSongs = await cursorSongs.continue();
  }

  let cursorArtists = await tx
    .objectStore("artists")
    .index("by-databaseId")
    .openCursor(dbid);

  while (cursorArtists) {
    tx.objectStore("artists").put({
      ...cursorArtists.value,
      isActive: isActive ? 1 : 0,
    });

    cursorArtists = await cursorArtists.continue();
  }

  await tx?.done;
}

async function deleteOldRecents(
  tx: IDBPTransaction<LocalDb, ["recents"], "readwrite">
) {
  const count = await tx.objectStore("recents").count();
  if (count > 100) {
    const all = _.sortBy(
      await tx.objectStore("recents").getAll(),
      (x) => x.date
    );
    for (const item of all.slice(0, -100)) {
      await tx.objectStore("recents").delete(item.id);
    }
  }
}

export async function addRecentSong(song: LocalSong) {
  const tx = (await localDbPromise).transaction("recents", "readwrite");

  await tx.objectStore("recents").put({
    type: "song",
    date: new Date(),
    id: `song:${song.id}`,
    song,
  });

  await deleteOldRecents(tx);

  await tx?.done;
}

export async function addRecentArtist(artist: LocalArtist) {
  const tx = (await localDbPromise).transaction("recents", "readwrite");

  await tx.objectStore("recents").put({
    type: "artist",
    date: new Date(),
    id: `artist:${artist.name}`,
    artist,
  });

  await deleteOldRecents(tx);

  await tx?.done;
}

export async function findAllRecents(): Promise<LocalRecentObject[]> {
  const tx = (await localDbPromise).transaction("recents", "readonly");
  const res = await tx.objectStore("recents").getAll();
  await tx?.done;
  const sorted = _.sortBy(res, (x) => x.date);
  sorted.reverse();
  return sorted;
}
export interface LocalDbSearchResult {
  artists: LocalArtist[];
  songs: LocalSong[];
  searchDone: boolean;
}

export async function searchLocalDb(
  criteria: string
): Promise<LocalDbSearchResult> {
  const tx = (await localDbPromise).transaction(
    ["songs", "artists"],
    "readonly"
  );

  const songsByTitle: LocalSong[] = [];
  const songsByText: LocalSong[] = [];
  const artists: LocalArtist[] = [];

  const tokens = compileSearchCriteria(criteria);

  if (!tokens.length) {
    return {
      searchDone: false,
      songs: [],
      artists: [],
    };
  }

  let artistCursor = await tx
    .objectStore("artists")
    .index("by-isActive")
    .openCursor(1);

  while (artistCursor) {
    if (matchSearchCriteria(artistCursor.value.name, tokens)) {
      artists.push(artistCursor.value);
    }

    artistCursor = await artistCursor.continue();
  }

  let songsCursor = await tx
    .objectStore("songs")
    .index("by-isActive")
    .openCursor(1);

  while (songsCursor) {
    if (
      matchMandatorySearchCriteria(
        songsCursor.value.title,
        songsCursor.value.artistName,
        tokens
      )
    ) {
      songsByTitle.push(songsCursor.value);
    } else if (
      matchMandatorySearchCriteria(
        removeChords(String(songsCursor.value.text)),
        songsCursor.value.artistName,
        tokens
      )
    ) {
      songsByText.push(songsCursor.value);
    }

    songsCursor = await songsCursor.continue();
  }

  await tx?.done;

  return {
    searchDone: true,
    songs: [
      ...localeSortByKey(songsByTitle, "title"),
      ...localeSortByKey(songsByText, "title"),
    ],
    artists,
  };
}
