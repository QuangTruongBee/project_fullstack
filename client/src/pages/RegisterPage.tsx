import React from "react";
import AuthForm from "../components/AuthForm";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

function RegisterPage() {
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      username: form.get("username"),
      email: form.get("email"),
      password: form.get("password"),
    };
    console.log("Đăng ký với:", data);
    try {
      await axios.post(`${API_URL}/api/auth/register`, data);
      alert("Đăng ký thành công! Mời đăng nhập");
      navigate("/login");
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi đăng ký");
    }
  };

  return <AuthForm title="Đăng ký" onSubmit={handleRegister} showUsername />;
}

export default RegisterPage;
