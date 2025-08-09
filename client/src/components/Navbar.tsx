import React, { useRef } from "react";
import { useUser } from "../hook/useUser";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Navbar.css";

const API_URL = process.env.REACT_APP_API_URL;

function Navbar() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 200 * 1024) {
      alert("File ảnh quá lớn, vui lòng chọn ảnh nhỏ hơn 200KB");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axios.put(
        `${API_URL}/api/user/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser((prev) => (prev ? { ...prev, avatar: response.data.url } : prev));
      alert("Cập nhật avatar thành công");
    } catch (error) {
      alert("Cập nhật avatar thất bại");
    }
  };

  return (
    <nav className="navbar">
      <h2 className="navbar-logo">My App</h2>
      <div className="navbar-right">
        {user ? (
          <>
            <img
              src={user.avatar || "https://via.placeholder.com/40"}
              alt="avatar"
              className="navbar-avatar"
              onClick={handleAvatarClick}
            />
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleFileChange}
            />
            <span className="navbar-username">{user.name}</span>
            <button onClick={handleLogout} className="navbar-button navbar-logout-btn">
              Đăng xuất
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="navbar-button navbar-login-btn"
          >
            Đăng nhập
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
