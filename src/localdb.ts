import { openDB, deleteDB, wrap, unwrap, DBSchema } from "idb";
import type {
  LocalArtist,
  LocalSong,
  SongDatabase,
  SongDbListItem,
} from "./types";
import _ from "lodash";

interface LocalDb extends DBSchema {
  songs: {
    key: string;
    value: LocalSong;
    indexes: { "by-artist": string };
  };
  databases: {
    key: string;
    value: SongDbListItem;
  };
}

const localDbPromise = openDB<LocalDb>("songiapp", 1, {
  upgrade(db, oldVersion, newVersion, transaction, event) {
    if (oldVersion < 1) {
      const songStore = db.createObjectStore("songs", { keyPath: "id" });
      db.createObjectStore("databases", { keyPath: "id" });
      songStore.createIndex("by-artist", "artist", { multiEntry: true });
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
      id: `${db.id}/${song.id}`,
    });
  }

  const storeDatabases = tx?.objectStore("databases");
  storeDatabases?.put?.(db);
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

  let cursor = await tx.objectStore("songs").openCursor();

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
  return _.sortBy(_.values(res), (x) => x.name);
}

export async function findDatabases(): Promise<SongDbListItem[]> {
  const tx = (await localDbPromise).transaction("databases", "readonly");

  const res = await tx.objectStore("databases").getAll();

  await tx?.done;
  return res;
}
