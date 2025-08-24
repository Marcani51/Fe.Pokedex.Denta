<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from "vue";
import { typeColors, formatHeight, formatWeight } from "../helper";
import type { PokemonDetail } from "../composables";
import { fetchPokemonById } from "../composables";

const props = defineProps<{
  modelValue: boolean;
  data: PokemonDetail | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "update:viewPokemon", value: {}): void;
}>();

const close = () => emit("update:modelValue", false);

const activeTab = ref<"about" | "stats" | "evolution" | "moves">("about");

type EvoData = { name: string; image: string | null; url: string };
const evolution = ref<EvoData[]>([]);

watch(
  () => props.data,
  async (val) => {
    if (val?.species?.url) {
      try {
        const speciesRes = await fetch(val.species.url).then((r) => r.json());
        if (speciesRes.evolution_chain?.url) {
          const evoRes = await fetch(speciesRes.evolution_chain.url).then((r) =>
            r.json()
          );
          const chain: string[] = [];
          let current = evoRes.chain;
          while (current) {
            chain.push(current.species.name);
            current = current.evolves_to?.[0];
          }
          const evoData: EvoData[] = await Promise.all(
            chain.map(async (name) => {
              try {
                const poke = await fetchPokemonById(name);
                return {
                  name,
                  image:
                    poke.sprites.other?.["official-artwork"]?.front_default ||
                    poke.sprites.other?.home?.front_default ||
                    poke.sprites.front_default,
                  url: `https://pokeapi.co/api/v2/pokemon/${name}`,
                };
              } catch (e) {
                return { name, image: null, url: "" };
              }
            })
          );

          evolution.value = evoData;
        }
      } catch (e) {
        console.error("Evolution fetch error:", e);
      }
    }
  },
  { immediate: true }
);

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      activeTab.value = "about";
    }
  }
);
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
    @click.self="close"
  >
    <div
      class="rounded-2xl shadow-lg w-full max-w-md md:max-w-xl overflow-hidden"
      :class="typeColors[data?.types[0].type.name || '']"
    >
      <div class="relative h-40 flex flex-col justify-between p-4 text-white">
        <div class="flex flex-col">
          <div class="flex justify-between items-start">
            <h2 class="text-2xl font-bold capitalize">
              {{ data?.name }}
            </h2>
            <span class="font-semibold text-white/80">#{{ data?.id }}</span>
          </div>
          <div class="flex gap-2 mt-2">
            <span
              v-for="t in data?.types"
              :key="t.type.name"
              class="px-3 py-1 rounded-full bg-white/30 text-xs capitalize"
            >
              {{ t.type.name }}
            </span>
          </div>
        </div>

        <div
          class="absolute left-1/2 bottom-[-40px] transform -translate-x-1/2"
        >
          <img
            :src="
              data?.sprites.other?.['official-artwork']?.front_default ||
              data?.sprites.other?.home?.front_default ||
              data?.sprites.front_default !
            "
            :alt="data?.name"
            class="w-40 h-40 object-contain drop-shadow-lg"
          />
        </div>
      </div>

      <!-- Content box -->
      <div class="px-6 pt-8 pb-6 bg-white rounded-2xl">
        <!-- Tabs -->
        <div class="flex border-b mb-4">
          <button
            v-for="tab in ['about', 'stats', 'evolution', 'moves']"
            :key="tab"
            class="flex-1 py-2 capitalize text-sm font-medium border-b-2 transition"
            :class="[
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            ]"
            @click="activeTab = tab as any"
          >
            {{ tab }}
          </button>
        </div>

        <div class="min-h-[150px] text-gray-700 text-sm">
          <div v-if="activeTab === 'about'">
            <ul class="space-y-2">
              <!-- <li><strong>Species:</strong>{{ data?.species }}</li> -->
              <li><strong>Height:</strong> {{ formatHeight(data!.height) }}</li>
              <li><strong>Weight:</strong> {{ formatWeight(data!.weight) }}</li>
              <li>
                <strong>Abilities:</strong>
                {{ data?.abilities.map((a) => a.ability.name).join(", ") }}
              </li>
            </ul>
          </div>

          <div v-if="activeTab === 'stats'" class="space-y-3">
            <div
              v-for="s in data?.stats"
              :key="s.stat.name"
              class="flex items-center gap-3"
            >
              <span class="capitalize w-24">{{ s.stat.name }}</span>
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full"
                  :class="
                    Math.min(s.base_stat, 100) <= 45
                      ? 'bg-red-400'
                      : 'bg-blue-500'
                  "
                  :style="{ width: Math.min(s.base_stat, 100) + '%' }"
                />
              </div>
              <span class="w-10 text-right">{{ s.base_stat }}</span>
            </div>
          </div>

          <div
            v-if="activeTab === 'evolution'"
            class="flex flex-col gap-4 justify-center items-center flex-wrap"
          >
            <div class="flex flex-row items-center gap-4">
              <template v-for="(evo, index) in evolution" :key="evo.name">
                <div
                  class="flex flex-col items-center gap-1 cursor-pointer"
                  @click="emit('update:viewPokemon', { url: evo.url })"
                >
                  <img
                    v-if="evo.image"
                    :src="evo.image"
                    :alt="evo.name"
                    class="w-36 h-36 object-contain drop-shadow-md"
                  />
                  <span class="capitalize font-semibold">{{ evo.name }}</span>
                </div>
                <i
                  v-if="index < evolution.length - 1"
                  class="fa-solid fa-arrow-right text-gray-500 text-2xl"
                ></i>
              </template>
            </div>

            <div class="text-sm text-gray-500 mt-2">
              Click Pokémon to see detail
            </div>
          </div>

          <div v-if="activeTab === 'moves'" class="grid grid-cols-2 gap-2">
            <span
              v-for="m in data?.moves.slice(0, 12)"
              :key="m.move.name"
              class="px-2 py-1 rounded bg-gray-100 capitalize text-center"
            >
              {{ m.move.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
