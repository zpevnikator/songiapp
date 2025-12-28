interface ChordLineSegment {
  type: "text" | "chord";
  text: string;
}

function getChordColor(chord: string, isDarkMode: boolean, defaultColor?: string): string | undefined {
  const firstChar = chord.charAt(0);
  const numericNote = parseInt(firstChar);
  
  if (isNaN(numericNote)) {
    return defaultColor;
  }
  
  // Map numeric notation to solfège colors (Do-Re-Mi)
  // Light theme - deeper colors
  const lightColorMap: { [key: number]: string } = {
    1: '#D32F2F', // Do (C) - Red
    2: '#E65100', // Re (D) - Orange
    3: '#F57F17', // Mi (E) - Yellow
    4: '#2E7D32', // Fa (F) - Green
    5: '#1565C0', // Sol (G) - Blue
    6: '#6A1B9A', // La (A) - Purple
    7: '#AD1457', // Ti (B) - Pink/Magenta
  };
  
  // Dark theme - lighter, more vibrant colors for better visibility
  const darkColorMap: { [key: number]: string } = {
    1: '#EF5350', // Do (C) - Light Red
    2: '#FF9800', // Re (D) - Light Orange
    3: '#FFEB3B', // Mi (E) - Light Yellow
    4: '#66BB6A', // Fa (F) - Light Green
    5: '#42A5F5', // Sol (G) - Light Blue
    6: '#AB47BC', // La (A) - Light Purple
    7: '#EC407A', // Ti (B) - Light Pink
  };
  
  const colorMap = isDarkMode ? darkColorMap : lightColorMap;
  return colorMap[numericNote] || defaultColor;
}

export class ChordLineFormatter {
  segments: ChordLineSegment[] = [];
  hasChords = false;

  constructor(public text: string) {
    let index = 0;

    let current = "";
    while (index < text.length) {
      if (text[index] == "[") {
        if (current) {
          this.segments.push({
            type: "text",
            text: current,
          });
        }
        current = "";
        index += 1;

        let chord = "";
        while (index < text.length && text[index] != "]") {
          chord += text[index];
          index += 1;
        }
        if (index < text.length) {
          index += 1;
        }
        if (chord) {
          this.segments.push({
            type: "chord",
            text: chord,
          });
        }
        continue;
      }

      if (text[index] == " " && current.length > 15) {
        // split long lines
        current += text[index];
        index += 1;
        this.segments.push({
          type: "text",
          text: current,
        });
        current = "";
        continue;
      }

      current += text[index];
      index += 1;
    }

    if (current) {
      this.segments.push({
        type: "text",
        text: current,
      });
    }

    this.hasChords = !!this.segments.find((x) => x.type == "chord");
  }

  format(key: any, label: string, showLabel: boolean, chordColor?: string, isDarkMode?: boolean) {
    if (!this.hasChords) {
      return (
        <div key={key}>
          {label && (
            <span className={showLabel ? "song-label" : "song-label hidden"}>
              {label}
            </span>
          )}
          {this.text}
        </div>
      );
    }

    const res: JSX.Element[] = [];

    if (label) {
      res.push(
        <div className="song-chord-line-item">
          <div className="song-chords-group">{"\u00A0"}</div>
          <div
            className={showLabel ? "song-label" : "song-label hidden"}
            key="label"
          >
            {label}
          </div>
        </div>
      );
    }

    let current = {
      text: "",
      chords: [] as string[],
    };

    const pushCurrent = () => {
      if (current.text || current.chords.length > 0) {
        if (current.chords.length == 0) {
          current.chords.push("\u00A0");
        }

        const currentChordRes: JSX.Element[] = [];
        let index = 0;
        for (const chord of current.chords) {
          const colonIndex = chord.indexOf(":");
          if (colonIndex >= 0) {
            const mainChord = chord.substring(0, colonIndex);
            const divIndex = chord.indexOf("/");
            if (divIndex >= 0 && divIndex > colonIndex) {
              // Handle bass note in chord like "C:6/G"
              const bassNote = chord.substring(divIndex + 1);
              const rootNote = chord.substring(0, colonIndex);
              const chordType = chord.substring(colonIndex + 1, divIndex);

              currentChordRes.push(
                <div
                  key={index++}
                  className="song-chord"
                  style={{ color: getChordColor(chord, isDarkMode || false, chordColor) }}
                >
                  {rootNote}
                  <span className="song-chord-type">{chordType}</span>/{bassNote}
                </div>
              );
            } else {
              const chordType = chord.substring(colonIndex + 1);

              currentChordRes.push(
                <div
                  key={index++}
                  className="song-chord"
                  style={{ color: getChordColor(chord, isDarkMode || false, chordColor) }}
                >
                  {mainChord}
                  <span className="song-chord-type">{chordType}</span>
                </div>
              );
            }
          } else {
            currentChordRes.push(
              <div
                key={index++}
                className="song-chord"
                style={{ color: getChordColor(chord, isDarkMode || false, chordColor) }}
              >
                {chord}
              </div>
            );
          }
        }

        res.push(
          <div className="song-chord-line-item">
            <div className="song-chords-group">{currentChordRes}</div>
            <div className="song-text-group">
              {current.text.replace(/ /g, "\u00A0")}
            </div>
          </div>
        );

        current = {
          text: "",
          chords: [],
        };
      }
    };

    for (const segment of this.segments) {
      if (segment.type == "chord") {
        if (current.text) {
          pushCurrent();
        }

        current.chords.push(segment.text);
      }
      if (segment.type == "text") {
        if (current.text) {
          pushCurrent();
        }

        current.text = segment.text;
      }
    }

    pushCurrent();

    return (
      <div key={key} className="song-chord-line ">
        {res}
      </div>
    );

    // return this.segments.map((x, i) => (
    //   <span key={i} className={`song-${x.type}`}>
    //     {x.text}
    //   </span>
    // ));
  }
}

export default class SongFormatter {
  constructor(public text?: string, public chordColor?: string, public isDarkMode?: boolean) {}

  format() {
    const res: JSX.Element[] = [];
    let label = "";
    let showLabel = false;

    for (const line of this.text?.split("\n") || "") {
      if (line.startsWith("#")) {
        if (label && showLabel) {
          res.push(
            <div key={res.length}>
              <span className="song-label">{label}</span>
            </div>
          );
        }
        label = line.substring(1).trim();
        showLabel = true;
      } else if (line.trim() == "") {
        label = "";
        showLabel = false;
        res.push(<div className="song-section-delimiter"></div>);
      } else {
        res.push(
          new ChordLineFormatter(line).format(
            res.length,
            label,
            showLabel,
            this.chordColor,
            this.isDarkMode
          )
        );
        showLabel = false;
      }
    }

    return res;

    // if (!this.text) {
    //   return null;
    // }
    // return (
    //   <>
    //     {this.text.split("\n").map((line, index) => (
    //       <div key={index}>{line}</div>
    //     ))}
    //   </>
    // );
  }
}
