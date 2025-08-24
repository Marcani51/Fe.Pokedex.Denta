export interface Pokemon {
  name: string
  url: string
  id: number
  image: string
  types:string[]
}

export type PokemonDetail = {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other?: {
      ["official-artwork"]?: { front_default: string | null };
      home?: { front_default: string | null };
    };
  };
  types: { type: { name: string } }[];
  height: number;
  weight: number;
  abilities: { ability: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  moves: { move: { name: string } }[];
  species: { url: string };
};