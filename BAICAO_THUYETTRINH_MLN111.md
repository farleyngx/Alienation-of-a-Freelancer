# BÁO CÁO MÔN HỌC MLN111 - DỰ ÁN GAME "ALIENATION OF A FREELANCER"

## 1. Giới thiệu tổng quan
- **Tên dự án:** Alienation of a Freelancer (Sự tha hóa của người lao động tự do)
- **Thể loại:** Text-based RPG / Visual Novel (Game tương tác theo cốt truyện)
- **Mục tiêu:** Mô phỏng sinh động các khái niệm cốt lõi trong môn Kinh tế Chính trị Mác-Lênin (MLN111) thông qua trải nghiệm của một người lao động tự do (Freelancer) trong kỷ nguyên Tư bản Số.

## 2. Công nghệ sử dụng
- **Cốt lõi:** React 18, TypeScript.
- **Giao diện:** Tailwind CSS.
- **Phong cách thiết kế:** Retro 8-bit Pixel Art, tái hiện không gian Terminal Code.
- **Công cụ build:** Vite (Siêu nhanh, tối ưu dung lượng).

## 3. Cách cài đặt và chạy Game
Dự án không cần cơ sở dữ liệu (Database) phức tạp, tất cả đều chạy trực tiếp trên trình duyệt.
1. Mở Terminal (Command Prompt / PowerShell / VSCode Terminal) tại thư mục chứa code dự án.
2. Nếu chạy lần đầu tiên trên máy tính mới, hãy gõ lệnh cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```
3. Sau đó, khởi động Game bằng lệnh:
   ```bash
   npm run dev
   ```
4. Cuối cùng, mở đường link (thường là `http://localhost:5173/`) trên trình duyệt Web (Chrome/Edge) để bắt đầu chơi.

## 4. Phân tích Ứng dụng Triết học Mác-Lênin (Kịch bản Thuyết trình)
Toàn bộ kịch bản game được thiết kế như một **mô hình thu nhỏ của Chủ nghĩa Tư bản kỷ nguyên số**. Các khái niệm sau được lồng ghép chặt chẽ nhằm giành điểm cao:

### A. Sự tha hóa của lao động (Alienation of Labor)
- **Biểu hiện trong game:** Người chơi khởi đầu với mong muốn "tự do sáng tạo", nhưng để duy trì "Tài chính" và "Tương tác", họ buộc phải làm ra những sản phẩm rập khuôn, vô hồn (chỉ số Bản Sắc giảm dần). 
- **Kết cục tương ứng ("Sự tha hóa hoàn toàn"):** Người chơi siêu giàu nhưng bị máy móc và thuật toán biến thành công cụ vô tri, đánh mất hoàn toàn bản chất con người.

### B. Bóc lột Giá trị Thặng dư & Tư bản độc quyền
- **Biểu hiện trong game:** Nền tảng trung gian thu "phí môi giới" hoặc "Địa tô kỹ thuật số" hàng tháng (Gói Premium). Giới chủ công nghệ không trực tiếp sản xuất mà chỉ độc quyền *Tư liệu sản xuất* (Thuật toán, Dữ liệu - Data) để bòn rút giá trị thặng dư từ công sức người dùng.
- **Kết cục tương ứng ("Ảo tưởng tự do"):** Việc từ chối nền tảng ngay từ đầu sẽ dẫn đến chết đói, vì mọi nguồn khách hàng và phân phối đều đã bị giới Tư bản độc quyền thâu tóm hoàn toàn. Sự tự do cá nhân ngoài hệ thống chỉ là ảo tưởng.

### C. Đấu tranh giai cấp & Ý thức giai cấp
- **Biểu hiện trong game:** Người lao động (Freelancer) thường ảo tưởng mình là "ông chủ của chính mình" (tiểu tư sản) nhưng thực chất họ chỉ là một Giai cấp Vô sản kiểu mới (Digital Proletariat).
- **Kết cục tương ứng ("Nghiệp đoàn số" / "Tử đạo dữ liệu"):** Lột tả quá trình chuyển mình từ "Giai cấp tự nó" sang "Giai cấp vì nó". Người chơi có thể dùng cách phá hoại tư liệu sản xuất (Data Poisoning) hoặc thành lập Nghiệp đoàn để đấu tranh trực tiếp đòi quyền làm chủ.

### D. Xã hội thành tích & Sự tự bóc lột (Byung-Chul Han)
- Lồng ghép thêm triết học hiện đại: Hình thức bóc lột hoàn hảo nhất là khi người lao động tự nguyện đóng cả hai vai: vừa là ông chủ tự bóc lột chính mình, vừa là nô lệ ngoan ngoãn dưới lớp vỏ bọc "đam mê" và "khát vọng thành công".

## 5. Cơ chế Gameplay (Hệ thống Chỉ số)
Game có hệ thống 5 thanh chỉ số cực kỳ khốc liệt, phản ánh các nguồn lực mâu thuẫn nhau của người lao động:
1. **TÀI CHÍNH:** Tiền bạc sinh tồn.
2. **SỨC KHỎE:** Năng lực tái sản xuất sức lao động (Nếu cạn kiệt sẽ bị Đột quỵ / Burnout).
3. **TỰ DO:** Quyền làm chủ thời gian cá nhân.
4. **TƯƠNG TÁC:** Sự ưu ái của Thuật toán (Thuật toán bóp tương tác đồng nghĩa với cái chết).
5. **BẢN SẮC:** Cái tôi cá nhân, sự sáng tạo chân chính của con người.

***Điểm nhấn Gameplay:*** Bất kỳ quyết định nào mang lại Tài chính và Tương tác cao đều sẽ tự động tước đoạt Sức khỏe, Tự do và Bản sắc của người chơi. Đây là cơ chế cốt lõi để người chơi tự mình nếm trải sự tàn nhẫn của hệ thống Tư bản số.
