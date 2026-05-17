================================================================
          NOTE MANAGEMENT APP — HƯỚNG DẪN CHẠY PROJECT
================================================================

THÀNH VIÊN NHÓM
---------------
- [Họ tên 1] — MSSV: [ID1]
- [Họ tên 2] — MSSV: [ID2]

CÔNG NGHỆ SỬ DỤNG
------------------
- Backend  : Laravel 12 (PHP 8.2) + Laravel Sanctum (API Authentication)
- Frontend : React 18 + Vite + Tailwind CSS
- Database : SQLite
- PWA      : Service Worker + Web App Manifest
- Realtime : [WebSocket - nếu đã làm]

KIẾN TRÚC
---------
[Browser] <---> [Laravel (Backend API + Serve Frontend)] <---> [SQLite]
                        |
                [Service Worker (PWA)]

================================================================
CÁCH 1: CHẠY BẰNG DOCKER COMPOSE (KHUYẾN NGHỊ)
================================================================

YÊU CẦU
-------
- Cài Docker Desktop: https://www.docker.com/products/docker-desktop
- Đảm bảo Docker Desktop đang chạy trước khi thực hiện các bước dưới

CÁC BƯỚC THỰC HIỆN
-------------------

Bước 1 — Mở Terminal / PowerShell, di chuyển vào thư mục source:

    cd đường/dẫn/đến/thư-mục/source

Bước 2 — Build và khởi động ứng dụng:

    docker-compose up --build

    (Lần đầu sẽ mất khoảng 3-5 phút để tải và build)

Bước 3 — Mở trình duyệt và truy cập:

    http://localhost:8000

Bước 4 — Để dừng ứng dụng:

    docker-compose down

LƯU Ý
------
- Dữ liệu được lưu trong Docker Volume, không bị mất khi restart
- Nếu port 8000 đã bị chiếm, đổi trong docker-compose.yml:
  "8000:8000" → "8080:8000" rồi truy cập http://localhost:8080

================================================================
CÁCH 2: CHẠY THỦ CÔNG (KHÔNG DÙNG DOCKER)
================================================================

YÊU CẦU
-------
- PHP >= 8.2        (kiểm tra: php -v)
- Composer          (tải tại: https://getcomposer.org)
- Node.js >= 18     (tải tại: https://nodejs.org)
- NPM               (đi kèm Node.js)

CÁC BƯỚC THỰC HIỆN
-------------------

Bước 1 — Mở Terminal, di chuyển vào thư mục source:

    cd đường/dẫn/đến/thư-mục/source

Bước 2 — Cài PHP dependencies:

    composer install

Bước 3 — Tạo file .env:

    copy .env.example .env       (Windows)
    cp .env.example .env         (Mac/Linux)

Bước 4 — Generate app key:

    php artisan key:generate

Bước 5 — Tạo database và chạy migration:

    php artisan migrate

Bước 6 — Tạo storage link:

    php artisan storage:link

Bước 7 — Cài Node dependencies và build frontend:

    npm install
    npm run build

Bước 8 — Khởi động server (mở 2 terminal):

    Terminal 1:  php artisan serve
    Terminal 2:  npm run dev

Bước 9 — Mở trình duyệt:

    http://localhost:8000

================================================================
TÀI KHOẢN MẪU ĐỂ KIỂM TRA
================================================================

Tài khoản 1 (có sẵn data notes, labels, shared notes):
    Email    : test1@example.com
    Password : password123

Tài khoản 2 (dùng để test tính năng share):
    Email    : test2@example.com
    Password : password123

(Nếu dùng Docker, chạy lệnh sau để tạo data mẫu:
 docker exec noteapp php artisan db:seed)

================================================================
CÁC TÍNH NĂNG ĐÃ THỰC HIỆN
================================================================

Account Management:
  [x] 1.  Đăng ký tài khoản
  [x] 2.  Kích hoạt tài khoản qua email
  [x] 3.  Đăng nhập / Đăng xuất
  [x] 4.  Quên mật khẩu / Reset password qua email
  [x] 5.  Xem profile và avatar
  [x] 6.  Chỉnh sửa profile và avatar
  [x] 7.  Đổi mật khẩu
  [x] 8.  User preferences (font size, màu, dark/light mode)

Simple Note Management:
  [x] 9.  Hiển thị notes dạng List view
  [x] 10. Hiển thị notes dạng Grid view (mặc định)
  [x] 11. Tạo note (title + content)
  [x] 12. Chỉnh sửa note (dùng chung màn hình với tạo note)
  [x] 13. Xóa note (có confirmation dialog)
  [x] 14. Auto-save (tự động lưu, không cần nút Save)
  [x] 15. Đính kèm ảnh vào note
  [x] 16. Ghim note lên đầu
  [x] 17. Tìm kiếm note (live search, delay 300ms)
  [x] 18. Quản lý label (xem, thêm, sửa, xóa)
  [x] 19. Gắn label vào note
  [x] 20. Lọc note theo label

Advanced Note Management:
  [x] 21. Bật / Tắt khóa mật khẩu note
  [x] 22. Bảo vệ note bằng mật khẩu / Đổi mật khẩu note
  [x] 23. Chia sẻ note / Nhận note được chia sẻ
  [ ] 24. Cộng tác realtime (WebSocket) — chưa hoàn thiện

Other:
  [x] 25. UI/UX
  [x] 26. Responsive design
  [x] 27. Offline/PWA (Service Worker)
  [x] 28. Docker Compose deployment

================================================================
GHI CHÚ THÊM
================================================================

- Tính năng email (activation, reset password) sử dụng Mailtrap.
  Để test email: đăng ký tài khoản tại https://mailtrap.io
  và cập nhật thông tin MAIL_* trong file .env

- File .env.example đã có đầy đủ các biến cần thiết.
  Chỉ cần copy thành .env và điền thông tin mail nếu muốn test email.

- Tính năng PWA: truy cập http://localhost:8000 bằng Chrome,
  nhấn vào icon Install trên thanh địa chỉ để cài như app.

================================================================
