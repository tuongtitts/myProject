import React from 'react';
import './introduction.css';

const Introduction = () => {
  return (
    <div className="introduction-page">
      <div className="introduction-container">
        <h1>Giới thiệu về ComNet Class</h1>
        <section className="intro-overview">
          <p>
            <strong>ComNet Class</strong> là một nền tảng học trực tuyến được thiết kế để hỗ trợ giáo viên và sinh viên trong việc giảng dạy và học tập hiệu quả. Với giao diện thân thiện và các tính năng hiện đại, ComNet Class mang đến trải nghiệm học tập liền mạch, giúp kết nối giáo viên và sinh viên trong môi trường giáo dục số.
          </p>
          <p>
            Được phát triển bởi đội ngũ sinh viên Mạng máy tính và truyền thông dữ liệu, ComNet Class hướng đến việc nâng cao chất lượng giáo dục trực tuyến thông qua công nghệ tiên tiến.
          </p>
        </section>

        <section className="intro-features">
          <h2>Tính năng dành cho giáo viên</h2>
          <ul>
            <li><strong>Quản lý khóa học và bài học:</strong> Tạo, chỉnh sửa và sắp xếp các khóa học, bài học một cách dễ dàng.</li>
            <li><strong>Tải tài liệu đa dạng:</strong> Hỗ trợ tải lên video, PDF, Word, PowerPoint, và file Packet Tracer (.pka).</li>
            <li><strong>Theo dõi tiến độ:</strong> Xem tiến độ học tập của từng sinh viên theo thời gian thực.</li>
            <li><strong>Tương tác:</strong> Nhận bình luận từ sinh viên và gửi thông báo về cho người dùng.</li>
          </ul>

          <h2>Tính năng dành cho sinh viên</h2>
          <ul>
            <li><strong>Truy cập tài liệu dễ dàng:</strong> Xem và tải tài liệu học tập từ mọi thiết bị.</li>
            <li><strong>Theo dõi tiến độ cá nhân:</strong> Kiểm tra mức độ hoàn thành bài học và tài liệu.</li>
            <li><strong>Tương tác với giáo viên:</strong> Gửi tin nhắn qua phòng chat hoặc câu hỏi trực tiếp trên bài học.</li>
            <li><strong>Hỗ trợ đa nền tảng:</strong> Sử dụng ComNet Class trên máy tính, điện thoại hoặc máy tính bảng.</li>
          </ul>
        </section>

        <section className="intro-goals">
          <h2>Mục tiêu của ComNet Class</h2>
          <p>
            - Tạo ra một môi trường học tập trực tuyến tiện lợi, dễ sử dụng cho cả giáo viên và sinh viên.<br />
            - Tăng cường tương tác và hiệu quả học tập thông qua các công cụ quản lý và theo dõi tiến độ.<br />
            - Đảm bảo tính linh hoạt, cho phép truy cập mọi lúc, mọi nơi với giao diện thân thiện.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Introduction;