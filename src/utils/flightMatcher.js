import flights from '../data/flights.js'

// 按飞行时长建立索引（分桶，每10分钟一桶）
const durationBuckets = {}
flights.forEach(f => {
  const bucket = Math.floor(f.duration / 10) * 10
  if (!durationBuckets[bucket]) durationBuckets[bucket] = []
  durationBuckets[bucket].push(f)
})

// 根据目标时长匹配航线，返回按接近程度排序的航线列表
export function matchFlights(targetMinutes, tolerance = 10) {
  const results = []
  for (const flight of flights) {
    const diff = Math.abs(flight.duration - targetMinutes)
    if (diff <= tolerance) {
      results.push({ ...flight, diff })
    }
  }
  results.sort((a, b) => a.diff - b.diff || Math.random() - 0.5)
  return results
}

// 获取推荐航线（最接近目标时长的一条）
export function getRecommendedFlight(targetMinutes) {
  const matches = matchFlights(targetMinutes, 15)
  if (matches.length > 0) return matches[0]
  // 放宽范围
  const loose = matchFlights(targetMinutes, 30)
  return loose.length > 0 ? loose[0] : null
}

// 获取所有可用时长（去重排序）
export function getAvailableDurations() {
  const durations = [...new Set(flights.map(f => f.duration))]
  return durations.sort((a, b) => a - b)
}

// 获取所有城市（去重）
export function getAllCities() {
  const cities = new Set()
  flights.forEach(f => {
    cities.add(f.from)
    cities.add(f.to)
  })
  return [...cities].sort()
}

// 按出发城市筛选航线
export function getFlightsFromCity(city) {
  return flights.filter(f => f.from === city)
}

// 获取热门出发城市（按航线数量排序）
export function getPopularCities(limit = 10) {
  const counts = {}
  flights.forEach(f => {
    counts[f.from] = (counts[f.from] || 0) + 1
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([city]) => city)
}

// 获取从某城市出发可到达的所有城市（去重）
export function getDestinationsFrom(city) {
  const dests = new Set()
  flights.filter(f => f.from === city).forEach(f => dests.add(f.to))
  return [...dests].sort()
}

// 获取从A到B的所有航班
export function getFlightsBetween(from, to) {
  return flights.filter(f => f.from === from && f.to === to)
}

// 搜索城市（模糊匹配）
export function searchCities(keyword) {
  if (!keyword) return []
  const kw = keyword.toLowerCase()
  return getAllCities().filter(c => c.toLowerCase().includes(kw))
}
