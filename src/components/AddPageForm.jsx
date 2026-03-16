import { useState } from 'react'
import { getPages, setPages } from '../services/storage'

export default function AddPageForm({ onSuccess }) {
  const [pageId, setPageId] = useState('')
  const [pageName, setPageName] = useState('')
  const [pageAccessToken, setPageAccessToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    if (!pageId.trim() || !pageName.trim() || !pageAccessToken.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin.' })
      return
    }
    setLoading(true)
    try {
      const pages = getPages()
      const existing = pages.filter((p) => p.pageId !== pageId.trim())
      existing.push({
        pageId: pageId.trim(),
        pageName: pageName.trim(),
        pageAccessToken: pageAccessToken.trim(),
      })
      setPages(existing)
      setMessage({ type: 'success', text: 'Đã lưu Page vào trình duyệt (localStorage).' })
      setPageId('')
      setPageName('')
      setPageAccessToken('')
      onSuccess?.()
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Có lỗi xảy ra.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Thêm Fanpage thủ công (Page Token)</h2>
      <p className="mb-4 text-sm text-gray-600">
        Nếu không dùng nút Facebook Login, bạn có thể lấy Page ID và Token từ{' '}
        <a
          href="https://developers.facebook.com/tools/explorer/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Graph API Explorer
        </a>{' '}
        rồi điền bên dưới.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Page ID</label>
          <input
            type="text"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            placeholder="Nhập Page ID"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Page Name</label>
          <input
            type="text"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            placeholder="Tên hiển thị"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Page Access Token</label>
          <input
            type="password"
            value={pageAccessToken}
            onChange={(e) => setPageAccessToken(e.target.value)}
            placeholder="Token từ Graph API Explorer"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
          />
        </div>
        {message.text && (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : 'Lưu Page (chỉ trên trình duyệt)'}
        </button>
      </form>
    </div>
  )
}
