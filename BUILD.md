# 🔨 Hướng dẫn Build — Cowdi English

Tài liệu giải thích đầy đủ về hệ thống build của project: các lệnh, thư viện liên quan, cơ chế hoạt động và cách tự build.

---

## 1. Tổng quan kiến trúc build

```
Source code (src/)
      │
      ▼
  [Vite 5]  ←── vite.config.js / vite.config.prod.js
      │
      ├── Transpile JSX → JS  (via @vitejs/plugin-react + Babel)
      ├── Bundle modules      (via Rollup — built-in Vite)
      ├── Minify CSS/JS       (via esbuild — built-in Vite)
      └── Output files
              ├── dist/          ← môi trường dev/test
              └── dist-prod/     ← môi trường production (deploy)
```

Cowdi English là **Single Page Application (SPA)** — toàn bộ React code được đóng gói thành
một tập hợp file tĩnh (HTML + CSS + JS). Không cần server để chạy frontend — chỉ cần Nginx
phục vụ các file này.

---

## 2. Các lệnh build

### 2.1 Development server (không build)

```bash
npm run dev
# tương đương: vite
```

| Thuộc tính | Giá trị |
|---|---|
| URL | `http://localhost:5173` |
| Config dùng | `vite.config.js` |
| Base path | `/cowdi/` |
| Hot Reload | ✅ (HMR — Hot Module Replacement) |
| Minify | ❌ (không nén, dễ debug) |
| Output | Không tạo file — serve trực tiếp từ RAM |

> Dùng khi **đang phát triển**, sửa code thấy kết quả ngay lập tức.

---

### 2.2 Build thường (dist/)

```bash
npm run build
# tương đương: vite build
# config: vite.config.js
```

| Thuộc tính | Giá trị |
|---|---|
| Output folder | `dist/` |
| Base path | `/cowdi/` |
| API URL | `http://localhost:3001` (mặc định) |
| Minify | ✅ |
| Source map | ❌ |

**Khi nào dùng:** Test build local, hoặc deploy lên subfolder `/cowdi/` của server.

**Tại sao base là `/cowdi/`?** Vì trên server, app có thể chạy tại `https://cowdi.net/cowdi/`
thay vì root domain. Nếu deploy ở root, dùng `build:prod`.

---

### 2.3 Build production (dist-prod/) ← DÙNG ĐỂ DEPLOY

```bash
npm run build:prod
# tương đương: vite build --config vite.config.prod.js --mode production
```

| Thuộc tính | Giá trị |
|---|---|
| Output folder | `dist-prod/` |
| Base path | `/` (root domain) |
| API URL | `https://cowdi.net` (hardcoded) |
| Minify JS | ✅ (esbuild) |
| Minify CSS | ✅ (cssMinify: true) |
| Source map | ❌ |
| Code splitting | ✅ (vendor chunk tách riêng) |

**Tại sao phải dùng `dist-prod/` thay vì `dist/`?**

```
dist/           → base = "/cowdi/"  → URL assets: /cowdi/assets/index.js
                  Nếu deploy ở root (/) thì link bị SAI → trang trắng

dist-prod/      → base = "/"       → URL assets: /assets/index.js
                  Deploy ở root (/) → ĐÚNG ✅
```

---

## 3. So sánh hai config file

### `vite.config.js` (development)

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/cowdi/',          // ← subfolder path
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true,             // tự mở browser
  },
});
```

### `vite.config.prod.js` (production)

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/',                // ← root path cho domain chính
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('https://cowdi.net'),
    // Thay thế biến này tại build time → không cần .env trên server
  },
  build: {
    outDir: 'dist-prod',
    sourcemap: false,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Tách vendor (164KB) riêng khỏi app code (768KB)
          // → Browser cache vendor lâu dài, chỉ re-download app khi code thay đổi
        },
      },
    },
  },
});
```

**Điểm khác biệt quan trọng — `define`:**

```javascript
// Trong source code:
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Sau khi build prod, Vite thay thế tại chỗ thành:
const API = 'https://cowdi.net';
// → Không cần file .env trên server production
```

---

## 4. Thư viện liên quan

### 4.1 Build tools (devDependencies)

| Thư viện | Version | Vai trò |
|---|---|---|
| **vite** | ^5.4.0 | Build tool chính — dev server + bundler |
| **@vitejs/plugin-react** | ^4.3.0 | Plugin xử lý JSX, React Fast Refresh |
| **rollup** | (built-in vite) | Module bundler — đóng gói ES modules thành file output |
| **esbuild** | (built-in vite) | Transpiler + minifier — nhanh hơn Babel/Terser 10-100x |
| **sharp** | ^0.34.5 | Xử lý ảnh WebP (dùng trong scripts/, không dùng lúc build) |

### 4.2 Runtime dependencies

| Thư viện | Version | Vai trò |
|---|---|---|
| **react** | ^18.3.0 | UI library |
| **react-dom** | ^18.3.0 | Render React vào DOM |
| **react-router-dom** | ^6.26.0 | Client-side routing (SPA navigation) |

### 4.3 Không có gì khác?

Đúng — Cowdi English **không dùng** Redux, Zustand, Axios, TypeScript hay bất kỳ framework
nặng nào. Toàn bộ state management dùng React hooks thuần (`useState`, `useContext`,
`useReducer`). Đây là lý do bundle size nhỏ (~768KB → 243KB gzip).

---

## 5. Output sau khi build

```
dist-prod/
├── index.html                   ← Entry point (0.97 KB)
└── assets/
    ├── index-CpuhHYw3.css       ← Tất cả CSS (30 KB → 6.79 KB gzip)
    ├── vendor-DIuwClwV.js       ← React + React-DOM + Router (164 KB → 53 KB gzip)
    ├── index-DCGP6WwR.js        ← App code (768 KB → 243 KB gzip)
    └── images/
        ├── pets/                ← Ảnh pet WebP
        ├── logo/
        └── events/
```

**Hash trong tên file (`CpuhHYw3`) là gì?**

Vite tự động đặt hash dựa trên nội dung file. Nếu code không thay đổi → hash không đổi →
browser dùng **cache cũ**. Nếu code thay đổi → hash mới → browser tải file mới. Đây là
kỹ thuật **cache busting** tự động.

---

## 6. Luồng hoạt động khi user truy cập

```
User nhập cowdi.net
      │
      ▼
   Nginx nhận request
      │
      ├── /api/*  → proxy_pass → Node.js :3001 (Express backend)
      ├── /auth/* → proxy_pass → Node.js :3001
      │
      └── /* (tất cả route khác)
              │
              ▼
          Trả về dist-prod/index.html
              │
              ▼
          Browser tải vendor.js + index.js + index.css
              │
              ▼
          React khởi động, React Router đọc URL
              │
              ▼
          Render đúng trang (/, /lessons, /pet, ...)
```

**Tại sao cần `try_files $uri $uri/ /index.html` trong Nginx?**

Vì đây là SPA. Route như `/lessons/greetings` không phải file thật trên server —
chỉ là React Router điều hướng. Nếu user F5 ở trang đó, Nginx phải trả về `index.html`
để React Router xử lý, không được trả 404.

---

## 7. Tự build từ đầu — Step by step

### Bước 1: Cài Node.js

Tải Node.js >= 18 từ https://nodejs.org (khuyên dùng LTS version)

```bash
node --version   # Kiểm tra: phải >= v18.0.0
npm --version    # Kiểm tra: phải >= v9.0.0
```

### Bước 2: Clone và cài dependencies

```bash
git clone https://github.com/your-org/cowdi-english.git
cd cowdi-english
npm install
```

Lệnh `npm install` đọc `package.json` và tải về:
- `node_modules/vite/` (~50MB)
- `node_modules/react/` (~500KB)
- `node_modules/@vitejs/plugin-react/` (~30MB)
- ...tổng ~150MB

### Bước 3: Chạy dev server

```bash
npm run dev
# Mở browser: http://localhost:5173
```

### Bước 4: Build production

```bash
npm run build:prod
```

Quá trình build (~3-5 giây):

```
1. Vite đọc vite.config.prod.js
2. @vitejs/plugin-react chuyển đổi JSX → JS
3. Rollup phân tích import graph toàn bộ src/
4. Rollup tách code thành chunks:
   - vendor chunk: react + react-dom + react-router-dom
   - app chunk: tất cả code src/
5. esbuild minify từng chunk
6. Vite copy public/assets/ vào dist-prod/assets/
7. Vite tạo dist-prod/index.html với script tags trỏ đúng file
```

Output:
```
dist-prod/index.html                  1.03 kB │ gzip:   0.55 kB
dist-prod/assets/index-CpuhHYw3.css  30.10 kB │ gzip:   6.79 kB
dist-prod/assets/vendor-DIuwClwV.js 164.20 kB │ gzip:  53.61 kB
dist-prod/assets/index-DCGP6WwR.js  768.00 kB │ gzip: 243.28 kB
✓ built in 2.76s
```

### Bước 5: Preview build locally (optional)

```bash
npm run preview
# Serve dist/ tại http://localhost:4173
# Kiểm tra build có hoạt động đúng không trước khi deploy
```

### Bước 6: Upload lên server

```bash
# Dùng SCP, FTP, hoặc aaPanel File Manager
# Upload toàn bộ thư mục dist-prod/ lên /www/wwwroot/cowdi.net/

scp -r dist-prod/* user@cowdi.net:/www/wwwroot/cowdi.net/
```

---

## 8. Cấu hình Nginx (SPA)

File `nginx-spa.conf` trong project chứa template. Cấu hình tối thiểu:

```nginx
server {
    listen 80;
    server_name cowdi.net;
    root /www/wwwroot/cowdi.net;
    index index.html;

    # 1. Gzip nén
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;

    # 2. Cache dài hạn cho assets có hash
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 3. Proxy API sang backend Node.js
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /auth {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
    }

    # 4. SPA fallback — QUAN TRỌNG
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 9. Thay đổi API URL

Nếu muốn build trỏ sang domain khác (ví dụ staging):

```javascript
// vite.config.prod.js
define: {
  'import.meta.env.VITE_API_URL': JSON.stringify('https://staging.cowdi.net'),
},
```

Hoặc dùng file `.env`:

```env
# .env.production
VITE_API_URL=https://cowdi.net
```

Rồi trong config bỏ `define`, code tự đọc `import.meta.env.VITE_API_URL`.

---

## 10. Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|---|---|---|
| `vite: command not found` | chưa `npm install` | Chạy `npm install` trước |
| Trang trắng sau deploy | `base` path sai | Đảm bảo dùng `vite.config.prod.js` với `base: '/'` |
| F5 trên route `/lessons` → 404 | Nginx chưa có SPA fallback | Thêm `try_files $uri /index.html` |
| API calls fail trên production | `VITE_API_URL` sai | Kiểm tra `define` trong `vite.config.prod.js` |
| Bundle quá lớn (>1MB) | Chưa code-split | Thêm `manualChunks` trong rollupOptions |
| `Cannot resolve './lessons.js'` | Import path sai sau refactor | Cập nhật relative path trong file bị lỗi |

---

## 11. Scripts đầy đủ

```json
// package.json
{
  "scripts": {
    "dev":        "vite",
    "build":      "vite build",
    "build:prod": "vite build --config vite.config.prod.js --mode production",
    "preview":    "vite preview"
  }
}
```

| Lệnh | Môi trường | Output | Dùng khi |
|---|---|---|---|
| `npm run dev` | Development | RAM (không file) | Lập trình hàng ngày |
| `npm run build` | Test | `dist/` | Test build với base `/cowdi/` |
| `npm run build:prod` | Production | `dist-prod/` | **Deploy lên server** |
| `npm run preview` | Preview | Serve `dist/` | Kiểm tra trước deploy |