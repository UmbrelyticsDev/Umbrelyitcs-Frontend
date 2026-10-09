import axios from 'axios'
import { REST_API_END_POINT } from '../constants/Defaultvalues'

// Guarded timetable endpoints need the SSO bearer token. We use the GLOBAL
// axios + full URL (the same pattern the working admin calls use) and attach
// the token explicitly. This deliberately bypasses the utils/axios instance,
// whose withCredentials + default Content-Type were getting blocked.
const BASE = `${REST_API_END_POINT}timetable` // http://localhost:4000/webservice/timetable

const authCfg = () => {
  const token = localStorage.getItem('accessToken')
  return { headers: token ? { Authorization: `Bearer ${token}` } : {} }
}

const timetableApi = {
  getPeriods: () => axios.get(`${BASE}/periods`, authCfg()),
  addPeriod: (data) => axios.post(`${BASE}/periods`, data, authCfg()),
  updatePeriod: (id, data) =>
    axios.put(`${BASE}/periods/${id}`, data, authCfg()),
  deletePeriod: (id) => axios.delete(`${BASE}/periods/${id}`, authCfg()),

  getClasses: () => axios.get(`${BASE}/classes`, authCfg()),

  getTimetable: (academic_year, term) =>
    axios.get(BASE, { ...authCfg(), params: { academic_year, term } }),
  addEntry: (data) => axios.post(BASE, data, authCfg()),
  updateEntry: (id, data) => axios.put(`${BASE}/${id}`, data, authCfg()),
  deleteEntry: (id) => axios.delete(`${BASE}/${id}`, authCfg()),

  publish: (academic_year, term) =>
    axios.post(`${BASE}/publish`, { academic_year, term }, authCfg()),

  importRows: (payload) => axios.post(`${BASE}/import`, payload, authCfg()),
}

export default timetableApi
