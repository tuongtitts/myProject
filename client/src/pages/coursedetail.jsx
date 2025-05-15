import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCoursesByCategory } from '../api/course';
import { getAllUsers } from '../api/userAdmin';
import { getAllCategories } from '../api/category';
import { getLessonsByCourse } from '../api/lesson';
import { getLessonProgress } from '../api/lessonProgress';
import { getUserFromToken } from '../api/auth';
import socket from '../socket';
import './coursedetail.css';

function CourseDetail() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [error, setError] = useState('');
  const [courseProgresses, setCourseProgresses] = useState({});

  const user = useMemo(() => getUserFromToken(), []); 

  useEffect(() => {
    if (!categoryId || isNaN(parseInt(categoryId))) {
      setError('Danh mục không hợp lệ!');
      return;
    }

    const fetchCourses = async () => {
      try {
        const data = await getCoursesByCategory(categoryId);
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Lỗi khi tải danh sách khóa học!');
      }
    };

    const fetchTeachers = async () => {
      try {
        const response = await getAllUsers();
        const teachersList = response.filter(user => user.role === 'teacher');
        setTeachers(teachersList);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };

    const fetchCategoryName = async () => {
      try {
        const categories = await getAllCategories();
        const category = categories.find(cat => cat.id === parseInt(categoryId));
        setCategoryName(category ? category.name : 'Danh mục không xác định');
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    };

    fetchCourses();
    fetchTeachers();
    fetchCategoryName();

    // Kết nối socket (chỉ gọi một lần ở cấp ứng dụng, không ngắt trong component)
    socket.connectSocket();

    // Lắng nghe sự kiện Socket.IO
    if (user?.role === 'student') {
      const studentId = user.id;

      socket.onMaterialCompleted(({ student_id, progressData }) => {
        if (student_id === studentId && selectedCourse) {
          calculateCourseProgress(selectedCourse);
        }
      });

      socket.onLessonProgressCreated(({ studentId: updatedStudentId, lessonId, progressData }) => {
        if (updatedStudentId === studentId && selectedCourse) {
          calculateCourseProgress(selectedCourse);
        }
      });

      socket.onLessonProgressUpdated(({ studentId: updatedStudentId, lessonId, progressData }) => {
        if (updatedStudentId === studentId && selectedCourse) {
          calculateCourseProgress(selectedCourse);
        }
      });
    }


  }, [categoryId]); 

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? (teacher.name || teacher.username) : 'Không xác định';
  };

  const calculateCourseProgress = useCallback(async (courseId) => {
    if (!user || user.role !== 'student') return;

    try {
      const lessonData = await getLessonsByCourse(courseId);
      if (!lessonData || lessonData.length === 0) {
        setCourseProgresses(prev => ({ ...prev, [courseId]: 0 }));
        return;
      }

      const studentId = user.id;
      const progressPromises = lessonData.map(lesson =>
        getLessonProgress(studentId, lesson.id)
          .then(progress => ({
            progress_percentage: Number(progress.progress_percentage) || 0,
          }))
          .catch(err => {
            console.warn(`Failed to fetch progress for lesson ${lesson.id}:`, err);
            return { progress_percentage: 0 };
          })
      );

      const progresses = await Promise.all(progressPromises);
      const validProgresses = progresses.filter(
        p => typeof p.progress_percentage === 'number' && !isNaN(p.progress_percentage)
      );
      const totalProgress = validProgresses.reduce((sum, p) => sum + p.progress_percentage, 0);
      const averageProgress = validProgresses.length > 0 ? totalProgress / validProgresses.length : 0;

      setCourseProgresses(prev => ({ ...prev, [courseId]: averageProgress }));
    } catch (error) {
      console.error('Error calculating course progress:', error);
      setCourseProgresses(prev => ({ ...prev, [courseId]: 0 }));
    }
  }, [user]);

  const fetchLessons = async (courseId) => {
    try {
      setLoadingLessons(true);
      setError('');
      const lessonData = await getLessonsByCourse(courseId);
      setLessons(lessonData);
    } catch (error) {
      setError('Lỗi khi tải danh sách bài học!');
      console.error('Error fetching lessons:', error);
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleCourseClick = async (courseId) => {
    if (selectedCourse === courseId) {
      setSelectedCourse(null);
      setLessons([]);
      return;
    }

    setSelectedCourse(courseId);
    await fetchLessons(courseId);
    if (user?.role === 'student') {
      await calculateCourseProgress(courseId);
    }
  };

  const handleLessonClick = (lessonId) => {
    navigate(`/lesson/${lessonId}`);
  };

  return (
    <div className="main-course">
      <h2 className="courses-section-title">Học Phần của {categoryName}</h2>
      {error && <div className="error">{error}</div>}
      <div className="courses-section">
        <ul className="course-list">
          {courses.length > 0 ? (
            courses.map(course => (
              <li
                key={course.id}
                className="course-list-item"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="course-info">
                  <span className="course-item-name">{course.name}</span>
                  <span className="course-description">{course.description}</span>
                  <span className="course-teacher">Giáo viên: {getTeacherName(course.teacher_id)}</span>
                  <span className="course-dates">
                    {course.start_date && `Từ: ${new Date(course.start_date).toLocaleDateString()}`}
                    {course.end_date && ` - Đến: ${new Date(course.end_date).toLocaleDateString()}`}
                  </span>
                  {user?.role === 'student' && courseProgresses[course.id] !== undefined && (
                    <span className="course-progress">
                      Tiến độ: {Number.isNaN(courseProgresses[course.id]) ? 0 : Math.round(courseProgresses[course.id])}%{' '}
                      {courseProgresses[course.id] >= 100 }
                    </span>
                  )}
                </div>

                <div className={`lessons-section ${selectedCourse === course.id ? 'open' : ''}`}>
                  {loadingLessons ? (
                    <div className="loading">Đang tải danh sách bài học...</div>
                  ) : error ? (
                    <div className="error">{error}</div>
                  ) : lessons.length > 0 ? (
                    <ul className="lesson-list">
                      {lessons.map(lesson => (
                        <li key={lesson.id} className="lesson-item" onClick={() => handleLessonClick(lesson.id)}>
                          <div className="lesson-header">
                            <strong>{lesson.title}</strong>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Chưa có bài học nào trong khóa học này.</p>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="course-list-item no-courses">Chưa có khóa học nào.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default CourseDetail;