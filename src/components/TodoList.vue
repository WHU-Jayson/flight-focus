<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { loadTodos, saveTodos } from '../utils/storage.js'

const emit = defineEmits(['start-focus'])

const todos = ref([])
const newTodo = ref('')
const editingId = ref(null)
const editText = ref('')

onMounted(() => {
  todos.value = loadTodos()
})

watch(todos, (val) => saveTodos(val), { deep: true })

const incompleteTodos = computed(() => todos.value.filter(t => !t.done))
const completedTodos = computed(() => todos.value.filter(t => t.done))

function addTodo() {
  const text = newTodo.value.trim()
  if (!text) return
  todos.value.unshift({
    id: Date.now(),
    text,
    done: false,
    createdAt: new Date().toISOString(),
  })
  newTodo.value = ''
}

function toggleTodo(todo) {
  todo.done = !todo.done
}

function deleteTodo(id) {
  todos.value = todos.value.filter(t => t.id !== id)
}

function startEdit(todo) {
  editingId.value = todo.id
  editText.value = todo.text
}

function confirmEdit(todo) {
  const text = editText.value.trim()
  if (text) todo.text = text
  editingId.value = null
}

function startFocus(todo) {
  emit('start-focus', todo)
}
</script>

<template>
  <div class="todo-page">
    <!-- 输入区 -->
    <div class="todo-input-area">
      <div class="input-wrapper">
        <input
          v-model="newTodo"
          class="todo-input"
          placeholder="添加新任务..."
          @keyup.enter="addTodo"
        />
        <button class="add-btn" @click="addTodo">
          <span>+</span>
        </button>
      </div>
    </div>

    <!-- 待办列表 -->
    <div class="todo-section" v-if="incompleteTodos.length">
      <div class="section-header">
        <span class="section-dot active"></span>
        <span>待完成 ({{ incompleteTodos.length }})</span>
      </div>
      <TransitionGroup name="list" tag="div" class="todo-list">
        <div
          v-for="todo in incompleteTodos"
          :key="todo.id"
          class="todo-item"
        >
          <button class="check-btn" @click="toggleTodo(todo)">
            <span class="check-circle"></span>
          </button>
          <div class="todo-content" v-if="editingId !== todo.id">
            <span class="todo-text">{{ todo.text }}</span>
            <div class="todo-actions">
              <button class="action-btn focus-btn" @click="startFocus(todo)" title="开始专注">
                ✈
              </button>
              <button class="action-btn edit-btn" @click="startEdit(todo)" title="编辑">
                ✎
              </button>
              <button class="action-btn delete-btn" @click="deleteTodo(todo.id)" title="删除">
                ×
              </button>
            </div>
          </div>
          <div class="todo-edit" v-else>
            <input
              v-model="editText"
              class="edit-input"
              @keyup.enter="confirmEdit(todo)"
              @blur="confirmEdit(todo)"
              autofocus
            />
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- 已完成 -->
    <div class="todo-section" v-if="completedTodos.length">
      <div class="section-header">
        <span class="section-dot done"></span>
        <span>已完成 ({{ completedTodos.length }})</span>
      </div>
      <TransitionGroup name="list" tag="div" class="todo-list">
        <div
          v-for="todo in completedTodos"
          :key="todo.id"
          class="todo-item done"
        >
          <button class="check-btn" @click="toggleTodo(todo)">
            <span class="check-circle checked">✓</span>
          </button>
          <div class="todo-content">
            <span class="todo-text">{{ todo.text }}</span>
            <button class="action-btn delete-btn" @click="deleteTodo(todo.id)">×</button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="!todos.length">
      <div class="empty-icon">✈</div>
      <p class="empty-title">还没有任务</p>
      <p class="empty-desc">添加一个任务，开始你的专注飞行</p>
    </div>

    <!-- 底部提示 -->
    <div class="bottom-tip" v-if="incompleteTodos.length">
      <span class="tip-icon">💡</span>
      点击任务右侧的 ✈ 按钮开始一次专注飞行
    </div>
  </div>
</template>

<style scoped>
.todo-page {
  padding: 0 0 24px;
  animation: fadeIn 0.3s ease;
}

.todo-input-area {
  padding: 20px 20px 0;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  background: var(--bg-card);
  border-radius: 14px;
  padding: 4px;
  border: 1px solid var(--border);
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.todo-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding: 12px 16px;
  font-size: 15px;
}

.todo-input::placeholder {
  color: var(--text-muted);
}

.add-btn {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--accent);
  color: white;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.add-btn:hover {
  background: var(--accent-light);
  transform: scale(1.05);
}

.todo-section {
  padding: 20px 20px 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  font-weight: 500;
}

.section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.section-dot.active {
  background: var(--accent);
  box-shadow: 0 0 6px var(--accent-glow);
}

.section-dot.done {
  background: var(--success);
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  transition: all 0.2s;
  animation: slideUp 0.3s ease;
}

.todo-item:hover {
  background: var(--bg-card-hover);
  border-color: rgba(255, 255, 255, 0.12);
}

.todo-item.done {
  opacity: 0.5;
}

.check-btn {
  background: transparent;
  padding: 0;
  flex-shrink: 0;
}

.check-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
}

.check-circle:hover {
  border-color: var(--accent);
}

.check-circle.checked {
  background: var(--success);
  border-color: var(--success);
  color: white;
  font-size: 11px;
}

.todo-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.todo-text {
  font-size: 14px;
  line-height: 1.4;
  word-break: break-all;
}

.todo-item.done .todo-text {
  text-decoration: line-through;
  color: var(--text-muted);
}

.todo-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.todo-item:hover .todo-actions {
  opacity: 1;
}

.action-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.focus-btn:hover {
  background: rgba(233, 69, 96, 0.2);
  color: var(--accent);
}

.delete-btn:hover {
  background: rgba(233, 69, 96, 0.2);
  color: var(--accent);
}

.edit-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--accent);
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--text-primary);
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  animation: float 3s ease-in-out infinite;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 20px var(--accent-glow));
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-desc {
  color: var(--text-secondary);
  font-size: 14px;
}

.bottom-tip {
  text-align: center;
  padding: 24px 20px;
  color: var(--text-muted);
  font-size: 12px;
}

.tip-icon {
  margin-right: 4px;
}

/* 列表动画 */
.list-move {
  transition: transform 0.3s ease;
}
.list-enter-active {
  transition: all 0.3s ease;
}
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
