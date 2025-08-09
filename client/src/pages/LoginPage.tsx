import React from "react";
import AuthForm from "../components/AuthForm";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      email: form.get("email"),
      password: form.get("password"),
    };
    console.log("Đăng nhập với:", data);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        data
      );
      console.log("Token:", res.data.token);
      alert("Đăng nhập thành công");
      const token = res.data.token;
      localStorage.setItem("token", token);
      console.log("Stored Token:", token);
      navigate("/");
    } catch (error: any) {
      console.error(
        "Lỗi đăng nhập:",
        error.response?.data?.message || error.message
      );
      alert("Đăng nhập thất bại");
    }
  };

  return <AuthForm title="Đăng nhập" onSubmit={handleLogin} />;
}

export default LoginPage;
