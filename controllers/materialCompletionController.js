const MaterialCompletion = require('../models/materialCompletionModel');

exports.markMaterialCompleted = async (req, res) => {
  const { student_id, material_id } = req.body;

  if (!student_id || !material_id) {
    return res.status(400).json({ message: 'Thiếu student_id hoặc material_id.' });
  }

  try {
    await MaterialCompletion.markCompleted(student_id, material_id);
    res.json({ message: 'Đã đánh dấu hoàn thành tài liệu.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi đánh dấu tài liệu.' });
  }
};

exports.getCompletedMaterials = async (req, res) => {
  const { studentId } = req.params;

  try {
    const materials = await MaterialCompletion.getCompletedMaterials(studentId);
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách tài liệu đã hoàn thành.' });
  }
};
