import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useUser } from "../hook/useUser";
import "../styles/HomePage.css";

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  comments: any[];
}

const MAX_CONTENT_LENGTH = 150;

const HomePage = () => {
  const { user } = useUser();

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [search, setSearch] = useState("");
  const [viewMyPosts, setViewMyPosts] = useState(false);
  const [total, setTotal] = useState(0);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const token = localStorage.getItem("token");

  const fetchPosts = async () => {
    if (!token) return;
    try {
      const url = viewMyPosts
        ? `http://localhost:5000/api/posts/my-posts?page=${page}&limit=${limit}&search=${encodeURIComponent(
            search
          )}`
        : `http://localhost:5000/api/posts?page=${page}&limit=${limit}&search=${encodeURIComponent(
            search
          )}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts(res.data.posts);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Lỗi khi lấy bài viết:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, search, viewMyPosts]);

  const toggleViewMyPosts = () => {
    setPage(1);
    setViewMyPosts(!viewMyPosts);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setSearch(e.target.value);
  };

  const nextPage = () => {
    if (page * limit < total) setPage(page + 1);
  };
  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung!");
      return;
    }
    if (newContent.length > 2000) {
      alert("Nội dung bài viết không được vượt quá 2000 ký tự");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/posts",
        { title: newTitle, content: newContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Tạo bài viết thành công!");
      setNewTitle("");
      setNewContent("");
      setShowCreateForm(false);
      setPage(1);
      fetchPosts();
    } catch (err) {
      console.error("Lỗi tạo bài viết:", err);
      alert("Tạo bài viết thất bại!");
    }
  };

  const getShortContent = (content: string) => {
    if (content.length <= MAX_CONTENT_LENGTH) return content;
    return content.slice(0, MAX_CONTENT_LENGTH) + "...";
  };

  const defaultAvatar = "/default-avatar.png";

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Danh sách bài viết</h2>

        <div className="buttons-group">
          <button onClick={toggleViewMyPosts}>
            {viewMyPosts ? "Xem tất cả bài viết" : "Xem bài viết của tôi"}
          </button>

          <button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "Đóng" : "Tạo bài viết mới"}
          </button>

          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {showCreateForm && (
          <div className="create-post-form">
            <input
              type="text"
              placeholder="Tiêu đề"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea
              placeholder="Nội dung"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              maxLength={2000}
            />
            <div className="char-count">{newContent.length} / 2000 ký tự</div>
            <button onClick={handleCreatePost}>Đăng bài</button>
          </div>
        )}

        {posts.length === 0 ? (
          <p>Không có bài viết nào.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="post-card"
              onClick={() => (window.location.href = `/posts/${post.id}`)}
            >
              <div className="post-header">
                <img
                  src={post.authorAvatar || defaultAvatar}
                  alt={post.authorName}
                />
                <div>
                  <strong>{post.authorName}</strong>
                  <small>{new Date(post.createdAt).toLocaleString()}</small>
                </div>
              </div>

              <h3 className="post-title">{post.title}</h3>
              <p className="post-content">{getShortContent(post.content)}</p>
            </div>
          ))
        )}

        <div className="pagination">
          <button onClick={prevPage} disabled={page === 1}>
            Trang trước
          </button>
          <span>
            Trang {page} / {Math.ceil(total / limit)}
          </span>
          <button onClick={nextPage} disabled={page * limit >= total}>
            Trang sau
          </button>
        </div>
      </div>
    </>
  );
};

export default HomePage;
