import React, { useEffect } from 'react';
import './intropage.css';

export default function IntroPage() {
  useEffect(() => {

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');


        if (!targetId || targetId === "#") return;

        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const offset = 180;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scroll({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });


    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const totalSlides = slides.length;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.style.display = i === index ? 'block' : 'none';
      });

      dots.forEach((dot, i) => {
        dot.classList.remove('active');
        if (i === index) {
          dot.classList.add('active');
        }
      });
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % totalSlides;
      showSlide(currentSlide);
    }

    function setSlide(index) {
      currentSlide = index;
      showSlide(currentSlide);
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => setSlide(index));
    });

    showSlide(currentSlide);
    const slideInterval = setInterval(nextSlide, 2500);

    return () => clearInterval(slideInterval);
  }, []);

  return (
    <div className='intro-page'>
      <header className="intro-header">
        <div className="intro-nameframe-header">
          <div className="intro-nameframe_uni-header">
            <div className="intro-logo_uni-header">
              <img src="/image/logo_haui.png" alt="Logo Trường Đại Học Công Nghiệp Hà Nội" />
            </div>
            <div className="intro-nameuni-header">
              <div className="intro-Vnameuni-header">
                <h1>TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP HÀ NỘI</h1>
              </div>
              <div className="intro-Enameuni-header">
                <h3>HANOI UNIVERSITY OF INDUSTRY</h3>
              </div>
            </div>
          </div>
          <div className="intro-nameframe_software-header">
            <div className="intro-logo_software-header">
              <img src="logo.svg" alt="Logo phần mềm học trực tuyến" />
            </div>
            <div className="intro-name_software-header">
              <h1 >Phần mềm học trực tuyến ComNet Class</h1>
            </div>
          </div>
        </div>
        <nav className="nav-login">
          <div className="nav_function">
            <ul>
              <li className="nav_icon"><i className="fa-solid fa-house-chimney-window"></i></li>
              <li className="intro_nav_item"><a href="#top-slider">Trang chủ</a></li>
              <li className="intro_nav_item"><a href="#news_main-login">Tin tức</a></li>
              <li className="intro_nav_item"><a href="#intro_main-login">Giới thiệu</a></li>
              <li className="intro_nav_item"><a href="#communication_main-login">Cộng đồng</a></li>
              <li className="intro_nav_item"><a href="#contact-with-footer">Liên hệ</a></li>
            </ul>
          </div>
          <div className="nav_functiontologin">
            <ul>
              <li className="nav_item-login"><a href="/login">Đăng nhập</a></li>
            </ul>
          </div>
        </nav>
      </header>

      <main className="main-login">
        <div className="slider" id="top-slider">
          <div className="slide"><img src="/image/t95333.jpg" alt="Ảnh 1" /></div>
          <div className="slide"><img src="/image/t78758.jpg" alt="Ảnh 2" /></div>
          <div className="slide"><img src="/image/4E9A8543-1724490779905.jpg" alt="Ảnh 3" /></div>
        </div>
        <div className="dots-container">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>

        <div className="menu_main-login">
          <div className="slogan_main-login">
            <h1>
              <span className="highlight-c">Com</span>munication & {" "}
              <span className="highlight-n">Net</span>work{" "}
              <span className="highlight-e">Class</span>
            </h1>
            <h3>kết nối kiến thức, mở rộng cơ hội</h3>
          </div>
          <div className="image_menu_main-login">
            <img
              className="image-slogan-menu"
              src="/image/tong--quan-ve-nganh-mang-may-tinh-va-truyen-thong-du-lieu.jpg"
              alt="Ảnh mạng máy tính"
            />
          </div>
        </div>

        <section id="news_main-login">
          <h1>Tin Tức</h1>
          <div className="news_content">
            <h3>Chưa Cập nhật!</h3>
          </div>
        </section>

        <section id="intro_main-login">
          <div className="obj_intro_main">
            <h1>Giới Thiệu Chung</h1>
            <p>
              Chào mừng bạn đến với trang web học trực tuyến cho nghành mạng máy tính và truyền thông dữ liệu! Nơi đây được thiết kế đặc biệt để cung cấp cho sinh viên và người học một nền tảng học tập phong phú và tiện lợi, giúp nâng cao kỹ năng và kiến thức trong lĩnh vực công nghệ thông tin. Chúng tôi mang đến một trải nghiệm học tập toàn diện với các tài liệu học tập đa dạng, từ sách và tài liệu PDF đến video bài giảng và bài tập chất lượng. Các thông báo quan trọng về học tập và hoạt động sẽ được cập nhật thường xuyên, giúp bạn luôn nắm bắt thông tin cần thiết.
            </p>
            <p>
              Bên cạnh đó, cộng đồng lớp học trong nền tảng sẽ là nơi bạn có thể giao tiếp trực tiếp với giảng viên, nhận được sự hỗ trợ và giải đáp thắc mắc. Với những tính năng nổi bật như phòng họp nhóm cho từng học phần, chúng tôi hy vọng sẽ tạo ra một môi trường học tập tích cực và hiệu quả. Hãy cùng khám phá và trải nghiệm kiến thức mới với chúng tôi!
            </p>
          </div>

          <div className="development_team">
            <h1>Đội Ngũ Phát Triển</h1>
            <table>
              <thead>
                <tr>
                  <th>Sinh Viên</th>
                  <th>Khóa</th>
                  <th>Nghành</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Phạm Văn Tiến</td><td>K17</td><td>Mạng máy tính và truyền thông dữ liệu</td></tr>
                <tr><td>Phạm Thị Phương Thảo</td><td>K17</td><td>Mạng máy tính và truyền thông dữ liệu</td></tr>
                <tr><td>Hồ Thiện Biển</td><td>K17</td><td>Mạng máy tính và truyền thông dữ liệu</td></tr>
                <tr><td>Vũ Kim Quang Tường</td><td>K17</td><td>Mạng máy tính và truyền thông dữ liệu</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="communication_main-login">
          <h1>Cộng đồng</h1>
          <div className="communication_content">
            <h3>Chưa Cập nhật!</h3>
          </div>
        </section>

        <section id="contact-with-footer">
          <div className="footer-section">
            <h1>Các Liên Kết Khác</h1>
            <ul>
              <li><i className="fa-solid fa-paper-plane"></i><a href="https://www.haui.edu.vn/vn">Trang Web nhà trường</a></li>
              <li><i className="fa-solid fa-paper-plane"></i><a href="https://sv.haui.edu.vn/survey">Trang Web cho sinh viên</a></li>
              <li><i className="fa-solid fa-paper-plane"></i><a href="https://www.facebook.com/groups/daihoccongnghiep.haui">Trang Facebook chính thức</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h1>Bản Đồ</h1>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.473663078486!2d105.73291811540255!3d21.053735992299995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31345457e292d5bf%3A0x20ac91c94d74439a!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2hp4buHcCBIw6AgTuG7mWk!5e0!3m2!1svi!2s!4v1631076181348!5m2!1svi!2s"
              allowFullScreen=""
              loading="lazy"
              title="Google Map"
            ></iframe>
          </div>
          <div className="footer-section">
            <h1>Liên Hệ Nhóm Nghiên Cứu</h1>
            <ul>
              <li>Trực tiếp tại: Đại học Công nghiệp Hà Nội</li>
              <li>Địa chỉ: Số 298 đường Cầu Diễn, quận Bắc Từ Liêm, Hà Nội</li>
            </ul>
            <ul>
              <li>Email: comnetclassk17@gmail.com</li>
              <li><i className="fa-solid fa-phone"></i> 0359027361</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
