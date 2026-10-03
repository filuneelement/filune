import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const { calculateEightChar } = await server.ssrLoadModule('/src/lib/calculateEightChar.ts')
  const seoul = {
    code: 'seoul', country: 'Korea', type: 'municipality', prefecture: 'Seoul', city: 'Seoul', displayName: 'Seoul, Korea',
    latitude: 37.5665, longitude: 126.978, timezone: 'Asia/Seoul',
  }
  const tokyo = {
    code: 'tokyo', country: 'Japan', type: 'municipality', prefecture: 'Tokyo', city: 'Tokyo', displayName: 'Tokyo, Japan',
    latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo',
  }

  const birth = { year: 1985, month: 1, day: 4, hour: 9, minute: 0 }
  const corrected = calculateEightChar(birth, { mode: 'longitude', birthplace: seoul })
  assert.equal(corrected.timeCorrection?.correctionMinutes, -32)
  assert.equal(corrected.timeCorrection?.calculationTime, '08:28')
  assert.equal(corrected.time, '丙辰', 'Seoul longitude correction must change 09:00 to 丙辰')
  assert.deepEqual(
    { year: corrected.year, month: corrected.month, day: corrected.day },
    { year: '甲子', month: '丙子', day: '癸卯' },
    'longitude correction must not change year, month, or day pillars',
  )

  const uncorrected = calculateEightChar(birth, { mode: 'none', birthplace: seoul })
  assert.equal(uncorrected.timeCorrection?.correctionMinutes, 0)
  assert.equal(uncorrected.timeCorrection?.calculationTime, '09:00')
  assert.equal(uncorrected.time, '丁巳', 'correction OFF must preserve the recorded-time pillar')

  const seoulBoundary = calculateEightChar(
    { year: 1985, month: 1, day: 4, hour: 9, minute: 0 },
    { mode: 'longitude', birthplace: seoul },
  )
  const seoulBoundaryOff = calculateEightChar(
    { year: 1985, month: 1, day: 4, hour: 9, minute: 0 },
    { mode: 'none', birthplace: seoul },
  )
  assert.equal(seoulBoundaryOff.time, '丁巳')
  assert.equal(seoulBoundary.time, '丙辰', 'Seoul correction must move a 09:xx recorded time from 巳 to 辰')

  const tokyoBoundary = calculateEightChar(
    { year: 1985, month: 1, day: 4, hour: 8, minute: 45 },
    { mode: 'longitude', birthplace: tokyo },
  )
  const tokyoBoundaryOff = calculateEightChar(
    { year: 1985, month: 1, day: 4, hour: 8, minute: 45 },
    { mode: 'none', birthplace: tokyo },
  )
  assert.equal(tokyoBoundaryOff.time, '丙辰')
  assert.equal(tokyoBoundary.time, '丁巳', 'Tokyo correction must move an 08:xx recorded time from 辰 to 巳')

  console.log('Longitude time-correction checks passed:')
  console.log('Seoul 1985-01-04 09:00 → −32 min → 08:28 → 丙辰; correction OFF → 丁巳')
  console.log('Hour-branch boundary checks passed: Seoul 09:00 巳→辰; Tokyo 08:45 辰→巳')
} finally {
  await server.close()
}
