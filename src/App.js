import logo from './logo.svg';
import './App.css';
import { useEffect } from "react";

function App() {
  async function loadSong() {
    const resp = await fetch(
      // "https://www.velkyzpevnik.cz/marien/a-bylo-leto"
      // "https://www.riverlog.info/api/diary-info/stats?accountId=google:116106201198693582561&fromTm=1695620453830&apikey=certaky"
      "https://raw.githubusercontent.com/dbgate/dbgate/master/app/src/electron.js"
    );
    console.log(await resp.text());
  }

  useEffect(() => {
    loadSong();
  });


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
