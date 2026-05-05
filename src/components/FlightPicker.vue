<script setup>
import { ref, computed } from 'vue'
import { getAllCities, getPopularCities, getFlightsFromCity, getRecommendedFlight } from '../utils/flightMatcher.js'
import SeatSelector from './SeatSelector.vue'
import BoardingPass from './BoardingPass.vue'
import WheelPicker from './WheelPicker.vue'

const props = defineProps({ selectedTodo: Object })
const emit = defineEmits(['back', 'start'])

// step: 1=选出发城市  2=航班面板(真实+虚拟)  3=选座位  4=登机牌
const step = ref(1)
const fromCity = ref('')
const searchFrom = ref('')
const selectedFlight = ref(null)
const selectedSeat = ref(null)

// 虚拟航班轮盘
const virtualDuration = ref(25)

const popularCities = getPopularCities(8)

const fromResults = computed(() => {
  if (!searchFrom.value) return []
  return getAllCities().filter(c => c.includes(searchFrom.value))
})

// 该城市所有真实直飞航班
const cityFlights = computed(() => {
  if (!fromCity.value) return []
  return getFlightsFromCity(fromCity.value).sort((a, b) => a.duration - b.duration)
})

// 虚拟航班匹配的目的地
const virtualDest = computed(() => getRecommendedFlight(virtualDuration.value))

const durationOptions = computed(() => {
  const items = []
  for (let m = 5; m <= 180; m += 5) {
    const dest = getRecommendedFlight(m)
    items.push({
      value: m,
      label: `${m} 分钟` + (dest ? `  →  ${dest.to}` : ''),
    })
  }
  return items
})

function selectFrom(city) {
  fromCity.value = city
  searchFrom.value = ''
  virtualDuration.value = 25
  step.value = 2
}

// 选择真实航班
function pickRealFlight(flight) {
  selectedFlight.value = flight
  step.value = 3
}

// 确认虚拟航班
function pickVirtualFlight() {
  const dest = virtualDest.value
  selectedFlight.value = {
    from: fromCity.value,
    to: dest ? dest.to : '未知',
    fromCode: dest ? dest.fromCode : '???',
    toCode: dest ? dest.toCode : '???',
    airline: 'VirtualAir',
    flightNo: 'VA' + String(virtualDuration.value).padStart(3, '0'),
    duration: virtualDuration.value,
  }
  step.value = 3
}

function confirmSeat(seat) {
  selectedSeat.value = seat
  step.value = 4
}

function goBack() {
  if (step.value === 2) {
    fromCity.value = ''
    step.value = 1
  } else if (step.value === 3) {
    step.value = 2
  } else if (step.value === 4) {
    step.value = 3
  } else {
    emit('back')
  }
}

function startFlight() {
  emit('start', selectedFlight.value, selectedSeat.value, props.selectedTodo)
}
</script>

<template>
  <div class="picker-page">
    <button class="back-btn" @click="goBack">← 返回</button>

    <!-- 步骤1：选出发城市 -->
    <div v-if="step === 1" class="step-content">
      <div class="step-header">
        <div class="step-icon">🛫</div>
        <h2>从哪里出发？</h2>
        <p class="step-desc">选择你的出发城市</p>
      </div>

      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input v-model="searchFrom" class="search-input" placeholder="搜索城市..." autofocus />
      </div>

      <div class="search-results" v-if="fromResults.length">
        <div v-for="city in fromResults.slice(0, 8)" :key="city" class="city-result" @click="selectFrom(city)">
          <span class="city-name">{{ city }}</span>
          <span class="city-arrow">→</span>
        </div>
      </div>

      <div class="city-section" v-if="!searchFrom">
        <h3 class="section-title">热门出发城市</h3>
        <div class="city-grid">
          <button v-for="city in popularCities" :key="city" class="city-chip" @click="selectFrom(city)">{{ city }}</button>
        </div>
      </div>

      <div class="city-section" v-if="!searchFrom">
        <h3 class="section-title">全部城市</h3>
        <div class="city-list">
          <button v-for="city in getAllCities()" :key="city" class="city-item" @click="selectFrom(city)">{{ city }}</button>
        </div>
      </div>
    </div>

    <!-- 步骤2：航班面板 -->
    <div v-if="step === 2" class="step-content">
      <div class="step-header">
        <div class="from-badge-big">{{ fromCity }}</div>
        <h2>选择航班</h2>
        <p class="step-desc">{{ fromCity }} 出发的所有直飞航班</p>
      </div>

      <!-- 真实航班列表 -->
      <div class="panel-section">
        <h3 class="panel-title">
          <span class="panel-dot"></span>
          真实航班 ({{ cityFlights.length }})
        </h3>
        <div class="flight-scroll">
          <div
            v-for="f in cityFlights"
            :key="f.flightNo"
            class="flight-row"
            @click="pickRealFlight(f)"
          >
            <div class="fr-left">
              <span class="fr-code">{{ f.toCode }}</span>
              <span class="fr-city">{{ f.to }}</span>
            </div>
            <div class="fr-mid">
              <div class="fr-line"></div>
              <span class="fr-plane">✈</span>
            </div>
            <div class="fr-right">
              <span class="fr-dur">{{ f.duration }}分钟</span>
              <span class="fr-no">{{ f.airline }} {{ f.flightNo }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分隔 -->
      <div class="divider">
        <span class="divider-line"></span>
        <span class="divider-text">或者</span>
        <span class="divider-line"></span>
      </div>

      <!-- 自定义虚拟航班 -->
      <div class="panel-section virtual-section">
        <h3 class="panel-title">
          <span class="panel-dot virtual"></span>
          自定义虚拟航班
        </h3>

        <!-- 虚拟目的地预览 -->
        <div class="virtual-preview">
          <div class="vp-route">
            <div class="vp-point">
              <span class="vp-code">{{ cityFlights[0]?.fromCode || '???' }}</span>
              <span class="vp-name">{{ fromCity }}</span>
            </div>
            <div class="vp-connector">
              <div class="vp-line"></div>
              <span class="vp-plane">✈</span>
              <div class="vp-line"></div>
            </div>
            <div class="vp-point">
              <span class="vp-code">{{ virtualDest?.toCode || '???' }}</span>
              <span class="vp-name">{{ virtualDest?.to || '选择时长' }}</span>
            </div>
          </div>
          <div class="vp-dur">{{ virtualDuration }} 分钟</div>
        </div>

        <!-- 轮盘 -->
        <WheelPicker
          :items="durationOptions"
          v-model="virtualDuration"
          :itemHeight="48"
          :visibleCount="5"
        />

        <button class="virtual-btn" @click="pickVirtualFlight">
          选择此虚拟航班 →
        </button>
      </div>
    </div>

    <!-- 步骤3：选座位 -->
    <div v-if="step === 3" class="step-content">
      <div class="step-header">
        <div class="route-preview">
          <span class="from-badge">{{ selectedFlight.from }}</span>
          <span class="route-arrow">✈</span>
          <span class="to-badge">{{ selectedFlight.to }}</span>
        </div>
        <h2>选择座位</h2>
        <p class="step-desc">{{ selectedFlight.airline }} {{ selectedFlight.flightNo }} · {{ selectedFlight.duration }}分钟</p>
      </div>
      <SeatSelector @confirm="confirmSeat" />
    </div>

    <!-- 步骤4：登机牌 -->
    <div v-if="step === 4" class="step-content">
      <div class="step-header">
        <h2>您的登机牌</h2>
        <p class="step-desc">准备登机，开始专注飞行</p>
      </div>
      <BoardingPass :flight="selectedFlight" :seat="selectedSeat" />
      <button class="primary-btn start-btn" @click="startFlight">✈ 开始登机</button>
    </div>
  </div>
</template>

<script>
import { getAllCities as _getAllCities } from '../utils/flightMatcher.js'
export default { methods: { getAllCities: _getAllCities } }
</script>

<style scoped>
.picker-page {
  padding: 16px 20px 24px;
}

.back-btn {
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  padding: 8px 0;
  margin-bottom: 4px;
  transition: color 0.2s;
}
.back-btn:hover { color: var(--text-primary); }

.step-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeIn 0.3s ease;
}

.step-header {
  text-align: center;
  margin-bottom: 4px;
}

.step-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.step-header h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
}

.step-desc {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 出发城市大标签 */
.from-badge-big {
  display: inline-block;
  background: rgba(233, 69, 96, 0.1);
  border: 1px solid rgba(233, 69, 96, 0.3);
  color: var(--accent);
  font-size: 16px;
  font-weight: 700;
  padding: 6px 20px;
  border-radius: 20px;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

/* 路线预览 */
.route-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 12px;
}

.from-badge, .to-badge {
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.from-badge { color: var(--accent); }
.to-badge { color: var(--accent-light); }

.route-arrow {
  color: var(--text-muted);
  font-size: 14px;
}

/* 搜索框 */
.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 4px 16px;
  border: 1px solid var(--border);
  transition: border-color 0.2s;
}

.search-box:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.search-icon {
  font-size: 14px;
  margin-right: 10px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding: 12px 0;
  font-size: 15px;
}

.search-input::placeholder { color: var(--text-muted); }

.search-results {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.city-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.city-result:hover {
  background: var(--bg-card-hover);
  border-color: var(--accent);
}

.city-name {
  font-size: 15px;
  font-weight: 500;
}

.city-arrow {
  color: var(--accent);
  font-size: 14px;
}

.city-section {
  margin-top: 4px;
}

.section-title {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 12px;
}

.city-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.city-chip {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 10px 18px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;
}

.city-chip:hover {
  background: rgba(233, 69, 96, 0.1);
  border-color: var(--accent);
  color: var(--accent);
}

.city-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 4px;
}

.city-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 8px;
  color: var(--text-secondary);
  font-size: 13px;
  transition: all 0.15s;
  text-align: center;
}

.city-item:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  border-color: rgba(255,255,255,0.12);
}

/* ===== 航班面板 ===== */
.panel-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.panel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 6px var(--accent-glow);
}

.panel-dot.virtual {
  background: var(--success);
  box-shadow: 0 0 6px rgba(46, 204, 113, 0.4);
}

/* 真实航班列表 */
.flight-scroll {
  max-height: 260px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 4px;
}

.flight-row {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.flight-row:hover {
  background: var(--bg-card-hover);
  border-color: var(--accent);
}

.fr-left {
  min-width: 70px;
}

.fr-code {
  display: block;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
}

.fr-city {
  font-size: 11px;
  color: var(--text-secondary);
}

.fr-mid {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.fr-line {
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.1);
}

.fr-plane {
  margin: 0 6px;
  color: var(--accent);
  font-size: 12px;
}

.fr-right {
  text-align: right;
}

.fr-dur {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.fr-no {
  font-size: 10px;
  color: var(--text-muted);
}

/* 分隔线 */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.divider-text {
  font-size: 12px;
  color: var(--text-muted);
}

/* 虚拟航班区域 */
.virtual-section {
  border-color: rgba(46, 204, 113, 0.2);
}

.virtual-preview {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  text-align: center;
}

.vp-route {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 10px;
}

.vp-point {
  text-align: center;
}

.vp-code {
  display: block;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
}

.vp-name {
  font-size: 11px;
  color: var(--text-secondary);
}

.vp-connector {
  flex: 1;
  display: flex;
  align-items: center;
  max-width: 100px;
}

.vp-line {
  flex: 1;
  height: 1px;
  background: var(--text-muted);
}

.vp-plane {
  margin: 0 6px;
  color: var(--accent);
  font-size: 13px;
}

.vp-dur {
  font-size: 24px;
  font-weight: 200;
  color: var(--accent);
  letter-spacing: 2px;
}

.virtual-btn {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--success), #27ae60);
  color: white;
  font-size: 15px;
  font-weight: 600;
  margin-top: 12px;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(46, 204, 113, 0.2);
}

.virtual-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(46, 204, 113, 0.3);
}

/* 按钮 */
.primary-btn {
  width: 100%;
  padding: 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--accent), #c0392b);
  color: white;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 4px 20px var(--accent-glow);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px var(--accent-glow);
}

.start-btn { margin-top: 8px; }
</style>
