import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useUser } from "../hook/useUser";
import "../styles/PostDetail.css";

interface Comment {
  id: number;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

interface PostDetailType {
  id: number;
  authorId: string;
  title: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  comments: Comment[];
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser(); // Lấy thông tin user hiện tại
  const [post, setPost] = useState<PostDetailType | null>(null);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [editPostMode, setEditPostMode] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostContent, setEditPostContent] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const defaultAvatar = "/default-avatar.png";

  useEffect(() => {
    if (!id || !token) {
      navigate("/login");
      return;
    }
    fetchPostDetail();
  }, [id, token, navigate]);

  const fetchPostDetail = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost(res.data);
      // Nếu đang ở chế độ edit post, cập nhật lại dữ liệu edit
      setEditPostTitle(res.data.title);
      setEditPostContent(res.data.content);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết bài viết", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert("Vui lòng nhập bình luận");
      return;
    }
    try {
      await axios.post(
        `http://localhost:5000/api/posts/${id}/comments`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      fetchPostDetail();
    } catch (err) {
      console.error("Lỗi khi thêm bình luận", err);
      alert("Thêm bình luận thất bại!");
    }
  };

  // Sửa bình luận
  const startEditComment = (commentId: number, currentText: string) => {
    setEditCommentId(commentId);
    setEditCommentText(currentText);
  };

  const cancelEditComment = () => {
    setEditCommentId(null);
    setEditCommentText("");
  };

  const saveEditComment = async () => {
    if (!editCommentText.trim()) {
      alert("Nội dung bình luận không được để trống");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/posts/${id}/comments/${editCommentId}`,
        { text: editCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditCommentId(null);
      setEditCommentText("");
      fetchPostDetail();
    } catch (err) {
      console.error("Lỗi khi cập nhật bình luận", err);
      alert("Cập nhật bình luận thất bại!");
    }
  };

  // Xóa bình luận
  const deleteComment = async (commentId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/posts/${id}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPostDetail();
    } catch (err) {
      console.error("Lỗi khi xóa bình luận", err);
      alert("Xóa bình luận thất bại!");
    }
  };

  // Sửa bài viết
  const startEditPost = () => {
    setEditPostMode(true);
  };

  const cancelEditPost = () => {
    if (post) {
      setEditPostTitle(post.title);
      setEditPostContent(post.content);
    }
    setEditPostMode(false);
  };

  const saveEditPost = async () => {
    if (!editPostTitle.trim() || !editPostContent.trim()) {
      alert("Tiêu đề và nội dung không được để trống");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/posts/${id}`,
        { title: editPostTitle, content: editPostContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditPostMode(false);
      fetchPostDetail();
    } catch (err) {
      console.error("Lỗi khi cập nhật bài viết", err);
      alert("Cập nhật bài viết thất bại!");
    }
  };

  // Xóa bài viết
  const deletePost = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Xóa bài viết thành công!");
      navigate("/");
    } catch (err) {
      console.error("Lỗi khi xóa bài viết", err);
      alert("Xóa bài viết thất bại!");
    }
  };

  if (!post) return <p>Đang tải...</p>;

  return (
    <>
      <Navbar />
      <div className="container">
        {/* Thông tin tác giả bài viết */}
        <div className="post-author">
          <img
            src={post.authorAvatar || defaultAvatar}
            alt={post.authorName}
          />
          <div>
            <strong>{post.authorName}</strong>
            <br />
            <small>{new Date(post.createdAt).toLocaleString()}</small>
          </div>
          {/* Nút sửa, xóa bài viết nếu là tác giả */}
          {user?.id === post.authorId && (
            <div className="post-actions">
              {!editPostMode ? (
                <>
                  <button onClick={startEditPost}>Sửa bài viết</button>
                  <button onClick={deletePost} className="delete">
                    Xóa bài viết
                  </button>
                </>
              ) : (
                <>
                  <button onClick={saveEditPost}>Lưu</button>
                  <button onClick={cancelEditPost} className="cancel">
                    Hủy
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Hiển thị form sửa bài viết hoặc nội dung bài viết */}
        {editPostMode ? (
          <div className="edit-post-form">
            <input
              type="text"
              value={editPostTitle}
              onChange={(e) => setEditPostTitle(e.target.value)}
            />
            <textarea
              value={editPostContent}
              onChange={(e) => setEditPostContent(e.target.value)}
            />
          </div>
        ) : (
          <>
            <h2 className="post-title">{post.title}</h2>
            <p className="post-content">{post.content}</p>
          </>
        )}

        <hr />

        <div className="comments-section">
          <h3>Bình luận ({post.comments.length})</h3>

          {post.comments.length === 0 && <p>Chưa có bình luận nào.</p>}

          {post.comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <img
                src={comment.authorAvatar || defaultAvatar}
                alt={comment.authorName}
                className="comment-avatar"
              />
              <div className="comment-content">
                <strong>{comment.authorName}</strong>
                <small>{new Date(comment.createdAt).toLocaleString()}</small>

                {editCommentId === comment.id ? (
                  <>
                    <textarea
                      className="edit-comment-textarea"
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                    />
                    <div className="edit-comment-actions">
                      <button onClick={saveEditComment}>Lưu</button>
                      <button onClick={cancelEditComment} className="cancel">
                        Hủy
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="comment-text">{comment.text}</p>
                )}
              </div>

              {user?.id === comment.authorId && editCommentId !== comment.id && (
                <div className="comment-actions">
                  <button
                    onClick={() => startEditComment(comment.id, comment.text)}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="delete"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="add-comment">
          <textarea
            placeholder="Viết bình luận..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            maxLength={2000}
          />
          <button onClick={handleAddComment}>Gửi bình luận</button>
        </div>
      </div>
    </>
  );
};

export default PostDetail;
