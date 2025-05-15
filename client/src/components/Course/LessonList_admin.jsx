import { useState, useEffect } from 'react';
import { getLessonDetails } from '../../api/lesson';
import { getMaterials } from '../../api/material';
import { getLessonProgress } from '../../api/lessonProgress';
import { getAllUsers } from '../../api/userAdmin';
import { getCompletedMaterials } from '../../api/materialCompletion';
import socket from '../../socket';
import './lessonList.css';

function LessonList({ lessons, onDeleteLesson, courseId }) {
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [completedMaterials, setCompletedMaterials] = useState({});
  const [lessonMaterials, setLessonMaterials] = useState({});
  const [showProgressDetail, setShowProgressDetail] = useState(null);


  const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    const icons = {
      pdf: '/image/pdf-icon.jpg',
      doc: '/image/word-icon.jpg',
      docx: '/image/word-icon.jpg',
      ppt: '/image/ppt-icon.jpg',
      pptx: '/image/ppt-icon.jpg',
      mp4: '/image/mp4-icon.jpg',
    };
    const iconUrl = icons[ext] || '/image/document-icon.jpg';
    return <img src={iconUrl} alt={ext} className="file-icon-img" />;
  };


  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await getAllUsers();
        const studentsList = response.filter(user => user.role === 'student');
        setStudents(studentsList);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Lỗi khi tải danh sách học sinh');
      }
    };
    fetchStudents();

    // Kết nối socket
    socket.connectSocket();

    // Tham gia room course_${courseId} nếu có
    if (courseId) {
      socket.joinCourseRoom(courseId);
    }

    // Lắng nghe sự kiện Socket.IO
    socket.onMaterialCreated(({ material }) => {
      if (material.lesson_id === expandedLesson?.id) {
        setMaterials((prev) => [...prev, material]);
        setLessonMaterials((prev) => ({
          ...prev,
          [material.lesson_id]: [...(prev[material.lesson_id] || []), material],
        }));
      }
    });

    socket.onMaterialDeleted(({ materialId, lessonId }) => {
      if (lessonId === expandedLesson?.id) {
        setMaterials((prev) => prev.filter((m) => m.id !== materialId));
        setLessonMaterials((prev) => ({
          ...prev,
          [lessonId]: prev[lessonId]?.filter((m) => m.id !== materialId) || [],
        }));
      }
    });

    socket.onMaterialCompleted(({ student_id, material_id, progressData }) => {
      setCompletedMaterials((prev) => {
        const lessonId = progressData.lesson_id;
        const studentProgress = prev[lessonId]?.[student_id] || {
          studentId: student_id,
          lessonId,
          completedMaterialIds: [],
        };
        if (!studentProgress.completedMaterialIds.includes(material_id)) {
          studentProgress.completedMaterialIds = [
            ...studentProgress.completedMaterialIds,
            material_id,
          ];
        }
        return {
          ...prev,
          [lessonId]: {
            ...prev[lessonId],
            [student_id]: {
              ...studentProgress,
              ...progressData,
            },
          },
        };
      });
      setProgressData((prev) => ({
        ...prev,
        [progressData.lesson_id]: {
          ...prev[progressData.lesson_id],
          [student_id]: {
            ...prev[progressData.lesson_id]?.[student_id],
            ...progressData,
          },
        },
      }));
    });

    socket.onLessonProgressUpdated(({ studentId, lessonId, progressData }) => {
      setProgressData((prev) => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          [studentId]: {
            ...prev[lessonId]?.[studentId],
            ...progressData,
          },
        },
      }));
    });

    return () => {
      socket.disconnectSocket();
    };
  }, [expandedLesson, courseId]);

  // Lấy tiến độ bài học cho một lessonId cụ thể
  const fetchProgress = async (lessonId) => {
    try {
      const materialsData = await getMaterials(lessonId);
      setLessonMaterials((prev) => ({ ...prev, [lessonId]: materialsData }));

      const progressPromises = students.map(async (student) => {
        try {
          let progress;
          try {
            progress = await getLessonProgress(student.id, lessonId);
          } catch {
            progress = {
              student_id: student.id,
              lesson_id: lessonId,
              progress_percentage: 0,
              is_completed: false,
              completed_at: null,
            };
          }

          const completedIds = await getCompletedMaterials(student.id).catch(() => []);

          const completedCount = completedIds.filter((id) =>
            materialsData.some((m) => m.id === id)
          ).length;

          const totalMaterials = materialsData.length;
          const calculatedProgress = totalMaterials > 0 ? (completedCount / totalMaterials) * 100 : 0;
          const isCompleted = calculatedProgress >= 100;

          return {
            ...progress,
            studentId: student.id,
            lessonId,
            progress_percentage: progress.progress_percentage || calculatedProgress,
            is_completed: progress.is_completed || isCompleted,
            completed_at: progress.completed_at || (isCompleted ? new Date().toISOString() : null),
            completedMaterialIds: completedIds,
          };
        } catch (err) {
          console.error(`Error fetching progress for student ${student.id}:`, err);
          return {
            studentId: student.id,
            lessonId,
            progress_percentage: 0,
            is_completed: false,
            completed_at: null,
            completedMaterialIds: [],
          };
        }
      });

      const results = await Promise.all(progressPromises);

      const progressMap = {};
      results.forEach((data) => {
        progressMap[data.studentId] = data;
      });

      setProgressData((prev) => ({ ...prev, [lessonId]: progressMap }));
      setCompletedMaterials((prev) => ({ ...prev, [lessonId]: progressMap }));
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      setError('Lỗi khi tải tiến độ bài học');
    }
  };

  const getProgressMessage = (studentId, lessonId) => {
    if (!progressData[lessonId] || !progressData[lessonId][studentId]) {
      return 'Đang tải dữ liệu...';
    }

    const progress = progressData[lessonId][studentId].progress_percentage || 0;
    const materialsForLesson = lessonMaterials[lessonId] || [];
    const totalMaterials = materialsForLesson.length;

    const studentProgress = completedMaterials[lessonId]?.[studentId];
    const completedIds = studentProgress?.completedMaterialIds || [];
    const completedCount = completedIds.filter((id) =>
      materialsForLesson.some((m) => m.id === id)
    ).length;

    if (progress === 0 || totalMaterials === 0) {
      return 'Chưa học nội dung nào';
    }
    if (progress >= 100) {
      return 'Đã hoàn thành tất cả các tài liệu cho bài học này!';
    }
    return `${Math.round(progress)}% đã hoàn thành (còn ${totalMaterials - completedCount} tài liệu)`;
  };

  const handleViewDetail = async (lessonId) => {
    if (expandedLesson?.id === lessonId) {
      setExpandedLesson(null);
      setMaterials([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const [lessonDetail, lessonMaterials] = await Promise.all([
        getLessonDetails(lessonId),
        getMaterials(lessonId),
      ]);

      setExpandedLesson(lessonDetail);
      setMaterials(lessonMaterials);
    } catch (err) {
      setError('Không thể tải thông tin bài học. Vui lòng thử lại sau.');
      console.error('Error fetching lesson details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lessonId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
      try {
        await onDeleteLesson(lessonId);
        if (expandedLesson?.id === lessonId) {
          setExpandedLesson(null);
          setMaterials([]);
        }
        setProgressData((prev) => {
          const newProgress = { ...prev };
          delete newProgress[lessonId];
          return newProgress;
        });
        setCompletedMaterials((prev) => {
          const newCompleted = { ...prev };
          delete newCompleted[lessonId];
          return newCompleted;
        });
        setLessonMaterials((prev) => {
          const newMaterials = { ...prev };
          delete newMaterials[lessonId];
          return newMaterials;
        });
      } catch (err) {
        console.error('Error deleting lesson:', err);
        setError('Lỗi khi xóa bài học');
      }
    }
  };

  const handleViewProgress = (lessonId) => {
    if (showProgressDetail === lessonId) {
      setShowProgressDetail(null);
    } else {
      setShowProgressDetail(lessonId);
      fetchProgress(lessonId);
    }
  };

  if (!lessons?.length) {
    return (
      <div className="lesson-list-container">
        <div className="lesson-list">
          <p>Chưa có bài học nào trong khóa học này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-list-container">
      <ul className="lesson-list">
        {lessons.map((lesson) => (
          <li key={lesson.id} className="lesson-item">
            <div className="lesson-header">
              <strong>{lesson.title}</strong>
              <div className="lesson-buttons">
                <button
                  onClick={() => handleViewDetail(lesson.id)}
                  className={`detail-btn ${expandedLesson?.id === lesson.id ? 'active' : ''}`}
                >
                  {expandedLesson?.id === lesson.id ? 'Thu gọn' : 'Chi tiết'}
                </button>
                <button
                  onClick={() => handleViewProgress(lesson.id)}
                  className={`progress-btn ${showProgressDetail === lesson.id ? 'active' : ''}`}
                  title="Xem tiến độ của tất cả học sinh"
                >
                  Tiến độ
                </button>
                <button
                  onClick={() => handleDelete(lesson.id)}
                  className="btn-delete"
                  title="Xóa bài học"
                >
                  Xóa
                </button>
              </div>
            </div>

            {expandedLesson?.id === lesson.id && (
              <div className="lesson-detail">
                {loading ? (
                  <div className="loading">
                    <span>⏳</span> Đang tải thông tin bài học...
                  </div>
                ) : error ? (
                  <div className="error">{error}</div>
                ) : (
                  <div className="detail-content">
                    <p>{expandedLesson.content}</p>
                    {materials.length > 0 && (
                      <div className="materials-list">
                        {materials.map((material) => {
                          const fullUrl = `http://localhost:5000${material.file_path}`;
                          return (
                            <a
                              key={material.id}
                              href={fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="material-link"
                            >
                              <span className="file-icon">
                                {getFileIcon(material.file_path)}
                              </span>
                              <span className="file-name">{material.title}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {showProgressDetail === lesson.id && (
              <div className="progress-detail">
                <h4>Tiến độ bài học của học sinh</h4>
                {students.length > 0 ? (
                  <ul className="student-progress-list">
                    {students.map((student) => (
                      <li key={student.id} className="student-progress-item">
                        <span className="student-name">{student.name || student.username}</span>
                        <span className="student-progress-message">
                          {getProgressMessage(student.id, lesson.id)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Chưa có học sinh nào.</p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LessonList;