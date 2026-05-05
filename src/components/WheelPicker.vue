<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },    // [{ value, label }]
  modelValue: { type: [Number, String], default: null },
  itemHeight: { type: Number, default: 48 },
  visibleCount: { type: Number, default: 5 },
})
const emit = defineEmits(['update:modelValue'])

const scrollRef = ref(null)
const isScrolling = ref(false)
let scrollTimer = null

const containerHeight = computed(() => props.itemHeight * props.visibleCount)
const paddingCount = computed(() => Math.floor(props.visibleCount / 2))

// 带 padding 的列表
const paddedItems = computed(() => {
  const pad = Array.from({ length: paddingCount.value }, (_, i) => ({
    value: null, label: '', _pad: true, _id: `pad-start-${i}`
  }))
  const endPad = Array.from({ length: paddingCount.value }, (_, i) => ({
    value: null, label: '', _pad: true, _id: `pad-end-${i}`
  }))
  return [
    ...pad,
    ...props.items.map((item, i) => ({ ...item, _id: `item-${i}` })),
    ...endPad,
  ]
})

const selectedIndex = computed(() => {
  const idx = props.items.findIndex(i => i.value === props.modelValue)
  return idx >= 0 ? idx : 0
})

function scrollToIndex(idx, smooth = false) {
  if (!scrollRef.value) return
  const top = idx * props.itemHeight
  scrollRef.value.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' })
}

function onScroll() {
  isScrolling.value = true
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    isScrolling.value = false
    snapToNearest()
  }, 100)
}

function snapToNearest() {
  if (!scrollRef.value) return
  const scrollTop = scrollRef.value.scrollTop
  const idx = Math.round(scrollTop / props.itemHeight)
  const clampedIdx = Math.max(0, Math.min(idx, props.items.length - 1))
  scrollToIndex(clampedIdx, true)
  if (props.items[clampedIdx]) {
    emit('update:modelValue', props.items[clampedIdx].value)
  }
}

function onItemClick(idx) {
  scrollToIndex(idx, true)
  if (props.items[idx]) {
    emit('update:modelValue', props.items[idx].value)
  }
}

// 初始化滚动位置
onMounted(() => {
  scrollToIndex(selectedIndex.value, false)
})

// 外部值变化时同步滚动
watch(() => props.modelValue, (val) => {
  const idx = props.items.findIndex(i => i.value === val)
  if (idx >= 0) scrollToIndex(idx, true)
})

onUnmounted(() => clearTimeout(scrollTimer))
</script>

<template>
  <div class="wheel-picker" :style="{ height: containerHeight + 'px' }">
    <!-- 选中高亮区 -->
    <div class="wheel-highlight" :style="{
      top: (containerHeight / 2 - itemHeight / 2) + 'px',
      height: itemHeight + 'px',
    }"></div>

    <!-- 渐变遮罩 -->
    <div class="wheel-mask top"></div>
    <div class="wheel-mask bottom"></div>

    <!-- 滚动列表 -->
    <div
      ref="scrollRef"
      class="wheel-scroll"
      @scroll="onScroll"
    >
      <div
        v-for="(item, i) in paddedItems"
        :key="item._id"
        :class="['wheel-item', { pad: item._pad, selected: item.value === modelValue }]"
        :style="{ height: itemHeight + 'px', lineHeight: itemHeight + 'px' }"
        @click="item.value !== null && onItemClick(i - paddingCount)"
      >
        <span v-if="!item._pad">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wheel-picker {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
}

.wheel-highlight {
  position: absolute;
  left: 0;
  right: 0;
  background: rgba(233, 69, 96, 0.08);
  border-top: 1px solid rgba(233, 69, 96, 0.2);
  border-bottom: 1px solid rgba(233, 69, 96, 0.2);
  pointer-events: none;
  z-index: 2;
}

.wheel-mask {
  position: absolute;
  left: 0;
  right: 0;
  height: 30%;
  pointer-events: none;
  z-index: 3;
}

.wheel-mask.top {
  top: 0;
  background: linear-gradient(180deg, var(--bg-card) 0%, transparent 100%);
}

.wheel-mask.bottom {
  bottom: 0;
  background: linear-gradient(0deg, var(--bg-card) 0%, transparent 100%);
}

.wheel-scroll {
  height: 100%;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.wheel-scroll::-webkit-scrollbar {
  display: none;
}

.wheel-item {
  scroll-snap-align: center;
  text-align: center;
  font-size: 18px;
  color: var(--text-muted);
  transition: color 0.2s, transform 0.2s;
  cursor: pointer;
  user-select: none;
}

.wheel-item.selected {
  color: var(--accent);
  font-weight: 700;
  font-size: 22px;
}

.wheel-item.pad {
  cursor: default;
}
</style>
