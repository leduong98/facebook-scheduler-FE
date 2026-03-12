import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
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

export default api
