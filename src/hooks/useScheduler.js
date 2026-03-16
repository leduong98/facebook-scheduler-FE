import { useEffect, useRef } from 'react'
import { getScheduledPosts, updateScheduledPost } from '../services/storage'
import { postToPageFeed } from '../services/facebookApi'

/**
 * Mỗi phút quét bài PENDING đã đến giờ, gọi Facebook API đăng, cập nhật SUCCESS/FAILED.
 * onTick: callback sau mỗi lần chạy (để refresh UI).
 */
export function useScheduler(onTick) {
  const onTickRef = useRef(onTick)
  onTickRef.current = onTick

  useEffect(() => {
    const run = () => {
      const now = new Date().toISOString()
      const posts = getScheduledPosts()
      const due = posts.filter(
        (p) => p.status === 'PENDING' && p.scheduledTime && p.scheduledTime <= now
      )
      if (due.length === 0) return
      for (const post of due) {
        try {
          postToPageFeed(post.pageId, post.pageAccessToken, post.content)
          updateScheduledPost(post.id, { status: 'SUCCESS', errorMessage: null })
        } catch (err) {
          updateScheduledPost(post.id, {
            status: 'FAILED',
            errorMessage: err?.message || 'Lỗi đăng bài',
          })
        }
      }
      onTickRef.current?.()
    }

    run()
    const t = setInterval(run, 60 * 1000)
    return () => clearInterval(t)
  }, [])
}
