import React from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import './App.css'
import MainNavbar from "./components/layout/Navbar-Top";
import Footer from "./components/layout/Footer";
import Error from "./pages/Error";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/client/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import ExamDashboard from "./pages/admin/Exam-Overview";
import CreateExam from "./pages/admin/Create-Exam";
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
import CodingPlatform from "./pages/client/CodeEditior";
import QuestionPaperResult from "./pages/client/Result";
import LiveLogsViewer from "./pages/dev/Logs";
import CreateUser from "./pages/dev/New-User";
import CreateFacultyAdmin from "./pages/dev/New-Admin";
import ViewQuestionPaper from "./pages/admin/View-Exam";
import UserManagement from "./pages/admin/User-Overview";
import CreateNewUser from "./pages/admin/New-User";
import EditExam from "./pages/admin/Edit-Exam";
import EditUser from "./pages/admin/Edit-User";
import ResultOverview from "./pages/admin/Result-Overview";
import StudentResultsPage from "./pages/admin/Results";
import QuestionPaperResultView from "./pages/admin/Result";
import LeaderboardOverview from "./pages/admin/Leaderboard";
import SingleUserResults from "./pages/admin/User-Results";
import CodingProblemForm from "./pages/admin/Create-Problem";
import ExamListPage from "./pages/client/All-exams";
import UpdateProfile from "./pages/client/Edit-Profile";
import GlobalLeaderboardOverview from "./pages/client/Global-Leaderboard";
import CodeProblemDashboard from "./pages/admin/Code-Exam-Overview";
import CodingProblemPlatform from "./pages/client/Solve-Code";
import CodingContestPlatform from "./pages/client/Code-Contest";
import CodeContestDashboard from "./pages/admin/Coding-Contest-Overview";
import CodingContestForm from "./pages/admin/Create-Contest";
import QuizLeaderboardOverview from "./pages/client/Quiz-Leaderboard";
import EditProfileFacultyAdmin from "./pages/admin/Edit-Profile";
import ContestResult from "./pages/admin/Contest-Result";
import About from "./pages/About";
import EditCodingContestForm from "./pages/admin/Edit-Contest";
import FAQ from "./pages/FAQ";




const App = () => {
  const location = useLocation();
  const isDeveloperRoute = location.pathname.startsWith("/developer");
  const isQuestionPaperRoute = location.pathname.startsWith("/user/paper");
  const isCodingContestRoute = location.pathname.startsWith("/user/coding-contest")
  return (
    <>
        <div className="app">
          {/* Navbar */}
          {(!isDeveloperRoute && !isQuestionPaperRoute && !isCodingContestRoute) && <MainNavbar />}

          {/* Routes */}
          <Routes>
            <Route exact path="/" element={<HomePage />} />
            <Route exact path="/login" element={<LoginPage />} />
            <Route exact path="/about" element={<About />} />
            <Route exact path="/faq" element={<FAQ />} />

            {/* Developer Routes */}
            <Route path="/developer/login" element={<DeveloperLogin />} />
            <Route exact path="/developer/dev" element={<DeveloperLayout />}>
              <Route exact path="dashboard" element={<DeveloperDashboard />} />
              <Route exact path="see-all-users" element={<SeeAllUsers />} />
              <Route exact path="see-all-admins" element={<SeeAllAdmins />} />
              <Route exact path="logs" element={<LiveLogsViewer />} />
              <Route exact path="new-user" element={<CreateUser />} />
              <Route exact path="new-faculty" element={<CreateFacultyAdmin />} />
            </Route>
            
            

            {/* User Routes */}
            <Route exact path="/user" element={<UserLayout />} >
              <Route exact path="dashboard" element={<Dashboard />} />
              <Route exact path="exams" element={<ExamListPage />} />
              <Route exact path="global-leaderboard" element={<GlobalLeaderboardOverview />} />
              <Route exact path="quiz-leaderboard/:paperKey" element={<QuizLeaderboardOverview />} />
              <Route exact path="edit-profile" element={<UpdateProfile />} />
              <Route exact path="paper/:title/:paperKey/:id" element={<ExamInterface />} />
              <Route exact path="results" element={<UserResults />} />
              <Route exact path="editor" element={<CodingPlatform />} />
              <Route exact path="problem-solving/:id" element={<CodingProblemPlatform />} />
              <Route exact path="coding-contest/:id" element={<CodingContestPlatform />} />
              <Route exact path="result/:userid/:paperkey" element={<QuestionPaperResult />} />
            </Route>


            {/* Admin Routes */}
            <Route exact path="/admin" element={<AdminLayout />}>
              <Route exact path="dashboard" element={<AdminDashboard />} />
              <Route exact path="edit-profile" element={<EditProfileFacultyAdmin />} />
              <Route exact path="dashboard/exam" element={<ExamDashboard />} />
              <Route exact path="dashboard/code" element={<CodeProblemDashboard />} />
              <Route exact path="dashboard/contest" element={<CodeContestDashboard />} />
              <Route exact path="user-management" element={<UserManagement />} />
              <Route exact path="result-management" element={<ResultOverview />} />
              <Route exact path="new-user" element={<CreateNewUser />} />
              <Route exact path="edit-user/:userId" element={<EditUser />} />
              <Route exact path="create-exam" element={<CreateExam />} />
              <Route exact path="create-problem" element={<CodingProblemForm />} />
              <Route exact path="create-contest" element={<CodingContestForm />} />
              <Route exact path="edit-exam/question_paper/:examId/:title/:paperkey" element={<EditExam />} />
              <Route exact path="edit-contest/:id" element={<EditCodingContestForm />} />
              <Route exact path="view-exam/question_paper/:examId/:title/:paperkey" element={<ViewQuestionPaper />} />
              <Route exact path="view-result/question_paper/:paperkey/:title" element={<StudentResultsPage />} />
              <Route exact path="view-result/contest/:id" element={<ContestResult />} />
              <Route exact path="result/:userId/:paperkey/:name" element={<QuestionPaperResultView />} />
              <Route exact path="leaderboard" element={<LeaderboardOverview />} />
              <Route exact path="results/:userId/:name" element={<SingleUserResults />} />
            </Route>

            <Route path="*" element={<Error />} />

          </Routes>

          {/* Footer */}
          {(!isDeveloperRoute && !isQuestionPaperRoute && !isCodingContestRoute)  && <Footer />}
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
