import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCommentsByLesson, createComment, deleteComment } from '../../api/comment';
import { getUserFromToken } from '../../api/auth';
import { connectSocket, getSocket, onNewComment, onDeleteComment } from '../../socket';
import './commentSection.css';

function CommentSection({ lessonId }) {
  const user = getUserFromToken();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      console.log('Connecting socket for user:', user.id);
      connectSocket();
    } else {
      console.warn('No user, skipping socket connection');
    }

    const handleNewComment = (incoming) => {
      console.log('Handling new comment:', incoming);
      if (incoming.lesson_id === parseInt(lessonId)) {
        setComments((prev) => {
          if (!prev.find((c) => c.id === incoming.id)) {
            console.log('Adding new comment to state:', incoming);
            return [...prev, incoming];
          }
          console.log('Comment already exists, skipping:', incoming.id);
          return prev;
        });
      } else {
        console.log('Comment not for this lesson:', incoming.lesson_id, lessonId);
      }
    };

    const handleDeleteComment = ({ commentId, lesson_id }) => {
      console.log('Handling delete comment:', { commentId, lesson_id });
      if (lesson_id === parseInt(lessonId)) {
        setComments((prev) => {
          const updated = prev.filter((c) => c.id !== commentId);
          console.log('Comments after deletion:', updated);
          return updated;
        });
      } else {
        console.log('Delete comment not for this lesson:', lesson_id, lessonId);
      }
    };

    onNewComment(handleNewComment);
    onDeleteComment(handleDeleteComment);

    return () => {
      console.log('Cleaning up socket listeners');
      const socket = getSocket();
      if (socket) {
        socket.off('newComment', handleNewComment);
        socket.off('deleteComment', handleDeleteComment);
      }
    };
  }, [user, lessonId]);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching comments for lesson:', lessonId);
        const data = await getCommentsByLesson(lessonId, navigate);
        setComments(Array.isArray(data) ? data : []);
        console.log('Comments loaded:', data);
      } catch (err) {
        setError(err.message || 'Không thể tải bình luận.');
        setComments([]);
        console.error('Error loading comments:', err);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchComments();
    } else {
      setError('Không tìm thấy bài học.');
      setLoading(false);
      console.warn('No lessonId provided');
    }
  }, [lessonId, navigate]);

  const handleCommentSubmit = async (e, parentId = null) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('Vui lòng nhập nội dung bình luận.');
      console.warn('Empty comment submitted');
      return;
    }

    setError(null);
    try {
      const commentData = {
        lesson_id: parseInt(lessonId),
        content: newComment,
        parent_id: parentId,
      };
      console.log('Submitting comment:', commentData);
      await createComment(commentData, navigate);
      setNewComment('');
      setReplyTo(null);
      console.log('Comment submitted successfully');
    } catch (err) {
      setError(err.message || 'Không thể gửi bình luận.');
      console.error('Error submitting comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return;

    try {
      console.log('Deleting comment:', commentId);
      await deleteComment(commentId, lessonId, navigate);
      console.log('Comment deleted successfully');
    } catch (err) {
      setError(err.message || 'Không thể xóa bình luận.');
      console.error('Error deleting comment:', err);
    }
  };

  const buildCommentTree = (comments) => {
    const map = {};
    const tree = [];

    comments.forEach((c) => {
      c.children = [];
      map[c.id] = c;
    });

    comments.forEach((c) => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].children.push(c);
      } else {
        tree.push(c);
      }
    });

    return tree;
  };

  const commentTree = buildCommentTree(comments);

  const renderComment = (comment, level = 0) => (
    <div key={comment.id} className={`comment-item level-${level}`}>
      <strong>{comment.user_name || 'Người dùng'}</strong>: {comment.content}
      <div className="comment-meta">
        <span>{new Date(comment.created_at).toLocaleString()}</span>
        {comment.user_id === user.id && (
          <button onClick={() => handleDeleteComment(comment.id)} className="delete-btn">
            Xóa
          </button>
        )}
        <button onClick={() => setReplyTo(comment.id)} className="reply-btn">
          Trả lời
        </button>
      </div>
      {replyTo === comment.id && (
        <form onSubmit={(e) => handleCommentSubmit(e, comment.id)} className="reply-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Viết câu trả lời..."
            rows="2"
            required
          />
          <div>
            <button type="submit" disabled={!newComment.trim()}>
              Gửi
            </button>
            <button type="button" onClick={() => setReplyTo(null)}>
              Hủy
            </button>
          </div>
        </form>
      )}
      {comment.children.length > 0 && (
        <div className="comment-replies">
          {comment.children.map((child) => renderComment(child, level + 1))}
        </div>
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="lesson-comments">
        Vui lòng <a href="/login">đăng nhập</a> để xem và gửi bình luận.
      </div>
    );
  }

  return (
    <div className="lesson-comments">
      <h2>Hỏi Đáp</h2>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Đang tải bình luận...</div>}
      {!loading && comments.length === 0 && !error && (
        <div className="no-comments">Chưa có bình luận nào.</div>
      )}

      <form onSubmit={handleCommentSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Viết bình luận..."
          rows="3"
          required
        />
        <button type="submit" disabled={!newComment.trim()}>
          Gửi
        </button>
      </form>

      <div className="comment-list">{commentTree.map((comment) => renderComment(comment))}</div>
    </div>
  );
}

export default CommentSection;