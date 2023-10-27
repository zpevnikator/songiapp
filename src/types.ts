export interface SongDbListItem {
  id?: string;
  title: string;
  description: string;
  size: string;
  url: string;
}

export interface SongDbList {
  databases: SongDbListItem[];
}

export interface SongDatabase {
  songs: {
    id: string;
    title: string;
    artist: string;
    lang: string;
    text: string;
  }[];
}

export interface LocalSong {
  id: string;
  title: string;
  artist: string;
  lang: string;
  text: string;
  databaseId: string;
}
