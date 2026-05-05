<script setup>
import { computed } from 'vue'

const props = defineProps({
  phase: String,
  progress: Number,
  theme: Object,
})

// 从主题获取基础色，随飞行阶段微调
const skyStyle = computed(() => {
  const t = props.theme
  const p = props.progress
  const [c1, c2, c3] = t.sky
  // 轻微的阶段变化
  let top = c1, mid = c2, bottom = c3
  if (p > 0.8) {
    const k = (p - 0.8) / 0.2
    top = lerp(c1, shiftHue(c1, 15), k)
    bottom = lerp(c3, shiftHue(c3, 20), k)
  }
  return { background: `linear-gradient(180deg, ${top} 0%, ${mid} 50%, ${bottom} 100%)` }
})

const showStars = computed(() => props.theme.stars && props.progress > 0.15)

const stars = computed(() => {
  const count = props.theme.starCount || 0
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: 5 + (i * 13.7) % 50,
    left: 3 + (i * 17.3) % 90,
    size: 1 + (i % 3) * 0.5,
    delay: i * 0.5,
    opacity: 0.2 + (i % 4) * 0.12,
  }))
})

const clouds = computed(() =>
  Array.from({ length: 5 }, (_, i) => ({
    id: i,
    bottom: 4 + (i * 7) % 35,
    left: 8 + (i * 15) % 55,
    w: 60 + (i * 31) % 130,
    h: 14 + (i * 5) % 22,
    isAccent: i % 3 === 1,
    delay: i * 12,
  }))
)

// 极光条带
const auroraWaves = computed(() =>
  Array.from({ length: 3 }, (_, i) => ({
    id: i,
    top: 15 + i * 12,
    width: 120 + i * 40,
    delay: i * 3,
    hue: 140 + i * 30,
  }))
)

function lerp(a, b, t) {
  const ah = parseInt(a.slice(1), 16), bh = parseInt(b.slice(1), 16)
  const r = Math.round(((ah >> 16) & 0xff) + (((bh >> 16) & 0xff) - ((ah >> 16) & 0xff)) * t)
  const g = Math.round(((ah >> 8) & 0xff) + (((bh >> 8) & 0xff) - ((ah >> 8) & 0xff)) * t)
  const bl = Math.round((ah & 0xff) + ((bh & 0xff) - (ah & 0xff)) * t)
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`
}

function shiftHue(hex, deg) {
  // 简单的色相偏移模拟
  const h = parseInt(hex.slice(1), 16)
  let r = (h >> 16) & 0xff, g = (h >> 8) & 0xff, b = h & 0xff
  r = Math.min(255, r + deg)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}
</script>

<template>
  <div class="window-scene">
    <!-- 窗框外框：深色拟态 -->
    <div class="window-outer">
      <div class="window-inner">
        <!-- 天空 -->
        <div class="sky" :style="skyStyle">
          <!-- 地平线光晕 -->
          <div class="horizon-glow" :style="{ background: `radial-gradient(ellipse, ${theme.glowColor} 0%, transparent 70%)` }"></div>

          <!-- 日落光带 -->
          <div class="sunset-band" v-if="theme.sunsetBand">
            <div class="sb-stripe s1"></div>
            <div class="sb-stripe s2"></div>
            <div class="sb-stripe s3"></div>
          </div>

          <!-- 极光 -->
          <div class="aurora" v-if="theme.aurora">
            <div
              v-for="w in auroraWaves"
              :key="w.id"
              class="aurora-wave"
              :style="{
                top: w.top + '%',
                width: w.width + '%',
                animationDelay: w.delay + 's',
                background: `linear-gradient(90deg, transparent, hsla(${w.hue}, 70%, 50%, 0.08), hsla(${w.hue + 30}, 60%, 45%, 0.06), transparent)`,
              }"
            ></div>
          </div>

          <!-- 星云 -->
          <div class="nebula" v-if="theme.nebula">
            <div class="nebula-cloud nc1"></div>
            <div class="nebula-cloud nc2"></div>
          </div>

          <!-- 星星 -->
          <div class="stars" v-if="showStars">
            <div v-for="s in stars" :key="s.id" class="star" :style="{
              top: s.top + '%',
              left: s.left + '%',
              width: s.size + 'px',
              height: s.size + 'px',
              animationDelay: s.delay + 's',
              opacity: s.opacity,
            }"></div>
          </div>

          <!-- 闪电（雷暴主题） -->
          <div class="lightning" v-if="theme.lightning">
            <div class="flash flash-1"></div>
            <div class="flash flash-2"></div>
          </div>

          <!-- 云层 -->
          <div class="clouds-track">
            <div
              v-for="c in clouds"
              :key="c.id"
              class="cloud"
              :style="{
                bottom: c.bottom + '%',
                left: c.left + '%',
                width: c.w + 'px',
                height: c.h + 'px',
                animationDelay: c.delay + 's',
                background: c.isAccent ? theme.accentCloudColor : theme.cloudColor,
              }"
            ></div>
          </div>
        </div>

        <!-- 玻璃反光 -->
        <div class="glass-reflection"></div>
        <div class="glass-streak"></div>

        <!-- 遮光板 -->
        <div class="shade">
          <div class="shade-handle"></div>
        </div>
      </div>
    </div>

    <!-- 主题名 -->
    <div class="theme-name">{{ theme.name }}</div>
  </div>
</template>

<style scoped>
.window-scene {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #131524;
  gap: 16px;
}

.window-outer {
  width: 280px;
  height: 400px;
  border-radius: 100px;
  background: #1a1e33;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    16px 16px 32px #0d0f1a,
    -16px -16px 32px #272d4c;
}

.window-inner {
  width: 220px;
  height: 340px;
  border-radius: 80px;
  overflow: hidden;
  position: relative;
  box-shadow:
    inset 8px 8px 16px rgba(0, 0, 0, 0.6),
    inset -4px -4px 10px rgba(255, 255, 255, 0.05);
}

.sky {
  position: absolute;
  inset: 0;
  transition: background 3s ease;
}

.horizon-glow {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 160%;
  height: 30%;
  pointer-events: none;
}

/* 星星 */
.stars { position: absolute; inset: 0; }

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 4px white;
  animation: twinkle 4s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.15; transform: scale(0.8); }
  50% { opacity: 0.7; transform: scale(1.3); }
}

/* 云层 */
.clouds-track {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 300%;
  height: 100%;
  animation: drift 60s linear infinite;
}

.cloud {
  position: absolute;
  border-radius: 999px;
  filter: blur(10px);
}

@keyframes drift {
  0% { transform: translateX(10%); }
  100% { transform: translateX(-50%); }
}

/* 极光 */
.aurora {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.aurora-wave {
  position: absolute;
  left: 10%;
  height: 30%;
  border-radius: 50%;
  filter: blur(20px);
  animation: aurora-drift 8s ease-in-out infinite alternate;
}

@keyframes aurora-drift {
  0% { transform: translateX(-5%) scaleY(1); opacity: 0.6; }
  50% { transform: translateX(5%) scaleY(1.3); opacity: 1; }
  100% { transform: translateX(-3%) scaleY(0.8); opacity: 0.5; }
}

/* 星云 */
.nebula {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.nebula-cloud {
  position: absolute;
  border-radius: 50%;
  filter: blur(30px);
  animation: nebula-pulse 10s ease-in-out infinite alternate;
}

.nc1 {
  top: 15%;
  left: 20%;
  width: 80px;
  height: 50px;
  background: rgba(140, 80, 220, 0.06);
}

.nc2 {
  top: 35%;
  right: 15%;
  width: 60px;
  height: 40px;
  background: rgba(220, 80, 160, 0.05);
  animation-delay: 4s;
}

@keyframes nebula-pulse {
  0% { opacity: 0.4; transform: scale(1); }
  100% { opacity: 0.8; transform: scale(1.15); }
}

/* 日落光带 */
.sunset-band {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  pointer-events: none;
}

.sb-stripe {
  position: absolute;
  left: -10%;
  right: -10%;
  height: 30%;
  border-radius: 50%;
  filter: blur(15px);
}

.s1 {
  bottom: 10%;
  background: rgba(255, 140, 50, 0.08);
}

.s2 {
  bottom: 20%;
  background: rgba(255, 80, 80, 0.06);
  animation: sunset-shift 12s ease-in-out infinite alternate;
}

.s3 {
  bottom: 30%;
  background: rgba(200, 60, 120, 0.04);
  animation: sunset-shift 15s ease-in-out infinite alternate-reverse;
}

@keyframes sunset-shift {
  0% { transform: translateX(-3%); opacity: 0.6; }
  100% { transform: translateX(3%); opacity: 1; }
}

/* 闪电 */
.lightning {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.flash {
  position: absolute;
  inset: 0;
  background: rgba(200, 200, 255, 0.03);
  opacity: 0;
}

.flash-1 {
  animation: flash-anim 8s ease-in-out infinite;
}

.flash-2 {
  animation: flash-anim 8s ease-in-out 3s infinite;
}

@keyframes flash-anim {
  0%, 94%, 100% { opacity: 0; }
  95% { opacity: 1; }
  96% { opacity: 0; }
  97% { opacity: 0.6; }
  98% { opacity: 0; }
}

/* 玻璃反光 */
.glass-reflection {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top right, transparent 0%, rgba(255,255,255,0.05) 40%, transparent 60%);
  pointer-events: none;
}

.glass-streak {
  position: absolute;
  top: -25%;
  left: -25%;
  width: 100%;
  height: 200%;
  background: rgba(255,255,255,0.02);
  transform: rotate(45deg);
  pointer-events: none;
}

/* 遮光板 */
.shade {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 15%;
  background: #1a1e33;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  z-index: 10;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
}

.shade-handle {
  width: 48px;
  height: 6px;
  background: rgba(100,116,139,0.5);
  border-radius: 999px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.3);
}

/* 主题名 */
.theme-name {
  font-size: 11px;
  color: rgba(255,255,255,0.2);
  letter-spacing: 3px;
  text-transform: uppercase;
}

@media (min-height: 700px) {
  .window-outer {
    width: 340px;
    height: 500px;
    border-radius: 120px;
  }
  .window-inner {
    width: 260px;
    height: 420px;
    border-radius: 90px;
  }
}
</style>
