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

export const TONE_NUMBER_NAMES = [
  "1",
  "1#",
  "2",
  "3b",
  "3",
  "4",
  "5b",
  "5",
  "5#",
  "6",
  "7b",
  "7",
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
  let maxScore = -1;
  let bestCandidate: number | null = null;
  for (let baseCandidate = 0; baseCandidate < 12; baseCandidate++) {
    let score = 0;
    for (const chord of chords) {
      const height = getChordTone(chord);
      if (height != null) {
        const transposed = (height - baseCandidate + 5 * 12) % 12;
        if (transposed == 0) {
          score += 3;
        } else if (transposed == 7) {
          score += 2;
        } else if (transposed == 5) {
          score += 1;
        } else if (transposed == 9 && chord.includes("m")) {
          score += 3;
        }
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestCandidate = baseCandidate;
    }
  }
  return bestCandidate;
}

export function transposeChordNumber(
  chord: string,
  baseTone: number,
  d: number
) {
  for (const tone of TONE_ALL_NAMES) {
    if (chord.startsWith(tone)) {
      const height = TONE_HEIGHTS[tone];
      const newHeight = (height - baseTone + 5 * 12 + d) % 12;
      const chordType = chord.substring(tone.length);
      if (chordType) {
        return `${TONE_NUMBER_NAMES[newHeight]}:${chordType}`;
      }
      return TONE_NUMBER_NAMES[newHeight];
    }
  }

  return chord;
}

export function transposeText(text: string, d: number, showNumChords = false) {
  if (showNumChords) {
    const baseTone = getBaseTone(text);
    return text.replace(
      /\[([^\]]+)\]/g,
      (m) => `[${transposeChordNumber(m.slice(1, -1), baseTone ?? 0, d)}]`
    );
  }
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
