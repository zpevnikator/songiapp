import _ from "lodash";

export const TONE_HEIGHTS = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  Es: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  As: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
  H: 11,
};

const TONE_ALL_NAMES = _.sortBy(_.keys(TONE_HEIGHTS), (x) => -x.length);

export const TONE_BASE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "Bb",
  "H",
];

export function getChordTone(chord: string): number | undefined {
  for (const tone of TONE_ALL_NAMES) {
    if (chord.startsWith(tone)) {
      return TONE_HEIGHTS[tone];
    }
  }
}

export function transposeChord(chord: string, d: number) {
  for (const tone of TONE_ALL_NAMES) {
    if (chord.startsWith(tone)) {
      const height = TONE_HEIGHTS[tone];
      const newHeight = (height + 5 * 12 + d) % 12;
      return `${TONE_BASE_NAMES[newHeight]}${chord.substring(tone.length)}`;
    }
  }

  return chord;
}

export function extractChords(text: string) {
  return [...text.matchAll(/\[([^\]]+)\]/g)].map((x) => x[1]);
}

export function getBaseTone(text?: string) {
  const chords = extractChords(text ?? "");
  for (const chord of chords) {
    const height = getChordTone(chord);
    if (height != null) {
      return height;
    }
  }
  return null;
}

export function transposeText(text: string, d: number) {
  if ((d + 5 * 12) % 12 == 0) {
    return text;
  }
  return text.replace(
    /\[([^\]]+)\]/g,
    (m) => `[${transposeChord(m.slice(1, -1), d)}]`
  );
}

export function removeChords(text: string) {
  return text.replace(/\[([^\]]+)\]/g, "");
}
