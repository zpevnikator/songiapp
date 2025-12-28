import { Link } from "react-router-dom";

export default function HomeCs() {
  return (
    <>
      <p>
        Zpěvníkátor.git je projekt vycházející z původního Zpěvníkátoru, který
        byl vytvořen na počátku 3. tisíciletí. Zatímco původní zpěvníkátor byl
        určen k tisku písniček, doba pokročila a nový zpěvníkátor je určen hlavně
        pro hraní z tabletu, případně mobilu.
      </p>
      <h4>Čím se nový zpěvníkátor liší od ostatních zpěvníkových aplikací?</h4>
      <p>
        Tento projekt je naprosto otevřený (samozřejmě zdarma), a nezávislý na
        původním autorovi. Všechny zdrojové kódy jsou k dispozici na GitHubu, a
        každý může přispět svým dílem k rozvoji projektu. Z tohoto důvodu
        projekt nemá ani vlastní placenou doménu, ale využívá služeb github
        pages pro open-source projekty.
      </p>
      <p>
        Všechny písně jsou uložené jako textový soubor na githubu ve formátu{" "}
        <a href="/songpro">songpro</a>, který je velmi jednoduchý na
        editaci.
      </p>
      <h4>Rozšiřitelné databáze písní</h4>
      <p>
        Do aplikace se dá stáhnout nekolik databází, dohromady necelých 100 000
        písní (ty se ale v různých databázích opakují, původní autoři databázi
        je od sebe dost často kopírovali). Takto vypadá například{" "}
        <a href="https://raw.githubusercontent.com/zpevnikator/songidb/refs/heads/main/zp8/db.songpro">
          databáze starého zpěvníkátoru
        </a>{" "}
        ve formátu songpro (textový soubor). Můžete si vytvořit i vlastní
        databázi, návod je{" "}
        <a href="https://github.com/zpevnikator/songiapp">popsaný na githubu</a>
        . Takto pak vypadá{" "}
        <a href="https://github.com/zpevnikator/miserables">
          jednoduchá databáze
        </a>
        .
      </p>
      <h4>Webová aplikace fungující offline</h4>
      <p>
        Zpěvníkátor je webová aplikace, která beží ve vašem prohlížečí, nicméně
        je navržená tak, že všechny písničky má uložené lokálně, tedy funguje i
        bez připojení k internetu. Internet je potřeba pouze pro prvotní stažení
        databáze písniček. Databází je několik a je možné, že budou vznikat
        další, do tabletu si můžete stáhnout jen některré,
      </p>
      <h4>Jak začít?</h4>
      <p>
        Při první spuštění máte lokální databázi prázdnou, je potřeba něco
        stáhnout na záložce <Link to="/databases">Databáze</Link>
      </p>
      <h4>Odkazy</h4>
      <ul>
        <li>
          <a href="https://github.com/zpevnikator/songiapp" target="_blank">
            Zpěvníkátor na GitHubu
          </a>
        </li>
        <li>
          <a href="https://songpro.org/" target="_blank">
            SongPro format
          </a>
        </li>
        <li>
          <a
            href="https://www.slunecnice.cz/sw/zpevnikator/#google_vignette"
            target="_blank"
          >
            Původní Zpěvníkátor
          </a>
        </li>
      </ul>
    </>
  );
}
