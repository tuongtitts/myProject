import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './app.css';

import IntroPage from './pages/intropage';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Chat from './pages/chat';
import AdminDashboard from './pages/admin/admin-dashboard';
import Study from './pages/study';
import CourseDetail from './pages/coursedetail';
import LessonPage from './pages/lessonPage';
import Introduction from './pages/introduction';
import SupportAndFAQ from './pages/supportAndFAQ';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/changePassword';

import AdminLayout from './layouts/adminLayout';
import MainLayout from './layouts/mainLayout';
import { connectSocket } from './socket';


function AppWrapper() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error("Invalid token structure");
        }
        const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(payloadBase64));
        const userId = payload.id;
        connectSocket(userId);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.warn("Token not found in localStorage.");
    }
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/editprofile" element={<EditProfile />} />
        <Route path="/changepassword" element={<ChangePassword />} />
        
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/admin-dashboard/*"
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          }
        />
        <Route path="/study" element={<Study />} />
        <Route
          path="/chat"
          element={
            <MainLayout>
              <Chat />
            </MainLayout>
          }
        />
                <Route
          path="/introduction"
          element={
            <MainLayout>
              <Introduction />
            </MainLayout>
          }
        />
          <Route
          path="/support"
          element={
            <MainLayout>
              <SupportAndFAQ/>
            </MainLayout>
          }
        />
        <Route path="/category/:categoryId/courses" element={<CourseDetail />} />
        <Route path="/lesson/:lessonId" element={<LessonPage />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;
