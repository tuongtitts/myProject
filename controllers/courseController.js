const Course = require('../models/courseModel');
const Category = require('../models/categoryModel');

exports.getCoursesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const courses = await Course.getByCategory(categoryId);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách khóa học.' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { id, name, description, category_id, teacher_id, start_date, end_date } = req.body;
    if (!name || !category_id) {
      return res.status(400).json({ message: 'Tên khóa học và danh mục không được bỏ trống!' });
    }

    // Kiểm tra xem id đã tồn tại chưa (nếu có gửi id)
    if (id) {
      const existingCourse = await Course.findById(id);
      if (existingCourse) {
        return res.status(400).json({ message: 'ID khóa học đã tồn tại!' });
      }
    }

    const courseId = await Course.create({ id, name, description, category_id, teacher_id, start_date, end_date });
    res.status(201).json({ id: courseId, name, description, category_id, teacher_id, start_date, end_date });
  } catch (err) {
    res.status(500).json({ message: `Lỗi server khi thêm khóa học: ${err.message}` });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await Course.delete(id);
    res.json({ message: 'Xóa khóa học thành công.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi xóa khóa học.' });
  }
};