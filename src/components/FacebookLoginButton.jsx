import { useState } from 'react'
import FacebookLogin from '@greatsumini/react-facebook-login'
import { authFacebook } from '../services/api'

const SCOPES = 'public_profile,pages_show_list,pages_read_engagement,pages_manage_posts'
const APP_ID = import.meta.env.VITE_FB_APP_ID || ''

export default function FacebookLoginButton({ onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const handleSuccess = async (response) => {
    const accessToken = response?.accessToken || response?.access_token
    if (!accessToken) {
      showToast('error', 'Không lấy được access token từ Facebook.')
      return
    }
    setLoading(true)
    try {
      await authFacebook(accessToken)
      showToast('success', 'Kết nối Fanpage thành công!')
      onSuccess?.()
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Kết nối thất bại. Kiểm tra backend (port 8080) và token.'
      showToast('error', msg)
    } finally {
      setLoading(false)
    }
  }

  const handleFail = (error) => {
    showToast('error', error?.message || 'Đăng nhập Facebook thất bại.')
  }

  if (!APP_ID) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Cấu hình <code className="rounded bg-amber-100 px-1">VITE_FB_APP_ID</code> trong file{' '}
        <code className="rounded bg-amber-100 px-1">.env</code> để dùng nút Facebook Login.
      </div>
    )
  }

  return (
    <div className="relative">
      <FacebookLogin
        appId={APP_ID}
        onSuccess={handleSuccess}
        onFail={handleFail}
        scope={SCOPES}
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-lg bg-[#1877F2] px-4 py-2.5 font-medium text-white transition hover:bg-[#166fe5] disabled:opacity-70"
        style={{}}
      >
        {loading ? (
          <span>Đang kết nối...</span>
        ) : (
          <>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Đăng nhập Facebook &amp; kết nối Fanpage</span>
          </>
        )}
      </FacebookLogin>

      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 max-w-sm rounded-lg px-4 py-3 shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
          role="alert"
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
