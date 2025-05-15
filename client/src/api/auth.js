import { showLoading } from '../utils/utils.js';

export async function login(id, password, navigate) {
  const loader = showLoading(true);

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Đăng nhập thất bại');
    }

    localStorage.setItem('token', data.token);
    return data; 
  } catch (error) {
    console.error('Login error:', error);
    alert(`Đăng nhập thất bại: ${error.message}`);
    return null;
  } finally {
    if (loader) loader.remove();
  }
}

export async function logout(navigate) {
  const loader = showLoading(true);

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Đăng xuất thất bại');
    }

    localStorage.removeItem('token');
    cleanupAfterLogoutReact(navigate);
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    alert(`Đăng xuất thất bại: ${error.message}`);
    return false;
  } finally {
    if (loader) loader.remove();
  }
}

export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

export function handleUnauthorizedReact(response, navigate) {
  if (response.status === 401) {
    alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    cleanupAfterLogoutReact(navigate);
    throw new Error('Phiên đăng nhập hết hạn');
  }
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
}

export function cleanupAfterLogoutReact(navigate) {
  localStorage.removeItem('token');
  if (navigate) {
    navigate('/login');
  } else {
    window.location.href = '/login';
  }
}

export function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload); 
  } catch (err) {
    console.error('Không thể decode token:', err);
    return null;
  }
}