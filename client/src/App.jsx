import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css'
import MainNavbar from "./components/layout/navbar";
import Footer from "./components/layout/Footer";
import Error from "./pages/Error";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/client/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import ExamDashboard from "./pages/admin/Exam-Overview";
const App = () => {

  return (
    <>
      <BrowserRouter>
        <div className="app">
          {/* Navbar */}
          <MainNavbar />

          {/* Routes */}
          <Routes>
            <Route exact path="/" element={<HomePage />} />
            <Route exact path="/login" element={<LoginPage />} />
            <Route exact path="/dashboard" element={<Dashboard />} />
            <Route exact path="/admin/dashboard" element={<AdminDashboard />} />
            <Route exact path="/admin/dashboard/exam" element={<ExamDashboard />} />
            <Route path="*" element={<Error />} />

          </Routes>

          {/* Footer */}
          <Footer/>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
