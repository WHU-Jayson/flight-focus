<script setup>
import { ref, onMounted } from 'vue'
import { loadHistory, saveHistory } from '../utils/storage.js'

const history = ref([])

onMounted(() => {
  history.value = loadHistory()
})

function clearHistory() {
  if (confirm('确定要清空所有飞行记录吗？')) {
    history.value = []
    saveHistory([])
  }
}

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getTotalMinutes() {
  return history.value.reduce((sum, r) => sum + (r.duration || 0), 0)
}
</script>

<template>
  <div class="history-page">
    <!-- 统计卡片 -->
    <div class="stats-card">
      <div class="stat-item">
        <span class="stat-value">{{ history.length }}</span>
        <span class="stat-label">总飞行次数</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ getTotalMinutes() }}</span>
        <span class="stat-label">总专注分钟</span>
      </div>
    </div>

    <!-- 记录列表 -->
    <div class="history-list" v-if="history.length">
      <div v-for="record in history" :key="record.id" class="history-item">
        <div class="item-route">
          <span class="route-from">{{ record.fromCode }}</span>
          <span class="route-arrow">→</span>
          <span class="route-to">{{ record.toCode }}</span>
        </div>
        <div class="item-info">
          <span class="info-flight">{{ record.flightNo }}</span>
          <span class="info-duration">{{ record.duration }}分钟</span>
          <span class="info-seat">{{ record.seat }}</span>
          <span class="info-date">{{ formatDate(record.completedAt) }}</span>
        </div>
        <div class="item-task" v-if="record.todoText">
          <span class="task-label">专注任务</span>
          {{ record.todoText }}
        </div>
        <div class="item-status" :class="{ completed: record.completed }">
          {{ record.completed ? '✓ 飞行完成' : '⊘ 提前结束' }}
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty" v-else>
      <div class="empty-icon">✈</div>
      <p>还没有飞行记录</p>
      <p class="empty-desc">完成一次专注飞行后这里会显示记录</p>
    </div>

    <!-- 清空按钮 -->
    <button class="clear-btn" v-if="history.length" @click="clearHistory">
      清空记录
    </button>
  </div>
</template>

<style scoped>
.history-page {
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.stats-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid var(--border);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  background: var(--bg-card);
  border-radius: 14px;
  padding: 16px;
  border: 1px solid var(--border);
  transition: all 0.2s;
}

.history-item:hover {
  background: var(--bg-card-hover);
}

.item-route {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.route-from, .route-to {
  font-size: 18px;
  font-weight: 700;
}

.route-arrow {
  color: var(--accent);
  font-size: 14px;
}

.item-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.info-flight {
  color: var(--accent);
  font-weight: 600;
}

.item-task {
  font-size: 12px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.03);
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.task-label {
  color: var(--accent);
  font-size: 10px;
  background: rgba(233, 69, 96, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 6px;
}

.item-status {
  font-size: 12px;
  color: var(--text-muted);
}

.item-status.completed {
  color: var(--success);
}

.empty {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-desc {
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 4px;
}

.clear-btn {
  display: block;
  margin: 24px auto 0;
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  padding: 10px 24px;
  border-radius: 8px;
  transition: all 0.2s;
}

.clear-btn:hover {
  color: var(--accent);
  background: rgba(233, 69, 96, 0.1);
}
</style>
