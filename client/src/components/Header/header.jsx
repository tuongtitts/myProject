import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUserProfile as fetchProfileFromAPI } from '../../api/userProfile';
import { logout as handleLogout } from '../../api/auth';
import { getAnnouncements, markAnnouncementAsRead, deleteAnnouncement, createAnnouncementForAll } from '../../api/userAnnouncement';
import { connectSocket } from '../../socket';
import useNotifications from './useNotifications';
import './header.css';

const Header = () => {
  const [username, setUsername] = useState('');
  const [userInitials, setUserInitials] = useState('');
  const [role, setRole] = useState(() => localStorage.getItem('role') || '');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [openNavDropdown, setOpenNavDropdown] = useState(null);
  const [imageSrc, setImageSrc] = useState('/logo.svg');
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementContent, setAnnouncementContent] = useState('');

  const { announcements, unreadCount, error, handleMarkAsRead, handleDelete } = useNotifications(useNavigate());
  const usernameRef = useRef(null);
  const avatarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (storedRole) setRole(storedRole);

    if (token) {
      loadUserProfile();
      connectSocket();
    } else {
      setUsername('Người dùng chưa đăng nhập');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [navigate]);

  useEffect(() => {
    const ACCOUNT_DROPDOWN = document.querySelector('.user_acount-header');
    const NOTIFICATION_ICON = document.querySelector('#notification_icon');
    const nav = document.querySelector('.nav-homepade');
    const header = document.querySelector('.frame-header');
    const NAV_ITEMS = document.querySelectorAll('.nav_item');
    const handleScroll = () => {
      if (window.scrollY >= header.offsetHeight) {
        nav.classList.add('sticky');
      } else {
        nav.classList.remove('sticky');
      }
    };
    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (event) => {
      if (
        (isAccountMenuOpen || isNotificationOpen || openNavDropdown !== null || showAnnouncementForm) &&
        ACCOUNT_DROPDOWN &&
        !ACCOUNT_DROPDOWN.contains(event.target) &&
        NOTIFICATION_ICON &&
        !NOTIFICATION_ICON.contains(event.target) &&
        ![...NAV_ITEMS].some((item) => item.contains(event.target)) &&
        !document.querySelector('.announcement-modal')?.contains(event.target)
      ) {
        setIsAccountMenuOpen(false);
        setIsNotificationOpen(false);
        setOpenNavDropdown(null);
        setShowAnnouncementForm(false);
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isAccountMenuOpen, isNotificationOpen, openNavDropdown, showAnnouncementForm]);

  const loadUserProfile = async () => {
    try {
      await fetchProfileFromAPI(usernameRef.current, avatarRef.current);
      setUsername(usernameRef.current.textContent);
      setUserInitials(avatarRef.current.textContent);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
    }
  };

  const handleSendAnnouncementToAll = () => {
    if (!['admin', 'teacher'].includes(role)) {
      alert('Chỉ admin hoặc teacher mới có quyền gửi thông báo cho tất cả.');
      return;
    }
    setShowAnnouncementForm(true);
  };

  const handleSubmitAnnouncement = async () => {
    if (!announcementContent.trim()) {
      alert('Nội dung thông báo không được để trống.');
      return;
    }
    try {
      await createAnnouncementForAll({ content: announcementContent }, navigate);
      setShowAnnouncementForm(false);
      setAnnouncementContent('');
      alert('Gửi thông báo đến tất cả thành công!');
    } catch (err) {
      alert(err.message || 'Không thể gửi thông báo.');
    }
  };

  const handleLogoutClick = async () => {
    const result = await handleLogout(navigate);
    if (result) {
      localStorage.removeItem('role');
      setRole('');
    }
  };

  const toggleAccountMenu = () => {
    setIsAccountMenuOpen(!isAccountMenuOpen);
    if (isNotificationOpen) setIsNotificationOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (isAccountMenuOpen) setIsAccountMenuOpen(false);
  };

  const toggleNavDropdown = (index) => {
    setOpenNavDropdown(openNavDropdown === index ? null : index);
  };

  const handleHomeClick = () => {
    const currentRole = localStorage.getItem('role') || '';
    if (currentRole === 'admin' || currentRole === 'teacher') {
      navigate('/admin-dashboard');
    } else if (currentRole === 'student') {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleImageError = () => {
    setImageSrc('/image/logo.png');
  };

  const getNavItemClass = (paths) => {
    const currentPath = location.pathname;
    if (Array.isArray(paths)) {
      return paths.includes(currentPath) ? 'nav_item homepade_item' : 'nav_item';
    }
    return currentPath === paths ? 'nav_item homepade_item' : 'nav_item';
  };

  return (
    <header className="main-header">
      <div className="frame-header">
        <div className="nameframe-header">
          <div className="logo_software-header">
            <img
              src={imageSrc}
              alt="Logo phần mềm học trực tuyến"
              onError={handleImageError}
            />
          </div>
          <div className="name_software-header">
            <h1 id="name_software-header">Phần mềm học trực tuyến ComNet Class</h1>
          </div>
        </div>
        <div className="acount-header">
          <div className="user_acount-header" onClick={toggleAccountMenu}>
            <div className="username_acount" ref={usernameRef}></div>
            <div className="caret_down-acount">
              <i className="fa-solid fa-caret-down"></i>
            </div>
            {isAccountMenuOpen && (
              <div className="dropdown-menu" id="dropdown-menu-acount">
                <div className="dropdown-item">
                  <Link to="/editprofile">Sửa thông tin cá nhân</Link>
                </div>
                <div className="dropdown-item">
                  <Link to="/changepassword">Đổi mật khẩu</Link>
                </div>
                <div className="dropdown-item" id="logout-item" onClick={handleLogoutClick}>
                  Đăng xuất
                </div>
              </div>
            )}
          </div>
          <div className="acount_image-acount" id="account-image" ref={avatarRef}></div>
        </div>
      </div>

      {showAnnouncementForm && (
        <div className="announcement部分:announcement-modal">
          <div className="announcement-form">
            <h3>Gửi thông báo cho tất cả</h3>
            {error && <div className="error">{error}</div>}
            <textarea
              value={announcementContent}
              onChange={(e) => setAnnouncementContent(e.target.value)}
              placeholder="Nhập nội dung thông báo..."
              rows="4"
              style={{ width: '100%', marginBottom: '10px' }}
            />
            <div>
              <button onClick={handleSubmitAnnouncement} disabled={!announcementContent.trim()}>
                Gửi
              </button>
              <button onClick={() => setShowAnnouncementForm(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      <nav className="nav-homepade">
        <div className="nav_left-homepade">
          <ul>
            <li className="home_icon-nav">
              <i className="fa-solid fa-house-chimney-window"></i>
            </li>
            <li className={getNavItemClass(['/dashboard', '/admin-dashboard'])}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleHomeClick();
                }}
              >
                Trang Chủ
              </a>
            </li>
            <li className={getNavItemClass('/introduction')}>
              <Link to="/introduction">Giới thiệu</Link>
            </li>
            <li className={getNavItemClass('/study')}>
              <Link to="/study">Học tập</Link>
            </li>
            <li className={getNavItemClass('/chat')}>
              <Link to="/chat">Tin Nhắn</Link>
            </li>
            <li className={getNavItemClass('/support')}>
              <Link to="/support">Liên hệ & Giải đáp</Link>
            </li>
          </ul>
        </div>
        <div className="nav_right-homepade">
          <ul>
            <li className="item_bar" id="notification_icon" onClick={toggleNotifications}>
              <i className="fa-solid fa-bell"></i>
              {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
              {isNotificationOpen && (
                <div className="dropdown-items">
                  <div className="dropdown-item">
                    <header className="header-notify-homepade">
                      <h3>Thông báo của bạn</h3>
                    </header>
                  </div>
                  <div className="dropdown-item">
                    <div className="notification-info">
                      {error && <div className="error">{error}</div>}
                      {announcements.length === 0 ? (
                        <p>Không có thông báo.</p>
                      ) : (
                        announcements.map((announcement) => (
                          <div
                            key={announcement.id}
                            className={`notification-item ${announcement.is_read ? 'read' : 'unread'}`}
                          >
                            <p>{announcement.content}</p>
                            <div className="meta">
                              <span className="timestamp">
                                {new Date(announcement.created_at).toLocaleString('vi-VN', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                  hour12: false
                                })}
                              </span>
                              <div className="button-group">
                                {!announcement.is_read && (
                                  <button onClick={() => handleMarkAsRead(announcement.id)}>
                                    Đánh dấu đã đọc
                                  </button>
                                )}
                                <button onClick={() => handleDelete(announcement.id)}>
                                  Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="dropdown-item footer-notify">
                    Xem tất cả
                  </div>
                </div>
              )}
            </li>
            <li className="item_bar" id="search_input">
              <input className="text" placeholder="Tìm kiếm..." />
            </li>
            <li className="item_bar" id="search_icon">
              <i className="fa-solid fa-magnifying-glass"></i>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;