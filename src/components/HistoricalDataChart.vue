<template>
  <div class="w-full flex justify-center">
    <div
      id="historical_data_chart"
      class="card min-w-sm max-w-sm border opacity-50 transition-shadow test shadow-lg hover:shadow-shadow-xl w-full rounded-md"
    >
      <div class="rounded-lg py-6 px-8 w-full bg-gray-900 text-white h-full">
        <button
          type="button"
          @click="closeChart"
          class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <FontAwesomeIcon :icon="['fa', 'close']" class="fa-2x" />
          <span class="sr-only">Close modal</span>
        </button>
        
        <div class="mt-5">
          <h2 class="font-bold text-3xl leading-none pb-1">Historical Data</h2>
          <h3 class="leading-none pb-2 pl-1">{{ locationName }}</h3>
        </div>
        
        <!-- Time Range Selector -->
        <div class="mt-5 mb-6">
          <div class="flex space-x-2">
            <button 
              v-for="period in timePeriods" 
              :key="period.value"
              @click="selectTimePeriod(period.value)"
              :class="[
                'px-3 py-2 rounded text-sm font-medium',
                selectedPeriod === period.value 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              ]"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
        
        <template v-if="!props.asyncLoading && !historicalLoadingErrorMsg.length">
          <!-- Chart Container -->
          <div class="mb-6">
            <canvas ref="chartCanvas" width="400" height="300"></canvas>
          </div>
          
          <!-- Summary Stats -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-800 p-3 rounded-lg">
              <div class="text-sm text-gray-400">Avg Water Level</div>
              <div class="text-xl font-bold text-blue-400">{{ avgWaterLevel }}m</div>
            </div>
            <div class="bg-gray-800 p-3 rounded-lg">
              <div class="text-sm text-gray-400">Max Rainfall</div>
              <div class="text-xl font-bold text-cyan-400">{{ maxRainfall }}mm</div>
            </div>
            <div class="bg-gray-800 p-3 rounded-lg">
              <div class="text-sm text-gray-400">Risk Changes</div>
              <div class="text-xl font-bold text-orange-400">{{ riskChanges }}</div>
            </div>
            <div class="bg-gray-800 p-3 rounded-lg">
              <div class="text-sm text-gray-400">Current Trend</div>
              <div class="text-xl font-bold" :class="trendColor">{{ currentTrend }}</div>
            </div>
          </div>
          
          <!-- Risk Timeline -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold mb-3">Risk Timeline</h4>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              <div 
                v-for="(entry, index) in riskTimeline" 
                :key="index"
                class="flex justify-between items-center p-2 bg-gray-800 rounded text-sm"
              >
                <span>{{ entry.date }}</span>
                <div 
                  :class="[
                    'px-2 py-1 rounded text-xs font-bold',
                    getRiskColor(entry.risk)
                  ]"
                >
                  {{ entry.risk }}
                </div>
              </div>
            </div>
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
          v-if="historicalLoadingErrorMsg.length > 0"
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
              historicalLoadingErrorMsg
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed, defineProps, defineEmits, ref, onMounted, watch } from "vue";

const props = defineProps({
  historicalData: Array,
  historicalLoadingErrorMsg: String,
  asyncLoading: Boolean,
  locationName: String
});

const emit = defineEmits(['close']);

const chartCanvas = ref(null);
const selectedPeriod = ref(7);

const timePeriods = [
  { label: '24h', value: 1 },
  { label: '7d', value: 7 },
  { label: '30d', value: 30 }
];

const avgWaterLevel = computed(() => {
  if (!props.historicalData || props.historicalData.length === 0) return '0.0';
  const sum = props.historicalData.reduce((acc, item) => acc + parseFloat(item.water_level), 0);
  return (sum / props.historicalData.length).toFixed(1);
});

const maxRainfall = computed(() => {
  if (!props.historicalData || props.historicalData.length === 0) return '0.0';
  const max = Math.max(...props.historicalData.map(item => parseFloat(item.rainfall_mm)));
  return max.toFixed(1);
});

const riskChanges = computed(() => {
  if (!props.historicalData || props.historicalData.length < 2) return '0';
  let changes = 0;
  for (let i = 1; i < props.historicalData.length; i++) {
    if (props.historicalData[i].risk !== props.historicalData[i-1].risk) {
      changes++;
    }
  }
  return changes;
});

const currentTrend = computed(() => {
  if (!props.historicalData || props.historicalData.length < 2) return 'Stable';
  const recent = props.historicalData.slice(-3);
  const waterLevels = recent.map(item => parseFloat(item.water_level));
  
  if (waterLevels[waterLevels.length - 1] > waterLevels[0]) return 'Rising';
  if (waterLevels[waterLevels.length - 1] < waterLevels[0]) return 'Falling';
  return 'Stable';
});

const trendColor = computed(() => {
  switch (currentTrend.value) {
    case 'Rising': return 'text-red-400';
    case 'Falling': return 'text-green-400';
    default: return 'text-yellow-400';
  }
});

const riskTimeline = computed(() => {
  if (!props.historicalData) return [];
  
  // Group by day and get the most common risk for each day
  const dailyRisks = {};
  props.historicalData.forEach(item => {
    const date = new Date(item.timestamp).toLocaleDateString();
    if (!dailyRisks[date]) {
      dailyRisks[date] = { risk: item.risk, count: 1 };
    } else {
      dailyRisks[date].count++;
    }
  });
  
  return Object.entries(dailyRisks)
    .map(([date, data]) => ({ date, risk: data.risk }))
    .slice(-5); // Show last 5 days
});

const getRiskColor = (risk) => {
  switch (risk) {
    case 'Low': return 'bg-green-600';
    case 'Moderate': return 'bg-yellow-600';
    case 'High': return 'bg-orange-600';
    case 'Critical': return 'bg-red-600';
    default: return 'bg-gray-600';
  }
};

const selectTimePeriod = (period) => {
  selectedPeriod.value = period;
  // Emit event to parent to fetch new data
  emit('periodChanged', period);
};

const closeChart = () => {
  emit('close');
};

// Simple chart rendering (you can replace with Chart.js or D3.js)
const renderChart = () => {
  if (!chartCanvas.value || !props.historicalData) return;
  
  const canvas = chartCanvas.value;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  if (props.historicalData.length === 0) return;
  
  // Draw water level line
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  const dataPoints = props.historicalData.map((item, index) => ({
    x: (index / (props.historicalData.length - 1)) * width,
    y: height - (parseFloat(item.water_level) / 5) * height
  }));
  
  dataPoints.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  
  ctx.stroke();
  
  // Draw data points
  ctx.fillStyle = '#3b82f6';
  dataPoints.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fill();
  });
};

onMounted(() => {
  renderChart();
});

watch(() => props.historicalData, renderChart, { deep: true });
</script>

<style scoped>
#historical_data_chart {
  width: 450px;
  height: 100vh;
}
</style>
