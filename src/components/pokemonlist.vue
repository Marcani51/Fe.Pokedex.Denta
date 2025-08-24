<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import {
  fetchDataAllPokemon,
  fetchPokemonById,
  fetchPokemonByUrl,
} from "../composables";
import modal from "./modal.vue";
import type { Pokemon } from "../composables/resources/data";
import { typeColors } from "../helper";

const pokemons = ref<Pokemon[]>([]);
const limit = 20;
const offset = ref(0);
const loading = ref(false);
const hasMore = ref(true);
const isOpen = ref(false);
const selectedPokemon = ref<any | null>(null);
const searchQuery = ref("");
const searchResult = ref<Pokemon | null>(null);
const searching = ref(false);
const sortByType = ref(false);
const originalPokemons = ref<Pokemon[]>([]);

async function getPokemon() {
  if (loading.value || !hasMore.value) return;
  loading.value = true;

  const data = await fetchDataAllPokemon(limit, offset.value);

  if (data.results.length === 0) {
    hasMore.value = false;
    return;
  }

  const detailPromises = data.results.map(async (p: any) => {
    const detail = await fetchPokemonById(p.name);
    return {
      id: detail.id,
      name: detail.name,
      url: p.url,
      image: detail.sprites.other["official-artwork"].front_default,
      types: detail.types.map((t: any) => t.type.name),
    } as Pokemon;
  });

  const mapped = await Promise.all(detailPromises);
  pokemons.value.push(...mapped);
  originalPokemons.value.push(...mapped);
  if (sortByType.value) sortPokemon();

  offset.value += limit;
  loading.value = false;
}

watch(searchQuery, async () => {
  await fetchPokemonBySearch();
});

watch(searchResult, async (value: any) => {
  if (value === null) {
    console.log("reset");

    pokemons.value = [];
    offset.value = 0;
    hasMore.value = true;

    getPokemon();

    await nextTick();
    setupInfiniteScroll();
  }
});

const openModal = async (value: any) => {
  isOpen.value = false;
  console.log(value, "SELECTED POKEMON");
  const res = await fetchPokemonByUrl(value.url);
  console.log(res);
  selectedPokemon.value = res;
  isOpen.value = true;
  console.log("WAH");
};

async function fetchPokemonBySearch() {
  if (!searchQuery.value.trim()) {
    searchResult.value = null;
    return;
  }
  searching.value = true;
  try {
    const data = await fetchPokemonById(searchQuery.value.toLocaleLowerCase());
    if (data === undefined) throw new Error("Not found");

    const pokemon: Pokemon = {
      id: data.id,
      name: data.name,
      url: `https://pokeapi.co/api/v2/pokemon/${data.id}`,
      image: data.sprites.other["official-artwork"].front_default,
      types: data.types.map((t: any) => t.type.name),
    };

    searchResult.value = pokemon;
  } catch (e) {
    searchResult.value = null;
  } finally {
    searching.value = false;
  }
}

function setupInfiniteScroll() {
  const sentinel = document.querySelector("#sentinel");
  if (!sentinel) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        getPokemon();
      }
    },
    { rootMargin: "100px" }
  );

  observer.observe(sentinel);
}

const sortPokemon = () => {
  pokemons.value.sort((a, b) => {
    const typeA = a.types[0] || "";
    const typeB = b.types[0] || "";

    if (typeA < typeB) return sortByType.value ? -1 : 1;
    if (typeA > typeB) return sortByType.value ? 1 : -1;
    return 0;
  });
};

async function sortPokemonsByType() {
  sortByType.value = !sortByType.value;
  console.log(sortByType.value);
  if (sortByType.value) sortPokemon();
  else pokemons.value = [...originalPokemons.value];
}

const scrollToHeader = () => {
  const header = document.getElementById("page-header");
  header?.scrollIntoView({ behavior: "smooth" });
};

onMounted(async () => {
  await getPokemon();
  setupInfiniteScroll();
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-50 to-sky-100">
    <header id="page-header" class="p-6 text-center">
      <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-800 drop-shadow">
        Pokedex
      </h1>
      <div class="mt-4 flex gap-4 justify-center">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or ID..."
          class="px-4 py-2 w-64 rounded-lg border border-gray-300 focus:outline-none"
        />
        <button class="bg-blue-400 p-3 rounded-lg" @click="sortPokemonsByType">
          Sort By Type
        </button>
      </div>
    </header>

    <main class="mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="searchResult" class="mb-8 flex justify-center">
        <div
          class="rounded-2xl shadow-md p-6 flex flex-col items-center"
          :class="typeColors[searchResult.types[0]]"
          @click="openModal(searchResult)"
        >
          <img
            :src="searchResult.image"
            :alt="searchResult.name"
            class="w-28 h-28 object-contain mb-2"
          />
          <p class="capitalize font-semibold text-gray-700 text-lg">
            {{ searchResult.name }}
          </p>
          <span class="text-white text-sm">#{{ searchResult.id }}</span>
          <div class="flex gap-2 mt-2">
            <span
              v-for="type in searchResult.types"
              :key="type"
              class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
            >
              {{ type }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
      >
        <div
          v-for="poke in pokemons"
          :key="poke.id"
          class="rounded-2xl shadow-md p-4 flex flex-col items-center hover:scale-105 hover:shadow-lg transition-transform"
          :class="typeColors[poke.types[0]]"
          @click="openModal(poke)"
        >
          <img
            :src="poke.image"
            :alt="poke.name"
            loading="lazy"
            class="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-2"
          />
          <p
            class="capitalize font-semibold text-gray-700 text-sm sm:text-base"
          >
            {{ poke.name }}
          </p>
          <span class="text-white text-xs">#{{ poke.id }}</span>

          <div class="flex gap-2 mt-2">
            <span
              v-for="type in poke.types"
              :key="type"
              class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
            >
              {{ type }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="!searchResult">
        <div id="sentinel" class="h-10"></div>
        <p v-if="loading" class="text-center py-4 text-gray-500">Loading...</p>
        <p v-if="!hasMore" class="text-center py-4 text-gray-400">
          No more Pokémon
        </p>
      </div>
    </main>
  </div>
  <button
    @click="scrollToHeader"
    class="p-3 fixed bottom-6 right-6 w-14 h-14 rounded-full bg-red-700 text-white flex items-center justify-center shadow-lg hover:bg-red-400 transition"
  >
    Search
  </button>
  <modal
    v-model="isOpen"
    :data="selectedPokemon"
    @update:viewPokemon="openModal"
  />
</template>
