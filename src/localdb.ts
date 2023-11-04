import Dexie, { Table } from "dexie";
import type {
  GroupedLetter,
  LocalArtist,
  LocalDatabase,
  LocalLetter,
  LocalRecentObject,
  LocalSong,
  SongDatabase,
  SongDbListItem,
} from "./types";
import _, { trim } from "lodash";
import {
  compileSearchCriteria,
  getFirstLetter,
  localeSortByKey,
  matchMandatorySearchCriteria,
  matchSearchCriteria,
  removeDiacritics,
  removeHtmlTags,
} from "./utils";
import { removeChords } from "./chordTools";

class LocalDb extends Dexie {
  public songs!: Table<LocalSong, string>;
  public databases!: Table<LocalDatabase, string>;
  public artists!: Table<LocalArtist, string>;
  public recents!: Table<LocalRecentObject, string>;
  public letters!: Table<LocalLetter, string>;

  public constructor() {
    super("LocalDb");

    this.version(1).stores({
      songs: "id,artistId,databaseId,*words",
      databases: "id,isActive",
      artists: "id,artistId,databaseId,letterId,*words",
      recents: "id",
      letters: "id,letter,databaseId",
    });
  }
}

const locdb = new LocalDb();

if (localStorage.getItem("deleteLocalDatabase") == "songiapp") {
  window.indexedDB.deleteDatabase("songiapp");
  localStorage.removeItem("deleteLocalDatabase");
  document.location.reload();
}

// async function recomputeLetters() {
//   await locdb.letters.clear();
//   const artists = await locdb.artists.where({ isActive: 1 }).toArray();

//   const grouped = _.groupBy(artists, (x) => x.letter);
//   await locdb.letters.bulkAdd(
//     _.keys(grouped).map((letter) => ({
//       letter,
//       artistCount: grouped[letter].length,
//     }))
//   );
// }

function getSongWords(...texts: string[]): string[] {
  const res = new Set<string>();

  for (const text of texts) {
    for (const word of removeDiacritics(
      removeHtmlTags(removeChords(String(text ?? "")))
    )
      .toLocaleLowerCase()
      .split(/[\s\-\(\)\.\,\;\!\?\"\'\/\+\*\&]/)) {
      const trimmed = word.replace(/[^a-z0-9]/g, "").trim();
      if (trimmed) {
        res.add(trimmed);
      }
    }
  }

  return [...res];
}

export async function saveSongDb(db: SongDbListItem, data: SongDatabase) {
  await locdb.transaction(
    "rw",
    locdb.songs,
    locdb.artists,
    locdb.databases,
    locdb.letters,
    () => {
      const artistMap = _.keyBy(data.artists, (x) => x.id);

      locdb.songs.bulkAdd(
        _.uniqBy(
          data.songs.map((song) => ({
            ...song,
            artistName: artistMap[song.artistId]?.name ?? song.artistId,
            databaseId: db.id,
            id: `${db.id}-${song.id}`,
            artistId: `${db.id}-${song.artistId}`,
            isActive: 1,
            words: getSongWords(song.title, song.text),
          })),
          "id"
        )
      );

      const artists = _.uniqBy(
        data.artists.map((artist) => ({
          ...artist,
          id: `${db.id}-${artist.id}`,
          databaseId: db.id,
          databaseTitle: db.title,
          songCount: data.songs.filter((x) => x.artistId == artist.id).length,
          isActive: 1,
          letter: getFirstLetter(artist.name),
          letterId: `${db.id}-${getFirstLetter(artist.name)}`,
          words: getSongWords(artist.name),
        })),
        "id"
      );

      locdb.artists.bulkAdd(artists);

      locdb.databases.add({
        ...db,
        isActive: 1,
        songCount: data.songs.length,
        artistCount: data.artists.length,
      });

      const artistsByLetters = _.groupBy(artists, (x) => x.letter);

      locdb.letters.bulkAdd(
        _.keys(artistsByLetters).map((letter) => ({
          id: `${db.id}-${letter}`,
          databaseId: db.id,
          letter,
          artistCount: artistsByLetters[letter].length,
        }))
      );
    }
  );

  // await recomputeLetters();
}

export async function deleteSongDb(db: SongDbListItem) {
  await locdb.transaction(
    "rw",
    locdb.songs,
    locdb.artists,
    locdb.databases,
    locdb.letters,
    () => {
      locdb.songs.where({ databaseId: db.id }).delete();
      locdb.artists.where({ databaseId: db.id }).delete();
      locdb.databases.where({ id: db.id }).delete();
      locdb.letters.where({ databaseId: db.id }).delete();
    }
  );

  //   await recomputeLetters();
}

export async function findArtists(): Promise<LocalArtist[]> {
  const activeDbs = await getActiveDatabaseIds();

  return localeSortByKey(
    await locdb.artists.where("databaseId").anyOf(activeDbs).toArray(),
    "name"
  );
}

export async function findActiveLetters(): Promise<GroupedLetter[]> {
  const activeDbs = await getActiveDatabaseIds();

  const allLetters = await locdb.letters
    .where("databaseId")
    .anyOf(activeDbs)
    .toArray();

  const groupedLetters = _.groupBy(allLetters, (x) => x.letter);

  return _.sortBy(
    Object.entries(groupedLetters).map(([k, v]) => ({
      letter: k,
      artistCount: _.sumBy(v, (x) => x.artistCount),
      // letterIds: v.map((x) => x.id),
    })),
    "letter"
  );
}

export async function findArtistsByLetter(
  letter: string
): Promise<LocalArtist[]> {
  const activeDbs = await getActiveDatabaseIds();

  return localeSortByKey(
    await locdb.artists
      .where("letterId")
      .anyOf(activeDbs.map((db) => `${db}-${letter}`))
      .toArray(),
    "name"
  );
}

export async function findDatabases(): Promise<LocalDatabase[]> {
  return localeSortByKey(await locdb.databases.toArray(), "title");
}

export async function getActiveDatabaseIds(): Promise<string[]> {
  return (await locdb.databases.where({ isActive: 1 }).toArray()).map(
    (x) => x.id
  );
}

export async function findSongsByArtist(
  artistId: string
): Promise<LocalSong[]> {
  return localeSortByKey(
    await locdb.songs.where({ artistId }).toArray(),
    "title"
  );
}

export async function getSong(songid: string): Promise<LocalSong | undefined> {
  return locdb.songs.get(songid);
}

export async function getArtist(
  artistid: string
): Promise<LocalArtist | undefined> {
  return locdb.artists.get(artistid);
}

export async function setLocalDbActive(dbid: string, isActive: boolean) {
  await locdb.databases
    .where({ id: dbid })
    .modify({ isActive: isActive ? 1 : 0 });
  // await locdb.transaction('rw', locdb.songs, locdb.artists, locdb.databases,()=>{
  //   locdb.songs.where({databaseId})

  // })
  // const tx = (await localDbPromise).transaction(
  //   ["databases", "songs", "artists"],
  //   "readwrite"
  // );
  // const db = await tx.objectStore("databases").get(dbid);
  // if (!db) {
  //   await tx?.done;
  //   return;
  // }
  // db.isActive = isActive ? 1 : 0;
  // await tx.objectStore("databases").put(db);
  // let cursorSongs = await tx
  //   .objectStore("songs")
  //   .index("by-databaseId")
  //   .openCursor(dbid);
  // while (cursorSongs) {
  //   tx.objectStore("songs").put({
  //     ...cursorSongs.value,
  //     isActive: isActive ? 1 : 0,
  //   });
  //   cursorSongs = await cursorSongs.continue();
  // }
  // let cursorArtists = await tx
  //   .objectStore("artists")
  //   .index("by-databaseId")
  //   .openCursor(dbid);
  // while (cursorArtists) {
  //   tx.objectStore("artists").put({
  //     ...cursorArtists.value,
  //     isActive: isActive ? 1 : 0,
  //     letter: isActive ? getFirstLetter(cursorArtists.value.name) : null,
  //   });
  //   cursorArtists = await cursorArtists.continue();
  // }
  // await tx?.done;
  // await recomputeLetters();
}

async function deleteOldRecents() {
  // const count = await tx.objectStore("recents").count();
  // if (count > 100) {
  //   const all = _.sortBy(
  //     await tx.objectStore("recents").getAll(),
  //     (x) => x.date
  //   );
  //   for (const item of all.slice(0, -100)) {
  //     await tx.objectStore("recents").delete(item.id);
  //   }
  // }
}

export async function addRecentSong(song: LocalSong) {
  // const tx = (await localDbPromise).transaction("recents", "readwrite");
  // await tx.objectStore("recents").put({
  //   type: "song",
  //   date: new Date(),
  //   id: `song:${song.id}`,
  //   song,
  // });
  // await deleteOldRecents(tx);
  // await tx?.done;
}

export async function addRecentArtist(artist: LocalArtist) {
  // const tx = (await localDbPromise).transaction("recents", "readwrite");
  // await tx.objectStore("recents").put({
  //   type: "artist",
  //   date: new Date(),
  //   id: `artist:${artist.name}`,
  //   artist,
  // });
  // await deleteOldRecents(tx);
  // await tx?.done;
}

export async function findAllRecents(): Promise<LocalRecentObject[]> {
  // const tx = (await localDbPromise).transaction("recents", "readonly");
  // const res = await tx.objectStore("recents").getAll();
  // await tx?.done;
  // const sorted = _.sortBy(res, (x) => x.date);
  // sorted.reverse();
  // return sorted;
  return [];
}
export interface LocalDbSearchResult {
  artists: LocalArtist[];
  songs: LocalSong[];
  searchDone: boolean;
}

export async function searchLocalDb(
  criteria: string
): Promise<LocalDbSearchResult> {
  // const tx = (await localDbPromise).transaction(
  //   ["songs", "artists"],
  //   "readonly"
  // );

  const tokens = compileSearchCriteria(criteria);

  if (!tokens.length) {
    return {
      searchDone: false,
      songs: [],
      artists: [],
    };
  }

  const activeDbs = await getActiveDatabaseIds();

  const songs = await locdb.songs
    .where("words")
    .startsWith(_.maxBy(tokens, (x) => x.length)!)
    .filter(
      (song) =>
        activeDbs.includes(song.databaseId) &&
        tokens.every((token) =>
          song.words.find((word) => word.startsWith(token))
        )
    )
    .distinct()
    .limit(100)
    .toArray();

  const artists = await locdb.artists
    .where("words")
    .startsWith(_.maxBy(tokens, (x) => x.length)!)
    .filter(
      (artist) =>
        activeDbs.includes(artist.databaseId) &&
        tokens.every((token) =>
          artist.words.find((word) => word.startsWith(token))
        )
    )
    .distinct()
    .limit(100)
    .toArray();

  return {
    searchDone: true,
    songs,
    artists,
  };

  // let artistCursor = await tx
  //   .objectStore("artists")
  //   .index("by-isActive")
  //   .openCursor(1);

  // while (artistCursor) {
  //   if (matchSearchCriteria(artistCursor.value.name, tokens)) {
  //     artists.push(artistCursor.value);
  //   }

  //   artistCursor = await artistCursor.continue();
  // }

  // let songsCursor = await tx
  //   .objectStore("songs")
  //   .index("by-isActive")
  //   .openCursor(1);

  // while (songsCursor) {
  //   if (
  //     matchMandatorySearchCriteria(
  //       songsCursor.value.title,
  //       songsCursor.value.artistName,
  //       tokens
  //     )
  //   ) {
  //     songsByTitle.push(songsCursor.value);
  //   } else if (
  //     matchMandatorySearchCriteria(
  //       removeChords(String(songsCursor.value.text)),
  //       songsCursor.value.artistName,
  //       tokens
  //     )
  //   ) {
  //     songsByText.push(songsCursor.value);
  //   }

  //   songsCursor = await songsCursor.continue();
  // }

  // await tx?.done;

  // return {
  //   searchDone: true,
  //   songs: [
  //     ...localeSortByKey(songsByTitle, "title"),
  //     ...localeSortByKey(songsByText, "title"),
  //   ],
  //   artists,
  // };
}
