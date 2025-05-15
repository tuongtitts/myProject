import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { connectSocket } from '../socket';

function Login() {
  const [resultMsg, setResultMsg] = useState('');
  const [resultClass, setResultClass] = useState('');
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    setShowResult(false);
    setResultMsg('');
    setResultClass('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: username, password }),
      });

      const data = await response.json();
      console.log('API Response:', data);
      console.log('Raw Token:', data.token);

      if (response.ok) {
        setResultClass('success');
        setResultMsg('✅ Đăng nhập thành công!');
        setShowResult(true);

        // Set token vào localStorage
        localStorage.setItem('token', data.token);

        // Kiểm tra lại token sau khi set
        const tokenCheck = localStorage.getItem('token');
        if (!tokenCheck) {
          setResultClass('error');
          setResultMsg('❌ Lưu token thất bại, thử lại!');
          setShowResult(true);
          return;
        }

        // Giải mã token
        const payloadBase64 = data.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(payloadBase64));
        const userId = payload.id;
        const userRole = payload.role;
        localStorage.setItem('role', userRole);

        console.log('User ID:', userId);
        console.log('Role from Token:', userRole);

        // Kết nối socket
        connectSocket(userId);

        // Delay để đảm bảo token được lưu
        setTimeout(() => {
          if (userRole === 'admin' || userRole === 'teacher') {
            navigate('/admin-dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 200);
      } else {
        setResultClass('error');
        // Xử lý các lỗi cụ thể từ backend
        setResultMsg(
          data.error === 'Tài khoản của bạn đã bị ngừng hoạt động. Vui lòng liên hệ quản trị viên.'
            ? '❌ Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên!'
            : data.error === 'Mật khẩu sai'
            ? '❌ Mật khẩu không đúng!'
            : data.error === 'User không tồn tại'
            ? '❌ Tên đăng nhập không tồn tại!'
            : data.error === 'Vui lòng nhập đủ thông tin'
            ? '❌ Vui lòng nhập tên đăng nhập và mật khẩu!'
            : '❌ Đăng nhập thất bại! Vui lòng thử lại.'
        );
        setShowResult(true);
      }
    } catch (error) {
      console.error('Lỗi khi đăng nhập:', error);
      setResultClass('error');
      setResultMsg('❌ Lỗi kết nối đến server! Vui lòng thử lại.');
      setShowResult(true);
    }
  };

  // Hàm xử lý khi nhấp vào "Quên mật khẩu?"
  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Bạn cần báo giáo viên để reset mật khẩu.');
  };

  return (
    <div className="login-page">
      <div className="form-container">
        <div className="logo-container">
          <img className="logo-login" src="logo.svg" alt="Logo Website" />
        </div>
        <h3 id="softname">Phần mềm học trực tuyến ComNet Class</h3>
        <h4 id="svgateway">Cổng đăng nhập hệ thống phần mềm</h4>

        <form id="loginForm" onSubmit={handleSubmit} className="form">
          <div className="dangnhap">
            <input type="text" id="username" name="username" placeholder="Tên đăng nhập" required />
            <input type="password" id="password" name="password" placeholder="Mật khẩu" required />
          </div>

          <a id="forget_password" onClick={handleForgotPassword}>Quên mật khẩu?</a>

          {showResult && <div id="result" className={resultClass}>{resultMsg}</div>}

          <div className="button_dangnhap">
            <button type="submit" className="box__submit">Đăng nhập</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;