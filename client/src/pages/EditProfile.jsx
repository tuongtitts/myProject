import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../api/user'; 
import './editProfile.css';

const EditProfile = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUser(profile);
        setEmail(profile.email || '');
      } catch (err) {
        setError('Không thể tải thông tin người dùng');
        console.error('Lỗi tải profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Vui lòng nhập email để cập nhật');
      return;
    }

    try {
      const userData = { email };
      const response = await updateUserProfile(userData);
      setSuccess('Cập nhật email thành công!');
      setUser(response.user);
      setEmail(response.user.email || '');
    } catch (err) {
      setError(err.message || 'Không thể cập nhật email');
      console.error('Lỗi cập nhật profile:', err);
    }
  };

  const handleBack = () => {
    navigate(-1); // Quay lại trang trước
  };

  if (!user) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="edit-profile-container">
      <h2>Cập nhật email</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email mới"
          />
        </div>
        <div className="form-buttons">
          <button type="submit" className="submit-button">Cập nhật</button>
          <button type="button" className="back-button" onClick={handleBack}>Quay lại</button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;