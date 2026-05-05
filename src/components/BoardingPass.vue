<script setup>
import { ref, onMounted } from 'vue'
import { drawBoardingPass, exportBoardingPass } from '../utils/boardingPass.js'

const props = defineProps({
  flight: Object,
  seat: String,
})

const canvasRef = ref(null)

onMounted(() => {
  if (canvasRef.value) {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const mins = String(now.getMinutes()).padStart(2, '0')
    const boardingH = String((now.getHours())).padStart(2, '0')
    const boardingM = String(now.getMinutes()).padStart(2, '0')

    drawBoardingPass(canvasRef.value, {
      ...props.flight,
      seat: props.seat,
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
      time: `${hours}:${mins}`,
      boardingTime: `${boardingH}:${boardingM}`,
      gate: 'A' + Math.floor(Math.random() * 20 + 1),
    })
  }
})

function saveAsImage() {
  if (!canvasRef.value) return
  const link = document.createElement('a')
  link.download = `boarding-pass-${props.flight.flightNo}.png`
  link.href = exportBoardingPass(canvasRef.value)
  link.click()
}
</script>

<template>
  <div class="boarding-pass-container">
    <canvas ref="canvasRef" class="boarding-canvas"></canvas>
    <button class="save-btn" @click="saveAsImage">保存登机牌</button>
  </div>
</template>

<style scoped>
.boarding-pass-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.boarding-canvas {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.save-btn {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 13px;
  transition: all 0.2s;
}

.save-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--text-primary);
}
</style>
