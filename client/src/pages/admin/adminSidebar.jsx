import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './adminSidebar.css'

const AdminSidebar = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAnnouncementMenuOpen, setIsAnnouncementMenuOpen] = useState(false);
  const [isCourseMenuOpen, setIsCourseMenuOpen] = useState(false); 

  return (
    <div className="admin-sidebar">
      <h2>Quản lí và Vận hành</h2>
      <ul>

        <li>
          <div
            onClick={() => setIsAnnouncementMenuOpen(!isAnnouncementMenuOpen)}
            className="announcement-menu-toggle"
          >
            {isAnnouncementMenuOpen ? "▼" : "▶"} Quản lý thông báo
          </div>

          {isAnnouncementMenuOpen && (
            <ul>
              <li>
                <NavLink
                  to="/admin-dashboard/announcements/create"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Tạo thông báo mới
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin-dashboard/announcements/list"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Danh sách thông báo
                </NavLink>
              </li>
            </ul>
          )}
        </li>


        <li>
          <div
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="user-menu-toggle"
          >
            {isUserMenuOpen ? "▼" : "▶"} Quản lý người dùng
          </div>

          {isUserMenuOpen && (
            <ul>
              <li>
                <NavLink
                  to="/admin-dashboard/users/create"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Tạo người dùng mới
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin-dashboard/users/list"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Danh sách người dùng
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        <li>
          <div
            onClick={() => setIsCourseMenuOpen(!isCourseMenuOpen)} 
            className="course-menu-toggle"
          >
            {isCourseMenuOpen ? "▼" : "▶"} Quản lý khóa học
          </div>

          {isCourseMenuOpen && (
            <ul>
              <li>
                <NavLink
                  to="/admin-dashboard/courses/create"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Danh mục học phần
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin-dashboard/courses/lessons" // Đường dẫn tới trang danh sách khóa học
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Thêm bài học mới
                </NavLink>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
