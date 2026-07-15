import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000/webservice', // ← Website backend!
  timeout: 180000,
  withCredentials: true, // ← CRITICAL for cookies!
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || 'Something went wrong',
    ),
)

export default axiosInstance
