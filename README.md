# Women's Day 2.0 — Cinematic Celebration

## Chạy dự án

Intro dùng TypeScript, Three.js và shader GLSL nên cần chạy qua Vite:

```powershell
npm install
npm run dev
```

Mở URL Vite hiển thị trong terminal. Tạo bản production bằng `npm run build`; kiểm tra bản build bằng `npm run preview`. Không mở `index.html` trực tiếp bằng `file://`.

## Trải nghiệm và cấu trúc

- `index.html`, `style.css`, `app.js`: hành trình 11A1 K48 và điều phối chuyển cảnh.
- `src/intro-particles.ts`: intro Three.js/WebGL 2; vertex/fragment shader GLSL chạy chuyển động tim 3D, nhịp đập, burst và tạo chữ bằng particles trên GPU.
- `package.json`, `tsconfig.json`: scripts và cấu hình build TypeScript/Vite.
- `effects/firework.js`: canvas pháo hoa có giới hạn particle, DPR tối đa 2, tạm dừng khi tab ẩn và cleanup listener.
- `matrix-pro.html`: địa chỉ tương thích ngược, chuyển tới cảnh Matrix trong trải nghiệm chính.
- `flower.html`, `flower.css`: trang vườn hoa độc lập được giữ lại; hoa nhiều cánh từ CSS gốc cũng được tái sử dụng làm nền thư cuối.
- `bgr2.jpg`, `assets/banner.png`: tài nguyên hình ảnh cũ được giữ nguyên.

## Tương tác

- Chạm trái tim 3D neon đỏ tạo từ hạt nhỏ dày, phân bố đầy khối và có chiều sâu; tim đập rồi nổ tung, sau đó các hạt lần lượt ghép thành “CHÚC MỪNG” và “NGÀY 20/10 / NHỮNG ĐÓA HOA / LỚP 11A1”. Hạt chữ dùng font Bangers, ánh neon và chuyển động nhẹ; cuối intro có hiệu ứng cổng sáng trước khi vào màn chính. Có thể dùng nút bỏ qua. Nếu WebGL 2 không khả dụng, thông báo lỗi và nút bỏ qua vẫn dùng được.
- Dùng các nút mũi tên hoặc `←` và `→` để đi giữa năm chặng; tiêu đề dùng font viết tay và chữ được reveal lần lượt từ trái sang phải khi chuyển cảnh.
- Cảnh Matrix có nút phát lại; chặng lời chúc có hiệu ứng pháo hoa tùy chọn.
- Vườn hoa và thư cuối dùng hiệu ứng 16 cây hoa 3D nở từ đáy rồi lắc lư nhẹ; khi quay lại cảnh, nhịp nở được phát lại. Nội dung thư cũng reveal từng chữ khi chuyển trang. Khi mở thư, ánh sáng/hạt lấp lánh và pháo hoa nền chạy lặp nhẹ; khi đóng/rời cảnh, loop dừng.
- Nhấn con dấu `11A1` để mở thư; dùng nút gấp thư, điều hướng trang trước/sau và vùng nội dung có thể cuộn. `Escape` gấp thư; nút cuối thư xem lại từ đầu.
- `prefers-reduced-motion` giảm hiệu ứng; không phát âm thanh tự động.

## Kiểm tra

- `npm run build`: chạy TypeScript type-check rồi tạo bản production bằng Vite.

## Giới hạn

Kiểm thử được thực hiện trong trình duyệt tích hợp trên các viewport mô phỏng, chưa đo FPS trên thiết bị vật lý hoặc chạy audit screen reader/WCAG tự động. Font Google cần mạng để tải; nội dung vẫn có font fallback khi offline.