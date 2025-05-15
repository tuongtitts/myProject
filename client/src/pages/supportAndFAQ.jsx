import React from 'react';
import './supportAndFAQ.css';

const SupportAndFAQ = () => {
  return (
    <div className="support-faq-page">
      <div className="support-faq-container">
        <h1>Liên hệ & Câu hỏi thường gặp</h1>
        

        <section className="support-section">
          <h2>Hỗ trợ người dùng</h2>
          <p>
            Nếu bạn gặp bất kỳ vấn đề nào khi sử dụng <strong>ComNet Class</strong>, vui lòng liên hệ với chúng tôi qua các kênh sau:
          </p>
          <h3>Thông tin liên hệ</h3>
          <ul>
            <li><strong>Email:</strong> comnetclassk17@gmail.com</li>
            <li><strong>Số điện thoại:</strong> (+84) 123 456 789</li>
            <li><strong>Địa chỉ:</strong> Trường đại học công nghiệp Hà Nội, Số 298 đường Cầu Diễn, quận Bắc Từ Liêm, Hà Nội</li>
          </ul>
          <h3>Hướng dẫn hỗ trợ</h3>
          <p>
            - <strong>Quên mật khẩu?</strong> Liên hệ giáo viên để được reset mật khẩu.<br />
            - <strong>Báo lỗi hệ thống:</strong> Gửi email mô tả chi tiết về vấn đề bạn gặp phải.<br />
            - <strong>Thời gian hỗ trợ:</strong> 8:00 - 17:00, thứ Hai đến thứ Sáu.
          </p>
        </section>

        <section className="faq-section">
          <h2>Câu hỏi thường gặp</h2>
          <div className="faq-item">
            <h3>1. Làm thế nào để đăng nhập vào ComNet Class?</h3>
            <p>
              Sử dụng tên đăng nhập và mật khẩu được cung cấp bởi giáo viên. Nếu quên mật khẩu, liên hệ giáo viên để reset.
            </p>
          </div>
          <div className="faq-item">
            <h3>2. Tôi có thể tải tài liệu gì lên hệ thống?</h3>
            <p>
              Hệ thống hỗ trợ các định dạng: video (mp4), PDF, Word (doc/docx), PowerPoint (ppt/pptx), và file Packet Tracer (.pka).
            </p>
          </div>
          <div className="faq-item">
            <h3>3. Làm sao để theo dõi tiến độ học tập?</h3>
            <p>
              Truy cập trang Lesson Page để xem tiến độ hoàn thành bài học và tài liệu của bạn.
            </p>
          </div>
          <div className="faq-item">
            <h3>4. Gặp lỗi hệ thống thì phải làm gì?</h3>
            <p>
              Gửi email đến support@comnetclass.edu.vn với mô tả chi tiết về lỗi, hoặc liên hệ giáo viên để được hỗ trợ.
            </p>
          </div>
          <div className="faq-item">
            <h3>5. ComNet Class có hỗ trợ trên điện thoại không?</h3>
            <p>
              Có, giao diện của ComNet Class được tối ưu cho cả máy tính và thiết bị di động.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SupportAndFAQ;