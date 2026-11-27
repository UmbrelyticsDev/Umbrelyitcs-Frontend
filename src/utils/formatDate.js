// Date display helper: formats dates as DD/MM/YYYY (day/month/year, the Jamaican
// default) or MM/DD/YYYY (month/day/year), per the user's saved preference.
// Stored in localStorage so it needs no backend and applies across the whole
// site. Components can listen for the DATE_FORMAT_EVENT to re-render on change.

export const DATE_FORMAT_KEY = 'umbrelytics_date_format'
export const DATE_FORMAT_EVENT = 'umbrelytics:date-format-changed'

// Returns 'DMY' or 'MDY'. Defaults to 'DMY' (day/month/year).
export function getDateFormatPref() {
  try {
    const v = localStorage.getItem(DATE_FORMAT_KEY)
    return v === 'MDY' ? 'MDY' : 'DMY'
  } catch (e) {
    return 'DMY'
  }
}

// Persists the preference and notifies listeners in the same tab.
export function setDateFormatPref(fmt) {
  const clean = fmt === 'MDY' ? 'MDY' : 'DMY'
  try {
    localStorage.setItem(DATE_FORMAT_KEY, clean)
    window.dispatchEvent(new Event(DATE_FORMAT_EVENT))
  } catch (e) {
    /* localStorage unavailable - ignore */
  }
  return clean
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]

function toDate(date) {
  if (date instanceof Date) return date
  if (date === null || date === undefined || date === '') return null
  const d = new Date(date)
  return isNaN(d.getTime()) ? null : d
}

// Numeric date: "27/11/2026" (DMY) or "11/27/2026" (MDY).
export function formatDate(date, fmt = getDateFormatPref()) {
  const d = toDate(date)
  if (!d) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return fmt === 'MDY' ? `${month}/${day}/${year}` : `${day}/${month}/${year}`
}

// Long date: "Friday, 27 November 2026" (DMY) or "Friday, November 27, 2026" (MDY).
export function formatDateLong(date, fmt = getDateFormatPref()) {
  const d = toDate(date)
  if (!d) return ''
  const weekday = WEEKDAYS[d.getDay()]
  const day = d.getDate()
  const month = MONTHS[d.getMonth()]
  const year = d.getFullYear()
  return fmt === 'MDY'
    ? `${weekday}, ${month} ${day}, ${year}`
    : `${weekday}, ${day} ${month} ${year}`
}
