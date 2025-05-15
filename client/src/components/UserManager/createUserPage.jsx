import React, { useState } from "react";
import CreateUserForm from "../../components/UserManager/createUserForm";

const CreateUserPage = ({ initialData, onSuccess }) => {
  const [creationSuccess, setCreationSuccess] = useState(false);

  const handleUserCreated = () => {
    setCreationSuccess(true);
    onSuccess?.();
    // Reset thông báo sau 3 giây
    setTimeout(() => {
      setCreationSuccess(false);
    }, 3000);
  };

  return (
    <div className="create-user-container p-4" style={{ margin: "2rem" }}>

      {creationSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p> Người dùng đã được {initialData ? "cập nhật" : "tạo"} thành công!</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <CreateUserForm initialData={initialData} onSuccess={handleUserCreated} />
      </div>

      {!initialData && (
        <div className="userpage_atention">
          <p>Lưu ý:</p>
          <ul className="userpage_atention_list">
            <li>Mật khẩu mặc định cho người dùng mới là: id@1</li>
            <li>Người dùng có thể thay đổi mật khẩu sau khi đăng nhập lần đầu</li>
            <li>Các tài khoản không hoạt động sẽ không thể đăng nhập vào hệ thống</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CreateUserPage;