import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CreateUserPage from '../../components/UserManager/createUserPage';
import UserListPage from '../../components/UserManager/userListPage';
import CreateAnnouncementPage from '../../components/AnnouncementForm/createAnnouncementPage';
import AnnouncementListPage from '../../components/AnnouncementForm/announcementListPage';
import CategoryManagement from '../../components/Course/createCategoryPage';
import LessonManager from '../../components/Lesson/LessonManager';





const AdminDashboard = () => {
  return (
    <Routes>
      <Route path="announcements/create" element={<CreateAnnouncementPage />} /> 
      <Route path="announcements/list" element={<AnnouncementListPage />} /> 
      <Route path="users/create" element={<CreateUserPage />} />
      <Route path="users/list" element={<UserListPage />} />
      <Route path="courses/create" element={<CategoryManagement />} />
      <Route path="courses/lessons" element={<LessonManager />} />

    </Routes>
  );
};

export default AdminDashboard;
