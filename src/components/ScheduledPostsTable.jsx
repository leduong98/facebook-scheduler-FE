import { useState, useEffect } from 'react'
import { getScheduledPosts } from '../services/storage'

const statusStyles = {
  PENDING: 'bg-amber-100 text-amber-800',
  SUCCESS: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
}

const statusLabel = {
  PENDING: 'Chờ đăng',
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
}

function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function ScheduledPostsTable({ refreshKey }) {
  const [posts, setPosts] = useState([])

  const load = () => setPosts(getScheduledPosts())

  useEffect(() => {
    load()
  }, [refreshKey])

  useEffect(() => {
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [])

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Chưa có bài viết nào được lên lịch.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800">Bài viết đã lên lịch</h2>
        <p className="mt-1 text-sm text-gray-500">Cập nhật mỗi 5 giây. Tab phải mở để tự đăng khi đến giờ.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-600">
              <th className="px-6 py-3">Nội dung</th>
              <th className="px-6 py-3">Fanpage</th>
              <th className="px-6 py-3">Thời gian đăng</th>
              <th className="px-6 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const status = (post.status || 'PENDING').toUpperCase()
              const style = statusStyles[status] || statusStyles.PENDING
              const label = statusLabel[status] || status
              return (
                <tr
                  key={post.id}
                  className="border-b border-gray-100 transition hover:bg-gray-50/50"
                >
                  <td className="max-w-xs px-6 py-4 text-gray-800">
                    <span className="line-clamp-2">{post.content || '—'}</span>
                    {post.errorMessage && (
                      <p className="mt-1 text-xs text-red-600 line-clamp-1">{post.errorMessage}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{post.pageName || post.pageId || '—'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                    {formatDateTime(post.scheduledTime)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${style}`}
                    >
                      {label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
