import { createContext, useEffect, useReducer } from 'react'
import PropTypes from 'prop-types'
// utils
import { isValidToken, setSession } from '../utils/jwt'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'
import axios from 'axios'
import { PATH_DASHBOARD } from 'src/routes/paths'
import { useNavigate } from 'react-router'

// NEW: Create axios instance with credentials
const axiosInstance = axios.create({
  baseURL: REST_API_END_POINT,
  withCredentials: true, // ← CRITICAL for cookies!
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor for 401 handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// ----------------------------------------------------------------------

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
}

const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user } = action.payload
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    }
  },
  LOGIN: (state, action) => {
    const { user } = action.payload

    return {
      ...state,
      isAuthenticated: true,
      user,
    }
  },
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
  REGISTER: (state, action) => {
    const { user } = action.payload

    return {
      ...state,
      isAuthenticated: true,
      user,
    }
  },
}

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state

const AuthContext = createContext({
  ...initialState,
  method: 'jwt',
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
})

AuthProvider.propTypes = {
  children: PropTypes.node,
}

function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem('accessToken')

        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken)
          const user = JSON.parse(localStorage.getItem('user'))
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: true,
              user,
            },
          })
        } else {
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: false,
              user: null,
            },
          })
        }
      } catch (err) {
        console.error(err)
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null,
          },
        })
      }
    }

    initialize()
  }, [])

  const login = async (email, password) => {
    let data = {}
    data.username = email
    data.password = password

    // Use axiosInstance with credentials
    const response = await axiosInstance.post('login', data)

    const { accessToken, user } = response.data

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user_id', user.user_id)
      localStorage.setItem('user_type', user.user_type)
      localStorage.setItem('user', JSON.stringify(user))
    }

    setSession(accessToken)

    dispatch({
      type: 'LOGIN',
      payload: {
        user,
      },
    })

    if (user.user_type === 1) {
      navigate(PATH_DASHBOARD.root)
      window.location.reload()
    } else if (user.user_type === 2) {
      navigate(PATH_DASHBOARD.general.dashboardSchool)
      window.location.reload()
    } else if (user.user_type === 3) {
      navigate(PATH_DASHBOARD.general.dashboardHOD)
      window.location.reload()
    } else if (user.user_type === 4 || user.user_type === 5) {
      // 4 = school teacher, 5 = independent teacher — both land on the teacher dashboard
      navigate(PATH_DASHBOARD.general.dashboardTeacher)
      window.location.reload()
    }
  }

  const register = async (email, password, firstName, lastName) => {
    const response = await axiosInstance.post('/api/account/register', {
      email,
      password,
      firstName,
      lastName,
    })
    const { accessToken, user } = response.data

    window.localStorage.setItem('accessToken', accessToken)
    dispatch({
      type: 'REGISTER',
      payload: {
        user,
      },
    })
  }

  const registerIndependent = async (payload) => {
    // baseURL already includes /webservice, so this hits POST /webservice/register
    const response = await axiosInstance.post('register', payload)
    return response.data // { status, message }
  }

  const logout = async () => {
    setSession(null)
    dispatch({ type: 'LOGOUT' })
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_type')
    localStorage.removeItem('user')
  }

  const resetPassword = async (email) => {
    try {
      console.log('emailsssssssssssssss', email)
      const res = await axiosInstance.post('resetPassword', { email })

      if (res.data.status === 1) {
        console.log('OTP received:', res.data.otp)
        return res.data
      } else if (res.data.status === 2) {
        return res.data
      } else {
        console.log('Not getting OTP')
        return null
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  const updateProfile = () => {}

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'jwt',
        login,
        logout,
        register,
        registerIndependent,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
