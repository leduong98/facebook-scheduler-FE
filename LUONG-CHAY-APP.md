# Luồng chạy app — Facebook Scheduler (chỉ Frontend)

App **không dùng backend**. Trình duyệt gọi trực tiếp **Facebook Graph API**, dữ liệu lưu trong **localStorage**.

---

## 1. Tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│  TRÌNH DUYỆT (bạn mở http://localhost:3000)                     │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  React App   │───▶│  localStorage │    │  Facebook Graph  │  │
│  │  (UI)        │    │  (Pages,      │    │  API (đăng nhập, │  │
│  │              │    │   bài lên lịch)   │   lấy Page, đăng) │  │
│  └──────────────┘    └──────────────┘    └────────▲─────────┘  │
│         │                    │                     │            │
│         │                    │                     │ fetch()    │
│         └────────────────────┴─────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

- **localStorage:** Lưu danh sách Fanpage (pageId, pageName, pageAccessToken) và danh sách bài viết đã lên lịch.
- **Facebook Graph API:** Đăng nhập (qua SDK) → lấy token → gọi API lấy Page, đăng bài.

---

## 2. Luồng từng bước (theo thao tác người dùng)

### Bước 1: Mở app

1. Bạn mở **http://localhost:3000** (hoặc URL FE).
2. App có 2 tab: **Dashboard** | **Quản lý Page**.
3. Lần đầu chưa có Fanpage → cần vào **Quản lý Page** để lấy Page.

---

### Bước 2: Lấy danh sách Fanpage (tab Quản lý Page)

```
Bạn bấm "Đăng nhập Facebook & lấy Fanpage"
        │
        ▼
Facebook Login (popup/cửa sổ) — bạn đăng nhập FB, chấp nhận quyền
        │
        ▼
App nhận được access_token (token user, từ Facebook SDK)
        │
        ▼
Gọi Facebook API: GET .../me/accounts?access_token=...
        │
        ▼
Facebook trả về danh sách Fanpage bạn quản lý (mỗi page có id, name, access_token)
        │
        ▼
App gộp vào localStorage (key: fb_scheduler_pages)
        │
        ▼
Hiện toast "Đã lấy X Fanpage" — xong, có thể sang Dashboard
```

**File liên quan:** `FacebookLoginButton.jsx` → `facebookApi.getMeAccounts()` → `storage.mergePages()`.

---

### Bước 3: Lên lịch đăng bài (tab Dashboard)

```
Bạn chọn Fanpage (dropdown) — danh sách lấy từ localStorage
Bạn nhập nội dung bài viết
Bạn chọn ngày giờ đăng (DatePicker)
Bạn bấm "Lên lịch đăng"
        │
        ▼
App tạo object bài viết: { id, pageId, pageName, pageAccessToken, content, scheduledTime, status: 'PENDING' }
        │
        ▼
Lưu vào localStorage (key: fb_scheduler_posts)
        │
        ▼
Bảng "Bài viết đã lên lịch" cập nhật (trạng thái Chờ đăng)
```

**File liên quan:** `CreatePostForm.jsx` → `storage.addScheduledPost()`.

---

### Bước 4: Tự đăng khi đến giờ (chạy nền trong tab)

```
App đã mount hook useScheduler()
        │
        ▼
Mỗi 60 giây (1 phút), scheduler chạy:
  1. Đọc tất cả bài từ localStorage (getScheduledPosts)
  2. Lọc bài: status === 'PENDING' VÀ scheduledTime <= thời gian hiện tại
  3. Với mỗi bài đủ điều kiện:
       - Gọi Facebook API: POST .../{pageId}/feed (message + access_token)
       - Nếu thành công → cập nhật bài: status = 'SUCCESS'
       - Nếu lỗi → cập nhật bài: status = 'FAILED', errorMessage = ...
  4. Gọi onTick() → UI bảng bài viết refresh
        │
        ▼
Bảng "Bài viết đã lên lịch" tự cập nhật mỗi 5 giây (setInterval trong ScheduledPostsTable)
→ Bạn thấy trạng thái chuyển từ "Chờ đăng" sang "Thành công" hoặc "Thất bại"
```

**File liên quan:** `useScheduler.js` → `getScheduledPosts()` → `postToPageFeed()` → `updateScheduledPost()`.

**Lưu ý:** Scheduler chỉ chạy khi **tab app đang mở**. Đóng tab thì không có gì chạy nền → bài sẽ không tự đăng. Muốn đăng đúng giờ thì để tab mở (hoặc mở trước giờ đăng).

---

## 3. Luồng dữ liệu (tóm tắt)

| Bước | Nơi lưu / Gọi | Nội dung |
|------|----------------|----------|
| Đăng nhập FB | Facebook (OAuth) | User token |
| Lấy Fanpage | Facebook API `GET /me/accounts` | Danh sách Page (id, name, access_token) |
| Lưu Page | localStorage `fb_scheduler_pages` | Mảng Page dùng cho dropdown |
| Tạo bài lên lịch | localStorage `fb_scheduler_posts` | Mảng bài (PENDING → SUCCESS/FAILED) |
| Đến giờ đăng | Facebook API `POST /{page-id}/feed` | Đăng nội dung lên Fanpage |
| Cập nhật trạng thái | localStorage `fb_scheduler_posts` | Sửa status + errorMessage |

---

## 4. Thêm Page thủ công (tùy chọn)

Trong tab **Quản lý Page** có form **Thêm Fanpage thủ công**: bạn nhập Page ID, Page Name, Page Access Token (lấy từ [Graph API Explorer](https://developers.facebook.com/tools/explorer/)) → lưu vào localStorage. Dùng khi không muốn dùng nút Facebook Login.

---

## 5. Lưu ý quan trọng

- **Tab phải mở** thì bài mới tự đăng khi đến giờ (setInterval chạy trong tab).
- Dữ liệu chỉ ở **trình duyệt** (localStorage): xóa cache / đổi máy / đổi trình duyệt là mất.
- **App Secret** (key) không dùng trong app FE-only; chỉ cần **App ID** trong `.env` (VITE_FB_APP_ID).
