// 舷窗外天空主题
// 每个主题定义：天空渐变色、云层颜色、是否有星云、特殊效果
export const skyThemes = [
  {
    id: 'deep-night',
    name: '深空夜航',
    sky: ['#080a12', '#0f1322', '#241322'],
    glowColor: 'rgba(232, 93, 117, 0.2)',
    cloudColor: 'rgba(255, 255, 255, 0.05)',
    accentCloudColor: 'rgba(232, 93, 117, 0.1)',
    stars: true,
    starCount: 12,
    nebula: false,
  },
  {
    id: 'aurora',
    name: '极光之夜',
    sky: ['#060a14', '#0a1a20', '#0d1522'],
    glowColor: 'rgba(80, 220, 160, 0.15)',
    cloudColor: 'rgba(80, 220, 160, 0.06)',
    accentCloudColor: 'rgba(120, 100, 255, 0.08)',
    stars: true,
    starCount: 16,
    nebula: false,
    aurora: true,
  },
  {
    id: 'sunset',
    name: '云端日落',
    sky: ['#0c0a18', '#1a0e20', '#2a1520'],
    glowColor: 'rgba(255, 140, 50, 0.25)',
    cloudColor: 'rgba(255, 180, 100, 0.06)',
    accentCloudColor: 'rgba(255, 100, 60, 0.1)',
    stars: false,
    starCount: 0,
    nebula: false,
    sunsetBand: true,
  },
  {
    id: 'nebula',
    name: '星云漫游',
    sky: ['#06060e', '#0a081a', '#140e22'],
    glowColor: 'rgba(140, 80, 220, 0.15)',
    cloudColor: 'rgba(140, 80, 220, 0.05)',
    accentCloudColor: 'rgba(220, 80, 160, 0.07)',
    stars: true,
    starCount: 24,
    nebula: true,
  },
  {
    id: 'storm',
    name: '雷暴边缘',
    sky: ['#08080e', '#0e0e18', '#161620'],
    glowColor: 'rgba(180, 180, 220, 0.08)',
    cloudColor: 'rgba(255, 255, 255, 0.04)',
    accentCloudColor: 'rgba(180, 180, 220, 0.06)',
    stars: false,
    starCount: 4,
    nebula: false,
    lightning: true,
  },
]

export function getRandomTheme() {
  return skyThemes[Math.floor(Math.random() * skyThemes.length)]
}
