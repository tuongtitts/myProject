const API_URL = "http://localhost:5000/api/categories";

export const getAllCategories = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Không thể tải danh mục");
  return await res.json();
};

export const createCategory = async (categoryData) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoryData),
  });
  if (!res.ok) throw new Error("Không thể thêm danh mục");
  return await res.json();
};

export const deleteCategory = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Không thể xoá danh mục");
  return await res.json();
};
