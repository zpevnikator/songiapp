export interface SongDbListItem {
  id: string;
  title: string;
  description: string;
  size: string;
  url: string;
}

export interface LocalDatabase extends SongDbListItem {
  isActive?: number;
  songCount: number;
  artistCount: number;
}

export interface SongDbList {
  databases: SongDbListItem[];
}

export interface SongDatabase {
  songs: {
    title: string;
    artist: string;
    lang: string;
    text: string;
  }[];
}

export interface LocalSong {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  lang: string;
  text: string;
  databaseId: string;
  databaseTitle: string;
  titleWords: string[];
  textWords: string[];
}

export interface LocalArtist {
  id: string;
  name: string;
  songCount: number;
  databaseId: string;
  databaseTitle: string;
  letter: string;
  letterId: string;
  nameWords: string[];
}

export interface LocalLetter {
  id: string;
  letter: string;
  databaseId: string;
  artistCount: number;
}

export interface GroupedLetter {
  letter: string;
  artistCount: number;
}

export interface LocalRecentCommon {
  id: string;
  date: Date;
}

export interface LocalRecentSong extends LocalRecentCommon {
  type: "song";
  song: LocalSong;
}

export interface LocalRecentArtist extends LocalRecentCommon {
  type: "artist";
  artist: LocalArtist;
}

export interface AppSettings {
  showAllArtists: boolean;
  useDarkTheme: boolean;
}

export type LocalRecentObject = LocalRecentSong | LocalRecentArtist;
