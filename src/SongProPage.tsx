import { Box } from "@mui/material";
import PageLayout from "./PageLayout";
import { useIntl } from "react-intl";

export default function SongProPage() {
  const intl = useIntl();

  return (
    <PageLayout
      title={intl.formatMessage({
        id: "songproFormat",
        defaultMessage: "SongPro Format",
      })}
      showLanguageSelector
    >
      <Box sx={{ m: 2 }} style={{ maxWidth: 600 }}>
        <p className="lead">
          SongPro is a text file format for making chord &amp; lyric lead sheets
          for songs.
        </p>

        <h2>Example</h2>

        <p>Here&rsquo;s a partial example of a song in the SongPro format:</p>

        <pre>
          @title=Escape Capsule
          <br />
          @artist=Brian Kelly
          <br />
          !bandcamp=https://spilth.bandcamp.com/track/escape-capsule
          <br />
          <br />
          # Verse 1<br />
          Climb a-[D]board [A] I&#39;ve been [Bm]waiting for you [F#m] Climb
          <br />
          a-[G]board [D] You&#39;ll be [Asus4]safe in [A7]here
          <br />
          <br />
          # Chorus 1<br />
          I&#39;m a [D]rocket [F#]made for your pro-[Bm]tection You&#39;re
          <br />
          [G]safe with me, un-[A]til you leave
        </pre>

        <p>When converted into HTML it looks like this:</p>

        <h2>SongPro Format</h2>

        <p>
          A SongPro file can contain Attributes, Custom Attributes, Sections,
          Lyrics &amp; Chords, Tablature and Measures.
        </p>

        <h3>Attributes</h3>

        <p>Attributes are added with the format:</p>

        <pre>
          <code>@attribute=value</code>
        </pre>

        <p>You can specify the following song attributes:</p>

        <ul>
          <li>title</li>
          <li>artist</li>
          <li>capo</li>
          <li>key</li>
          <li>tempo</li>
          <li>year</li>
          <li>album</li>
          <li>tuning</li>
        </ul>

        <p>
          They can be placed anywhere in the song but it&rsquo;s recommended to
          put them at the top of your file. The values are text that are
          displayed in the rendered output.
        </p>

        <h3>Custom Attributes</h3>

        <p>Custom attributes can be added the format:</p>

        <pre>
          <code>!custom_attribute=value</code>
        </pre>

        <p>
          A custom attribute can be anything. These are mainly used by other
          apps that want to store additional attributes beyond the core set or
          are specific to the app.
        </p>

        <h3>Sections</h3>

        <p>
          Any line starting with <code>#</code> is considered the beginning of a
          new section:
        </p>

        <pre>
          <code># Section Name</code>
        </pre>

        <p>Section names are usually things like:</p>

        <ul>
          <li>Verse 1</li>
          <li>Chorus 2</li>
          <li>Bridge</li>
          <li>Outro</li>
        </ul>

        <p>But you can name them however you please.</p>

        <h3>Lyrics &amp; Chords</h3>

        <p>
          Chords are anything contained inside of brackets, such as{" "}
          <code>C#m7</code>. Lyrics are words by themselves or around chords.
        </p>

        <pre>
          <code>You&#39;ll be [Asus4]safe in [A7]here</code>
        </pre>

        <h3>Tablature</h3>

        <p>
          Any line starting with <code>|-</code> is considered to be tablature.
          For example:
        </p>

        <pre>
          <code>|-8--10--12--10--8-|</code>
        </pre>

        <h3>Measures</h3>

        <p>
          When you want to show where chord changes are for an instrumental
          section, start a line with <code>|</code> and use another{" "}
          <code>|</code> whenever a new measure starts.
        </p>

        <pre>
          <code>| [G] | [D] | [F#] | [Bm] [D/A] |</code>
        </pre>

        <h3>Comments</h3>

        <p>
          You can include comments throughout the song by prefixing them with{" "}
          <code>&gt;</code>. These can be used to provide performance notes/tips
          to players.
        </p>

        <pre>
          <code>&gt; Whistle the verse melody over these chords</code>
        </pre>

        <h2>SongPro Libraries</h2>

        <ul>
          <li>
            <a href="https://github.com/SongProOrg/songpro-crystal">
              SongPro Crystal
            </a>{" "}
          </li>
          <li>
            <a href="https://github.com/SongProOrg/songpro-java">
              SongPro Java
            </a>
          </li>
          <li>
            <a href="https://github.com/SongProOrg/songpro-javascript">
              SongPro Javascript
            </a>
          </li>
          <li>
            <a href="https://github.com/SongProOrg/songpro-ruby">
              SongPro Ruby
            </a>
          </li>
          <li>
            <a href="https://github.com/SongProOrg/songpro-swift">
              SongPro Swift
            </a>
          </li>
        </ul>

        <h2>Related Tools</h2>

        <ul>
          <li>
            <a href="https://songbooks.songpro.org/">Songbooks</a> - Turn
            collections of SongPro songs into guitar &amp; ukulele song books
            that be can viewed online and downloaded as PDFs
          </li>
          <li>
            <a href="https://github.com/spilth/chord_diagrams">
              Chord Diagrams Ruby Gem
            </a>{" "}
            - Provides chord diagrams as SVGs
          </li>
          <li>
            <a href="https://zpevnikator.github.io/">Zpevnikator.git</a> -
            Offline song database browser (many songs in SongPro format)
          </li>
        </ul>
      </Box>
    </PageLayout>
  );
}
