# Bản Trình Chiếu HTML5: Lực Van der Waals (Van der Waals Forces)

Bản trình chiếu web HTML5 chuẩn hóa cao cấp, chuyển đổi trực tiếp từ file PowerPoint `VanDerWaals_Complete.pptx`, tối ưu hóa đặc biệt để đưa lên **GitHub Pages** trình chiếu online mượt mà, sắc nét và chuyên nghiệp.

---

## 🌟 Các Đặc Điểm Vượt Trội

1. **Chuẩn xác tỷ lệ tuyệt đối (Zero Distortion - Không lệch, không méo hình):**
   - Áp dụng thuật toán co giãn rạp chiếu phim với tỷ lệ gốc **4:3**.
   - Thích ứng hoàn hảo với mọi thiết bị: màn hình máy tính 16:9, màn hình Ultrawide 21:9, iPad, điện thoại dọc/ngang, máy chiếu hội trường.
   - Không bị tràn viền, không kéo dãn ảnh, không làm méo tỷ lệ gốc.

2. **Độ nét 4K UHD (2880 × 2160) siêu nhẹ nhờ WebP:**
   - Các công thức toán học (`pV = nRT`, phương trình Van der Waals), sơ đồ cấu trúc phân tử và ảnh hiển vi điện tử (SEM) đều sắc nét tuyệt đối.
   - Nén ảnh WebP thế hệ mới giúp tốc độ tải trang gần như tức thì trên GitHub Pages.

3. **Bảo tồn trọn vẹn hiệu ứng chuyển cảnh & hoạt ảnh:**
   - **Slide 1 ➔ Slide 2:** Hiệu ứng bóc tách 3D lật trang cuốn góc (*3D Peel-Off Transition*) chân thực.
   - **Slide 2 ➔ Slide 3:** Hiệu ứng biến đổi hình thái mượt mà (*Morph Transition*).
   - **Slide 4 ➔ Slide 21:** Hiệu ứng mờ dần tinh tế (*Smooth Cross-Fade*, 0.7s chuẩn PowerPoint).
   - **Slide 7:** Giữ nguyên hoạt ảnh GIF động phân tử đang dao động và tương tác lực hút lưỡng cực.

4. **Bộ công cụ diễn giả chuyên nghiệp:**
   - **Bút chỉ điểm Laser (Laser Pointer):** Phím `L` – tạo vệt sáng đỏ chuyên nghiệp như dùng bút laser thật.
   - **Xem tổng quan 21 Slide (Slide Sorter):** Phím `O` hoặc `G` – mở lưới thu nhỏ để nhảy nhanh đến bất kỳ slide nào.
   - **Ghi chú diễn giả (Speaker Notes):** Phím `N` – xem nội dung tóm tắt và trích dẫn thuyết trình.
   - **Tự động trình chiếu (Autoplay):** Phím `P` – tự chuyển slide với vòng đồng hồ đếm ngược SVG trực quan.
   - **Màn hình tạm dừng:** Phím `B` (Màn hình đen), Phím `W` (Màn hình trắng).
   - **Toàn màn hình:** Phím `F` (Fullscreen).
   - **Hỗ trợ cảm ứng:** Vuốt trái/phải trên iPad và smartphone.
   - **Đồng bộ liên kết (Deep Linking):** URL tự đổi thành `#slide-1`, `#slide-7`,... giúp gửi link chính xác đến từng slide.

---

## 🚀 Hướng Dẫn Đưa Lên GitHub Pages Trình Chiếu

Thư mục này đã được đóng gói hoàn chỉnh, độc lập và chứa file `.nojekyll` sẵn sàng để kích hoạt GitHub Pages.

### Cách 1: Sử dụng Git Command Line (Khuyên dùng)

1. Mở PowerShell hoặc Terminal tại thư mục `vanderwaals_html5_presentation`:
   ```bash
   cd d:\Slide\vanderwaals_html5_presentation
   ```

2. Khởi tạo Git và thêm remote repository của bạn:
   ```bash
   git init
   git add .
   git commit -m "Initial presentation deck release"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repository>.git
   git push -u origin main
   ```

3. Bật GitHub Pages trên GitHub:
   - Truy cập vào Repository của bạn trên GitHub.
   - Nhấp vào **Settings** ➔ chọn mục **Pages** (ở menu bên trái).
   - Tại mục **Build and deployment**:
     - **Source**: Chọn `Deploy from a branch`.
     - **Branch**: Chọn `main` và thư mục `/(root)`.
   - Nhấn **Save**.
   - Sau 1 - 2 phút, GitHub sẽ cung cấp đường link dạng:
     `https://<tai-khoan-cua-ban>.github.io/<ten-repository>/`

---

### Cách 2: Tải lên trực tiếp qua giao diện web GitHub

1. Truy cập [github.com](https://github.com) và tạo một Repository mới (ví dụ: `vanderwaals-slides`).
2. Kéo thả toàn bộ nội dung bên trong thư mục `vanderwaals_html5_presentation` (gồm file `index.html`, các thư mục `css`, `js`, `slides`, `assets`,...) lên trang web GitHub rồi nhấn **Commit changes**.
3. Vào **Settings** ➔ **Pages** ➔ Chọn branch `main` ➔ Bấm **Save**.

---

## ⌨️ Bảng Phím Tắt Trình Chiếu

| Phím | Chức năng |
| :--- | :--- |
| `→` / `Space` / `Enter` / `PageDown` | Chuyển sang slide tiếp theo |
| `←` / `Backspace` / `PageUp` | Quay lại slide trước đó |
| `Home` / `End` | Về slide đầu tiên / slide cuối cùng |
| `F` | Bật / Tắt chế độ toàn màn hình (Fullscreen) |
| `O` hoặc `G` | Mở lưới tổng quan tất cả slide (Slide Sorter) |
| `L` | Bật / Tắt bút Laser chỉ điểm |
| `P` | Bật / Tắt chế độ tự động chạy (Autoplay) |
| `N` | Mở / Đóng ghi chú diễn giả |
| `B` | Tắt đen màn hình (Black screen) khi cần tập trung vào người nói |
| `W` | Tắt trắng màn hình (White screen) |
| `Esc` | Đóng các hộp thoại (Tổng quan, Ghi chú, Trợ giúp) |
| `?` hoặc `H` | Xem bảng trợ giúp phím tắt |
| Click góc trái / phải slide | Lùi lại / Tiến tới slide tiếp theo |
