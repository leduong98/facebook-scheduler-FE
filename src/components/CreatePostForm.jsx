import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import { getPages, createPost } from '../services/api'

export default function CreatePostForm({ onSuccess }) {
  const [pages, setPages] = useState([])
  const [pageId, setPageId] = useState('')
  const [content, setContent] = useState('')
  const [scheduledTime, setScheduledTime] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingPages, setLoadingPages] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await getPages()
        const data = res.data?.data ?? res.data ?? []
        setPages(Array.isArray(data) ? data : [])
        if (data?.length && !pageId) setPageId(data[0].id ?? data[0].pageId ?? '')
      } catch {
        setPages([])
      } finally {
        setLoadingPages(false)
      }
    }
    fetchPages()
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
    if (!pageId) {
      setMessage({ type: 'error', text: 'Vui lòng chọn Fanpage.' })
      return
    }
    setLoading(true)
    try {
      await createPost({
        pageId,
        content: content.trim(),
        scheduled_time: scheduledTime.toISOString(),
      })
      setMessage({ type: 'success', text: 'Đã lên lịch đăng bài thành công!' })
      setContent('')
      setScheduledTime(null)
      onSuccess?.()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra.'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoading(false)
    }
  }

  const pageValue = (p) => p.id ?? p.pageId
  const pageLabel = (p) => p.pageName ?? p.name ?? pageValue(p)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Tạo bài viết &amp; lên lịch</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Fanpage</label>
          <select
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            disabled={loadingPages}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition disabled:bg-gray-100"
          >
            <option value="">-- Chọn Fanpage --</option>
            {pages.map((p) => (
              <option key={pageValue(p)} value={pageValue(p)}>
                {pageLabel(p)}
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
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Lên lịch đăng'}
        </button>
      </form>
    </div>
  )
}
