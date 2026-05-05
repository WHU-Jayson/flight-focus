<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { addFlightRecord } from '../utils/storage.js'
import { getRandomTheme } from '../data/skyThemes.js'
import WindowView from './WindowView.vue'

const skyTheme = getRandomTheme()

const props = defineProps({
  flight: Object,
  seat: String,
  todo: Object,
})
const emit = defineEmits(['finish'])

const totalSeconds = props.flight.duration * 60
const remaining = ref(totalSeconds)
const isRunning = ref(false)
const isPaused = ref(false)
let interval = null

const progress = computed(() => 1 - remaining.value / totalSeconds)
const displayTime = computed(() => {
  const m = Math.floor(remaining.value / 60)
  const s = remaining.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const flightPhase = computed(() => {
  const p = progress.value
  if (p < 0.1) return 'boarding'
  if (p < 0.2) return 'takeoff'
  if (p < 0.8) return 'cruise'
  if (p < 0.95) return 'descent'
  return 'landing'
})

const phaseText = computed(() => {
  const map = {
    boarding: '正在登机...',
    takeoff: '起飞爬升中...',
    cruise: '巡航中 · 专注飞行',
    descent: '开始下降...',
    landing: '即将到达目的地',
  }
  return map[flightPhase.value]
})

function start() {
  if (isRunning.value && isPaused.value) {
    isPaused.value = false
    startTimer()
    return
  }
  isRunning.value = true
  startTimer()
}

function startTimer() {
  clearInterval(interval)
  interval = setInterval(() => {
    if (remaining.value > 0) {
      remaining.value--
    } else {
      finish()
    }
  }, 1000)
}

function pause() {
  isPaused.value = true
  clearInterval(interval)
}

const showCelebration = ref(false)

function finish() {
  clearInterval(interval)
  isRunning.value = false
  addFlightRecord({
    flightNo: props.flight.flightNo,
    airline: props.flight.airline,
    from: props.flight.from,
    to: props.flight.to,
    fromCode: props.flight.fromCode,
    toCode: props.flight.toCode,
    duration: props.flight.duration,
    seat: props.seat,
    todoText: props.todo?.text || '',
    completed: remaining.value === 0,
  })
  if (remaining.value === 0) {
    showCelebration.value = true
  }
}

function goHome() {
  showCelebration.value = false
  emit('finish')
}

function quit() {
  if (isRunning.value) {
    if (confirm('确定要中途结束飞行吗？')) {
      finish()
      emit('finish')
    }
  } else {
    emit('finish')
  }
}

onUnmounted(() => clearInterval(interval))
</script>

<template>
  <div class="timer-page">
    <!-- 顶部信息 -->
    <div class="timer-top">
      <button class="icon-btn" @click="quit">✕</button>
      <div class="top-info">
        <span class="top-airline">{{ flight.airline }}</span>
        <span class="top-flight">{{ flight.flightNo }}</span>
      </div>
      <div class="top-seat">{{ seat }}</div>
    </div>

    <!-- 舷窗 -->
    <div class="window-area">
      <WindowView :phase="flightPhase" :progress="progress" :theme="skyTheme" />
    </div>

    <!-- 路线进度 -->
    <div class="route-bar">
      <span class="rb-code">{{ flight.fromCode }}</span>
      <div class="rb-track">
        <div class="rb-fill" :style="{ width: progress * 100 + '%' }"></div>
        <div class="rb-plane" :style="{ left: progress * 100 + '%' }">✈</div>
      </div>
      <span class="rb-code">{{ flight.toCode }}</span>
    </div>

    <!-- 计时器 -->
    <div class="timer-body">
      <div class="phase-label">{{ phaseText }}</div>
      <div class="time-digits">{{ displayTime }}</div>

      <div class="task-tag" v-if="todo">
        <span class="tag-label">专注</span>
        {{ todo.text }}
      </div>

      <div class="controls">
        <button v-if="!isRunning" class="btn-primary" @click="start">开始飞行</button>
        <button v-else-if="!isPaused" class="btn-secondary" @click="pause">暂停</button>
        <button v-else class="btn-primary" @click="start">继续飞行</button>
      </div>
    </div>

    <!-- 到达庆祝 -->
    <div class="celebration" v-if="showCelebration">
      <div class="cele-card">
        <div class="cele-icon">🎉</div>
        <h2>到达{{ flight.to }}！</h2>
        <p class="cele-desc">你完成了一次 {{ flight.duration }} 分钟的专注飞行</p>
        <div class="cele-stats">
          <div class="cele-stat">
            <span class="cs-val">{{ flight.duration }}</span>
            <span class="cs-label">分钟</span>
          </div>
          <div class="cele-stat">
            <span class="cs-val">{{ flight.flightNo }}</span>
            <span class="cs-label">航班</span>
          </div>
          <div class="cele-stat">
            <span class="cs-val">{{ seat }}</span>
            <span class="cs-label">座位</span>
          </div>
        </div>
        <button class="btn-primary" @click="goHome">返回首页</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timer-page {
  min-height: 100vh;
  background: #131524;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* 顶部 */
.timer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  padding: 20px 24px 0;
  z-index: 10;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: rgba(232, 93, 117, 0.15);
  color: #e85d75;
}

.top-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

.top-airline {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.top-flight {
  font-size: 13px;
  font-weight: 600;
  color: #e85d75;
}

.top-seat {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
}

/* 舷窗区域 */
.window-area {
  flex: 1;
  width: 100%;
  position: relative;
  min-height: 420px;
}

/* 路线进度条 */
.route-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  max-width: 320px;
  padding: 0 24px;
  z-index: 10;
}

.rb-code {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 1px;
  flex-shrink: 0;
}

.rb-track {
  flex: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1px;
  position: relative;
}

.rb-fill {
  height: 100%;
  background: linear-gradient(90deg, #e85d75, #ff7a8f);
  border-radius: 1px;
  transition: width 1s linear;
}

.rb-plane {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 13px;
  color: #e85d75;
  transition: left 1s linear;
  filter: drop-shadow(0 0 4px rgba(232, 93, 117, 0.4));
}

/* 计时器主体 */
.timer-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 24px 40px;
  z-index: 10;
  width: 100%;
}

.phase-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.time-digits {
  font-size: 64px;
  font-weight: 200;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 4px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  margin-bottom: 16px;
}

.task-tag {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 24px;
  text-align: center;
  max-width: 280px;
  word-break: break-all;
}

.tag-label {
  color: #e85d75;
  font-size: 11px;
  background: rgba(232, 93, 117, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 6px;
}

.controls {
  display: flex;
  gap: 12px;
}

.btn-primary {
  padding: 14px 40px;
  border-radius: 30px;
  background: linear-gradient(135deg, #e85d75, #d04060);
  color: white;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(232, 93, 117, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(232, 93, 117, 0.4);
}

.btn-secondary {
  padding: 14px 40px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 1px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* 庆祝 */
.celebration {
  position: fixed;
  inset: 0;
  background: rgba(19, 21, 36, 0.9);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.5s ease;
}

.cele-card {
  text-align: center;
  padding: 40px;
  animation: slideUp 0.5s ease;
}

.cele-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.cele-card h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: white;
}

.cele-desc {
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  margin-bottom: 28px;
}

.cele-stats {
  display: flex;
  gap: 32px;
  justify-content: center;
  margin-bottom: 32px;
}

.cele-stat {
  text-align: center;
}

.cs-val {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #e85d75;
  margin-bottom: 2px;
}

.cs-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}
</style>
