import React from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import './App.css'
import MainNavbar from "./components/layout/navbar";
import Footer from "./components/layout/Footer";
import Error from "./pages/Error";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/client/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import ExamDashboard from "./pages/admin/Exam-Overview";
import CreateExam from "./pages/admin/Create-Exam,";
import ExamInterface from "./pages/client/Question-Paper";
import { AdminLayout } from "./components/layout/Admin-Layout";
import { UserLayout } from "./components/layout/User-Layout";

// Deveoper Pages
import DeveloperDashboard from "./pages/dev/Dashboard";
import SeeAllUsers from "./pages/dev/All-Users";
import DeveloperLogin from "./pages/dev/Login-Dev";
import { DeveloperLayout } from "./components/layout/Developer-Layout";
import SeeAllAdmins from "./pages/dev/All-Admins";
import UserResults from "./pages/client/Results";




const App = () => {
  const location = useLocation();
  const isDeveloperRoute = location.pathname.startsWith("/developer");
  return (
    <>
        <div className="app">
          {/* Navbar */}
          {!isDeveloperRoute && <MainNavbar />}

          {/* Routes */}
          <Routes>
            <Route exact path="/" element={<HomePage />} />
            <Route exact path="/login" element={<LoginPage />} />

            {/* Developer Routes */}
            <Route path="/developer/login" element={<DeveloperLogin />} />
            <Route exact path="/developer/dev" element={<DeveloperLayout />}>
              <Route exact path="dashboard" element={<DeveloperDashboard />} />
              <Route exact path="see-all-users" element={<SeeAllUsers />} />
              <Route exact path="see-all-admins" element={<SeeAllAdmins />} />
            </Route>

            {/* User Routes */}
            <Route exact path="/user" element={<UserLayout />} >

              <Route exact path="dashboard" element={<Dashboard />} />
              <Route exact path="paper/:title/:paperKey/:id" element={<ExamInterface />} />
              <Route exact path="results" element={<UserResults />} />
            </Route>


            {/* Admin Routes */}
            <Route exact path="/admin" element={<AdminLayout />}>
              <Route exact path="dashboard" element={<AdminDashboard />} />
              <Route exact path="dashboard/exam" element={<ExamDashboard />} />
              <Route exact path="create-exam" element={<CreateExam />} />
            </Route>

            <Route path="*" element={<Error />} />

          </Routes>

          {/* Footer */}
          {!isDeveloperRoute && <Footer />}
        </div>
    </>
  )
}

const AppWrapper = () => {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

export default AppWrapper;
