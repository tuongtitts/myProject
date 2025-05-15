const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.log('No token found in localStorage');
    // Đợi một chút trước khi redirect
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  } catch (error) {
    console.error('Error parsing token in PrivateRoute:', error);
    return <Navigate to="/login" replace />;
  }
};
