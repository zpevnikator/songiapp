export interface SongDbListItem {
  id: string;
  title: string;
  description: string;
  size: string;
  url: string;
}

export interface LocalDatabase extends SongDbListItem {
  isActive?: boolean;
}

export interface SongDbList {
  databases: SongDbListItem[];
}

export interface SongDatabase {
  songs: {
    id: string;
    title: string;
    artist: string | string[];
    lang: string;
    text: string;
  }[];
}

export interface LocalSong {
  id: string;
  title: string;
  artist: string[];
  lang: string;
  text: string;
  databaseId: string;
  isActive?: number;
}

export interface LocalArtist {
  name: string;
  songCount?: number;
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
