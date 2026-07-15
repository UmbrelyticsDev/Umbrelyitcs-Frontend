import axios from 'axios'

// Points at the UMBLPTOOL backend (port 3000).
// Sends the shared SSO cookie + Bearer token so the tool authenticates the teacher.
const toolAxios = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

toolAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default toolAxios
