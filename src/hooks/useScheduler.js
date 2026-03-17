import { useEffect, useRef } from 'react'
import { getScheduledPosts, updateScheduledPost } from '../services/storage'
import { publishPost } from '../services/facebookApi'
import { getPostMedia } from '../services/mediaStore'

/**
 * Mỗi phút quét bài PENDING đã đến giờ, gọi Facebook API đăng, cập nhật SUCCESS/FAILED.
 * onTick: callback sau mỗi lần chạy (để refresh UI).
 */
export function useScheduler(onTick) {
  const onTickRef = useRef(onTick)
  onTickRef.current = onTick

  useEffect(() => {
    const run = async () => {
      const now = new Date().toISOString()
      const posts = getScheduledPosts()
      const due = posts.filter(
        (p) => p.status === 'PENDING' && p.scheduledTime && p.scheduledTime <= now
      )
      if (due.length === 0) return
      for (const post of due) {
        try {
          const media = await getPostMedia(post.id)
          const mediaFiles = (media || []).map((m) => m.file).filter(Boolean)
          await publishPost({
            pageId: post.pageId,
            pageAccessToken: post.pageAccessToken,
            message: post.content,
            mediaFiles,
          })
          updateScheduledPost(post.id, { status: 'SUCCESS', errorMessage: null })
        } catch (err) {
          updateScheduledPost(post.id, {
            status: 'FAILED',
            errorMessage: err?.message || 'Lỗi đăng bài',
          })
        } finally {
          onTickRef.current?.()
        }
      }
    }

    run()
    const t = setInterval(run, 60 * 1000)
    return () => clearInterval(t)
  }, [])
}
