import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css'
import MainNavbar from "./components/layout/navbar";
import Footer from "./components/layout/Footer";
import Error from "./pages/Error";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/client/Dashboard";
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
