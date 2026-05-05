// 在 Canvas 上绘制登机牌
export function drawBoardingPass(canvas, flightInfo) {
  const ctx = canvas.getContext('2d')
  const W = 700, H = 300
  canvas.width = W
  canvas.height = H

  // 背景
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, '#1a1e33')
  grad.addColorStop(1, '#131524')
  ctx.fillStyle = grad
  roundRect(ctx, 0, 0, W, H, 16)
  ctx.fill()

  // 左侧装饰条
  ctx.fillStyle = '#e85d75'
  ctx.fillRect(0, 0, 8, H)

  // 虚线分隔线（右侧撕裂效果）
  ctx.setLineDash([6, 4])
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(520, 10)
  ctx.lineTo(520, H - 10)
  ctx.stroke()
  ctx.setLineDash([])

  // 标题
  ctx.fillStyle = '#e85d75'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('BOARDING PASS', 24, 32)
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '11px sans-serif'
  ctx.fillText('登机牌', 24, 48)

  // 航空公司 & 航班号
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 20px sans-serif'
  ctx.fillText(flightInfo.airline, 24, 82)
  ctx.fillStyle = '#e85d75'
  ctx.font = 'bold 28px sans-serif'
  ctx.fillText(flightInfo.flightNo, 24, 115)

  // 出发和到达
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 36px sans-serif'
  ctx.fillText(flightInfo.fromCode, 24, 170)
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.font = '20px sans-serif'
  ctx.fillText('✈', 140, 168)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 36px sans-serif'
  ctx.fillText(flightInfo.toCode, 180, 170)

  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '12px sans-serif'
  ctx.fillText(flightInfo.from, 24, 190)
  ctx.fillText(flightInfo.to, 180, 190)

  // 详细信息
  const infoY = 230
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '11px sans-serif'
  ctx.fillText('日期 DATE', 24, infoY)
  ctx.fillText('时间 TIME', 140, infoY)
  ctx.fillText('座位 SEAT', 260, infoY)
  ctx.fillText('时长 DURATION', 380, infoY)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 15px sans-serif'
  ctx.fillText(flightInfo.date || '2026-05-05', 24, infoY + 20)
  ctx.fillText(flightInfo.time || '10:00', 140, infoY + 20)
  ctx.fillText(flightInfo.seat || '12A', 260, infoY + 20)
  ctx.fillText(`${flightInfo.duration}分钟`, 380, infoY + 20)

  // 右侧信息区
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '11px sans-serif'
  ctx.fillText('GATE', 540, 40)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 24px sans-serif'
  ctx.fillText(flightInfo.gate || 'A' + Math.floor(Math.random() * 20 + 1), 540, 65)

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '11px sans-serif'
  ctx.fillText('登机 BOARDING', 540, 100)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 16px sans-serif'
  ctx.fillText(flightInfo.boardingTime || '09:30', 540, 120)

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '11px sans-serif'
  ctx.fillText('座位 SEAT', 540, 155)
  ctx.fillStyle = '#e85d75'
  ctx.font = 'bold 32px sans-serif'
  ctx.fillText(flightInfo.seat || '12A', 540, 190)

  // 条形码区域
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  roundRect(ctx, 530, 210, 150, 60, 8)
  ctx.fill()
  drawBarcode(ctx, 540, 220, 130, 40)

  // 名称
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.font = '10px sans-serif'
  ctx.fillText('FlightFocus · 专注飞行', 24, H - 15)
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawBarcode(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  let cx = x
  while (cx < x + w) {
    const barW = Math.random() > 0.5 ? 3 : 2
    if (Math.random() > 0.3) {
      ctx.fillRect(cx, y, barW, h)
    }
    cx += barW + (Math.random() > 0.5 ? 2 : 1)
  }
}

// 导出登机牌为图片
export function exportBoardingPass(canvas) {
  return canvas.toDataURL('image/png')
}
