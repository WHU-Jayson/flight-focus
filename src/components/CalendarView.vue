<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadCalendar, addCalendarEvent, deleteCalendarEvent } from '../utils/storage.js'
import { getPopularCities, getDestinationsFrom, getFlightsBetween } from '../utils/flightMatcher.js'

const events = ref([])
const viewMode = ref('week') // week | month
const currentDate = ref(new Date())
const showBooking = ref(false)
const bookingStep = ref(1)

// 预约表单
const bookDate = ref('')
const bookTime = ref('09:00')
const bookFrom = ref('')
const bookTo = ref('')
const bookDuration = ref(25)
const bookTodo = ref('')

const popularCities = getPopularCities(8)

onMounted(() => {
  events.value = loadCalendar()
  const today = new Date()
  bookDate.value = formatDateStr(today)
})

// 周视图：获取本周7天
const weekDays = computed(() => {
  const d = new Date(currentDate.value)
  const day = d.getDay()
  const start = new Date(d)
  start.setDate(d.getDate() - (day === 0 ? 6 : day - 1)) // 周一开始
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    days.push({
      date,
      dateStr: formatDateStr(date),
      dayName: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
      dayNum: date.getDate(),
      isToday: formatDateStr(date) === formatDateStr(new Date()),
      events: events.value.filter(e => e.date === formatDateStr(date)),
    })
  }
  return days
})

// 月视图
const monthGrid = computed(() => {
  const d = currentDate.value
  const year = d.getFullYear()
  const month = d.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  let startDay = firstDay.getDay()
  if (startDay === 0) startDay = 7
  startDay--

  const grid = []
  // 填充上月
  const prevMonth = new Date(year, month, 0)
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonth.getDate() - i)
    grid.push(makeDayCell(date, false))
  }
  // 本月
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    grid.push(makeDayCell(date, true))
  }
  // 填充下月
  const remain = 42 - grid.length
  for (let i = 1; i <= remain; i++) {
    const date = new Date(year, month + 1, i)
    grid.push(makeDayCell(date, false))
  }
  return grid
})

function makeDayCell(date, isCurrentMonth) {
  const dateStr = formatDateStr(date)
  return {
    date,
    dateStr,
    dayNum: date.getDate(),
    isCurrentMonth,
    isToday: dateStr === formatDateStr(new Date()),
    events: events.value.filter(e => e.date === dateStr),
  }
}

const monthTitle = computed(() => {
  const d = currentDate.value
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
})

function formatDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function prevPeriod() {
  const d = new Date(currentDate.value)
  if (viewMode.value === 'week') d.setDate(d.getDate() - 7)
  else d.setMonth(d.getMonth() - 1)
  currentDate.value = d
}

function nextPeriod() {
  const d = new Date(currentDate.value)
  if (viewMode.value === 'week') d.setDate(d.getDate() + 7)
  else d.setMonth(d.getMonth() + 1)
  currentDate.value = d
}

function goToday() {
  currentDate.value = new Date()
}

// 预约相关
const destinations = computed(() => bookFrom.value ? getDestinationsFrom(bookFrom.value) : [])

function openBooking() {
  showBooking.value = true
  bookingStep.value = 1
  bookFrom.value = ''
  bookTo.value = ''
  bookTodo.value = ''
  bookDuration.value = 25
}

function selectFromCity(city) {
  bookFrom.value = city
  bookingStep.value = 2
}

function selectToCity(city) {
  bookTo.value = city
  const flights = getFlightsBetween(bookFrom.value, bookTo.value)
  if (flights.length) bookDuration.value = flights[0].duration
  bookingStep.value = 3
}

function confirmBooking() {
  if (!bookDate.value || !bookTime.value || !bookFrom.value || !bookTo.value) return
  events.value = addCalendarEvent({
    date: bookDate.value,
    time: bookTime.value,
    from: bookFrom.value,
    to: bookTo.value,
    duration: bookDuration.value,
    todo: bookTodo.value,
    status: 'booked',
  })
  showBooking.value = false
}

function removeEvent(id) {
  events.value = deleteCalendarEvent(id)
}

function formatTime(t) {
  return t || ''
}
</script>

<template>
  <div class="calendar-page">
    <!-- 头部控制 -->
    <div class="cal-header">
      <div class="cal-nav">
        <button class="nav-arrow" @click="prevPeriod">‹</button>
        <button class="today-btn" @click="goToday">今天</button>
        <button class="nav-arrow" @click="nextPeriod">›</button>
      </div>
      <div class="view-toggle">
        <button :class="['toggle-btn', { active: viewMode === 'week' }]" @click="viewMode = 'week'">周</button>
        <button :class="['toggle-btn', { active: viewMode === 'month' }]" @click="viewMode = 'month'">月</button>
      </div>
    </div>

    <!-- 周视图 -->
    <div v-if="viewMode === 'week'" class="week-view">
      <div
        v-for="day in weekDays"
        :key="day.dateStr"
        :class="['week-day', { today: day.isToday }]"
      >
        <div class="day-header">
          <span class="day-name">{{ day.dayName }}</span>
          <span :class="['day-num', { today: day.isToday }]">{{ day.dayNum }}</span>
        </div>
        <div class="day-events">
          <div
            v-for="ev in day.events"
            :key="ev.id"
            class="event-card"
          >
            <div class="event-time">{{ formatTime(ev.time) }}</div>
            <div class="event-route">
              <span>{{ ev.from }}</span>
              <span class="event-arrow">✈</span>
              <span>{{ ev.to }}</span>
            </div>
            <div class="event-meta">
              <span>{{ ev.duration }}分钟</span>
              <button class="event-del" @click.stop="removeEvent(ev.id)">×</button>
            </div>
            <div class="event-todo" v-if="ev.todo">{{ ev.todo }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 月视图 -->
    <div v-if="viewMode === 'month'" class="month-view">
      <div class="month-header-label">{{ monthTitle }}</div>
      <div class="month-weekdays">
        <span v-for="d in ['一','二','三','四','五','六','日']" :key="d">{{ d }}</span>
      </div>
      <div class="month-grid">
        <div
          v-for="cell in monthGrid"
          :key="cell.dateStr"
          :class="['month-cell', { other: !cell.isCurrentMonth, today: cell.isToday }]"
          @click="bookDate = cell.dateStr; openBooking()"
        >
          <span :class="['cell-num', { today: cell.isToday }]">{{ cell.dayNum }}</span>
          <div class="cell-events">
            <div
              v-for="ev in cell.events.slice(0, 2)"
              :key="ev.id"
              class="cell-event"
            >
              {{ ev.from }}→{{ ev.to }}
            </div>
            <div v-if="cell.events.length > 2" class="cell-more">+{{ cell.events.length - 2 }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 周视图下也显示预约按钮 -->
    <button class="fab" @click="openBooking" v-if="!showBooking">
      <span>+</span>
      <span class="fab-text">预约航班</span>
    </button>

    <!-- 预约弹窗 -->
    <div class="booking-overlay" v-if="showBooking" @click.self="showBooking = false">
      <div class="booking-modal">
        <div class="modal-header">
          <h3>预约专注航班</h3>
          <button class="modal-close" @click="showBooking = false">×</button>
        </div>

        <!-- 步骤1：选出发 -->
        <div v-if="bookingStep === 1" class="booking-step">
          <p class="book-label">出发城市</p>
          <div class="book-city-grid">
            <button
              v-for="city in popularCities"
              :key="city"
              :class="['book-city', { active: bookFrom === city }]"
              @click="selectFromCity(city)"
            >{{ city }}</button>
          </div>
        </div>

        <!-- 步骤2：选到达 -->
        <div v-if="bookingStep === 2" class="booking-step">
          <p class="book-label">{{ bookFrom }} → 到达城市</p>
          <div class="book-city-grid">
            <button
              v-for="city in destinations"
              :key="city"
              :class="['book-city', { active: bookTo === city }]"
              @click="selectToCity(city)"
            >{{ city }}</button>
          </div>
          <button class="book-back" @click="bookingStep = 1">← 重选出发</button>
        </div>

        <!-- 步骤3：填写详情 -->
        <div v-if="bookingStep === 3" class="booking-step">
          <div class="book-route-summary">
            <span>{{ bookFrom }}</span>
            <span class="book-arrow">✈</span>
            <span>{{ bookTo }}</span>
            <span class="book-dur">{{ bookDuration }}分钟</span>
          </div>

          <div class="book-field">
            <label>日期</label>
            <input type="date" v-model="bookDate" class="book-input" />
          </div>

          <div class="book-field">
            <label>时间</label>
            <input type="time" v-model="bookTime" class="book-input" />
          </div>

          <div class="book-field">
            <label>专注任务（可选）</label>
            <input v-model="bookTodo" class="book-input" placeholder="写点什么..." />
          </div>

          <div class="book-field">
            <label>时长（分钟）</label>
            <input type="number" v-model.number="bookDuration" class="book-input" min="5" max="300" />
          </div>

          <button class="book-confirm" @click="confirmBooking">确认预约</button>
          <button class="book-back" @click="bookingStep = 2">← 重选航线</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-page {
  padding: 16px 12px 80px;
  animation: fadeIn 0.3s ease;
}

/* 头部 */
.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 4px;
}

.cal-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-arrow {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-primary);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.nav-arrow:hover { background: var(--bg-card-hover); }

.today-btn {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  transition: all 0.15s;
}

.today-btn:hover { color: var(--text-primary); background: var(--bg-card-hover); }

.view-toggle {
  display: flex;
  background: var(--bg-card);
  border-radius: 10px;
  border: 1px solid var(--border);
  overflow: hidden;
}

.toggle-btn {
  padding: 6px 18px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  transition: all 0.15s;
}

.toggle-btn.active {
  background: var(--accent);
  color: white;
}

/* 周视图 */
.week-view {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.week-day {
  min-height: 120px;
}

.week-day.today {
  background: rgba(233, 69, 96, 0.05);
  border-radius: 10px;
}

.day-header {
  text-align: center;
  padding: 8px 0 6px;
}

.day-name {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
}

.day-num {
  display: inline-block;
  font-size: 16px;
  font-weight: 600;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  border-radius: 50%;
}

.day-num.today {
  background: var(--accent);
  color: white;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 2px;
}

.event-card {
  background: rgba(233, 69, 96, 0.12);
  border-left: 2px solid var(--accent);
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 10px;
}

.event-time {
  color: var(--accent);
  font-weight: 600;
  font-size: 11px;
}

.event-route {
  display: flex;
  align-items: center;
  gap: 3px;
  margin: 2px 0;
  font-size: 10px;
}

.event-arrow {
  font-size: 8px;
  color: var(--accent);
}

.event-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-muted);
  font-size: 9px;
}

.event-del {
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  padding: 0;
  line-height: 1;
  transition: color 0.15s;
}

.event-del:hover { color: var(--accent); }

.event-todo {
  color: var(--text-muted);
  font-size: 9px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 月视图 */
.month-view {
  animation: fadeIn 0.2s ease;
}

.month-header-label {
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-secondary);
}

.month-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.month-cell {
  min-height: 70px;
  background: var(--bg-card);
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.month-cell:hover {
  border-color: var(--accent);
  background: var(--bg-card-hover);
}

.month-cell.other {
  opacity: 0.3;
}

.month-cell.today {
  border-color: var(--accent);
  background: rgba(233, 69, 96, 0.05);
}

.cell-num {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.cell-num.today {
  background: var(--accent);
  color: white;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
}

.cell-events {
  margin-top: 4px;
}

.cell-event {
  font-size: 9px;
  background: rgba(233, 69, 96, 0.15);
  color: var(--accent-light);
  padding: 2px 4px;
  border-radius: 3px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-more {
  font-size: 9px;
  color: var(--text-muted);
  text-align: center;
}

/* FAB 按钮 */
.fab {
  position: fixed;
  bottom: 24px;
  right: calc(50% - 220px);
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--accent), #c0392b);
  color: white;
  padding: 14px 24px;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 20px var(--accent-glow);
  z-index: 50;
  transition: all 0.3s;
}

.fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px var(--accent-glow);
}

.fab span:first-child {
  font-size: 20px;
  font-weight: 300;
}

/* 预约弹窗 */
.booking-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.2s ease;
}

.booking-modal {
  background: var(--bg-secondary);
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  color: var(--text-secondary);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.booking-step {
  animation: fadeIn 0.2s ease;
}

.book-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.book-city-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.book-city {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 10px 18px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.15s;
}

.book-city:hover, .book-city.active {
  background: rgba(233, 69, 96, 0.15);
  border-color: var(--accent);
  color: var(--accent);
}

.book-route-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-card);
  border-radius: 12px;
}

.book-arrow { color: var(--accent); }

.book-dur {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 400;
  background: rgba(255,255,255,0.05);
  padding: 4px 10px;
  border-radius: 8px;
}

.book-field {
  margin-bottom: 14px;
}

.book-field label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.book-input {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  color: var(--text-primary);
  font-size: 14px;
  transition: border-color 0.2s;
}

.book-input:focus {
  border-color: var(--accent);
  outline: none;
}

.book-confirm {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent), #c0392b);
  color: white;
  font-size: 15px;
  font-weight: 600;
  margin-top: 8px;
  transition: all 0.2s;
}

.book-confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px var(--accent-glow);
}

.book-back {
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  padding: 10px;
  margin-top: 8px;
  width: 100%;
  text-align: center;
}

.book-back:hover { color: var(--text-secondary); }
</style>
