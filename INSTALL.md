# Cài Travel Booking Design Studio vào Claude Code

Tài liệu này hướng dẫn cách dùng repository như một bộ creative agents cho một dự án travel frontend thực tế.

## 1. Cài Claude Code

Yêu cầu tối thiểu:

- macOS, Linux, Windows qua WSL hoặc Git Bash
- Node.js 18+
- tài khoản Claude hoặc Anthropic Console

Cài CLI:

```bash
npm install -g @anthropic-ai/claude-code
```

Kiểm tra cài đặt:

```bash
claude --version
claude doctor
```

Không chạy npm global bằng `sudo`.

## 2. Chọn cách sử dụng

Có hai cách.

### Cách A — Dùng studio như một dự án độc lập

Phù hợp khi bạn muốn nghiên cứu concept, tạo design language, review giao diện hoặc phát triển trực tiếp trong repository này.

```bash
git clone https://github.com/nvttrong2511/travel-booking-design-studio.git
cd travel-booking-design-studio
claude
```

Claude Code tự đọc `CLAUDE.md` ở thư mục gốc. Các workflow nằm trong `.claude/commands/`, còn specialist agents nằm trong `.claude/agents/`.

Trong Claude Code, nhập `/` để kiểm tra command đã được nhận diện, sau đó bắt đầu bằng:

```text
/create-concept
```

### Cách B — Cài studio vào dự án frontend hiện có

Đây là cách khuyến nghị.

Giả sử dự án cần thiết kế nằm tại:

```text
~/projects/my-travel-app
```

Clone studio tạm thời:

```bash
git clone https://github.com/nvttrong2511/travel-booking-design-studio.git /tmp/travel-booking-design-studio
cd ~/projects/my-travel-app
```

Sao chép hệ thống vào dự án:

```bash
mkdir -p .claude
cp -R /tmp/travel-booking-design-studio/.claude/agents .claude/
cp -R /tmp/travel-booking-design-studio/.claude/commands .claude/
cp -R /tmp/travel-booking-design-studio/.claude/rules .claude/
cp -R /tmp/travel-booking-design-studio/docs ./design-studio-docs
cp -R /tmp/travel-booking-design-studio/templates ./design-studio-templates
cp -R /tmp/travel-booking-design-studio/checklists ./design-studio-checklists
cp /tmp/travel-booking-design-studio/CLAUDE.md ./CLAUDE.design-studio.md
```

Sau đó thêm dòng sau vào `CLAUDE.md` của dự án:

```md
@CLAUDE.design-studio.md
```

Nếu dự án chưa có `CLAUDE.md`, tạo file mới:

```bash
printf '@CLAUDE.design-studio.md\n' > CLAUDE.md
```

Khởi động Claude Code ngay tại root dự án:

```bash
claude
```

## 3. Cài nhanh bằng script

Từ root của dự án frontend:

```bash
curl -fsSL https://raw.githubusercontent.com/nvttrong2511/travel-booking-design-studio/main/scripts/install.sh | bash
```

Script sẽ:

- tải phiên bản mới nhất của studio;
- sao chép agents, commands và rules vào `.claude/`;
- sao chép tài liệu hỗ trợ vào các thư mục `design-studio-*`;
- tạo `CLAUDE.design-studio.md`;
- thêm import vào `CLAUDE.md` nếu chưa có;
- không ghi đè `CLAUDE.md` hiện tại của dự án.

Nên review script trước khi chạy trong môi trường quan trọng.

## 4. Kiểm tra sau khi cài

Từ root dự án:

```bash
find .claude -maxdepth 2 -type f | sort
```

Bạn phải thấy các thư mục:

```text
.claude/agents/
.claude/commands/
.claude/rules/
```

Mở Claude Code:

```bash
claude
```

Sau đó kiểm tra:

```text
Hãy đọc CLAUDE.md và tóm tắt creative workflow của dự án này.
```

Nhập `/` và xác nhận các command sau xuất hiện:

```text
/create-concept
/challenge-design
/generate-design-language
/reinvent-layout
/implement-concept
/design-review
```

## 5. Workflow sử dụng chuẩn

Không yêu cầu Claude code giao diện ngay ở prompt đầu tiên.

### Bước 1 — Tạo brief

```text
Đọc codebase và tạo design brief cho trang khám phá tour cao cấp dành cho người dùng Việt Nam. Chưa code.
```

### Bước 2 — Tạo concept

```text
/create-concept
```

Yêu cầu cụ thể hơn:

```text
/create-concept Trang khám phá khách sạn tại Nhật Bản. Tạo 3 hướng khác nhau về cấu trúc, interaction và visual language. Không dùng hero + search pill + card grid.
```

### Bước 3 — Phản biện

```text
/challenge-design
```

### Bước 4 — Khóa design language

```text
/generate-design-language
```

### Bước 5 — Tái cấu trúc layout nếu còn generic

```text
/reinvent-layout
```

### Bước 6 — Triển khai

```text
/implement-concept
```

### Bước 7 — Review trước khi hoàn thành

```text
/design-review
```

## 6. Prompt khởi đầu khuyến nghị

```text
Đọc toàn bộ CLAUDE.md, .claude/rules và các file liên quan trong design-studio-docs.

Nhiệm vụ: thiết kế lại trang tìm kiếm khách sạn.

Trước khi code:
1. phân tích codebase hiện tại;
2. xác định user state và business goal;
3. tạo ít nhất 3 concept khác nhau thực sự;
4. dùng Design Critic loại hướng generic;
5. đề xuất một hướng thắng và nêu trade-off;
6. chờ tôi phê duyệt concept rồi mới triển khai.

Không sao chép Airbnb, Booking, Agoda, Traveloka hoặc Expedia.
```

## 7. Cập nhật studio trong dự án

Chạy lại installer:

```bash
curl -fsSL https://raw.githubusercontent.com/nvttrong2511/travel-booking-design-studio/main/scripts/install.sh | bash
```

Installer cập nhật các file studio nhưng giữ nguyên `CLAUDE.md` dự án. Với file đã tùy biến bên trong `.claude/`, hãy commit trước khi cập nhật để dễ review diff.

## 8. Gỡ cài đặt

```bash
rm -rf .claude/agents .claude/commands .claude/rules
rm -rf design-studio-docs design-studio-templates design-studio-checklists
rm -f CLAUDE.design-studio.md
```

Sau đó xóa dòng sau khỏi `CLAUDE.md`:

```md
@CLAUDE.design-studio.md
```

## 9. Lưu ý quan trọng

- Repository này không phải package npm và không cần `npm install` bên trong dự án frontend.
- Claude Code chỉ áp dụng project instructions khi bạn chạy `claude` từ root hoặc một thư mục con thuộc project đó.
- `CLAUDE.md` nên giữ các chỉ dẫn riêng của dự án; studio được import qua `CLAUDE.design-studio.md` để tránh ghi đè kiến trúc và coding conventions hiện có.
- Agents tạo ý tưởng nhưng vẫn phải tuân thủ API contract, accessibility, performance và dữ liệu thực của sản phẩm.
