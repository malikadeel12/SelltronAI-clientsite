import React from 'react'
import { Routes, Route } from "react-router-dom";
import Home from './pages/LandingPages/Home';
import SignUp from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import PricingPage from './pages/LandingPages/PricingPage';
import ContactPage from './pages/LandingPages/ContactPage';
import AboutPage from './pages/LandingPages/AboutPage';
import TermsPage from './pages/LandingPages/TermsPage';
import PredatorDashboard from './pages/Cockpit/PredatorDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import AdminUsers from './pages/Dashboard/AdminUsers';
import ProfileCover from './components/ProfileCover';
import ProtectedRoute from './components/ProtectedRoute';
function App() {
  return (
    <Routes>
      {/* Default route = Sign Up */}
      <Route path="/" element={<Home />} />
      <Route path="/pricingpage" element={<PricingPage />} />
      <Route path="/contactpage" element={<ContactPage />} />
      <Route path="/aboutpage" element={<AboutPage />} />
      <Route path="/termspage" element={<TermsPage />} />
      
      {/* Auth Routes */}
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/predatordashboard" element={
        <ProtectedRoute>
          <PredatorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <PredatorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/AdminDashboard" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/AdminUsers" element={
        <ProtectedRoute>
          <AdminUsers />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfileCover />
        </ProtectedRoute>
      } />

    </Routes>
  );
}

export default App;
