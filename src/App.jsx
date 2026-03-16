import { useState } from 'react'
import AddPageForm from './components/AddPageForm'
import CreatePostForm from './components/CreatePostForm'
import ScheduledPostsTable from './components/ScheduledPostsTable'
import FacebookLoginButton from './components/FacebookLoginButton'
import { useScheduler } from './hooks/useScheduler'

function App() {
  const [postsRefreshKey, setPostsRefreshKey] = useState(0)
  const [pagesRefreshKey, setPagesRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState('dashboard')

  useScheduler(() => setPostsRefreshKey((k) => k + 1))

  const handlePostCreated = () => setPostsRefreshKey((k) => k + 1)
  const handlePageAdded = () => {
    setPostsRefreshKey((k) => k + 1)
    setPagesRefreshKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold text-gray-800">Facebook Scheduler (chỉ FE)</h1>
          <p className="mt-1 text-sm text-gray-500">Đăng nhập Facebook &amp; lên lịch đăng bài — không cần backend.</p>
          <nav className="mt-2 flex gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                activeTab === 'pages'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Quản lý Page
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <section>
              <CreatePostForm key={pagesRefreshKey} onSuccess={handlePostCreated} />
            </section>
            <section>
              <ScheduledPostsTable refreshKey={postsRefreshKey} />
            </section>
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="max-w-md space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-gray-800">Đăng nhập Facebook</h2>
              <FacebookLoginButton onSuccess={handlePageAdded} />
            </div>
            <AddPageForm onSuccess={handlePageAdded} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
