const mockData = [
  {
    id: "all-you-need-is-love",
    title: "All You Need Is Love",
    artist: "The Beatles",
    sheet: `
Intro “La Marseillaise”
{title: All You Need Is Love}
{subtitle: _}
{define: D/A base_fret 1 frets 2 2 5 x}

{define: D/C base_fret 1 frets 5 2 2 x}

{define: D/B base_fret 1 frets 4 2 2 x}

[F] Love [C] love [Dm] love
[F] love [C] love [Dm] love
[Gm]Love [F]love [C] love
[C]    [C]

[F] There’s nothing you can [C]do that can’t be-do[Dm]ne.
[F] Nothing you can [C]sing that can’t be [Dm]sung
[Bb]Nothing you can sa[F]y  but you can [C/G]learn how to play the game
It’s [C]easy [C/Bb]. [C/A]. [C]

[F] nothing you can [C]make that can’t be [Dm]made
[F] Nothing [C]you can save that can’t be [Dm]saved
[Bb]~ Nothing you can [F]do but you can [C/G]learn how to be you in time
It’s [C]easy [C/Bb].  [C/A]   [C]

[F] ~ All you [G]need is love [C].
[F] All you [G]need is love [C]
[F] ~All you [A7]need is lov[Dm]e love
[Bb] ~ Love is [C]all you need [F]

[F] Love [C] love [Dm] love
[F] love [C] love [Dm] love
[Gm]Love [F]love [C] love
[C]    [C]

[F] ~ There’s nothing you can [C]know that isn’t [Dm]known
[F] Nothing you can [C]see that isn’t [Dm]shown
[Bb]~ There’s nowhere you can [F]be that isn’t [C/G]where you’re meant to be
It’s [C]easy [C/Bb]. [C/A]  [C]

[F]  All you [G]need is love[C]
[F] All you [G]need is love[C]
[F] All you [A7]need is love[Dm] love
[Bb] Love is [C]all you need [F]

[F] All you [G]need is love[C]
[F] All you [G]need is love[C]
[F] All you [A7] need is love[Dm] love
[Bb] Love is [C]all you need [F]

Outro
[F] Love is all you need [F] love is all you need
{soh}repeat ad lib {eoh}`,
  },
];

export type SongDescrDto = {
  id: string;
  title: string;
  artist: string;
};

export type SongDto = {
  id: string;
  title: string;
  artist: string;
  sheet: string;
};

export class SongService {
  static listSongs = async (): Promise<SongDescrDto[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockData;
  };

  static getSong = async (songId: string): Promise<SongDto | null> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockData.find((song) => song.id === songId) || null;
  };
}
