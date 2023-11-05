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
import _ from "lodash";
import {
  getFirstLetter,
  localeSortByKey,
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

    this.version(2).stores({
      songs: "id,artistId,databaseId,*titleWords,*textWords",
      databases: "id,isActive",
      artists: "id,artistId,databaseId,letterId,*nameWords",
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

function tokenize(...texts: string[]): string[] {
  const res = new Set<string>();

  for (const text of texts) {
    for (const word of removeDiacritics(
      removeHtmlTags(removeChords(String(text ?? "")))
    )
      .toLocaleLowerCase()
      .split(/[\s\-\(\)\.\,\;\!\?\"\'\/\+\*\&]/)) {
      const trimmed = word.replace(/[^a-z]/g, "").trim();
      if (trimmed.length >= 2) {
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
            databaseTitle: db.title,
            id: `${db.id}-${song.id}`,
            artistId: `${db.id}-${song.artistId}`,
            isActive: 1,
            textWords: tokenize(song.text),
            titleWords: tokenize(song.text),
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
          nameWords: tokenize(artist.name),
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
}

export async function findArtists(dbid?: string): Promise<LocalArtist[]> {
  const activeDbs = dbid ? [dbid] : await getActiveDatabaseIds();

  return localeSortByKey(
    await locdb.artists.where("databaseId").anyOf(activeDbs).toArray(),
    "name"
  );
}

export async function findActiveLetters(
  dbid?: string
): Promise<GroupedLetter[]> {
  const activeDbs = dbid ? [dbid] : await getActiveDatabaseIds();

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
  letter: string,
  dbid?: string
): Promise<LocalArtist[]> {
  const activeDbs = dbid ? [dbid] : await getActiveDatabaseIds();

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

export async function getDatabase(
  dbid: string
): Promise<LocalDatabase | undefined> {
  return locdb.databases.get(dbid);
}

export async function setLocalDbActive(dbid: string, isActive: boolean) {
  await locdb.databases
    .where({ id: dbid })
    .modify({ isActive: isActive ? 1 : 0 });
}

async function deleteOldRecents() {
  const count = await locdb.recents.count();
  if (count > 100) {
    const all = _.sortBy(await locdb.recents.toArray(), (x) => x.date);
    await locdb.recents.bulkDelete(all.slice(0, -100).map((x) => x.id));
  }
}

export async function addRecentSong(song: LocalSong) {
  await locdb.recents.put({
    type: "song",
    date: new Date(),
    id: `song:${song.id}`,
    song,
  });
  await deleteOldRecents();
}

export async function addRecentArtist(artist: LocalArtist) {
  await locdb.recents.put({
    type: "artist",
    date: new Date(),
    id: `artist:${artist.name}`,
    artist,
  });
  await deleteOldRecents();
}

export async function findAllRecents(): Promise<LocalRecentObject[]> {
  const res = await locdb.recents.toArray();
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
  const tokens = tokenize(criteria);

  const LIMIT = 100;

  if (!tokens.length) {
    return {
      searchDone: false,
      songs: [],
      artists: [],
    };
  }

  const activeDbs = await getActiveDatabaseIds();

  const artists = await locdb.artists
    .where("nameWords")
    .startsWith(_.maxBy(tokens, (x) => x.length)!)
    .filter(
      (artist) =>
        activeDbs.includes(artist.databaseId) &&
        tokens.every((token) =>
          artist.nameWords.find((word) => word.startsWith(token))
        )
    )
    .distinct()
    .limit(LIMIT)
    .toArray();

  if (artists.length >= LIMIT) {
    return {
      searchDone: true,
      songs: [],
      artists,
    };
  }

  const songsByTitle = await locdb.songs
    .where("titleWords")
    .startsWith(_.maxBy(tokens, (x) => x.length)!)
    .filter(
      (song) =>
        activeDbs.includes(song.databaseId) &&
        tokens.every((token) =>
          song.titleWords.find((word) => word.startsWith(token))
        )
    )
    .distinct()
    .limit(LIMIT - artists.length)
    .toArray();

  if (artists.length + songsByTitle.length >= LIMIT) {
    return {
      searchDone: true,
      songs: songsByTitle,
      artists,
    };
  }

  const songsByText = await locdb.songs
    .where("textWords")
    .startsWith(_.maxBy(tokens, (x) => x.length)!)
    .filter(
      (song) =>
        activeDbs.includes(song.databaseId) &&
        tokens.every(
          (token) =>
            song.titleWords.find((word) => word.startsWith(token)) ||
            song.textWords.find((word) => word.startsWith(token))
        )
    )
    .distinct()
    .limit(LIMIT - artists.length - songsByTitle.length)
    .toArray();

  return {
    searchDone: true,
    songs: [
      ...localeSortByKey(songsByTitle, "title"),
      ...localeSortByKey(songsByText, "title"),
    ],
    artists: localeSortByKey(artists, "name"),
  };
}
