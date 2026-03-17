import { useEffect, useMemo, useState } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css" // Đừng quên import CSS của datepicker
import { getPages, addScheduledPost } from '../services/storage'
import { publishPost } from '../services/facebookApi'

export default function CreatePostForm({ onSuccess }) {
  const [pages, setPages] = useState([])
  const [pageId, setPageId] = useState('')
  const [content, setContent] = useState('')
  const [scheduledTime, setScheduledTime] = useState(null)
  // State mới để lưu file media
  const [mediaFiles, setMediaFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const fetchedPages = getPages() || []
    setPages(fetchedPages)
    if (fetchedPages.length > 0) {
      setPageId(fetchedPages[0].pageId)
    }
  }, [])

  // Hàm xử lý khi người dùng chọn file
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Rule: không trộn ảnh + video; video chỉ 1 file
    const hasVideo = files.some((f) => (f.type || '').startsWith('video/'))
    const hasImage = files.some((f) => (f.type || '').startsWith('image/'))

    if (hasVideo && (hasImage || mediaFiles.some((f) => (f.type || '').startsWith('image/')))) {
      setMessage({ type: 'error', text: 'Không thể chọn chung ảnh và video trong cùng 1 bài.' })
      e.target.value = ''
      return
    }
    if (hasImage && mediaFiles.some((f) => (f.type || '').startsWith('video/'))) {
      setMessage({ type: 'error', text: 'Không thể chọn chung ảnh và video trong cùng 1 bài.' })
      e.target.value = ''
      return
    }
    if (hasVideo && (mediaFiles.length > 0 || files.length > 1)) {
      setMessage({ type: 'error', text: 'Hiện chỉ hỗ trợ 1 video mỗi bài.' })
      e.target.value = ''
      return
    }

    // Append
    setMediaFiles((prev) => [...prev, ...files])
    e.target.value = ''
  }

  // Hàm xóa file đã chọn
  const removeFile = (indexToRemove) => {
    setMediaFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const previews = useMemo(() => {
    return mediaFiles.map((file) => ({
      file,
      url: file.type?.startsWith('image/') ? URL.createObjectURL(file) : null,
    }))
  }, [mediaFiles])

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url)
      })
    }
  }, [previews])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    
    if (!content.trim() && mediaFiles.length === 0) {
      setMessage({ type: 'error', text: 'Vui lòng nhập nội dung hoặc chọn ảnh/video.' })
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
      // Gọi service lưu bài viết kèm mediaFiles
      addScheduledPost({
        pageId: page.pageId,
        pageName: page.pageName,
        pageAccessToken: page.pageAccessToken,
        content: content.trim(),
        scheduledTime: scheduledTime.toISOString(),
        media: mediaFiles // Truyền mảng File objects
      })
      
      setMessage({ type: 'success', text: 'Đã lên lịch đăng bài!' })
      setContent('')
      setScheduledTime(null)
      setMediaFiles([]) // Reset files
      onSuccess?.()
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Có lỗi xảy ra.' })
    } finally {
      setLoading(false)
    }
  }

  const handlePostNow = async () => {
    setMessage({ type: '', text: '' })

    if (!content.trim() && mediaFiles.length === 0) {
      setMessage({ type: 'error', text: 'Vui lòng nhập nội dung hoặc chọn ảnh/video.' })
      return
    }

    const page = pages.find((p) => p.pageId === pageId)
    if (!page) {
      setMessage({ type: 'error', text: 'Vui lòng chọn Fanpage.' })
      return
    }

    setLoading(true)
    try {
      await publishPost({
        pageId: page.pageId,
        pageAccessToken: page.pageAccessToken,
        message: content.trim(),
        mediaFiles,
      })

      setMessage({ type: 'success', text: 'Đã đăng bài ngay lập tức!' })
      setContent('')
      setScheduledTime(null)
      setMediaFiles([])
      onSuccess?.()
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Đăng bài thất bại.' })
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
        {/* Chọn Fanpage */}
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

        {/* Nhập nội dung */}
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

        {/* Upload Ảnh/Video */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Đính kèm Ảnh/Video</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple // Cho phép chọn nhiều file
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-2 text-xs text-gray-500">
            Lưu ý: Không trộn ảnh và video trong 1 bài. Video chỉ hỗ trợ 1 file.
          </p>
          
          {/* Khu vực xem trước (Preview) */}
          {previews.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {previews.map(({ file, url }, index) => (
                <div key={index} className="relative h-20 w-20 rounded-md border border-gray-200 overflow-hidden group">
                  {file.type.startsWith('image/') ? (
                    <img src={url} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-500 text-center p-1">
                      Video<br />{file.name.substring(0, 10)}...
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex"
                    title="Xóa"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Thời gian đăng */}
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

        {/* Thông báo */}
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handlePostNow}
            disabled={loading || pages.length === 0}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ngay'}
          </button>

          <button
            type="submit"
            disabled={loading || pages.length === 0}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Lên lịch đăng'}
          </button>
        </div>
      </form>
    </div>
  )
}