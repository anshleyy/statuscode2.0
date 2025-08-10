// In App.vue
watch(searchTermRef, async (newTerms) => {
  if (newTerms && newTerms.length >= 3) {
    const results = GeoRadar.search(newTerms);
    console.log('Search results:', results);
    state.relevanceLocationVector = [...results];
  }
  // ...
});<script setup>
import { onMounted, ref, watch, reactive, computed, onBeforeMount } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import VRSpace from "./virtuality/VRSpace";
import {
  createMotionControls,
  animate,
  startCameraMovement,
} from "./virtuality/Motion";
import GeoRadar from "./map/GeoRadar";
import OpenWeatherMap from "./map/OpenWeatherMap";
import FloodRiskAPI from "./map/FloodRiskAPI";
import WeatherComposition from "./types/WeatherComposition";
import WeatherForecastCard from "./components/WeatherForecastCard.vue";
import FloodRiskCard from "./components/FloodRiskCard.vue";
import HistoricalDataChart from "./components/HistoricalDataChart.vue";

const isMobile = (function () {
  const regex =
    /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return regex.test(navigator.userAgent);
})();
const canvasContainerRef = ref();
const cameraControlIconRef = ref();
const weatherPopupRef = ref();
const floodRiskPopupRef = ref();
const historicalChartPopupRef = ref();
const searchTermRef = ref("");
const weatherForecastViewDataRef = ref();

let vrSpace = undefined;

const state = reactive({
  relevanceLocationVector: [],
  selectedLocationVector: new Array(),
  activeVRMarkerID: null,
  weatherForecastViewData: {
    id: undefined,
    locationFormatText: "",
    humidity: -1,
    windSpeed: -1,
    pressure: -1,
    visibility: -1,
    tempCelsius: -1,
    tempMaxCelsius: -1,
    tempMinCelsius: -1,
    weatherDescription: "",
    weatherParameterGroup: "",
  },
  floodRiskData: {
    location: "",
    flood_risk: "",
    water_level: 0,
    rainfall_mm: 0,
    soil_moisture: 0,
    temp: 0,
    humidity: 0,
    timestamp: "",
    coordinates: { lat: 0, lon: 0 }
  },
  riskZones: { zones: [] },
  historicalData: [],
  openWeatherInterface: {
    errorState: "",
    asyncLoading: false,
  },
  floodRiskInterface: {
    errorState: "",
    asyncLoading: false,
  },
  historicalInterface: {
    errorState: "",
    asyncLoading: false,
  },
  smallScreen: isMobile && innerWidth < 1024,
  showFloodRisk: false,
  showHistoricalChart: false,
});
// a computed ref
const relevanceResultVisible = computed(() => {
  return searchTermRef.value.length > 0;
});

library.add(fas);

const utils = {
  partialWeatherUpdate(id, fragment) {
    const mutatedVector = state.selectedLocationVector.map((cursor) =>
      cursor.id == id ? { ...cursor, ...fragment } : cursor
    );
    state.selectedLocationVector = [...mutatedVector];
  },
  isAlreadyLocationMarked(id) {
    return state.selectedLocationVector.some((cursor) => cursor.id == id);
  },
  getSelectedLocation(id) {
    return state.selectedLocationVector.find((cursor) => cursor.id === id);
  },
  computeWeatherAsset(id, weatherParameterGroup) {
    const g = WeatherComposition.WeatherConditions[weatherParameterGroup];
    if (g) {
      return g.findWeatherAsset(id);
    }
    return "./indicators/cloud.png";
  },
};

function VRSetup() {
  const VRContainer = canvasContainerRef.value;
  const VRCameraControlIcon = cameraControlIconRef.value;
  vrSpace = new VRSpace(VRContainer, VRCameraControlIcon, isMobile);
  createMotionControls(VRContainer, vrSpace, isMobile);
  animate(VRContainer, vrSpace);
}

function onRelevationItemSelect(id) {
  const iLocation = state.relevanceLocationVector.find(
    (item) => item.id === id
  );
  if (iLocation && !utils.isAlreadyLocationMarked(id)) {
    vrSpace.createVirtualMarker(id, iLocation.coord?.lat, iLocation.coord?.lon);
    state.selectedLocationVector.push({ ...iLocation });
    searchTermRef.value = "";
  }
}

async function onVRMarkerFocus(id) {
  if (id && utils.isAlreadyLocationMarked(id)) {
    state.activeVRMarkerID = id;
    state.openWeatherInterface.errorState = "";
    state.floodRiskInterface.errorState = "";
    
    const weatherPopupHTMLElement = weatherPopupRef.value;
    const { position } =
      vrSpace.selectVirtualMarker(
        state.activeVRMarkerID,
        weatherPopupHTMLElement
      ) || {};
      
    if (position) {
      startCameraMovement(position);
      let { coord } = utils.getSelectedLocation(state.activeVRMarkerID);
      
      // Fetch weather data
      state.openWeatherInterface.asyncLoading = true;
      try {
        const { id, main, name, sys, visibility, weather, wind, timezone, dt } =
          await OpenWeatherMap.fetchForecastWeatherData(
            coord.lat,
            coord.lon,
            "Metric"
          );
        const locationFormatText = sys.country + "," + name,
          humidity = main.humidity,
          windSpeed = main.speed,
          pressure = main.pressure,
          tempCelsius = main.temp.toFixed(0),
          tempMaxCelsius = main.temp_max.toFixed(1),
          tempMinCelsius = main.temp_min.toFixed(1),
          weatherAsset = utils.computeWeatherAsset(id, weather[0]?.main),
          weatherDescription = weather[0]?.description;
        state.weatherForecastViewData = {
          locationFormatText,
          humidity,
          windSpeed,
          pressure,
          visibility,
          tempCelsius,
          tempMaxCelsius,
          tempMinCelsius,
          weatherAsset,
          weatherDescription,
          timezone,
        };
        utils.partialWeatherUpdate(state.activeVRMarkerID, {
          tempCelsius,
          weatherAsset,
          weatherDescription,
        });
      } catch (error) {
        state.openWeatherInterface.errorState = error.name
          ? error.name + error.message
          : "network error";
      } finally {
        state.openWeatherInterface.asyncLoading = false;
      }
      
      // Fetch flood risk data
      state.floodRiskInterface.asyncLoading = true;
      try {
        const floodData = await FloodRiskAPI.fetchFloodRiskData(coord.lat, coord.lon);
        const riskZones = await FloodRiskAPI.fetchRiskZones(coord.lat, coord.lon);
        
        state.floodRiskData = {
          ...floodData,
          location: name || "Unknown Location"
        };
        state.riskZones = riskZones;
        
        // Update location with flood risk info
        utils.partialWeatherUpdate(state.activeVRMarkerID, {
          floodRisk: floodData.flood_risk,
          waterLevel: floodData.water_level
        });
        
      } catch (error) {
        state.floodRiskInterface.errorState = error.name
          ? error.name + error.message
          : "flood risk data error";
      } finally {
        state.floodRiskInterface.asyncLoading = false;
      }
    }
  }
}

onMounted(() => {
  VRSetup();
});

// Flood risk and historical data functions
async function fetchHistoricalData(period = 7) {
  if (!state.activeVRMarkerID) return;
  
  const location = utils.getSelectedLocation(state.activeVRMarkerID);
  if (!location) return;
  
  state.historicalInterface.asyncLoading = true;
  state.historicalInterface.errorState = "";
  
  try {
    const historicalData = await FloodRiskAPI.fetchHistoricalData(
      location.name, 
      period
    );
    state.historicalData = historicalData;
  } catch (error) {
    state.historicalInterface.errorState = error.name
      ? error.name + error.message
      : "historical data error";
  } finally {
    state.historicalInterface.asyncLoading = false;
  }
}

function showFloodRiskPanel() {
  state.showFloodRisk = true;
  state.showHistoricalChart = false;
}

function showHistoricalChart() {
  state.showHistoricalChart = true;
  state.showFloodRisk = false;
  fetchHistoricalData();
}

function closeFloodRiskPanel() {
  state.showFloodRisk = false;
}

function closeHistoricalChart() {
  state.showHistoricalChart = false;
}

function onHistoricalPeriodChanged(period) {
  fetchHistoricalData(period);
}

function getRiskColor(risk) {
  switch (risk) {
    case 'Low':
      return 'text-green-400';
    case 'Moderate':
      return 'text-yellow-400';
    case 'High':
      return 'text-orange-400';
    case 'Critical':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

function showRiskZones() {
  // This would integrate with the 3D globe to show risk zones
  // For now, we'll just show a message
  console.log('Showing risk zones on globe');
  // TODO: Implement 3D risk zone visualization
}

watch(searchTermRef, async (newTerms) => {
  if (newTerms && newTerms.length >= 3) {
    const results = GeoRadar.search(newTerms);
    console.log('Search results:', results);
    state.relevanceLocationVector = [...results];
  }
  if (!newTerms && state.relevanceLocationVector.length > 0) {
    state.relevanceLocationVector = [];
  }
});
</script>

<template>
  <div class="flex h-screen bg-black">
    <!-- SYSTEM PANEL -->
    <div
      v-if="!isMobile"
      class="w-1/3 flex flex-col py-8 px-10 overflow-auto"
      style="border-right: 0.25px solid cyan"
    >
      <!-- SEARCH BOX -->
      <div class="row-auto">
        <form id="search-box">
          <input
            type="text"
            placeholder="Search location..."
            v-model="searchTermRef"
          />
        </form>
      </div>
      <!-- RELEVANCE RESULT SET -->
      <ul
        v-if="relevanceResultVisible"
        id="suggestion-short-list"
        role="list"
        class="divide-gray-50 my-4"
      >
        <li
          v-for="item in state.relevanceLocationVector"
          :key="item.id"
          class="flex gap-x-6 py-4"
          @click="onRelevationItemSelect(item.id)"
        >
          <div class="flex min-w-0 gap-x-4">
            <FontAwesomeIcon
              icon="fa-solid fa-location-arrow"
              class="fa-2x"
              style="color: aqua"
            />
          </div>
          <div class="min-w-0 flex-auto px-4">
            <p class="truncate text-md leading-5 text-white">
              {{ item.name }}
            </p>
            <p class="mt-1 text-sm font-semibold leading-4 text-white">
              {{ item.country }}
            </p>
          </div>
          <div
            v-if="utils.isAlreadyLocationMarked(item.id)"
            class="hidden shrink-0 sm:flex sm:flex-col sm:items-end"
          >
            <div class="mt-1 flex items-center gap-x-1.5">
              <div class="flex-none p-1">
                <FontAwesomeIcon icon="fa-solid fa-lock" style="color: red" />
              </div>
              <p class="text-xs leading-5 text-gray-500">Locked</p>
            </div>
          </div>
        </li>
      </ul>
      <!-- SELECTED LOCATIONS -->
      <template v-if="!relevanceResultVisible">
        <ul
          v-if="state.selectedLocationVector.length > 0"
          id="active-location-list"
          role="list"
          class="divide-y divide-gray-100 my-4"
        >
          <li
            v-for="location in state.selectedLocationVector"
            :key="location.id"
            class="flex justify-between gap-x-6 py-4"
            @click="onVRMarkerFocus(location.id)"
          >
            <div class="flex min-w-0 gap-x-4 pt-2">
              <FontAwesomeIcon
                icon="fa-solid fa-location-crosshairs"
                :class="[
                  'fa-2x',
                  state.activeVRMarkerID == location.id
                    ? 'text-rose-600'
                    : 'text-cyan-600',
                ]"
              />
            </div>
            <div class="min-w-0 flex-auto px-4">
              <p class="truncate text-md leading-5 text-white">
                {{ location.name }}
              </p>
              <p class="mt-1 text-sm font-semibold leading-4 text-white">
                {{ location.country }}
              </p>
              <p class="mt-1 text-xs leading-5 text-gray-500">
                Geo coordinates
                {{ location.coord?.lat }}° / {{ location.coord?.lon }}°
              </p>
              <template
                v-if="location.tempCelsius && location.weatherDescription"
              >
                <p class="mt-1 text-xs leading-5 text-gray-500">
                  {{ location.tempCelsius }}ºC
                  {{ location.weatherDescription }}
                </p>
              </template>
              <template v-if="location.floodRisk">
                <p class="mt-1 text-xs leading-5" :class="getRiskColor(location.floodRisk)">
                  🌊 Flood Risk: {{ location.floodRisk }}
                </p>
              </template>
            </div>
            <div class="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
              <img
                v-if="location.weatherAsset"
                :src="location.weatherAsset"
                width="48"
                height="48"
              />
              <div
                class="mt-1 flex items-center gap-x-1.5"
                v-if="state.activeVRMarkerID == location.id"
              >
                <div class="flex-none rounded-full bg-rose-600/20 p-1">
                  <div class="h-1.5 w-1.5 rounded-full bg-rose-600" />
                </div>
                <p class="text-xs leading-5 text-gray-500">Active</p>
              </div>
            </div>
          </li>
        </ul>
        <dl
          v-else
          class="m-20 justify-space-between max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none"
        >
          <div class="flex items-center gap-x-6">
            <FontAwesomeIcon
              icon="fa-solid fa-earth-oceania"
              class="fa-3x"
              style="color: #3c5b6f"
            />
            <div>
              <p class="inline font-bold text-white-900 leading-6">
                Your location list is empty
              </p>
            </div>
          </div>
        </dl>
      </template>
    </div>
    <!-- CANVAS CONTAINER -->
    <div
      :class="state.smallScreen ? 'sm:w-full' : 'w-2/3'"
      ref="canvasContainerRef"
    >
      <canvas></canvas>
      
      <!-- Flood Risk Toggle Button -->
      <div 
        v-if="state.activeVRMarkerID && !state.showFloodRisk && !state.showHistoricalChart"
        class="absolute top-4 right-4 z-50"
      >
        <button
          @click="showFloodRiskPanel"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <FontAwesomeIcon :icon="['fas', 'water']" />
          <span>Flood Risk</span>
        </button>
      </div>
      
      <!-- Weather Toggle Button -->
      <div 
        v-if="state.activeVRMarkerID && (state.showFloodRisk || state.showHistoricalChart)"
        class="absolute top-4 right-4 z-50"
      >
        <button
          @click="closeFloodRiskPanel"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <FontAwesomeIcon :icon="['fas', 'cloud-sun']" />
          <span>Weather</span>
        </button>
      </div>
    </div>
    <div
      ref="weatherPopupRef"
      class="bg-black bg-opacity-20 fixed rounded"
      style="display: none"
    >
      <WeatherForecastCard
        :weatherForecastViewData="state.weatherForecastViewData"
        :openWeatherLoadingErrorMsg="state.openWeatherInterface.errorState"
        :asyncLoading="state.openWeatherInterface.asyncLoading"
      ></WeatherForecastCard>
    </div>
    
    <!-- Flood Risk Panel -->
    <div
      v-if="state.showFloodRisk"
      ref="floodRiskPopupRef"
      class="bg-black bg-opacity-20 fixed rounded"
      style="display: block; z-index: 1000;"
    >
      <FloodRiskCard
        :floodRiskData="state.floodRiskData"
        :riskZones="state.riskZones"
        :floodLoadingErrorMsg="state.floodRiskInterface.errorState"
        :asyncLoading="state.floodRiskInterface.asyncLoading"
        :locationName="state.floodRiskData.location"
        @showHistorical="showHistoricalChart"
        @showRiskZones="showRiskZones"
      ></FloodRiskCard>
    </div>
    
    <!-- Historical Data Chart -->
    <div
      v-if="state.showHistoricalChart"
      ref="historicalChartPopupRef"
      class="bg-black bg-opacity-20 fixed rounded"
      style="display: block; z-index: 1000;"
    >
      <HistoricalDataChart
        :historicalData="state.historicalData"
        :historicalLoadingErrorMsg="state.historicalInterface.errorState"
        :asyncLoading="state.historicalInterface.asyncLoading"
        :locationName="state.floodRiskData.location"
        @close="closeHistoricalChart"
        @periodChanged="onHistoricalPeriodChanged"
      ></HistoricalDataChart>
    </div>
    <div
      ref="cameraControlIconRef"
      class="bg-black bg-opacity-40 fixed rounded p-7"
      style="display: none"
    >
      <FontAwesomeIcon
        :icon="['fas', 'video']"
        class="fa-3x"
        style="color: white"
      />
    </div>
  </div>
</template>

<style scoped>
#search-box {
  position: relative;
}

#search-box > input {
  background: #eceef2;
  width: 100%;
  height: 41px;
  padding: 12px 15px;
  box-sizing: border-box;
  border-radius: 7px;
  border: none;
  font-weight: bold;
  font-size: 16px;
  line-height: 38px;
  /* identical to box height */
  color: #000000;
}

#active-location-list > li,
#suggestion-short-list > li {
  cursor: pointer;
}
</style>