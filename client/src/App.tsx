import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import PostDetail from "./pages/PostDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/HomePage" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/posts/:id" element={<PostDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
