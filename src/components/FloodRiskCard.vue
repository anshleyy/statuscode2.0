<template>
  <div class="w-full flex justify-center">
    <div
      id="flood_risk_card"
      class="card min-w-sm max-w-sm border opacity-50 transition-shadow test shadow-lg hover:shadow-shadow-xl w-full rounded-md"
    >
      <div class="rounded-lg py-6 px-8 w-full bg-gray-900 text-white h-full">
        <button
          type="button"
          class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <FontAwesomeIcon :icon="['fa', 'close']" class="fa-2x" />
          <span class="sr-only">Close modal</span>
        </button>
        
        <div class="mt-5">
          <h2 class="font-bold text-3xl leading-none pb-1">Flood Risk</h2>
          <h3 class="leading-none pb-2 pl-1">{{ locationName }}</h3>
        </div>
        
        <template v-if="!props.asyncLoading && !floodLoadingErrorMsg.length">
          <div class="mt-5 mb-10">
            <p class="flex aling-center opacity-75">
              Last updated: {{ lastUpdatedFmt }}
            </p>
          </div>
          
          <!-- Risk Level Indicator -->
          <div class="mb-6">
            <div class="flex items-center justify-between">
              <span class="text-lg font-semibold">Risk Level:</span>
              <div 
                :class="[
                  'px-4 py-2 rounded-full font-bold text-white',
                  riskLevelClasses
                ]"
              >
                {{ props.floodRiskData.flood_risk }}
              </div>
            </div>
          </div>
          
          <!-- Sensor Readings -->
          <div class="space-y-3 mb-6">
            <div class="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <div class="flex items-center space-x-3">
                <FontAwesomeIcon :icon="['fas', 'water']" class="text-blue-400" />
                <span>Water Level</span>
              </div>
              <span class="font-bold text-blue-400">{{ props.floodRiskData.water_level }}m</span>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <div class="flex items-center space-x-3">
                <FontAwesomeIcon :icon="['fas', 'cloud-rain']" class="text-cyan-400" />
                <span>Rainfall</span>
              </div>
              <span class="font-bold text-cyan-400">{{ props.floodRiskData.rainfall_mm }}mm</span>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <div class="flex items-center space-x-3">
                <FontAwesomeIcon :icon="['fas', 'droplet']" class="text-green-400" />
                <span>Soil Moisture</span>
              </div>
              <span class="font-bold text-green-400">{{ (props.floodRiskData.soil_moisture * 100).toFixed(1) }}%</span>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <div class="flex items-center space-x-3">
                <FontAwesomeIcon :icon="['fas', 'temperature-half']" class="text-orange-400" />
                <span>Temperature</span>
              </div>
              <span class="font-bold text-orange-400">{{ props.floodRiskData.temp }}°C</span>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <div class="flex items-center space-x-3">
                <FontAwesomeIcon :icon="['fas', 'humidity']" class="text-purple-400" />
                <span>Humidity</span>
              </div>
              <span class="font-bold text-purple-400">{{ props.floodRiskData.humidity }}%</span>
            </div>
          </div>
          
          <!-- Risk Zones Info -->
          <div v-if="props.riskZones && props.riskZones.zones" class="mb-6">
            <h4 class="text-lg font-semibold mb-3">Nearby Risk Zones</h4>
            <div class="space-y-2">
              <div 
                v-for="(zone, index) in props.riskZones.zones.slice(0, 3)" 
                :key="index"
                class="flex justify-between items-center p-2 bg-gray-800 rounded"
              >
                <span class="text-sm">{{ zone.risk }} Risk</span>
                <span class="text-xs opacity-75">{{ zone.radius.toFixed(1) }}km away</span>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex space-x-3">
            <button 
              @click="showHistoricalData"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              <FontAwesomeIcon :icon="['fas', 'chart-line']" class="mr-2" />
              History
            </button>
            <button 
              @click="showRiskZones"
              class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              <FontAwesomeIcon :icon="['fas', 'map-marked-alt']" class="mr-2" />
              Map View
            </button>
          </div>
        </template>
        
        <!-- Loading State -->
        <div
          class="flex justify-center"
          v-else-if="props.asyncLoading"
          role="status"
        >
          <svg
            aria-hidden="true"
            class="w-48 h-48 pt-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span class="sr-only">Loading...</span>
        </div>
        
        <!-- Error State -->
        <div
          class="flex mt-20 space-x-2 items-center"
          v-if="floodLoadingErrorMsg.length > 0"
        >
          <div class="flex min-w-0 gap-x-4">
            <FontAwesomeIcon
              :icon="['fas', 'exclamation-triangle']"
              class="fa-2x"
              style="color: red"
            />
          </div>
          <div class="min-w-0 flex-auto px-4">
            <span class="font-bold text-2xl text-red-400">{{
              floodLoadingErrorMsg
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed, defineProps, defineEmits } from "vue";

const props = defineProps({
  floodRiskData: Object,
  riskZones: Object,
  floodLoadingErrorMsg: String,
  asyncLoading: Boolean,
  locationName: String
});

const emit = defineEmits(['showHistorical', 'showRiskZones']);

const riskLevelClasses = computed(() => {
  const risk = props.floodRiskData?.flood_risk;
  switch (risk) {
    case 'Low':
      return 'bg-green-600';
    case 'Moderate':
      return 'bg-yellow-600';
    case 'High':
      return 'bg-orange-600';
    case 'Critical':
      return 'bg-red-600';
    default:
      return 'bg-gray-600';
  }
});

const lastUpdatedFmt = computed(() => {
  if (!props.floodRiskData?.timestamp) return 'N/A';
  const date = new Date(props.floodRiskData.timestamp);
  return date.toLocaleString();
});

const showHistoricalData = () => {
  emit('showHistorical');
};

const showRiskZones = () => {
  emit('showRiskZones');
};
</script>

<style scoped>
#flood_risk_card {
  width: 450px;
  height: 100vh;
}
</style>
