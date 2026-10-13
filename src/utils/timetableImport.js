// ============================================================================
// timetableImport.js
// Pure, framework-free helpers that turn a parsed spreadsheet (array-of-arrays
// + merge ranges) into a single CANONICAL shape the importer understands:
//
//   { day, start, end, class_name, subject, grade_level, room }
//
// Every input format (our list template, a grid, and later any program export)
// is converted into that canonical shape here. Nothing in this file touches
// React or SheetJS — the caller does the file reading and passes plain data in,
// which keeps these functions easy to reuse (website side) and to test.
// ============================================================================

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const DAY_ALIASES = {
  mon: 'Monday',
  monday: 'Monday',
  tue: 'Tuesday',
  tues: 'Tuesday',
  tuesday: 'Tuesday',
  wed: 'Wednesday',
  weds: 'Wednesday',
  wednesday: 'Wednesday',
  thu: 'Thursday',
  thur: 'Thursday',
  thurs: 'Thursday',
  thursday: 'Thursday',
  fri: 'Friday',
  friday: 'Friday',
}

// Cell labels that are never a teachable class — skipped during grid parsing.
// (Lowercased. Callers can extend the ignore set from the mapping UI.)
export const NON_TEACHING_DEFAULTS = [
  'assembly',
  'registration',
  'registratio', // truncated cells seen in real exports
  'break',
  'lunch',
  'recess',
  'form',
  'form time',
  'tutor',
  'tutor time',
  'prep',
  'devotion',
  'chapel',
  'free',
]

// ----------------------------------------------------------------------------
// Primitive normalizers
// ----------------------------------------------------------------------------

export const normalizeDay = (v) => {
  const k = String(v ?? '')
    .trim()
    .toLowerCase()
  return DAY_ALIASES[k] || ''
}

const pad = (n) => String(n).padStart(2, '0')

export const minutesToHHMM = (min) => {
  if (min == null || isNaN(min)) return ''
  const m = ((min % 1440) + 1440) % 1440 // wrap into a single day
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
}

export const hhmmToMinutes = (t) => {
  const m = String(t).match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
}

// Accepts "8:00 AM", "08:00", "8:00", a Date, or an Excel numeric time.
// Returns "HH:MM" (24h) or "".
export const normalizeTime = (v) => {
  if (v === null || v === undefined || v === '') return ''

  if (v instanceof Date) {
    return `${pad(v.getHours())}:${pad(v.getMinutes())}`
  }

  if (typeof v === 'number') {
    let frac = v
    if (v >= 1) {
      // plain hour integer (e.g. 8 → 08:00), otherwise strip the date part
      if (Number.isInteger(v) && v >= 0 && v <= 23) return `${pad(v)}:00`
      frac = v - Math.floor(v)
    }
    const totalMin = Math.round(frac * 24 * 60)
    return minutesToHHMM(totalMin)
  }

  const s = String(v).trim()
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?$/)
  if (!m) return ''

  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  const ap = m[3] ? m[3].toLowerCase() : ''
  if (ap === 'pm' && h < 12) h += 12
  if (ap === 'am' && h === 12) h = 0
  if (h > 23 || min > 59) return ''

  return `${pad(h)}:${pad(min)}`
}

// A time-column label may be a single time ("08:00") or a range ("8:30-8:45").
// Returns { start, end } in minutes; end is null for a single time.
const parseTimeLabel = (v) => {
  if (v === null || v === undefined || v === '')
    return { start: null, end: null }

  if (typeof v === 'number' || v instanceof Date) {
    return { start: hhmmToMinutes(normalizeTime(v)), end: null }
  }

  const s = String(v)
    .trim()
    .replace(/[‒-―−]/g, '-') // dashes → "-"
  if (s.includes('-')) {
    const [a, b] = s.split('-')
    return {
      start: hhmmToMinutes(normalizeTime(a)),
      end: hhmmToMinutes(normalizeTime(b)),
    }
  }
  return { start: hhmmToMinutes(normalizeTime(s)), end: null }
}

// "8I" → "Grade 8", "10 SCI" → "Grade 10", "9W" → "Grade 9". "" if no number.
export const deriveGradeFromClassCode = (code) => {
  const m = String(code ?? '').match(/\d{1,2}/)
  return m ? `Grade ${m[0]}` : ''
}

const cellText = (x) => (x == null ? '' : String(x).trim())
const isNonTeaching = (txt, extra = []) => {
  const t = txt.trim().toLowerCase()
  if (!t) return false
  return NON_TEACHING_DEFAULTS.includes(t) || extra.includes(t)
}

// ----------------------------------------------------------------------------
// Merge expansion — fill every cell of a merged range with its top-left value
// so vertically-merged (multi-period) blocks read as repeated values.
// Mutates and returns the aoa.
// ----------------------------------------------------------------------------
export const expandMerges = (aoa, merges = []) => {
  merges.forEach((m) => {
    const val = aoa[m.s.r] !== undefined ? aoa[m.s.r][m.s.c] : undefined
    for (let r = m.s.r; r <= m.e.r; r++) {
      if (!aoa[r]) aoa[r] = []
      for (let c = m.s.c; c <= m.e.c; c++) {
        aoa[r][c] = val
      }
    }
  })
  return aoa
}

// ----------------------------------------------------------------------------
// Format detection
// ----------------------------------------------------------------------------
// grid  = a row with 3+ day names across columns (days as headers)
// list  = our template (Day / Start / End / Class / Subject / Grade / Room)
export const detectFormat = (aoa) => {
  for (let r = 0; r < Math.min(aoa.length, 5); r++) {
    const row = aoa[r] || []
    const dayCount = row.filter((c) => normalizeDay(c) !== '').length
    if (dayCount >= 3) return 'grid'
  }
  return 'list'
}

// ----------------------------------------------------------------------------
// LIST parser (our template). Produces canonical rows directly.
// ----------------------------------------------------------------------------
const headerIndex = (headers, names) => {
  const lower = headers.map((h) =>
    String(h ?? '')
      .trim()
      .toLowerCase(),
  )
  for (const n of names) {
    const i = lower.indexOf(n)
    if (i !== -1) return i
  }
  return -1
}

export const parseList = (aoa) => {
  if (!aoa.length) return { rows: [], errors: ['The sheet is empty.'] }

  const headers = aoa[0]
  const idx = {
    day: headerIndex(headers, ['day', 'day of week']),
    start: headerIndex(headers, ['start', 'start time']),
    end: headerIndex(headers, ['end', 'end time']),
    class_name: headerIndex(headers, ['class', 'class name']),
    subject: headerIndex(headers, ['subject']),
    grade_level: headerIndex(headers, ['grade', 'grade level']),
    room: headerIndex(headers, ['room']),
  }

  const missing = Object.entries(idx)
    .filter(([k, v]) => k !== 'room' && v === -1)
    .map(([k]) => k)
  if (missing.length) {
    return {
      rows: [],
      errors: [
        `Missing required column(s): ${missing.join(', ')}. ` +
          `Expected headers: Day, Start, End, Class, Subject, Grade (Room optional).`,
      ],
    }
  }

  const rows = []
  for (let i = 1; i < aoa.length; i++) {
    const row = aoa[i]
    if (!row || row.every((c) => cellText(c) === '')) continue
    const rowNo = i + 1

    const day = normalizeDay(row[idx.day])
    const start = normalizeTime(row[idx.start])
    const end = normalizeTime(row[idx.end])
    const class_name = cellText(row[idx.class_name])
    const subject = cellText(row[idx.subject])
    const grade_level = cellText(row[idx.grade_level])
    const room = idx.room === -1 ? '' : cellText(row[idx.room])

    const issues = []
    if (!day) issues.push('day')
    if (!start) issues.push('start time')
    if (!end) issues.push('end time')
    if (!class_name) issues.push('class')
    if (!subject) issues.push('subject')
    if (!grade_level) issues.push('grade')
    if (start && end && start >= end) issues.push('end ≤ start')

    rows.push({
      rowNo,
      day,
      start,
      end,
      class_name,
      subject,
      grade_level,
      room,
      ok: issues.length === 0,
      issues,
    })
  }
  return { rows, errors: [] }
}

// ----------------------------------------------------------------------------
// GRID parser. Produces "slots" of { day, start, end, value } where `value`
// is the raw cell content (a subject OR a class code — the mapping step
// decides which). Does NOT produce canonical rows on its own; that needs the
// user's mapping (see buildCanonicalFromGrid).
// ----------------------------------------------------------------------------
export const parseGrid = (aoa, extraIgnore = []) => {
  // 1. Find the day-header row and the day→column map.
  let headerRow = -1
  let dayCols = []
  for (let r = 0; r < Math.min(aoa.length, 5); r++) {
    const row = aoa[r] || []
    const cols = []
    row.forEach((c, ci) => {
      const d = normalizeDay(c)
      if (d) cols.push({ col: ci, name: d })
    })
    if (cols.length >= 3) {
      headerRow = r
      dayCols = cols
      break
    }
  }
  if (headerRow === -1) {
    return {
      slots: [],
      distinctValues: [],
      ignoredLabels: [],
      errors: ['Could not find a row of day names (Mon–Fri) in this sheet.'],
    }
  }

  const width = Math.max(...aoa.map((r) => (r ? r.length : 0)))
  const dataRowIdx = []
  for (let r = headerRow + 1; r < aoa.length; r++) {
    const row = aoa[r]
    if (!row || row.every((c) => cellText(c) === '')) continue
    dataRowIdx.push(r)
  }

  // 2. Find the time column (most parseable time labels among the first cols).
  let timeCol = 0
  let bestCount = -1
  for (let c = 0; c < Math.min(width, 3); c++) {
    let count = 0
    dataRowIdx.forEach((r) => {
      if (parseTimeLabel(aoa[r][c]).start != null) count++
    })
    if (count > bestCount) {
      bestCount = count
      timeCol = c
    }
  }

  // 3. Parse each data row's start/end (minutes) + ignore flag.
  const ignoredLabels = new Set()
  const rowsMeta = dataRowIdx.map((r) => {
    const { start, end } = parseTimeLabel(aoa[r][timeCol])

    // Spelled-out label row (e.g. B R E A K / L U N C H): all day cells are
    // single characters. Treat the whole row as non-teaching.
    const dayVals = dayCols.map((d) => cellText(aoa[r][d.col]))
    const nonEmpty = dayVals.filter((v) => v !== '')
    const spelled =
      nonEmpty.length >= 3 && nonEmpty.every((v) => v.length === 1)
    if (spelled) ignoredLabels.add(nonEmpty.join('').toUpperCase())

    return { r, start, end, ignore: spelled }
  })

  // 4. 12-hour clock fix: school grids often write 1:20 meaning 13:20.
  //    Enforce a monotonic (non-decreasing) start sequence; bump an early
  //    hour (1–7) by 12h when it would otherwise jump backwards.
  let last = -1
  rowsMeta.forEach((rm) => {
    if (rm.start == null) return
    if (rm.start < last && rm.start < 8 * 60) rm.start += 720
    if (rm.end != null && rm.end < rm.start) rm.end += 720
    last = rm.start
  })

  // 5. Infer end times for single-time rows from the next row's start.
  const durations = rowsMeta
    .filter((rm) => rm.end != null && rm.start != null)
    .map((rm) => rm.end - rm.start)
  const typicalDur =
    durations.length > 0
      ? durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)]
      : 60
  for (let i = 0; i < rowsMeta.length; i++) {
    if (rowsMeta[i].end == null && rowsMeta[i].start != null) {
      const next = rowsMeta[i + 1]
      rowsMeta[i].end =
        next && next.start != null ? next.start : rowsMeta[i].start + typicalDur
    }
  }

  // 6. Walk each day column, merging consecutive identical values into a slot.
  const slots = []
  const distinct = new Set()

  dayCols.forEach(({ col, name }) => {
    let i = 0
    while (i < rowsMeta.length) {
      const rm = rowsMeta[i]
      if (rm.ignore || rm.start == null || rm.end == null) {
        i++
        continue
      }
      const val = cellText(aoa[rm.r][col])
      if (!val || isNonTeaching(val, extraIgnore)) {
        if (val && isNonTeaching(val, extraIgnore)) ignoredLabels.add(val)
        i++
        continue
      }

      // extend the block downward while the value repeats on contiguous rows
      let j = i
      while (
        j + 1 < rowsMeta.length &&
        !rowsMeta[j + 1].ignore &&
        rowsMeta[j + 1].start != null &&
        cellText(aoa[rowsMeta[j + 1].r][col]).toLowerCase() ===
          val.toLowerCase() &&
        cellText(aoa[rowsMeta[j + 1].r][col]) !== ''
      ) {
        j++
      }

      slots.push({
        day: name,
        start: minutesToHHMM(rm.start),
        end: minutesToHHMM(rowsMeta[j].end),
        value: val,
      })
      distinct.add(val)
      i = j + 1
    }
  })

  return {
    slots,
    distinctValues: [...distinct],
    ignoredLabels: [...ignoredLabels],
    errors: [],
    info: { headerRow, timeCol, days: dayCols.map((d) => d.name) },
  }
}

// ----------------------------------------------------------------------------
// Apply the user's mapping to grid slots → canonical rows.
//
// mapping = {
//   cellMeaning: "subject" | "class",
//   defaultGrade: string,          // used when a grade can't be derived
//   defaultSubject: string,        // used when cellMeaning === "class"
//   overrides: { [value]: { class_name, subject, grade_level } },
// }
// ----------------------------------------------------------------------------
export const resolveValue = (value, mapping) => {
  const ov = mapping.overrides?.[value]
  if (ov) {
    return {
      class_name: ov.class_name ?? value,
      subject: ov.subject ?? '',
      grade_level: ov.grade_level ?? '',
    }
  }
  if (mapping.cellMeaning === 'class') {
    return {
      class_name: value,
      subject: mapping.defaultSubject?.trim() || value,
      grade_level:
        deriveGradeFromClassCode(value) || mapping.defaultGrade || '',
    }
  }
  // cellMeaning === "subject"
  return {
    class_name: value,
    subject: value,
    grade_level: mapping.defaultGrade || '',
  }
}

// rowOverrides is keyed by slot index: { [i]: { class_name?, subject?, grade_level? } }
// so each occurrence of a repeated cell value can become its own class.
export const buildCanonicalFromGrid = (slots, mapping, rowOverrides = {}) => {
  return slots.map((s, i) => {
    const base = resolveValue(s.value, mapping)
    const ov = rowOverrides[i] || {}
    const class_name =
      ov.class_name !== undefined ? ov.class_name : base.class_name
    const subject = ov.subject !== undefined ? ov.subject : base.subject
    const grade_level =
      ov.grade_level !== undefined ? ov.grade_level : base.grade_level

    const issues = []
    if (!s.day) issues.push('day')
    if (!s.start) issues.push('start time')
    if (!s.end) issues.push('end time')
    if (!class_name) issues.push('class')
    if (!subject) issues.push('subject')
    if (!grade_level) issues.push('grade')
    if (s.start && s.end && s.start >= s.end) issues.push('end ≤ start')

    return {
      rowNo: i + 1,
      day: s.day,
      start: s.start,
      end: s.end,
      class_name,
      subject,
      grade_level,
      room: '',
      value: s.value, // kept so the preview can show the original cell text
      ok: issues.length === 0,
      issues,
    }
  })
}
