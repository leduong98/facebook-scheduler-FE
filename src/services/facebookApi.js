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
