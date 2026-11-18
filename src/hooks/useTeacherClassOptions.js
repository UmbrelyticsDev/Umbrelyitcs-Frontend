import { useState, useEffect } from 'react'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'

// Split a stored comma-separated list ("Maths, Physics") into a clean array.
const splitList = (s) =>
  String(s || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)

// Loads the teacher's onboarding subjects + grade levels (stored on the teacher
// record) so the class forms can offer them as autocomplete options. Falls back
// to empty lists on any failure — the fields still work as free text.
export default function useTeacherClassOptions() {
  const [subjectOptions, setSubjectOptions] = useState([])
  const [gradeOptions, setGradeOptions] = useState([])
  // The teacher's default "Timetable Period" (minutes); null until they set it.
  const [sessionPeriod, setSessionPeriod] = useState(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (!user?.teacherId) return
        const res = await axios.get(
          `${REST_API_END_POINT}get-teacher-details-for-editing/${user.teacherId}`,
        )
        if (!active || res.data?.status !== 1) return
        const r = res.data.result || {}
        setSubjectOptions(splitList(r.subjects))
        setGradeOptions(splitList(r.grade_levels))
        const sp = parseInt(r.session_period, 10)
        setSessionPeriod(Number.isFinite(sp) && sp > 0 ? sp : null)
      } catch (e) {
        /* leave options empty; fields degrade to plain free text */
      }
    })()
    return () => {
      active = false
    }
  }, [])

  return { subjectOptions, gradeOptions, sessionPeriod }
}
