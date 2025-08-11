# Project Fullstack - Sàn Giáo Dục (MVP)

Dự án Fullstack gồm **Client** (ReactJS) và **Server** (Node.js + Express + Prisma + MySQL).  
Mục tiêu: Xây dựng MVP cho sàn giáo dục hỗ trợ học tiếng Anh, có tính năng cộng đồng (UGC).

---

## 1. Yêu cầu hệ thống
- Node.js >= 18
- npm >= 9
- MySQL (Railway DB)
- Git

---

## 2. Hướng dẫn cài đặt & chạy dự án

### Bước 1: Clone dự án
```bash
git clone https://github.com/QuangTruongBee/project_fullstack
cd project_fullstack
```
### Bước 2: Cài đặt & cấu hình Server
```bash
cd server
npm install
```
Tạo file .env trong thư mục server với nội dung:
# Secret key cho JWT
JWT_SECRET=f4b7c30542294fa887867ec46ca9d01060c92b0e0f691d13901f2965d63c0bce102576b19ef0ef847fd0ff88cfc123a373e08c87541f5cb1189ae59b82213c7f

# Kết nối MySQL (ví dụ dùng Railway)
DATABASE_URL="mysql://username:password@host:port/database_name"

# Thông tin Cloudinary (nếu có dùng upload ảnh)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

Chạy server: ```npm run dev```

### Bước 3: Cài đặt & cấu hình Client
Mở terminal mới:
```bash
cd ../client
npm install
```
Tạo file .env trong thư mục client với nội dung:
# URL API backend
REACT_APP_API_URL=https://projectfullstack-production.up.railway.app

Chạy client: npm start
