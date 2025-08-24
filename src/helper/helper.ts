/*
helper untuk map data membentuk card
*/
export const createDataCard = (data: any) => {
const dataCard=  data.results.map((p: any) => {
    const id = parseInt(p.url.split("/").filter(Boolean).pop());
    return {
      name: p.name,
      url: p.url,
      id,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    };
  });

  return dataCard
};

/*
helper untuk mapping warna
*/
export const typeColors: Record<string, string> = {
  normal: "bg-gray-300 text-gray-800",
  fire: "bg-red-500 text-white",
  water: "bg-blue-500 text-white",
  grass: "bg-green-500 text-white",
  electric: "bg-yellow-400 text-yellow-900",
  ice: "bg-cyan-300 text-cyan-900",
  fighting: "bg-orange-700 text-white",
  poison: "bg-purple-500 text-white",
  ground: "bg-yellow-600 text-white",
  flying: "bg-indigo-300 text-indigo-900",
  psychic: "bg-pink-500 text-white",
  bug: "bg-lime-600 text-white",
  rock: "bg-stone-500 text-white",
  ghost: "bg-violet-700 text-white",
  dragon: "bg-indigo-700 text-white",
  dark: "bg-gray-800 text-white",
  steel: "bg-gray-400 text-gray-900",
  fairy: "bg-pink-300 text-pink-900",
};

export const formatHeight = (hDecimeter: number) => {
  const cm = hDecimeter * 10;
  const inches = cm / 2.54;
  const feet = Math.floor(inches / 12);
  const inch = Math.round(inches % 12);
  return `${feet}'${inch}" (${(cm / 100).toFixed(2)} m)`;
};

export const formatWeight = (hHectogram: number) => {
  const kg = hHectogram / 10;
  const lbs = (kg * 2.20462).toFixed(1);
  return `${lbs} lbs (${kg.toFixed(1)} kg)`;
};

