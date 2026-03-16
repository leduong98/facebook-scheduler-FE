import axios from 'axios'

const baseURL = `${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api`

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Pages
export const getPages = () => api.get('/pages')
export const createPage = (data) => api.post('/pages', data)

// Posts
export const getPosts = () => api.get('/posts')
export const createPost = (data) => api.post('/posts', data)

export const authFacebook = (accessToken) =>
  api.post('/auth/facebook', { accessToken })

export default api
