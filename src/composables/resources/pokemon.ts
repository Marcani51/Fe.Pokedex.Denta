
import { httpGet } from "../http/index";

const url = {
  getAllPokemon: (limit: number, offset: number) =>
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
  getPokemonById: (nameOrId: string) =>
    `https://pokeapi.co/api/v2/pokemon/${nameOrId}`,
};

export const fetchDataAllPokemon = async (limit: number, offset: number) => {
  return await httpGet<{ results: any[] }>(url.getAllPokemon(limit, offset));
};

export const fetchPokemonById = async (nameOrId: string) => {
  return await httpGet<any>(url.getPokemonById(nameOrId));
};

export const fetchPokemonByUrl=async(url:string)=>{
  return await httpGet<any>(url);
}
