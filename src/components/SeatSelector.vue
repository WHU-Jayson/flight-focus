<script setup>
import { ref } from 'vue'

const emit = defineEmits(['confirm'])

const selectedSeat = ref(null)
const rows = 15
const cols = ['A', 'B', 'C', 'D', 'E', 'F']
const occupied = new Set(['3B', '5A', '5C', '7D', '8F', '10A', '10B', '12E', '14C'])

function seatLabel(row, col) {
  return `${row}${col}`
}

function isOccupied(row, col) {
  return occupied.has(seatLabel(row, col))
}

function isSelected(row, col) {
  return selectedSeat.value === seatLabel(row, col)
}

function isWindow(col) {
  return col === 'A' || col === 'F'
}

function isAisle(col) {
  return col === 'C' || col === 'D'
}

function selectSeat(row, col) {
  if (isOccupied(row, col)) return
  selectedSeat.value = seatLabel(row, col)
}

function getSeatType(col) {
  if (isWindow(col)) return '靠窗'
  if (isAisle(col)) return '过道'
  return '中间'
}

function confirm() {
  if (selectedSeat.value) emit('confirm', selectedSeat.value)
}
</script>

<template>
  <div class="seat-selector">
    <!-- 图例 -->
    <div class="legend">
      <div class="legend-item">
        <span class="legend-seat available"></span>
        <span>可选</span>
      </div>
      <div class="legend-item">
        <span class="legend-seat selected"></span>
        <span>已选</span>
      </div>
      <div class="legend-item">
        <span class="legend-seat occupied"></span>
        <span>已占</span>
      </div>
    </div>

    <!-- 座位图 -->
    <div class="seat-map">
      <!-- 列标签 -->
      <div class="col-labels">
        <span v-for="col in cols.slice(0, 3)" :key="col" class="col-label">{{ col }}</span>
        <span class="col-aisle"></span>
        <span v-for="col in cols.slice(3)" :key="col" class="col-label">{{ col }}</span>
      </div>

      <!-- 座位行 -->
      <div v-for="row in rows" :key="row" class="seat-row">
        <span class="row-label">{{ row }}</span>
        <button
          v-for="col in cols.slice(0, 3)"
          :key="col"
          :class="['seat', { occupied: isOccupied(row, col), selected: isSelected(row, col), window: isWindow(col) }]"
          @click="selectSeat(row, col)"
          :disabled="isOccupied(row, col)"
        >
          <span v-if="isSelected(row, col)">✈</span>
        </button>
        <span class="row-aisle">{{ row }}</span>
        <button
          v-for="col in cols.slice(3)"
          :key="col"
          :class="['seat', { occupied: isOccupied(row, col), selected: isSelected(row, col), window: isWindow(col) }]"
          @click="selectSeat(row, col)"
          :disabled="isOccupied(row, col)"
        >
          <span v-if="isSelected(row, col)">✈</span>
        </button>
      </div>
    </div>

    <!-- 选中信息 -->
    <div class="selected-info" v-if="selectedSeat">
      <div class="seat-detail">
        <span class="seat-number">{{ selectedSeat }}</span>
        <span class="seat-type">{{ getSeatType(selectedSeat.slice(-1)) }}</span>
      </div>
      <button class="confirm-btn" @click="confirm">确认座位</button>
    </div>
  </div>
</template>

<style scoped>
.seat-selector {
  animation: fadeIn 0.3s ease;
}

.legend {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 12px;
  color: var(--text-secondary);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-seat {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

.legend-seat.available {
  background: var(--bg-card);
  border: 1px solid var(--border);
}

.legend-seat.selected {
  background: var(--accent);
}

.legend-seat.occupied {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.seat-map {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid var(--border);
  overflow-x: auto;
}

.col-labels {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 8px;
  padding-left: 28px;
}

.col-label {
  width: 36px;
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
}

.col-aisle {
  width: 20px;
}

.seat-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 4px;
}

.row-label, .row-aisle {
  width: 20px;
  text-align: center;
  font-size: 10px;
  color: var(--text-muted);
}

.row-aisle {
  width: 20px;
}

.seat {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.seat:not(.occupied):hover {
  background: rgba(233, 69, 96, 0.2);
  border-color: var(--accent);
  cursor: pointer;
}

.seat.selected {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 10px var(--accent-glow);
  animation: pulse 1.5s ease infinite;
}

.seat.occupied {
  background: rgba(255, 255, 255, 0.03);
  border-color: transparent;
  cursor: not-allowed;
  opacity: 0.3;
}

.seat.window {
  border-left: 2px solid rgba(100, 200, 255, 0.2);
}

.selected-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 14px 18px;
  margin-top: 16px;
  border: 1px solid var(--accent);
}

.seat-detail {
  display: flex;
  align-items: center;
  gap: 10px;
}

.seat-number {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
}

.seat-type {
  font-size: 12px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: 3px 8px;
  border-radius: 6px;
}

.confirm-btn {
  background: var(--accent);
  color: white;
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.confirm-btn:hover {
  background: var(--accent-light);
  transform: translateY(-1px);
}
</style>
