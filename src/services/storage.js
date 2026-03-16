/**
 * Lưu Pages và Scheduled Posts trong localStorage (chỉ FE, không BE).
 */

const KEY_PAGES = 'fb_scheduler_pages'
const KEY_POSTS = 'fb_scheduler_posts'

export function getPages() {
  try {
    const raw = localStorage.getItem(KEY_PAGES)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function setPages(pages) {
  localStorage.setItem(KEY_PAGES, JSON.stringify(pages || []))
}

/** Merge pages từ Facebook với pages hiện có (theo pageId). */
export function mergePages(newPages) {
  const current = getPages()
  const byId = new Map(current.map((p) => [p.pageId, p]))
  for (const p of newPages || []) {
    if (p.pageId && p.pageAccessToken) byId.set(p.pageId, p)
  }
  setPages(Array.from(byId.values()))
}

export function getScheduledPosts() {
  try {
    const raw = localStorage.getItem(KEY_POSTS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveScheduledPosts(posts) {
  localStorage.setItem(KEY_POSTS, JSON.stringify(posts))
}

export function addScheduledPost(post) {
  const posts = getScheduledPosts()
  const id = `post_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const newPost = {
    id,
    pageId: post.pageId,
    pageName: post.pageName || '',
    pageAccessToken: post.pageAccessToken,
    content: post.content,
    scheduledTime: post.scheduledTime,
    status: 'PENDING',
    errorMessage: null,
  }
  posts.push(newPost)
  saveScheduledPosts(posts)
  return newPost
}

export function updateScheduledPost(id, update) {
  const posts = getScheduledPosts()
  const i = posts.findIndex((p) => p.id === id)
  if (i === -1) return
  posts[i] = { ...posts[i], ...update }
  saveScheduledPosts(posts)
}
