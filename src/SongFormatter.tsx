interface ChordLineSegment {
  type: "text" | "chord";
  text: string;
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

  format(key: any) {
    if (!this.hasChords) {
      return <div key={key}>{this.text}</div>;
    }

    const res: JSX.Element[] = [];

    let current = {
      text: "",
      chords: [] as string[],
    };

    function pushCurrent() {
      if (current.text || current.chords.length > 0) {
        if (current.chords.length == 0) {
          current.chords.push("\u00A0");
        }

        res.push(
          <div className="song-chord-line-item">
            <div className="song-chords-group">
              {current.chords.map((x, i) => (
                <div key={i} className="song-chord">
                  {x}
                </div>
              ))}
            </div>
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
    }

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
  constructor(public text?: string) {}

  format() {
    const res: JSX.Element[] = [];

    for (const line of this.text?.split("\n") || "") {
      if (line.startsWith(".")) {
        res.push(
          <div key={res.length}>
            <span className="song-label">{line.substring(1)}</span>
          </div>
        );
      } else {
        res.push(new ChordLineFormatter(line).format(res.length));
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
