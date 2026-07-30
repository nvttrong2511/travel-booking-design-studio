# Cài Travel Booking Design Studio vào Claude Code

Bộ cài hiện hoạt động như một npm CLI và đưa trực tiếp agents, commands, rules cùng tài liệu hỗ trợ vào `.claude/` của dự án.

## 1. Yêu cầu

- Node.js 18+
- Claude Code
- macOS, Linux, Windows qua WSL hoặc Git Bash

Cài Claude Code:

```bash
npm install -g @anthropic-ai/claude-code
claude doctor
```

Không dùng `sudo npm install -g`.

## 2. Cài bằng npx

Đi đến root dự án frontend:

```bash
cd ~/projects/my-travel-app
```

Hiện tại package chưa được publish lên npm, vì vậy chạy trực tiếp từ GitHub:

```bash
npx github:nvttrong2511/travel-booking-design-studio init
```

Sau khi publish npm, có thể dùng:

```bash
npx travel-booking-design-studio init
```

Bộ cài mặc định dùng profile `complete`.

## 3. Kết quả sau khi cài

```text
my-travel-app/
├── CLAUDE.md
└── .claude/
    ├── agents/
    ├── commands/
    ├── rules/
    ├── travel-booking-design-studio.md
    └── travel-booking-design-studio/
        ├── templates/
        ├── checklists/
        ├── docs/
        ├── examples/
        └── installation.json
```

`CLAUDE.md` hiện tại không bị thay thế. CLI chỉ thêm block quản lý sau nếu chưa tồn tại:

```md
<!-- travel-booking-design-studio -->
@.claude/travel-booking-design-studio.md
```

## 4. Các profile

### Complete

Toàn bộ agents, commands, rules, templates, checklist, docs và examples:

```bash
npx github:nvttrong2511/travel-booking-design-studio init --profile complete
```

### Minimal

Commands và rules, không cài agents hoặc tài liệu mở rộng:

```bash
npx github:nvttrong2511/travel-booking-design-studio init --profile minimal
```

### Agents only

```bash
npx github:nvttrong2511/travel-booking-design-studio init --profile agents
```

### Commands only

```bash
npx github:nvttrong2511/travel-booking-design-studio init --profile commands
```

## 5. Cài vào thư mục khác

```bash
npx github:nvttrong2511/travel-booking-design-studio init \
  --target /absolute/path/to/project
```

Dùng trong CI hoặc script không cần hỏi xác nhận:

```bash
npx github:nvttrong2511/travel-booking-design-studio init --yes
```

## 6. Cơ chế chống ghi đè

Khi destination đã có file khác nội dung, CLI mặc định:

- không ghi đè;
- báo conflict;
- giữ nguyên file của dự án.

Xem trước thay đổi:

```bash
npx github:nvttrong2511/travel-booking-design-studio update --dry-run
```

Chỉ dùng `--force` khi bạn thật sự muốn thay file bị trùng:

```bash
npx github:nvttrong2511/travel-booking-design-studio update --force
```

Nên commit dự án trước khi dùng `--force`.

## 7. Kiểm tra trạng thái

```bash
npx github:nvttrong2511/travel-booking-design-studio status
```

Hoặc kiểm tra thủ công:

```bash
find .claude -maxdepth 3 -type f | sort
```

Khởi động Claude Code:

```bash
claude
```

Trong Claude Code, nhập `/` và xác nhận các command:

```text
/create-concept
/challenge-design
/generate-design-language
/reinvent-layout
/implement-concept
/design-review
```

## 8. Workflow khuyến nghị

```text
/create-concept
/challenge-design
/generate-design-language
/reinvent-layout
/implement-concept
/design-review
```

Prompt bắt đầu mẫu:

```text
Đọc CLAUDE.md và toàn bộ design studio đã cài trong .claude/.

Nhiệm vụ: thiết kế lại trang tìm kiếm khách sạn.
Trước khi code, hãy tạo ít nhất 3 concept khác nhau về cấu trúc,
interaction model và visual language. Dùng Design Critic loại các hướng
generic. Không sao chép Airbnb, Booking, Agoda, Traveloka hoặc Expedia.
```

## 9. Cập nhật

```bash
npx github:nvttrong2511/travel-booking-design-studio update
```

CLI chỉ thêm file mới hoặc cập nhật file trùng khi nội dung giống bản studio cũ. File xung đột được giữ nguyên trừ khi có `--force`.

## 10. Gỡ cài đặt

Xem trước:

```bash
npx github:nvttrong2511/travel-booking-design-studio remove --dry-run
```

Gỡ:

```bash
npx github:nvttrong2511/travel-booking-design-studio remove
```

CLI dựa trên `.claude/travel-booking-design-studio/installation.json` và chỉ xóa các file đã được ghi nhận là do studio quản lý. File `.claude/` không liên quan được giữ nguyên.

## 11. Dành cho maintainer

```bash
git clone https://github.com/nvttrong2511/travel-booking-design-studio.git
cd travel-booking-design-studio
npm test
npm run check
npm pack
```

Test gói tarball trong một dự án tạm:

```bash
npx ./travel-booking-design-studio-1.0.0.tgz init \
  --target /path/to/test-project
```

Publish npm:

```bash
npm login
npm publish
```

Trước khi publish cần kiểm tra lại tên package `travel-booking-design-studio` còn khả dụng trên npm.
