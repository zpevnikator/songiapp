import { SongDatabase } from "./types";

export function parseSongDatabase(data: string): SongDatabase {
  let currentSong: any = null;
  let currentText = "";

  const songs: SongDatabase["songs"] = [];

  function flushSong() {
    if (
      currentSong &&
      currentText.trim() &&
      currentSong.title &&
      currentSong.artist
    ) {
      songs.push({
        ...currentSong,
        text: currentText.trim(),
      });
    }
    currentSong = null;
    currentText = "";
  }

  for (const line of data.split("\n")) {
    if (line.match(/^\s*----*\s*$/)) {
      flushSong();
      continue;
    }

    if (!currentText) {
      const attrMatch = line.match(/[@!]([^=]+)=(.*)/);
      if (attrMatch) {
        if (!currentSong) {
          currentSong = {};
        }
        currentSong[attrMatch[1]] = attrMatch[2].trim();
        continue;
      }
    }

    if (line.trim() || currentText) {
      currentText += line + "\n";
    }
  }

  flushSong();

  return { songs };
}
