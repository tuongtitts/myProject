const Category = require('../models/categoryModel');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách categories.' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Tên category không được bỏ trống!' });

    const id = await Category.create(name);
    res.status(201).json({ id, name });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi thêm category.' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.delete(id);
    res.json({ message: 'Xoá category thành công.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi xoá category.' });
  }
};
