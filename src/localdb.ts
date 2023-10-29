import { openDB, deleteDB, wrap, unwrap, DBSchema } from "idb";
import type {
  LocalArtist,
  LocalDatabase,
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
}

const localDbPromise = openDB<LocalDb>("songiapp", 3, {
  upgrade(db, oldVersion, newVersion, transaction, event) {
    if (oldVersion < 1) {
      const songStore = db.createObjectStore("songs", { keyPath: "id" });
      db.createObjectStore("databases", { keyPath: "id" });
      songStore.createIndex("by-artist", "artist", { multiEntry: true });
    }
    if (oldVersion < 2) {
      const songStore = transaction.objectStore("songs");
      songStore.createIndex("by-databaseId", "databaseId");
    }
    if (oldVersion < 3) {
      const songStore = transaction.objectStore("songs");
      songStore.createIndex("by-isActive", "isActive");
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
    ["songs", "databases"],
    "readwrite"
  );

  const storeSongs = tx?.objectStore("songs");
  for (const song of data.songs) {
    await storeSongs?.put?.({
      ...song,
      artist: Array.isArray(song.artist) ? song.artist : [song.artist],
      databaseId: db.id,
      id: `${db.id}-${song.id}`,
      isActive: 1,
    });
  }

  const storeDatabases = tx?.objectStore("databases");
  storeDatabases?.put?.({
    ...db,
    isActive: true,
    size: data.songs.length.toString(),
  });
  await tx?.done;
}

export async function deleteSongDb(db: SongDbListItem) {
  const tx = (await localDbPromise).transaction(
    ["songs", "databases"],
    "readwrite"
  );

  const deletedSongs: string[] = [];
  const songStore = tx.objectStore("songs");
  let cursor = await songStore.openCursor();
  while (cursor) {
    if (cursor.value.databaseId == db.id) {
      deletedSongs.push(cursor.key);
    }
    cursor = await cursor.continue();
  }

  for (const key of deletedSongs) {
    await songStore.delete(key);
  }

  await tx.objectStore("databases").delete(db.id);

  await tx?.done;
}

export async function findArtists(): Promise<LocalArtist[]> {
  const tx = (await localDbPromise).transaction("songs", "readonly");

  let cursor = await tx.objectStore("songs").index("by-isActive").openCursor(1);

  const res: Record<string, LocalArtist> = {};

  while (cursor) {
    for (const artist of cursor.value.artist) {
      if (!res[artist]) {
        res[artist] = {
          name: artist,
          songCount: 0,
        };
      }
      res[artist].songCount += 1;
    }
    cursor = await cursor.continue();
  }

  await tx?.done;
  return localeSortByKey(_.values(res), "name");
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

export async function findSongsByArtist(artist: string): Promise<LocalSong[]> {
  const tx = (await localDbPromise).transaction("songs", "readonly");

  const res = await tx.objectStore("songs").index("by-artist").getAll(artist);

  await tx?.done;
  return localeSortByKey(
    res.filter((x) => x.isActive),
    "title"
  );
}

export async function getSong(songid: string): Promise<LocalSong | undefined> {
  const tx = (await localDbPromise).transaction("songs", "readonly");

  const res = await tx.objectStore("songs").get(songid);

  await tx?.done;
  return res;
}

export async function setLocalDbActive(dbid: string, isActive: boolean) {
  const tx = (await localDbPromise).transaction(
    ["databases", "songs"],
    "readwrite"
  );

  const db = await tx.objectStore("databases").get(dbid);

  if (!db) {
    await tx?.done;
    return;
  }

  db.isActive = isActive;
  await tx.objectStore("databases").put(db);

  let cursor = await tx
    .objectStore("songs")
    .index("by-databaseId")
    .openCursor(dbid);

  while (cursor) {
    tx.objectStore("songs").put({
      ...cursor.value,
      isActive: isActive ? 1 : 0,
    });

    cursor = await cursor.continue();
  }

  await tx?.done;
}

export interface LocalDbSearchResult {
  artists: LocalArtist[];
  songs: LocalSong[];
  searchDone: boolean;
}

export async function searchLocalDb(
  criteria: string
): Promise<LocalDbSearchResult> {
  const tx = (await localDbPromise).transaction("songs", "readonly");

  let cursor = await tx.objectStore("songs").index("by-isActive").openCursor(1);

  const songsByTitle: LocalSong[] = [];
  const songsByText: LocalSong[] = [];

  const tokens = compileSearchCriteria(criteria);

  if (!tokens.length) {
    return {
      searchDone: false,
      songs: [],
      artists: [],
    };
  }

  const artistDict: Record<string, LocalArtist> = {};

  while (cursor) {
    for (const artist of cursor.value.artist) {
      if (!matchSearchCriteria(artist, tokens)) {
        continue;
      }
      if (!artistDict[artist]) {
        artistDict[artist] = {
          name: artist,
          songCount: 0,
        };
      }
      artistDict[artist].songCount += 1;
    }

    if (
      matchMandatorySearchCriteria(
        cursor.value.title,
        (cursor.value.artist ?? []).join(" "),
        tokens
      )
    ) {
      songsByTitle.push(cursor.value);
    } else if (
      matchMandatorySearchCriteria(
        removeChords(String(cursor.value.text)),
        (cursor.value.artist ?? []).join(" "),
        tokens
      )
    ) {
      songsByText.push(cursor.value);
    }

    cursor = await cursor.continue();
  }

  await tx?.done;

  return {
    searchDone: true,
    songs: [
      ...localeSortByKey(songsByTitle, "title"),
      ...localeSortByKey(songsByText, "title"),
    ],
    artists: _.sortBy(_.values(artistDict), (x) => -x.songCount),
  };
}
