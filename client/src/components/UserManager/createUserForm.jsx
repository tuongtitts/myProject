import React, { useState, useEffect } from "react";
import { createUser, updateUser } from "../../api/userAdmin";
import './createUserForm.css';

const CreateUserForm = ({ initialData, onSuccess }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (initialData) {
      setId(initialData.id || "");
      setName(initialData.name || "");
      setRole(initialData.role || "student");
      setStatus(initialData.status || "active");
    } else {
      setId("");
      setName("");
      setRole("student");
      setStatus("active");
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        // Cập nhật người dùng
        await updateUser(initialData.id, { name, role, status });
        alert(" Cập nhật người dùng thành công");
      } else {
        // Tạo mới người dùng
        if (!id.trim()) {
          alert("❗Vui lòng nhập ID người dùng");
          return;
        }
        await createUser({ id, name, role, status });
        alert(" Tạo người dùng mới thành công (password mặc định: id@1)");
      }
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert(" Lỗi khi tạo/cập nhật người dùng");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form space-y-4">
      <h3 className="text-xl font-bold">
        {initialData ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
      </h3>

      {!initialData && (
        <div>
          <label className="block text-sm font-semibold">ID người dùng</label>
          <input
            type="text"
            placeholder="Nhập ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            className="border px-2 py-1 rounded w-full"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold">Tên người dùng</label>
        <input
          type="text"
          placeholder="Tên người dùng"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold">Vai trò</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        >
          <option value="student">Học viên</option>
          <option value="teacher">Giảng viên</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold">Trạng thái</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        >
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {initialData ? "Cập nhật" : "Tạo mới"}
      </button>
    </form>
  );
};

export default CreateUserForm;