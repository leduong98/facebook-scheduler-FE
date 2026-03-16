import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import { getPages, addScheduledPost } from '../services/storage'

export default function CreatePostForm({ onSuccess }) {
  const [pages, setPages] = useState([])
  const [pageId, setPageId] = useState('')
  const [content, setContent] = useState('')
  const [scheduledTime, setScheduledTime] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    setPages(getPages())
    const first = getPages()[0]
    if (first) setPageId(first.pageId)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    if (!content.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập nội dung bài viết.' })
      return
    }
    if (!scheduledTime) {
      setMessage({ type: 'error', text: 'Vui lòng chọn thời gian đăng.' })
      return
    }
    const page = pages.find((p) => p.pageId === pageId)
    if (!page) {
      setMessage({ type: 'error', text: 'Vui lòng chọn Fanpage.' })
      return
    }
    setLoading(true)
    try {
      addScheduledPost({
        pageId: page.pageId,
        pageName: page.pageName,
        pageAccessToken: page.pageAccessToken,
        content: content.trim(),
        scheduledTime: scheduledTime.toISOString(),
      })
      setMessage({ type: 'success', text: 'Đã lên lịch đăng bài! (Trình duyệt sẽ tự đăng khi đến giờ)' })
      setContent('')
      setScheduledTime(null)
      onSuccess?.()
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Có lỗi xảy ra.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Tạo bài viết &amp; lên lịch</h2>
      {pages.length === 0 && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Chưa có Fanpage. Vào tab &quot;Quản lý Page&quot; → Đăng nhập Facebook để lấy Fanpage.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Fanpage</label>
          <select
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            disabled={pages.length === 0}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition disabled:bg-gray-100"
          >
            <option value="">-- Chọn Fanpage --</option>
            {pages.map((p) => (
              <option key={p.pageId} value={p.pageId}>
                {p.pageName || p.pageId}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Nội dung bài viết</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung..."
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-y"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Thời gian đăng</label>
          <DatePicker
            selected={scheduledTime}
            onChange={setScheduledTime}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd/MM/yyyy HH:mm"
            minDate={new Date()}
            placeholderText="Chọn ngày giờ đăng"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
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
          disabled={loading || pages.length === 0}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Lên lịch đăng'}
        </button>
      </form>
    </div>
  )
}
