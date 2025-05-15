import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getLessonDetails } from '../api/lesson';
import { getMaterials } from '../api/material';
import { getLessonProgress, createOrUpdateLessonProgress } from '../api/lessonProgress';
import { getUserFromToken } from '../api/auth';
import { getCompletedMaterials, markMaterialCompleted } from '../api/materialCompletion';
import socket from '../socket';
import CommentSection from '../components/comments/commentSection';
import './lessonPage.css';


const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

function LessonPage() {
  const { lessonId } = useParams();
  const user = getUserFromToken();
  const studentId = user?.id;
  const isTestMode = user?.role === 'admin' || user?.role === 'teacher';

  const [lesson, setLesson] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [lessonProgress, setLessonProgress] = useState(null);
  const [completedMaterialIds, setCompletedMaterialIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const hasFetched = useRef(false);


  useEffect(() => {
    console.log('LessonPage mounted for lessonId:', lessonId);
    return () => console.log('LessonPage unmounted for lessonId:', lessonId);
  }, [lessonId]);


  const fetchLessonDetails = useCallback(
    debounce(async () => {
      if (hasFetched.current) {
        console.log('Skipping fetchLessonDetails, already fetched for lessonId:', lessonId);
        return;
      }
      console.log('Fetching lesson details for lessonId:', lessonId);
      try {
        setLoading(true);
        const [lessonData, materialsData, progressData, completedIds] = await Promise.all([
          getLessonDetails(lessonId),
          getMaterials(lessonId),
          !isTestMode
            ? getLessonProgress(studentId, lessonId).catch(() => ({
                progress_percentage: 0,
                is_completed: false,
                completed_at: null,
              }))
            : Promise.resolve({ progress_percentage: 0, is_completed: false, completed_at: null }),
          !isTestMode ? getCompletedMaterials(studentId).catch(() => []) : Promise.resolve([]),
        ]);

        setLesson(lessonData);
        setMaterials(materialsData);
        setLessonProgress(progressData);
        setCompletedMaterialIds(completedIds);

        if (lessonData.course_id) {
          socket.joinCourseRoom(lessonData.course_id);
        } else {
          console.warn('No course_id found in lessonData:', lessonData);
        }
        hasFetched.current = true;
      } catch (err) {
        setError('Không thể tải thông tin bài học. Vui lòng thử lại sau.');
        console.error('Lỗi khi lấy chi tiết bài học:', err);
      } finally {
        setLoading(false);
      }
    }, 500),
    [lessonId, studentId, isTestMode]
  );


  const updateProgress = useCallback(
    debounce(async (newCompletedIds, shouldUpdateAPI = false) => {
      try {
        if (!studentId || isTestMode) return;

        const parsedStudentId = parseInt(studentId, 10);
        const parsedLessonId = parseInt(lessonId, 10);

        if (isNaN(parsedStudentId) || isNaN(parsedLessonId)) {
          throw new Error('Student ID hoặc Lesson ID không hợp lệ.');
        }

        const completedCount = newCompletedIds.filter((id) =>
          materials.some((m) => m.id === id)
        ).length;
        const totalMaterials = materials.length || 1;
        const newProgress = materials.length > 0 ? Math.round((completedCount / totalMaterials) * 100) : 0;
        const isCompleted = newProgress >= 100;

        console.log('Cập nhật tiến độ:', { completedCount, totalMaterials, newProgress, isCompleted });

        const newProgressData = {
          progress_percentage: newProgress,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date() : null,
        };

        if (shouldUpdateAPI) {
          try {
            const progressData = await createOrUpdateLessonProgress(
              parsedStudentId,
              parsedLessonId,
              newProgress,
              isCompleted
            );
            console.log('Progress data từ API:', progressData);

            if (progressData && typeof progressData.progress_percentage === 'number') {
              setLessonProgress(progressData);
            } else {
              console.log('Không thể lấy dữ liệu từ API, dùng dữ liệu tạm thời');
              setLessonProgress(newProgressData);
            }
          } catch (apiError) {
            console.error('API error:', apiError);
            setLessonProgress(newProgressData);
          }
        } else {
          setLessonProgress(newProgressData);
        }
      } catch (err) {
        console.error('Lỗi khi cập nhật tiến độ:', err.message, err.stack);
        setError(`Không thể cập nhật tiến độ bài học: ${err.message}`);
      }
    }, 500),
    [studentId, lessonId, isTestMode, materials]
  );

  useEffect(() => {
    if (!studentId || !user) {
      setError('Không xác định được người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    console.log('useEffect running for lessonId:', lessonId, 'studentId:', studentId);
    fetchLessonDetails();

    // Socket event handlers
    const handleMaterialCreated = ({ material }) => {
      if (material.lesson_id === parseInt(lessonId)) {
        setMaterials((prev) => {
          if (!prev.some((m) => m.id === material.id)) {
            return [...prev, material];
          }
          return prev;
        });
        updateProgress(completedMaterialIds, true);
      }
    };

    const handleMaterialDeleted = ({ materialId, lessonId: deletedLessonId }) => {
      if (deletedLessonId === parseInt(lessonId)) {
        setMaterials((prev) => prev.filter((m) => m.id !== materialId));
        updateProgress(completedMaterialIds, true);
      }
    };

    const handleMaterialCompleted = ({ student_id, material_id, progressData }) => {
      if (student_id === parseInt(studentId)) {
        console.log('Nhận materialCompleted:', { student_id, material_id, progressData });
        setCompletedMaterialIds((prev) => {
          if (!prev.includes(material_id)) {
            const updatedIds = [...prev, material_id];
            updateProgress(updatedIds, true);
            return updatedIds;
          }
          return prev;
        });
        if (progressData && typeof progressData.progress_percentage === 'number') {
          setLessonProgress(progressData);
        }
      }
    };

    const handleLessonProgressCreated = ({ studentId: updatedStudentId, lessonId: updatedLessonId, progressData }) => {
      if (updatedStudentId === parseInt(studentId) && updatedLessonId === parseInt(lessonId)) {
        console.log('Nhận lessonProgressCreated:', progressData);
        if (progressData && typeof progressData.progress_percentage === 'number') {
          setLessonProgress(progressData);
        }
      }
    };

    const handleLessonProgressUpdated = ({ studentId: updatedStudentId, lessonId: updatedLessonId, progressData }) => {
      if (updatedStudentId === parseInt(studentId) && updatedLessonId === parseInt(lessonId)) {
        console.log('Nhận lessonProgressUpdated:', progressData);
        if (progressData && typeof progressData.progress_percentage === 'number') {
          setLessonProgress(progressData);
        }
      }
    };


    socket.onMaterialCreated(handleMaterialCreated);
    socket.onMaterialDeleted(handleMaterialDeleted);
    socket.onMaterialCompleted(handleMaterialCompleted);
    socket.onLessonProgressCreated(handleLessonProgressCreated);
    socket.onLessonProgressUpdated(handleLessonProgressUpdated);

    return () => {
      console.log('Cleaning up useEffect for lessonId:', lessonId);
      socket.onMaterialCreated(() => {});
      socket.onMaterialDeleted(() => {});
      socket.onMaterialCompleted(() => {});
      socket.onLessonProgressCreated(() => {});
      socket.onLessonProgressUpdated(() => {});
    };
  }, [lessonId, studentId, isTestMode, fetchLessonDetails, updateProgress, completedMaterialIds]);

  const handleMaterialClick = useCallback(
    async (materialId) => {
      if (isTestMode) return;

      try {
        const parsedStudentId = parseInt(studentId, 10);
        const parsedLessonId = parseInt(lessonId, 10);

        if (isNaN(parsedStudentId) || isNaN(parsedLessonId)) {
          throw new Error('Student ID hoặc Lesson ID không hợp lệ.');
        }

        if (!completedMaterialIds.includes(materialId)) {
          console.log('Đánh dấu tài liệu hoàn thành:', { studentId: parsedStudentId, materialId });
          const response = await markMaterialCompleted(parsedStudentId, materialId);
          console.log('Phản hồi từ markMaterialCompleted:', response);

          const updatedCompletedIds = [...completedMaterialIds, materialId];
          setCompletedMaterialIds(updatedCompletedIds);
          updateProgress(updatedCompletedIds, true);
        }
      } catch (err) {
        console.error('Lỗi khi đánh dấu tài liệu hoàn thành:', err.message, err.stack);
        setError(`Không thể đánh dấu tài liệu hoàn thành: ${err.message}`);
      }
    },
    [isTestMode, studentId, lessonId, completedMaterialIds, updateProgress]
  );

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
    return icons[ext] || '/image/document-icon.jpg';
  };

  const renderFileIcon = (filename) => {
    const icon = getFileIcon(filename);
    return <img src={icon} alt="File icon" className="material-icon-img" style={{ width: '24px', height: '24px' }} />;
  };

  const progressPercentage = lessonProgress?.progress_percentage || 0;
  const progressMessage =
    progressPercentage === 0
      ? 'Bạn chưa học nội dung nào'
      : progressPercentage === 100
      ? '🎉 Chúc mừng bạn đã hoàn thành tất cả các tài liệu cho bài học này!'
      : `${Math.round(progressPercentage)}% đã hoàn thành (còn ${materials.length - Math.round(progressPercentage / (100 / materials.length))} tài liệu)`;

  if (loading) {
    return (
      <div className="lesson-page loading">
        <span>⏳</span> Đang tải thông tin bài học...
        <div className="materials-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="material-card skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="lesson-page error">⚠️ {error}</div>;
  }

  if (!lesson) {
    return (
      <div className="lesson-page error">
        Không tìm thấy bài học hoặc bài học không hợp lệ.
      </div>
    );
  }

  return (
    <div className="lesson-page">
      {isTestMode && (
        <div className="test-mode-banner">
           Bạn đang xem trang dưới vai trò <strong>{user.role}</strong>. Tiến độ sẽ không được lưu.
        </div>
      )}

      <div className="lesson-content">
        <h1 className="lesson-title">{lesson.title}</h1>
        <div className="lesson-description">{lesson.content}</div>

        {materials.length > 0 ? (
          <div className="lesson-materials">
            <h2>Bài học</h2>
            <div className="materials-grid">
              {materials.map((material) => (
                <div key={material.id} className={`material-card ${completedMaterialIds.includes(material.id) ? 'completed' : ''}`}>
                  <a
                    href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${material.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="material-link"
                    aria-label={`Mở tài liệu ${material.title}`}
                    onClick={() => handleMaterialClick(material.id)}
                  >
                    {renderFileIcon(material.file_path)}
                    <span className="material-name">{material.title}</span>
                    {completedMaterialIds.includes(material.id) && <span className="completed-check">✔</span>}
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-materials">Không có tài liệu nào cho bài học này.</div>
        )}

        {progressMessage && (
          <div className="lesson-progress-message">
            {progressMessage}
          </div>
        )}
      </div>
      <CommentSection lessonId={lessonId} />
    </div>
  );
}

export default LessonPage;