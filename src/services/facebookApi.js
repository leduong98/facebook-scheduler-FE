/**
 * Gọi trực tiếp Facebook Graph API từ FE (không qua BE).
 */

const GRAPH_VERSION = 'v19.0'
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`

/**
 * Lấy danh sách Fanpage user quản lý (có kèm page access_token).
 * GET /me/accounts
 */
export async function getMeAccounts(accessToken) {
  const url = `${GRAPH_BASE}/me/accounts?access_token=${encodeURIComponent(accessToken)}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.error) {
    throw new Error(data.error.message || 'Lấy danh sách Fanpage thất bại')
  }
  const list = data.data || []
  return list.map((p) => ({
    pageId: p.id,
    pageName: p.name || p.id,
    pageAccessToken: p.access_token || '',
  }))
}

/**
 * Đăng bài lên Fanpage.
 * POST /{page-id}/feed với message và access_token (page token).
 */
export async function postToPageFeed(pageId, pageAccessToken, message) {
  const url = `${GRAPH_BASE}/${pageId}/feed`
  const body = new URLSearchParams({
    message,
    access_token: pageAccessToken,
  })
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.error?.message || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return data
}

/**
 * Upload 1 ảnh (unpublished) lên page.
 * POST /{page-id}/photos với FormData: source, published=false
 */
export async function uploadPhoto(pageId, pageAccessToken, file) {
  const url = `${GRAPH_BASE}/${pageId}/photos`
  const form = new FormData()
  form.append('source', file)
  form.append('published', 'false')
  form.append('access_token', pageAccessToken)

  const res = await fetch(url, { method: 'POST', body: form })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.error?.message || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return data // { id, post_id? }
}

/**
 * Tạo post với nhiều ảnh: upload unpublished rồi tạo feed với attached_media.
 */
export async function postPhotosToFeed(pageId, pageAccessToken, message, files) {
  const uploads = []
  for (const f of files) {
    uploads.push(await uploadPhoto(pageId, pageAccessToken, f))
  }

  const url = `${GRAPH_BASE}/${pageId}/feed`
  const body = new URLSearchParams({
    message: message || '',
    access_token: pageAccessToken,
  })
  uploads.forEach((u, i) => {
    body.append(`attached_media[${i}]`, JSON.stringify({ media_fbid: u.id }))
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.error?.message || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return data
}

/**
 * Upload video lên page (published=true).
 * POST /{page-id}/videos với FormData: source, description
 */
export async function postVideoToPage(pageId, pageAccessToken, description, file) {
  const url = `${GRAPH_BASE}/${pageId}/videos`
  const form = new FormData()
  form.append('source', file)
  if (description) form.append('description', description)
  form.append('access_token', pageAccessToken)

  const res = await fetch(url, { method: 'POST', body: form })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.error?.message || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return data
}

/**
 * Publish post hỗ trợ text / ảnh / video.
 * - Không cho trộn ảnh + video trong cùng 1 post.
 * - Video chỉ hỗ trợ 1 file.
 */
export async function publishPost({ pageId, pageAccessToken, message, mediaFiles }) {
  const files = mediaFiles || []
  if (files.length === 0) {
    return await postToPageFeed(pageId, pageAccessToken, message || '')
  }

  const hasVideo = files.some((f) => (f.type || '').startsWith('video/'))
  const hasImage = files.some((f) => (f.type || '').startsWith('image/'))

  if (hasVideo && hasImage) {
    throw new Error('Facebook không hỗ trợ đăng kèm cả ảnh và video trong cùng một bài.')
  }

  if (hasVideo) {
    if (files.length > 1) {
      throw new Error('Hiện chỉ hỗ trợ đăng 1 video mỗi bài.')
    }
    return await postVideoToPage(pageId, pageAccessToken, message || '', files[0])
  }

  // images
  return await postPhotosToFeed(pageId, pageAccessToken, message || '', files)
}
