const STORAGE_KEYS = {
  TODOS: 'flightfocus_todos',
  HISTORY: 'flightfocus_history',
  SETTINGS: 'flightfocus_settings',
}

export function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS)) || []
  } catch { return [] }
}

export function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos))
}

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || []
  } catch { return [] }
}

export function saveHistory(history) {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history))
}

export function addFlightRecord(record) {
  const history = loadHistory()
  history.unshift({
    ...record,
    id: Date.now(),
    completedAt: new Date().toISOString(),
  })
  // 只保留最近50条
  if (history.length > 50) history.length = 50
  saveHistory(history)
}

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {}
  } catch { return {} }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}

// 预约航班（日历事件）
const CALENDAR_KEY = 'flightfocus_calendar'

export function loadCalendar() {
  try {
    return JSON.parse(localStorage.getItem(CALENDAR_KEY)) || []
  } catch { return [] }
}

export function saveCalendar(events) {
  localStorage.setItem(CALENDAR_KEY, JSON.stringify(events))
}

export function addCalendarEvent(event) {
  const events = loadCalendar()
  events.push({ ...event, id: Date.now() })
  saveCalendar(events)
  return events
}

export function deleteCalendarEvent(id) {
  const events = loadCalendar().filter(e => e.id !== id)
  saveCalendar(events)
  return events
}

// 获取某天的事件
export function getEventsForDate(dateStr) {
  return loadCalendar().filter(e => e.date === dateStr)
}
