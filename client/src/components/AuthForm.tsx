import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

interface AuthFormProps {
  title: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  showUsername?: boolean;
}

const AuthForm = ({ title, onSubmit, showUsername = false }: AuthFormProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === '/login';

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={onSubmit}>
        <h2>{title}</h2>
        {showUsername && (
          <input type="text" name="username" placeholder="Username" required />
        )}
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">{title}</button>
      </form>

      <div className="auth-switch">
        {isLoginPage ? (
          <>
            <span>Chưa có tài khoản?</span>
            <button onClick={() => navigate('/register')}>Đăng ký</button>
          </>
        ) : (
          <>
            <span>Đã có tài khoản?</span>
            <button onClick={() => navigate('/login')}>Đăng nhập</button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
