import React, { useEffect, useState } from 'react';
import LessonList from './LessonList_admin';
import { getAllCategories, createCategory, deleteCategory } from '../../api/category';
import { createCourse, getCoursesByCategory, deleteCourse } from '../../api/course';
import { getLessonsByCourse, deleteLesson } from '../../api/lesson';
import { getAllUsers } from '../../api/userAdmin';
import { getLessonProgress } from '../../api/lessonProgress';
import './createCategoryPage.css';

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [courseInputs, setCourseInputs] = useState({});
  const [showCourseForm, setShowCourseForm] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [coursesByCategory, setCoursesByCategory] = useState({});
  const [showCourses, setShowCourses] = useState({});
  const [lessonsByCourse, setLessonsByCourse] = useState({});
  const [showLessons, setShowLessons] = useState({});
  const [courseProgress, setCourseProgress] = useState({});
  const [showCourseProgress, setShowCourseProgress] = useState({});

  useEffect(() => {
    fetchCategories();
    fetchTeachers();
    fetchStudents();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Lỗi khi tải danh mục!');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await getAllUsers();
      const teachersList = response.filter(user => user.role === 'teacher');
      setTeachers(teachersList);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      alert('Lỗi khi tải danh sách giáo viên!');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await getAllUsers();
      const studentsList = response.filter(user => user.role === 'student');
      setStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Lỗi khi tải danh sách học sinh!');
    }
  };

  const fetchCourses = async (categoryId) => {
    try {
      const data = await getCoursesByCategory(categoryId);
      setCoursesByCategory(prev => ({ ...prev, [categoryId]: data }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Lỗi khi tải học phần!');
    }
  };

  const fetchLessons = async (courseId) => {
    try {
      const data = await getLessonsByCourse(courseId);
      setLessonsByCourse(prev => ({ ...prev, [courseId]: data }));
    } catch (err) {
      alert('Lỗi khi tải bài học');
    }
  };

  const calculateCourseProgress = async (courseId) => {
    try {
      const lessonData = await getLessonsByCourse(courseId);
      if (!lessonData || lessonData.length === 0) {
        setCourseProgress(prev => ({ ...prev, [courseId]: {} }));
        return;
      }

      const progressPromises = students.map(student =>
        Promise.all(
          lessonData.map(lesson =>
            getLessonProgress(student.id, lesson.id)
              .then(progress => ({
                progress_percentage: Number(progress.progress_percentage) || 0,
              }))
              .catch(() => ({ progress_percentage: 0 }))
          )
        ).then(progresses => {
          const validProgresses = progresses.filter(p => typeof p.progress_percentage === 'number' && !isNaN(p.progress_percentage));
          const totalProgress = validProgresses.reduce((sum, p) => sum + p.progress_percentage, 0);
          const averageProgress = validProgresses.length > 0 ? totalProgress / validProgresses.length : 0;
          return { studentId: student.id, progress: averageProgress };
        })
      );

      const results = await Promise.all(progressPromises);
      const progressMap = results.reduce((acc, { studentId, progress }) => {
        acc[studentId] = progress;
        return acc;
      }, {});
      setCourseProgress(prev => ({ ...prev, [courseId]: progressMap }));
    } catch (error) {
      console.error('Error calculating course progress:', error);
      setCourseProgress(prev => ({ ...prev, [courseId]: {} }));
    }
  };

  const handleDeleteLesson = async (lessonId, courseId) => {
    if (window.confirm('Xóa bài học này?')) {
      try {
        await deleteLesson(lessonId);
        setLessonsByCourse(prev => ({
          ...prev,
          [courseId]: prev[courseId].filter(lesson => lesson.id !== lessonId),
        }));
        alert('Đã xóa bài học');
      } catch (err) {
        alert('Xóa bài học thất bại');
      }
    }
  };

  const toggleLessons = (courseId) => {
    setShowLessons(prev => ({ ...prev, [courseId]: !prev[courseId] }));
    if (!showLessons[courseId]) {
      fetchLessons(courseId);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      alert('Tên danh mục không được để trống.');
      return;
    }
    try {
      await createCategory({ name: newCategory });
      setNewCategory('');
      fetchCategories();
      alert('Thêm danh mục thành công!');
    } catch (err) {
      alert('Lỗi: Thêm danh mục thất bại!');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
      try {
        await deleteCategory(id);
        fetchCategories();
        setShowCourses(prev => ({ ...prev, [id]: false }));
        setShowCourseForm(prev => ({ ...prev, [id]: false }));
        setCoursesByCategory(prev => {
          const newCourses = { ...prev };
          delete newCourses[id];
          return newCourses;
        });
        alert('Xóa danh mục thành công!');
      } catch (error) {
        alert('Xóa danh mục thất bại!');
      }
    }
  };

  const handleCourseInput = (categoryId, field, value) => {
    setCourseInputs(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [field]: value,
      },
    }));
  };

  const handleAddCourse = async (e, categoryId) => {
    e.preventDefault();
    const courseData = {
      id: parseInt(courseInputs[categoryId]?.id),
      name: courseInputs[categoryId]?.name,
      description: courseInputs[categoryId]?.description || 'Mô tả học phần',
      teacher_id: parseInt(courseInputs[categoryId]?.teacher_id),
      category_id: parseInt(categoryId),
      start_date: courseInputs[categoryId]?.start_date,
      end_date: courseInputs[categoryId]?.end_date,
    };

    if (!courseData.id || !courseData.name?.trim() || !courseData.teacher_id) {
      alert('ID, tên học phần và giáo viên không được để trống.');
      return;
    }

    if (isNaN(courseData.id) || courseData.id <= 0) {
      alert('ID học phần phải là số nguyên dương.');
      return;
    }

    try {
      await createCourse(courseData);
      setCourseInputs(prev => ({
        ...prev,
        [categoryId]: {
          id: '',
          name: '',
          description: 'Mô tả học phần',
          teacher_id: '',
          start_date: '',
          end_date: '',
        },
      }));
      setShowCourseForm(prev => ({ ...prev, [categoryId]: false }));
      if (showCourses[categoryId]) {
        fetchCourses(categoryId);
      }
      alert('Thêm học phần thành công!');
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleDeleteCourse = async (courseId, categoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa học phần này không?')) {
      try {
        await deleteCourse(courseId);
        setCoursesByCategory(prev => ({
          ...prev,
          [categoryId]: prev[categoryId].filter(course => course.id !== courseId),
        }));
        alert('Xóa học phần thành công!');
      } catch (error) {
        alert('Xóa học phần thất bại!');
      }
    }
  };

  const toggleCourseForm = (categoryId) => {
    setShowCourseForm(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
    if (!showCourseForm[categoryId]) {
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);
      const formatDate = (date) => date.toISOString().slice(0, 16);
      setCourseInputs(prev => ({
        ...prev,
        [categoryId]: {
          id: prev[categoryId]?.id || '',
          name: prev[categoryId]?.name || '',
          description: prev[categoryId]?.description || 'Mô tả học phần',
          teacher_id: prev[categoryId]?.teacher_id || '',
          start_date: prev[categoryId]?.start_date || formatDate(now),
          end_date: prev[categoryId]?.end_date || formatDate(nextMonth),
        },
      }));
    }
  };

  const toggleCoursesList = (categoryId) => {
    setShowCourses(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
    if (!showCourses[categoryId]) {
      fetchCourses(categoryId);
    }
  };

  const toggleCourseProgress = (courseId) => {
    setShowCourseProgress(prev => ({ ...prev, [courseId]: !prev[courseId] }));
    if (!showCourseProgress[courseId]) {
      calculateCourseProgress(courseId);
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? (teacher.name || teacher.username) : 'Không xác định';
  };

  return (
    <div className="category-management">
      <h2 className="category-title"> Danh sách học phần</h2>

      <ul className="category-list">
        {categories.map((cat) => (
          <li key={cat.id} className="category-list-item">
            <span className="category-item-name">{cat.name}</span>
            <div className="category-buttons">
              <button
                className="category-add-course-button"
                onClick={() => toggleCourseForm(cat.id)}
              >
                {showCourseForm[cat.id] ? 'Hủy' : ' Thêm học phần'}
              </button>
              <button
                className="category-show-courses-button"
                onClick={() => toggleCoursesList(cat.id)}
              >
                {showCourses[cat.id] ? 'Ẩn học phần' : ' Xem học phần'}
              </button>
              <button
                className="category-delete-button"
                onClick={() => handleDeleteCategory(cat.id)}
              >
                Xóa
              </button>
            </div>

            {showCourseForm[cat.id] && (
              <form onSubmit={(e) => handleAddCourse(e, cat.id)} className="add-course-form">
                <div className="form-group">
                  <label className="add-course-label">ID học phần</label>
                  <input
                    type="number"
                    className="add-course-input"
                    value={courseInputs[cat.id]?.id || ''}
                    onChange={(e) => handleCourseInput(cat.id, 'id', e.target.value)}
                    placeholder="Nhập ID học phần"
                    required
                    min="1"
                  />
                  <p className="form-note">ID học phần phải là số nguyên dương.</p>
                </div>
                <div className="form-group">
                  <label className="add-course-label">Tên học phần</label>
                  <input
                    type="text"
                    className="add-course-input"
                    value={courseInputs[cat.id]?.name || ''}
                    onChange={(e) => handleCourseInput(cat.id, 'name', e.target.value)}
                    placeholder="Nhập tên học phần..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="add-course-label">Mô tả học phần</label>
                  <textarea
                    className="add-course-input"
                    value={courseInputs[cat.id]?.description || ''}
                    onChange={(e) => handleCourseInput(cat.id, 'description', e.target.value)}
                    placeholder="Nhập mô tả học phần..."
                  />
                </div>
                <div className="form-group">
                  <label className="add-course-label">Giáo viên</label>
                  <select
                    className="add-course-input"
                    value={courseInputs[cat.id]?.teacher_id || ''}
                    onChange={(e) => handleCourseInput(cat.id, 'teacher_id', e.target.value)}
                    required
                  >
                    <option value="">-- Chọn giáo viên --</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name || teacher.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="add-course-label">Ngày bắt đầu</label>
                  <input
                    type="datetime-local"
                    className="add-course-input"
                    value={courseInputs[cat.id]?.start_date || ''}
                    onChange={(e) => handleCourseInput(cat.id, 'start_date', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="add-course-label">Ngày kết thúc</label>
                  <input
                    type="datetime-local"
                    className="add-course-input"
                    value={courseInputs[cat.id]?.end_date || ''}
                    onChange={(e) => handleCourseInput(cat.id, 'end_date', e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="add-course-button">Thêm học phần</button>
              </form>
            )}

            {showCourses[cat.id] && (
              <div className="courses-section">
                <ul className="course-list">
                  {coursesByCategory[cat.id]?.length > 0 ? (
                    coursesByCategory[cat.id].map(course => (
                      <li key={course.id} className="course-list-item">
                        <div className="course-info">
                          <span className="course-item-name">{course.name} (ID: {course.id})</span>
                          <span className="course-description">{course.description}</span>
                          <span className="course-teacher">Giáo viên: {getTeacherName(course.teacher_id)}</span>
                          <span className="course-dates">
                            {course.start_date && `Từ: ${new Date(course.start_date).toLocaleDateString()}`}
                            {course.end_date && ` - Đến: ${new Date(course.end_date).toLocaleDateString()}`}
                          </span>
                        </div>

                        <div className="course-actions">
                          <button
                            className="course-progress-button"
                            onClick={() => toggleCourseProgress(course.id)}
                          >
                            Tiến độ
                          </button>
                          <button
                            className="course-delete-button"
                            onClick={() => handleDeleteCourse(course.id, cat.id)}
                          >
                            Xóa
                          </button>
                          <button
                            className="course-show-lessons-button"
                            onClick={() => toggleLessons(course.id)}
                          >
                            {showLessons[course.id] ? 'Ẩn bài học' : 'Xem bài học'}
                          </button>
                        </div>

                        {showCourseProgress[course.id] && (
                          <div className="course-progress-detail">
                            <h4>Tiến độ khóa học của học sinh</h4>
                            {students.length > 0 ? (
                              <ul className="student-progress-list">
                                {students.map(student => (
                                  <li key={student.id} className="student-progress-item">
                                    <span className="student-name">{student.name || student.username}</span>
                                    <span className="student-progress">
                                      Tiến độ: {courseProgress[course.id]?.[student.id] ? Math.round(courseProgress[course.id][student.id]) : 0}%{' '}
                                      {courseProgress[course.id]?.[student.id] >= 100 && '🎉'}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>Chưa có học sinh nào.</p>
                            )}
                          </div>
                        )}

                        {showLessons[course.id] && (
                          <div className="lesson-container">
                            <LessonList
                              lessons={lessonsByCourse[course.id] || []}
                              onDeleteLesson={(lessonId) => handleDeleteLesson(lessonId, course.id)}
                            />
                          </div>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="course-list-item no-courses">Chưa có học phần nào.</li>
                  )}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleAddCategory} className="add-category-form">
        <div className="form-group">
          <label className="add-category-label">Tên danh mục mới</label>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="add-category-input"
            placeholder="Nhập tên danh mục..."
          />
        </div>
        <button type="submit" className="add-category-button">Thêm danh mục</button>
      </form>

      <div className="mt-4 text-gray-600">
        <p>Lưu ý:</p>
        <ul className="list-disc ml-5 mt-2">
          <li>Chỉ xóa danh mục khi không có tài liệu nào trong khóa học</li>
          <li>Chỉ xóa khóa học khi không có tài liệu nào trong nó</li>
        </ul>
      </div>
    </div>
  );
}

export default CategoryManagement;