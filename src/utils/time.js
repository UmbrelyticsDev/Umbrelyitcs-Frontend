// Display helper: convert a stored 24-hour time to a 12-hour string with am/pm.
// Times are stored 24-hour (MySQL TIME "HH:MM:SS" / "HH:MM"); this is the one
// place that turns them into what the user sees, e.g. "9:00 AM".
// Defensive: "" for empty, passes through values that already carry am/pm, and
// returns anything unrecognisable unchanged — safe to call on any time value.
export function to12h(value) {
  if (value === null || value === undefined) return ''
  const s = String(value).trim()
  if (!s) return ''
  if (/[ap]\.?\s?m\.?/i.test(s)) return s
  const m = s.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return s
  let h = parseInt(m[1], 10)
  const min = m[2]
  const period = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${min} ${period}`
}

export default to12h
