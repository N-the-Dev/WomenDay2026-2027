# PROMPT CHUẨN CHO KIRO AI AGENT — WOMEN'S DAY 2.0
## Cinematic Celebration | Nâng cấp dự án 20/10 từ A đến Z

> **Vai trò:** Bạn là một Senior Frontend Engineer, Creative Developer và UI/UX Designer chuyên xây dựng trải nghiệm web tương tác có chất lượng production.
>
> **Nhiệm vụ:** Làm việc trực tiếp trên mã nguồn dự án 20/10 hiện có trong workspace. Hãy kiểm tra toàn bộ dự án, lên kế hoạch, triển khai, kiểm thử và hoàn thiện một phiên bản mới có tên định hướng **Women's Day 2.0 — Cinematic Celebration**. Không chỉ đưa ra gợi ý hoặc đoạn code mẫu: hãy thực sự chỉnh sửa và hoàn thành sản phẩm trong workspace.

---

## 1. Mục tiêu sản phẩm

Nâng cấp website chúc mừng Ngày Phụ nữ Việt Nam 20/10 dành cho lớp **10A1** thành một trải nghiệm kỹ thuật số giàu cảm xúc, hiện đại và chỉn chu.

Phong cách chủ đạo: **Cinematic Celebration** — trình diễn ánh sáng, typography động, hiệu ứng Matrix được nâng cấp, pháo hoa, hạt sáng và các chuyển cảnh điện ảnh. Giữ lại tinh thần và những tài nguyên/hiệu ứng có giá trị từ dự án cũ, nhưng thống nhất toàn bộ trải nghiệm thành một sản phẩm hoàn chỉnh.

Một yêu cầu ưu tiên đặc biệt: **phong thư phải lớn, nổi bật và dễ đọc; phần giấy/thư bên trong phải đủ rộng; chữ trong nội dung thư và thơ phải lớn hơn đáng kể so với bản cũ**, dễ đọc trên máy tính lẫn điện thoại. Không được làm phong thư quá nhỏ, chữ li ti hoặc ép nội dung vào một khung chật.

Ngôn ngữ hiển thị mặc định: tiếng Việt có dấu, câu chữ tự nhiên, ấm áp, phù hợp môi trường học đường. Giữ tên lớp **10A1** nếu mã nguồn cũ đang dùng tên này. Không tự ý thay bằng tên lớp khác.

## 2. Bắt đầu bằng việc khảo sát dự án

Trước khi sửa code:

1. Kiểm tra toàn bộ cấu trúc workspace và đọc các file nguồn quan trọng.
2. Tập trung rà soát các file hiện có, có thể gồm:
   - `index.html`
   - `app.js`
   - `style.css`
   - `matrix-pro.html`
   - `effects/firework.js`
   - `flower.html`
   - `flower.css`
   - các ảnh trong `assets/` và các tài nguyên khác.
3. Tìm hiểu luồng điều hướng hiện tại, nội dung lời chúc/thư/thơ, hiệu ứng Matrix, pháo hoa, hoạt ảnh hoa và các liên kết giữa trang.
4. Xác định lỗi, tài nguyên trùng lặp, CSS/JS xung đột, liên kết hỏng, lỗi console, đường dẫn tương đối sai và các vấn đề responsive.
5. **Bảo toàn nội dung có giá trị** từ dự án cũ. Không xóa nội dung thơ, thư, tên lớp, hình ảnh hoặc hiệu ứng quan trọng nếu chưa hiểu chức năng của chúng.
6. Nếu có Git, kiểm tra trạng thái trước khi sửa. Không ghi đè hoặc xóa thay đổi không liên quan của người dùng.
7. Sau khi khảo sát, thực hiện luôn việc xây dựng. Không dừng ở việc chỉ viết kế hoạch, không chờ người dùng xác nhận từng bước nếu không có câu hỏi thực sự chặn tiến độ.

Nếu có điểm chưa rõ, ưu tiên giữ hành vi và nội dung đang tồn tại, chọn giải pháp an toàn, ghi lại giả định trong tài liệu bàn giao.

## 3. Định hướng mỹ thuật

### 3.1. Bảng màu

Xây dựng một hệ màu thống nhất, cinematic và tinh tế:

- Nền chính: đen mận, đỏ rượu vang đậm hoặc tím than (`#120D16`, `#24101F`).
- Màu nhấn: hồng neon có kiểm soát (`#FF6FAE`), hồng sáng (`#FFC0D9`).
- Ánh sáng phụ: vàng champagne (`#F6D58A`), trắng ấm (`#FFF6F8`).
- Chữ nội dung: trắng ấm hoặc màu kem có độ tương phản cao.
- Dùng gradient và glow để tạo chiều sâu, nhưng tránh làm mọi thành phần phát sáng cùng lúc.

### 3.2. Typography

- Dùng font display hiện đại, có cá tính cho tiêu đề và font sans-serif dễ đọc cho nội dung.
- Có thể dùng serif thanh lịch cho lời chúc hoặc thư, nhưng phải bảo đảm dấu tiếng Việt hiển thị đẹp.
- Tạo phân cấp rõ ràng: tiêu đề, phụ đề, nội dung, chú thích, nút.
- Hiệu ứng chữ phải mượt, đúng nhịp và không gây khó đọc.
- Tránh lạm dụng chữ in hoa, chữ quá mảnh hoặc hiệu ứng blur trên nội dung chính.

### 3.3. Chất lượng giao diện

- Có chiều sâu bằng nhiều lớp nền, ánh sáng, hạt và parallax nhẹ.
- Bố cục rõ ràng, có khoảng thở; không dùng hiệu ứng để che nội dung.
- Các nút phải có trạng thái hover, focus, active và disabled phù hợp.
- Không dùng emoji làm hình ảnh chính thay cho thiết kế.
- Ưu tiên hiệu ứng tự triển khai bằng CSS/Canvas/Web APIs hoặc thư viện đã có trong dự án. Không thêm dependency nặng nếu không cần thiết.
- Nếu cần tải font hoặc thư viện ngoài, website vẫn phải có fallback hợp lý khi offline hoặc mạng yếu.

## 4. Cấu trúc trải nghiệm đề xuất

Có thể giữ kiến trúc nhiều trang hiện tại nếu điều đó an toàn và phù hợp. Nếu chọn chuyển thành trải nghiệm một trang, phải bảo đảm toàn bộ nội dung và hiệu ứng hiện có vẫn hoạt động. Không đổi kiến trúc chỉ để chạy theo xu hướng.

### Cảnh 1 — Cinematic Intro

Tạo màn hình mở đầu có chất lượng cao:

- Nền tối có gradient chuyển động chậm, hạt sáng và các tia sáng tinh tế.
- Hiển thị dòng nhỏ như `A SPECIAL GIFT FOR YOU`.
- Tiêu đề chính: **“Chúc mừng Ngày Phụ nữ Việt Nam”**.
- Số **20.10** là điểm nhấn typography lớn, có gradient hoặc ánh sáng viền.
- Hiển thị **10A1** như chữ ký của tập thể.
- Nút CTA nổi bật: **“Mở món quà”** hoặc nội dung tương đương.
- Khi người dùng bấm CTA, chuyển sang cảnh tiếp theo bằng transition mượt; không tự động phát âm thanh trước tương tác.
- Có thể cho phép bỏ qua intro nếu animation kéo dài.

### Cảnh 2 — Matrix Reveal & Light Show

Nâng cấp hiệu ứng Matrix đang có, không chỉ phủ các ký tự ngẫu nhiên lên toàn màn hình:

- Tạo hiệu ứng ký tự/rain có nhịp, có độ sâu và tốc độ khác nhau.
- Matrix là lớp trình diễn nền; nội dung chúc mừng chính phải luôn dễ đọc.
- Các ký tự hoặc hạt sáng có thể hội tụ, mở đường hoặc tạo cảm giác reveal cho dòng chữ trung tâm.
- Typography xuất hiện theo từng nhịp, chẳng hạn:
  1. “Gửi những bông hoa xinh đẹp nhất…”
  2. “Chúc mừng ngày 20.10”
  3. “Thân gửi từ tập thể 10A1”
- Tránh che kín màn hình bằng ký tự hoặc khiến thiết bị yếu bị giật.
- Có một cao trào ánh sáng ngắn, sau đó hạ cường độ để người xem đọc nội dung.
- Có thể thêm nút bỏ qua/phát lại hiệu ứng.

### Cảnh 3 — Fireworks Finale Moment

Nâng cấp module pháo hoa đang có trong `effects/firework.js` nếu phù hợp:

- Pháo hoa xuất hiện có chủ đích, đúng nhịp với thông điệp; không bắn liên tục gây rối mắt.
- Bảng màu pháo hoa: hồng, trắng ấm, champagne và một ít tím.
- Có hiệu ứng trails, particles, fade-out mượt, độ sâu và các kích cỡ nổ khác nhau.
- Canvas phải được resize đúng, xử lý `devicePixelRatio`, giới hạn số particle và giải phóng animation khi không còn cần.
- Không để canvas chặn thao tác click hoặc che các nút.
- Giảm mật độ hiệu ứng trên thiết bị yếu hoặc khi người dùng bật chế độ giảm chuyển động.
- Không phát âm thanh tự động. Nếu có âm thanh, cần nút bật/tắt riêng và chỉ phát sau tương tác.

### Cảnh 4 — The Letter: Phong thư lớn và nội dung dễ đọc

Đây là **một trong những yêu cầu quan trọng nhất** của toàn bộ dự án.

Thiết kế lại phong thư và phần thư bên trong thành điểm nhấn trung tâm, sang trọng và dễ đọc:

#### Kích thước và bố cục
- Phong thư phải đủ lớn, chiếm phần đáng kể của màn hình và là tâm điểm thị giác.
- Trên desktop, mục tiêu tham khảo: khung thư rộng khoảng `min(88vw, 900px)` và có chiều cao phù hợp với nội dung; không bắt buộc đúng tuyệt đối nếu thiết kế thực tế cần điều chỉnh.
- Trên điện thoại, thư chiếm gần hết chiều rộng khả dụng, có padding hợp lý và không bị cắt cạnh.
- Khi mở thư, giấy thư phải mở rộng rõ ràng, có chiều sâu, bóng đổ mềm, nắp thư lật mượt và dấu sáp/chi tiết trang trí tinh tế.
- Không để phần nội dung bị che bởi nắp thư, hình trang trí, nút hoặc hiệu ứng.
- Nếu nội dung dài, cho phép cuộn bên trong vùng nội dung hoặc chia thành các trang/đoạn có điều hướng rõ ràng. Tránh ép chữ nhỏ để nhét tất cả vào một màn hình.
- Trên điện thoại, ưu tiên đọc và cuộn tự nhiên theo chiều dọc.

#### Kích thước chữ
- **Chữ trong thư và thơ phải lớn hơn rõ rệt so với phiên bản cũ.**
- Nội dung thư trên desktop: ưu tiên cỡ chữ khoảng `20–24px`; trên mobile: khoảng `18–21px`, có thể điều chỉnh theo font và chiều rộng thực tế.
- Dùng `line-height` thoáng, tham khảo khoảng `1.65–1.9`.
- Đoạn thơ phải xuống dòng theo nhịp thơ, giữ đúng dấu câu và khoảng cách giữa khổ.
- Tiêu đề thư lớn, rõ và có phân cấp với nội dung.
- Không dùng chữ mảnh, low-contrast hoặc glow quá mạnh làm giảm khả năng đọc.
- Nếu nội dung thơ/thư hiện có dài, không xóa hoặc rút gọn tùy tiện; giữ nguyên nội dung gốc và cải thiện cách trình bày.

#### Nội dung và tương tác
- Bảo toàn nội dung thư/thơ đang có trong mã nguồn.
- Nếu có nhiều trang thư, thêm nút `Trang trước`, `Trang tiếp`, `Đóng thư` hoặc điều hướng tương ứng.
- Animation mở thư nên gồm các bước rõ ràng: nắp thư mở → giấy thư xuất hiện/trượt lên → nội dung hiện dần.
- Chuyển động có thể tạo cảm giác điện ảnh nhưng phải nhanh vừa đủ, có thể bỏ qua và không khóa người dùng quá lâu.
- Hỗ trợ mở lại thư sau khi đóng.
- Đảm bảo thao tác bàn phím có thể kích hoạt các nút và có focus state.
- Không để nội dung chỉ xuất hiện trong animation khiến trình đọc màn hình hoặc người dùng reduced-motion không truy cập được.

### Cảnh 5 — Closing Scene

- Màn kết có thông điệp ngắn, ấm áp và chân thành.
- Gợi ý: **“Mong mỗi ngày của bạn đều rực rỡ như một mùa hoa.”**
- Chữ ký: **“With love, 10A1”**.
- Hạt sáng/cánh hoa hội tụ thành một khung hình cuối.
- Có nút **“Xem lại từ đầu”** hoạt động thật.
- Nếu nội dung cũ có lời kết riêng, ưu tiên dùng nội dung đó thay cho câu gợi ý.

## 5. Chuyển cảnh và nhịp điệu

Xây dựng một nhịp cảm xúc có chủ đích:

1. Mở đầu bí ẩn, ít hiệu ứng.
2. Matrix reveal tăng dần cường độ.
3. Pháo hoa tạo cao trào ngắn.
4. Hạ nhịp để người xem tập trung vào phong thư và lời thơ.
5. Kết thúc bằng ánh sáng dịu và thông điệp ấm áp.

Yêu cầu:
- Transition đồng bộ giữa các cảnh, tránh flash trắng hoặc nhảy bố cục.
- Không tự chuyển cảnh khi người dùng đang đọc thư.
- Các nút chuyển cảnh phải có tác dụng thật.
- Không để nhiều animation cạnh tranh sự chú ý cùng lúc.
- Thời lượng animation phải hợp lý; cung cấp tùy chọn bỏ qua khi cần.

## 6. Responsive, accessibility và hiệu năng

### Responsive
Kiểm thử ít nhất ở các chiều rộng tham khảo:
- Mobile nhỏ: 320–375px.
- Mobile phổ biến: 390–430px.
- Tablet: 768px.
- Laptop: 1366px.
- Desktop rộng: 1920px.

Không được có:
- Tràn ngang không chủ đích.
- Chữ hoặc nút bị cắt.
- Phong thư quá nhỏ trên mobile.
- Nội dung thư khó đọc.
- Canvas che thao tác.
- Thành phần bị chồng lấn do `position: absolute`.
- Chỉ hoạt động tốt khi dùng chuột mà không dùng được trên màn hình cảm ứng.

### Accessibility
- Dùng HTML semantic phù hợp.
- Nút có nhãn rõ ràng.
- Hỗ trợ keyboard focus và thao tác bàn phím.
- Đảm bảo contrast đủ cho nội dung.
- Tôn trọng `prefers-reduced-motion`.
- Không truyền tải thông tin quan trọng chỉ bằng màu sắc hoặc animation.
- Không tự phát âm thanh.

### Hiệu năng
- Dùng `requestAnimationFrame` cho animation liên tục.
- Hủy animation loop/listener khi không còn cần thiết.
- Giới hạn particle theo kích thước màn hình và khả năng thiết bị.
- Tránh layout thrashing, tạo quá nhiều DOM nodes hoặc dùng blur/filter quá nặng trên diện tích lớn.
- Tối ưu ảnh và tài nguyên hiện có; không xóa ảnh chỉ vì chưa rõ vai trò.
- Không thêm thư viện mới nếu có thể giải quyết tốt bằng mã hiện tại.
- Giữ trải nghiệm ổn định trên thiết bị cấu hình phổ thông.

## 7. Kiến trúc và chất lượng mã nguồn

- Giữ công nghệ nền hiện có nếu phù hợp; không chuyển framework chỉ vì sở thích cá nhân.
- Tách cấu hình, nội dung, animation và điều hướng ở mức hợp lý.
- Tránh viết lại toàn bộ CSS/JS một cách mù quáng trước khi hiểu code cũ.
- Dùng tên biến/hàm dễ hiểu, tránh tạo global variables không cần thiết.
- Tránh lặp code; tái sử dụng logic phù hợp.
- Xử lý trường hợp phần tử DOM không tồn tại để tránh lỗi runtime.
- Đảm bảo các đường dẫn hoạt động khi mở theo cách dự án đang hỗ trợ.
- Nếu dự án dùng nhiều HTML page, kiểm tra toàn bộ liên kết giữa các trang.
- Nếu có lỗi tham chiếu tới file không tồn tại, sửa hoặc thay bằng luồng điều hướng hợp lệ.
- Không đưa API key, token hoặc thông tin bí mật vào mã nguồn.
- Không xóa `.git` hoặc các file cấu hình quan trọng.

## 8. Nội dung và tài nguyên

- Giữ các lời chúc, bài thơ, thư và thông tin gốc đang có.
- Kiểm tra chính tả tiếng Việt và hiển thị Unicode.
- Không tự bịa tên cá nhân hoặc danh sách thành viên lớp.
- Nếu cần thêm nội dung mới, ưu tiên câu chữ ấm áp, tôn trọng và phù hợp học đường.
- Dùng tài nguyên trong dự án trước; chỉ tạo/thêm tài nguyên mới khi thực sự cần.
- Nếu không có tài nguyên âm thanh phù hợp, đừng tạo một nút nhạc giả. Có thể bỏ tính năng âm thanh hoặc triển khai điều khiển thật với tài nguyên sẵn có.
- Không để lại nút `TODO`, link `#` vô tác dụng, placeholder hoặc tính năng chỉ mang tính minh họa trong sản phẩm cuối.

## 9. Quy trình thực hiện bắt buộc

Thực hiện theo thứ tự sau:

### Giai đoạn A — Audit
- Đọc cấu trúc và mã nguồn.
- Ghi lại luồng trang, hiệu ứng và nội dung cần bảo toàn.
- Xác định các lỗi hiện tại và các rủi ro khi thay đổi.

### Giai đoạn B — Implementation
- Xây dựng hệ thống giao diện và bảng màu thống nhất.
- Nâng cấp intro, Matrix, pháo hoa, phong thư, nội dung thư/thơ và màn kết.
- Đặc biệt rà soát kích thước phong thư và typography của nội dung thư.
- Tạo responsive layout và reduced-motion fallback.
- Sửa liên kết và điều hướng để toàn bộ luồng hoạt động.

### Giai đoạn C — Verification
- Chạy các lệnh kiểm tra phù hợp với công nghệ dự án.
- Kiểm tra lỗi console, đường dẫn asset, liên kết giữa các trang và lỗi JavaScript.
- Kiểm thử các nút và toàn bộ luồng từ đầu đến cuối.
- Kiểm thử responsive trên các kích thước ở mục 6.
- Xác nhận nội dung thư/thơ vẫn còn đầy đủ, dễ đọc và không bị che/cắt.
- Nếu có browser automation hoặc công cụ xem trước, dùng chúng để kiểm tra thực tế; nếu không có, thực hiện các kiểm tra khả thi trong môi trường hiện tại và nêu rõ giới hạn, không tuyên bố đã kiểm thử những gì chưa kiểm thử.

### Giai đoạn D — Polish
- Sửa lỗi phát hiện được.
- Xóa code chết hoặc tài nguyên không còn dùng chỉ khi đã xác nhận an toàn.
- Rà soát animation, tương phản, khoảng cách và tính nhất quán.
- Đảm bảo không còn placeholder hoặc nút giả.

### Giai đoạn E — Handover
Tạo hoặc cập nhật tài liệu `README.md` hoặc một tài liệu bàn giao ngắn, ghi:
- Cách chạy dự án.
- Cấu trúc trang/module.
- Những thay đổi chính.
- Các tính năng đã triển khai.
- Các bài kiểm thử đã chạy và kết quả.
- Giới hạn còn tồn tại (nếu có).

## 10. Tiêu chí nghiệm thu

Chỉ coi là hoàn thành khi đáp ứng các tiêu chí sau:

- [ ] Website có phong cách Cinematic Celebration nhất quán.
- [ ] Màn hình mở đầu có typography nổi bật và CTA hoạt động.
- [ ] Matrix được nâng cấp, không làm nội dung chính khó đọc.
- [ ] Pháo hoa chạy mượt, có giới hạn tài nguyên và không chặn tương tác.
- [ ] Phong thư lớn, nổi bật và có hoạt ảnh mở thư chỉn chu.
- [ ] **Chữ trong thư/thơ lớn, thoáng, dễ đọc trên cả desktop và mobile.**
- [ ] Nội dung thư/thơ gốc được bảo toàn, không bị cắt hoặc che.
- [ ] Điều hướng giữa các cảnh/trang hoạt động đúng.
- [ ] Màn kết và nút xem lại hoạt động.
- [ ] Responsive, không có tràn ngang ngoài ý muốn.
- [ ] Có hỗ trợ reduced motion và keyboard focus cơ bản.
- [ ] Không còn lỗi runtime nghiêm trọng hoặc liên kết nội bộ hỏng đã biết.
- [ ] Tài liệu hướng dẫn chạy và bàn giao được cập nhật.
- [ ] Báo cáo cuối nêu rõ thay đổi, file chính đã sửa, cách chạy, kiểm thử thực tế và những giới hạn còn lại.

## 11. Quy tắc làm việc với người dùng

- Hãy chủ động thực hiện nhiệm vụ từ A đến Z trong workspace.
- Không chỉ trả lời bằng lý thuyết, không chỉ tạo mockup, không chỉ đưa code rời.
- Không hỏi lại những thông tin có thể suy ra an toàn từ dự án.
- Nếu gặp lỗi môi trường hoặc thiếu công cụ, tiếp tục hoàn thành các phần khả thi và báo rõ giới hạn.
- Không tuyên bố tính năng đã chạy tốt nếu chưa kiểm tra.
- Không xóa hoặc làm mất nội dung cũ một cách âm thầm.
- Ưu tiên chất lượng hoàn chỉnh, khả năng bảo trì, trải nghiệm người dùng và tính nhất quán.

## 12. Bắt đầu ngay

Hãy bắt đầu bằng việc khảo sát mã nguồn hiện có trong workspace, sau đó triển khai toàn bộ phiên bản Women's Day 2.0 theo đặc tả trên. Đưa ra một bản tóm tắt ngắn về kế hoạch audit trước khi chỉnh sửa nếu môi trường hỗ trợ trao đổi theo bước, nhưng **không dừng lại ở kế hoạch**: tiếp tục thực hiện, kiểm thử, sửa lỗi và bàn giao sản phẩm hoàn chỉnh.

**Ưu tiên số một về trải nghiệm:** hiệu ứng điện ảnh đẹp nhưng không rối; và phong thư phải thật sự lớn, với nội dung thư/thơ lớn, thoáng, dễ đọc.
