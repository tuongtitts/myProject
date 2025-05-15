const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/material-completion';

export const markMaterialCompleted = async (student_id, material_id) => {
  const res = await fetch(`${API_URL}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student_id, material_id }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể đánh dấu tài liệu hoàn thành');
  }

  return await res.json();
};

export const getCompletedMaterials = async (studentId) => {
  const res = await fetch(`${API_URL}/completed/${studentId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể tải danh sách tài liệu đã hoàn thành');
  }

  return await res.json(); 
};
