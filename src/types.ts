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
  artists: {
    id: string;
    name: string;
  }[];
  songs: {
    id: string;
    title: string;
    artistId: string;
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
  // isActive?: number;
  words:string[];
}

export interface LocalArtist {
  id: string;
  name: string;
  songCount: number;
  databaseId: string;
  databaseTitle: string;
  // isActive?: number;
  letter: string;
  letterId: string;
  words:string[];
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
  // letterIds: string[];
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

export type LocalRecentObject = LocalRecentSong | LocalRecentArtist;
