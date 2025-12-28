import { Link } from "react-router-dom";

export default function HomeEn() {
  return (
    <>
      <p>
        Zpevnikator.git is a project based on the original Zpevnikator, which was created at the beginning of the 3rd millennium. While the original Zpevnikator was intended for printing songs, times have advanced, and the new Zpevnikator is mainly designed for playing from a tablet or mobile device.
      </p>
      <h4>How does the new Zpevnikator differ from other songbook applications?</h4>
      <p>
        This project is completely open (and of course free) and independent of the original author. All source codes are available on GitHub, and anyone can contribute to the development of the project. For this reason, the project does not even have its own paid domain but utilizes GitHub Pages services for open-source projects.
      </p>
      <p>
        All songs are stored as text files on GitHub in the{" "}
        <a href="https://songspro.github.io/">SongPro</a> format, which is very easy to edit.
      </p>
      <h4>Extensible song databases</h4>
      <p>
        Several databases can be downloaded into the application, totaling nearly 100,000 songs (though they repeat across different databases, as original authors often copied databases from each other). For example, this is how the{" "}
        <a href="https://raw.githubusercontent.com/zpevnikator/songidb/refs/heads/main/zp8/db.songpro">
          database of the old Zpevnikator
        </a>{" "}
        looks in SongPro format (a text file). You can also create your own database; instructions are <a href="https://github.com/zpevnikator/songiapp">described on GitHub</a>
        . Here's how a{" "}
        <a href="https://github.com/zpevnikator/miserables">simple database</a> looks.
      </p>
      <h4>Web application working offline</h4>
      <p>
        Zpevnikator is a web application that runs in your browser; however, it is designed so that all songs are stored locally, meaning it works even without an internet connection. The internet is only needed for the initial download of the song database. There are several databases available, and more may be created; you can download only the ones you prefer to your tablet.
      </p>
      <h4>How to start?</h4>
      <p>
        Upon first launch, your local database is empty. You need to download something on the <Link to="/databases">Databases</Link> tab.
      </p>
      <h4>Links</h4>
      <ul>
        <li>
          <a href="https://github.com/zpevnikator/songiapp" target="_blank" rel="noopener noreferrer">
            Zpevnikator on GitHub
          </a>
        </li>
        <li>
          <a href="https://songspro.github.io/" target="_blank" rel="noopener noreferrer">
            SongPro Format
          </a>
        </li>
        <li>
          <a
            href="https://www.slunecnice.cz/sw/zpevnikator/#google_vignette"
            target="_blank"
            rel="noopener noreferrer"
          >
            Original Zpevnikator
          </a> (CZ)
        </li>
      </ul>
    </>
  );
}