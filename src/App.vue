<script setup>
import { ref } from 'vue'
import TodoList from './components/TodoList.vue'
import FlightPicker from './components/FlightPicker.vue'
import FlightTimer from './components/FlightTimer.vue'
import FlightHistory from './components/FlightHistory.vue'
import CalendarView from './components/CalendarView.vue'

const currentView = ref('home')
const selectedFlight = ref(null)
const selectedSeat = ref(null)
const selectedTodo = ref(null)

function startFlight(flight, seat, todo) {
  selectedFlight.value = flight
  selectedSeat.value = seat
  selectedTodo.value = todo
  currentView.value = 'timer'
}

function goHome() {
  currentView.value = 'home'
  selectedFlight.value = null
  selectedSeat.value = null
  selectedTodo.value = null
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header" v-if="currentView !== 'timer'">
      <div class="header-left" @click="goHome" style="cursor:pointer">
        <span class="logo">✈</span>
        <h1 class="title">FlightFocus</h1>
      </div>
      <nav class="header-nav">
        <button
          :class="['nav-btn', { active: currentView === 'home' }]"
          @click="currentView = 'home'"
        >待办</button>
        <button
          :class="['nav-btn', { active: currentView === 'calendar' }]"
          @click="currentView = 'calendar'"
        >行程</button>
        <button
          :class="['nav-btn', { active: currentView === 'history' }]"
          @click="currentView = 'history'"
        >记录</button>
      </nav>
    </header>

    <main class="app-main">
      <TodoList v-if="currentView === 'home'" @start-focus="(todo) => { selectedTodo = todo; currentView = 'picker' }" />
      <FlightPicker
        v-else-if="currentView === 'picker'"
        :selectedTodo="selectedTodo"
        @back="currentView = 'home'"
        @start="startFlight"
      />
      <FlightTimer
        v-else-if="currentView === 'timer'"
        :flight="selectedFlight"
        :seat="selectedSeat"
        :todo="selectedTodo"
        @finish="goHome"
      />
      <FlightHistory v-else-if="currentView === 'history'" />
      <CalendarView v-else-if="currentView === 'calendar'" />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  font-size: 22px;
  filter: drop-shadow(0 0 8px var(--accent-glow));
}

.title {
  font-size: 17px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff, var(--accent-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-nav {
  display: flex;
  gap: 4px;
}

.nav-btn {
  background: transparent;
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  transition: all 0.2s;
}

.nav-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-btn.active {
  color: var(--accent);
  background: rgba(233, 69, 96, 0.1);
}

.app-main {
  min-height: calc(100vh - 56px);
}
</style>
