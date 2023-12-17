import { SongDbList, SongDbListItem } from "./types";

export async function findGithubDatabases(filter: string): Promise<SongDbList> {
  const qs = filter
    ? ["topic:songidb-public", `topic:songidb-${filter}`]
    : ["topic:songidb-public"];

  const databases: SongDbListItem[] = [];

  for (const q of qs) {
    const resp = await fetch(
      `https://api.github.com/search/repositories?q=${q}`
    );
    const json = await resp.json();

    databases.push(
      ...json.items.map((item) => ({
        id: `gh_${item.id}`,
        title: item.full_name,
        description: item.description,
        url: `https://raw.githubusercontent.com/${item.full_name}/${item.default_branch}/index.songpro`,
      }))
    );
  }

  return {
    databases,
  };
}

export async function findDefaultRemoteDatabases(): Promise<SongDbList> {
  const resp = await fetch(
    `https://raw.githubusercontent.com/songiapp/songidb/main/index.json?x=${new Date().getTime()}`
  );
  return resp.json();
}
