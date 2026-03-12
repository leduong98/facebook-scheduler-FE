import { useState, useEffect } from 'react'
import { getPosts } from '../services/api'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPosts()
      const data = res.data?.data ?? res.data ?? []
      setPosts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không tải được danh sách bài viết.')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [refreshKey])

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Đang tải...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    )
  }

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
              const pageName = post.page?.pageName ?? post.page?.name ?? post.pageId ?? '—'
              return (
                <tr
                  key={post.id}
                  className="border-b border-gray-100 transition hover:bg-gray-50/50"
                >
                  <td className="max-w-xs px-6 py-4 text-gray-800">
                    <span className="line-clamp-2">{post.content || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{pageName}</td>
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                    {formatDateTime(post.scheduled_time ?? post.scheduledTime)}
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
