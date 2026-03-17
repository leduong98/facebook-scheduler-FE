/**
 * Lưu file (Blob) cho scheduled post bằng IndexedDB để không bị mất khi refresh.
 * Tránh nhét File vào localStorage (không hỗ trợ / giới hạn dung lượng).
 */
 
const DB_NAME = 'fb_scheduler_media_db'
const DB_VERSION = 1
const STORE = 'post_media'
 
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
 
function txPromise(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onabort = () => reject(tx.error || new Error('IndexedDB aborted'))
    tx.onerror = () => reject(tx.error || new Error('IndexedDB error'))
  })
}
 
export async function savePostMedia(postId, files) {
  const list = (files || []).map((f) => ({
    name: f.name,
    type: f.type,
    size: f.size,
    lastModified: f.lastModified,
    file: f, // File/Blob lưu trực tiếp vào IDB
  }))
 
  const db = await openDb()
  const tx = db.transaction(STORE, 'readwrite')
  tx.objectStore(STORE).put(list, postId)
  await txPromise(tx)
  db.close()
 
  // Trả về metadata để hiển thị trong table nếu cần
  return list.map(({ name, type, size, lastModified }) => ({
    name,
    type,
    size,
    lastModified,
  }))
}
 
export async function getPostMedia(postId) {
  const db = await openDb()
  const tx = db.transaction(STORE, 'readonly')
  const req = tx.objectStore(STORE).get(postId)
  const value = await new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
  db.close()
  // value là [{ name,type,size,lastModified,file }]
  return value
}
 
export async function deletePostMedia(postId) {
  const db = await openDb()
  const tx = db.transaction(STORE, 'readwrite')
  tx.objectStore(STORE).delete(postId)
  await txPromise(tx)
  db.close()
}
