import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLesson, getLessonsByCourse } from '../../api/lesson';
import { getAllCategories } from '../../api/category';
import { getCoursesByCategory } from '../../api/course';
import { getMaterials, createMaterial, deleteMaterial } from '../../api/material';
import { connectSocket, joinCourseRoom, onMaterialCreated, onMaterialDeleted } from '../../socket';
import './createLesson.css';

const CreateLessonAndMaterial = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [orderNum, setOrderNum] = useState('');
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(true);
  const [lessonId, setLessonId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Kết nối Socket.IO
    connectSocket();

    // Lấy danh sách danh mục
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        setCategories(response);
      } catch (err) {
        console.error('Lỗi khi tải danh mục:', err);
        setError('Không thể tải danh mục. Vui lòng thử lại.');
      }
    };
    fetchCategories();

    // Lắng nghe sự kiện materialCreated
    onMaterialCreated(({ material }) => {
      if (material.lesson_id === parseInt(lessonId)) {
        console.log('Received materialCreated for lessonId:', lessonId, material);
        setMaterials((prev) => {
          if (!prev.some((m) => m.id === material.id)) {
            return [...prev, material];
          }
          return prev;
        });
      }
    });

    // Lắng nghe sự kiện materialDeleted
    onMaterialDeleted(async ({ materialId, lessonId: deletedLessonId }) => {
      if (deletedLessonId === parseInt(lessonId)) {
        console.log('Received materialDeleted for lessonId:', lessonId, 'materialId:', materialId);
        try {
          const updatedMaterials = await getMaterials(lessonId);
          setMaterials(updatedMaterials);
        } catch (err) {
          console.error('Lỗi khi làm mới danh sách tài liệu sau materialDeleted:', err);
          setError('Không thể làm mới danh sách tài liệu. Vui lòng thử lại.');
        }
      }
    });

    return () => {
      // Cleanup listeners
      onMaterialCreated(() => {});
      onMaterialDeleted(() => {});
    };
  }, [lessonId]);

  const handleCategoryChange = async (e) => {
    const selectedCategoryId = e.target.value;
    setCategoryId(selectedCategoryId);
    setCourseId('');
    setCourses([]);
    setLessonId(null);
    setLessons([]);
    setMaterials([]);

    if (selectedCategoryId) {
      try {
        const response = await getCoursesByCategory(selectedCategoryId);
        setCourses(response);
      } catch (err) {
        console.error('Lỗi khi tải khóa học:', err);
        setError('Không thể tải khóa học. Vui lòng thử lại.');
      }
    }
  };

  const handleCourseChange = async (e) => {
    const selectedCourseId = e.target.value;
    setCourseId(selectedCourseId);
    setLessonId(null);
    setLessons([]);
    setMaterials([]);

    if (selectedCourseId) {
      try {
        joinCourseRoom(selectedCourseId); // Tham gia room course_${selectedCourseId}
        const response = await getLessonsByCourse(selectedCourseId);
        setLessons(response);
      } catch (err) {
        console.error('Lỗi khi tải bài học:', err);
        setError('Không thể tải bài học. Vui lòng thử lại.');
      }
    }
  };

  const handleLessonChange = async (e) => {
    const selectedLessonId = e.target.value;
    setLessonId(selectedLessonId);

    if (selectedLessonId) {
      try {
        const data = await getMaterials(selectedLessonId);
        setMaterials(data);
        setError('');
      } catch (err) {
        console.error('Lỗi khi tải tài liệu:', err);
        setError(err.message || 'Không thể tải tài liệu. Vui lòng thử lại.');
      }
    } else {
      setMaterials([]);
    }
  };

  const toggleMode = async (isAddLesson) => {
    setShowAddLesson(isAddLesson);
    setError('');
    setTitle('');
    setFile(null);

    if (!isAddLesson && courseId) {
      try {
        const response = await getLessonsByCourse(courseId);
        setLessons(response);
      } catch (err) {
        console.error('Lỗi khi tải bài học:', err);
        setError('Không thể tải bài học. Vui lòng thử lại.');
      }
    }
  };

  const handleSubmitLesson = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!title || !content || !courseId || !orderNum) {
      setError('Vui lòng điền đầy đủ tất cả các trường!');
      alert('Vui lòng điền đầy đủ tất cả các trường!');
      setIsLoading(false);
      return;
    }

    if (isNaN(orderNum) || parseInt(orderNum) < 0) {
      setError('Số thứ tự bài học phải là số không âm!');
      alert('Số thứ tự bài học phải là số không âm!');
      setIsLoading(false);
      return;
    }

    const lessonData = {
      title,
      content,
      course_id: parseInt(courseId),
      order_num: parseInt(orderNum),
    };

    try {
      const response = await createLesson(lessonData);

      if (response.message === 'Tạo bài học thành công!') {
        alert('Tạo bài học thành công!');

        try {
          const updatedLessons = await getLessonsByCourse(courseId);
          setLessons(updatedLessons);

          const newLesson = updatedLessons.find(
            (lesson) => lesson.title === title && lesson.order_num === parseInt(orderNum)
          );

          if (newLesson) {
            setLessonId(newLesson.id);
          }
        } catch (err) {
          console.error('Lỗi khi cập nhật danh sách bài học:', err);
        }

        if (window.confirm('Bạn có muốn thêm tài liệu cho bài học này không?')) {
          setShowAddLesson(false);
        } else {
          setTitle('');
          setContent('');
          setOrderNum('');
        }
      } else {
        setError(response.message || 'Không thể tạo bài học. Hãy kiểm tra lại dữ liệu!');
        alert(response.message || 'Không thể tạo bài học!');
      }
    } catch (err) {
      console.error('Lỗi khi tạo bài học:', err);
      setError(err.message || 'Lỗi khi tạo bài học. Vui lòng thử lại!');
      alert(err.message || 'Lỗi khi tạo bài học!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!title || !file || !lessonId) {
      setError('Vui lòng nhập tiêu đề, chọn file và chọn bài học');
      alert('Vui lòng nhập tiêu đề, chọn file và chọn bài học');
      setLoading(false);
      return;
    }

    const allowedTypes = [
      'video/mp4',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/x-pka',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Loại file không hợp lệ. Cho phép: video, pdf, word, ppt');
      alert('Loại file không hợp lệ. Cho phép: video, pdf, word, ppt');
      setLoading(false);
      return;
    }

    try {
      const fileType = getFileType(file.type);
      const materialData = {
        title,
        lesson_id: lessonId,
        file,
        file_type: fileType,
        file_size: file.size,
      };

      let response;
      try {
        response = await createMaterial(materialData);
        console.log('Phản hồi từ createMaterial:', response);
      } catch (err) {
        console.warn('API createMaterial lỗi, kiểm tra danh sách tài liệu:', err.message);
      }

      const updatedMaterials = await getMaterials(lessonId);
      setMaterials(updatedMaterials);

      const isMaterialAdded = updatedMaterials.some(
        (m) => m.title === title && m.file_type === fileType
      );

      if (response && (response.id || response.title) || isMaterialAdded) {
        setTitle('');
        setFile(null);
        setError('');
        alert('Tải lên tài liệu thành công!');
      } else {
        throw new Error('Tài liệu không được lưu vào cơ sở dữ liệu');
      }
    } catch (err) {
      console.error('Lỗi khi tải tài liệu:', err);
      setError(err.message || 'Lỗi khi tải lên tài liệu. Vui lòng thử lại.');
      alert(err.message || 'Lỗi khi tải lên tài liệu!');
    } finally {
      setLoading(false);
    }
  };

  const getFileType = (mimeType) => {
    switch (mimeType) {
      case 'video/mp4':
        return 'video';
      case 'application/pdf':
        return 'pdf';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'word';
      case 'application/vnd.ms-powerpoint':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return 'ppt';
      case 'application/x-pka':
        return 'pkt';
      default:
        return 'unknown';
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài liệu này?')) return;
    setLoading(true);
    setError('');
    try {
      const response = await deleteMaterial(id);
      console.log('Delete material response:', response);

      // Làm mới danh sách tài liệu
      const updatedMaterials = await getMaterials(lessonId);
      setMaterials(updatedMaterials);

      alert('Xóa tài liệu thành công!');
    } catch (err) {
      console.error('Lỗi khi xóa tài liệu:', err.message);
      setError(err.message || 'Lỗi khi xóa tài liệu. Vui lòng thử lại.');
      alert(err.message || 'Lỗi khi xóa tài liệu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-lesson-container">
      <h2>{showAddLesson ? 'Tạo bài học mới' : 'Quản lý tài liệu'}</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="toggle-buttons">
        <button
          onClick={() => toggleMode(true)}
          className={`btn ${showAddLesson ? 'active' : ''}`}
        >
          Thêm bài học
        </button>
        <button
          onClick={() => toggleMode(false)}
          className={`btn ${!showAddLesson ? 'active' : ''}`}
        >
          Quản lý tài liệu
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="categoryId">Danh mục khóa học</label>
        <select id="categoryId" value={categoryId} onChange={handleCategoryChange} required>
          <option value="">Chọn danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="courseId">Khóa học</label>
        <select id="courseId" value={courseId} onChange={handleCourseChange} required>
          <option value="">Chọn khóa học</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {showAddLesson ? (
        <form onSubmit={handleSubmitLesson}>
          <div className="form-group">
            <label htmlFor="title">Tiêu đề bài học</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Nội dung bài học</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="orderNum">Số thứ tự bài học</label>
            <input
              type="number"
              id="orderNum"
              value={orderNum}
              onChange={(e) => setOrderNum(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Đang tạo...' : 'Tạo bài học'}
          </button>
        </form>
      ) : (
        <div>
          <div className="form-group">
            <label htmlFor="lessonId">Bài học</label>
            <select id="lessonId" value={lessonId || ''} onChange={handleLessonChange} required>
              <option value="">Chọn bài học</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </div>

          {lessonId && (
            <form onSubmit={handleFileUpload}>
              <div className="form-group">
                <label htmlFor="title">Tiêu đề tài liệu</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề tài liệu"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="file">Tải lên file</label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".mp4,.pdf,.doc,.docx,.ppt,.pptx,.pka"
                  required
                />
                <small>Cho phép: video (mp4), pdf, word (doc/docx), powerpoint (ppt/pptx), pka</small>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Đang tải lên...' : 'Tải lên tài liệu'}
              </button>
            </form>
          )}

          {lessonId && materials.length > 0 && (
            <div className="material-list">
              <h3>Tài liệu đã tải lên</h3>
              <ul>
                {materials.map((material) => (
                  <li key={material.id} className="material-item">
                    <div className="material-info">
                      <span className="material-title">{material.title}</span>
                      <span className="material-type">({material.file_type})</span>
                    </div>
                    <button
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="btn-delete"
                      disabled={loading}
                    >
                      Xóa
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lessonId && materials.length === 0 && (
            <div className="no-materials">
              <p>Chưa có tài liệu nào cho bài học này.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateLessonAndMaterial;