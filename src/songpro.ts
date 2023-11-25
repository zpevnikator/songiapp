import _ from "lodash";
import { SongDatabase } from "./types";
import { getFirstLetter } from "./utils";

export function parseSongDatabase(data: string): SongDatabase {
  let currentSong: any = null;
  let currentText = "";
  let currentSource = "";

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
        source: currentSource.trim(),
      });
    }
    currentSong = null;
    currentText = "";
    currentSource = "";
  }

  for (const line of data.split("\n")) {
    if (line.match(/^\s*----*\s*$/)) {
      flushSong();
      continue;
    }

    currentSource += line + "\n";

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

  const allArtists: SongDatabase["artists"] = songs.map((x) => ({
    id: _.kebabCase(x.artist) || "no-artist",
    name: x.artist,
    letter: getFirstLetter(x.artist),
    songCount: 0,
  }));
  const artists = _.uniqBy(allArtists, (x) => x.id);
  const artistByName = _.keyBy(allArtists, (x) => x.name);

  const songIds = new Set<string>();
  for (const song of songs) {
    let id = `${artistByName[song.artist].id}/${
      _.kebabCase(song.title) || "no-title"
    }`;
    let suffix = "";
    let suffixIndex = 1;
    while (songIds.has(id + suffix)) {
      suffixIndex += 1;
      suffix = `-${suffixIndex}`;
    }
    songIds.add(id + suffix);

    song.id = id + suffix;
    song.artistId = artistByName[song.artist].id;
  }

  const artistsByLetters = _.groupBy(artists, (x) => x.letter);
  const letters = _.keys(artistsByLetters).map((letter) => ({
    letter,
    artistCount: artistsByLetters[letter].length,
  }));

  for (const artist of artists) {
    artist.songCount = songs.filter((x) => x.artistId == artist.id).length;
  }

  return {
    songs,
    artists,
    letters,
  };
}

export function parseSongParts(source: string) {
  const song = {};
  let text = "";
  for (const line of source.split("\n")) {
    if (line.match(/^\s*----*\s*$/)) {
      return {
        ...song,
        text,
      };
    }

    if (!text) {
      const attrMatch = line.match(/[@!]([^=]+)=(.*)/);
      if (attrMatch) {
        song[attrMatch[1]] = attrMatch[2].trim();
        continue;
      }
    }

    if (line.trim() || text) {
      text += line + "\n";
    }
  }

  return {
    ...song,
    text,
  };
}
