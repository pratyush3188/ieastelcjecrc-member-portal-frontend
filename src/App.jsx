import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import MemberDashboard from './pages/MemberDashboard';
import ScrollToTop from './components/ScrollToTop';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardHome from './pages/admin/AdminDashboardHome';
import ManageOffers from './pages/admin/ManageOffers';
import ApproveMembers from './pages/admin/ApproveMembers';
import Applications from './pages/admin/Applications';
import Members from './pages/admin/Members';
import Notifications from './pages/admin/Notifications';
import Settings from './pages/admin/Settings';

const App = () => {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/membership" element={<Register />} />
                {/* Member dashboard */}
                <Route path="/dashboard" element={<MemberDashboard />} />
                <Route path="/dashboard/:tab" element={<MemberDashboard />} />
                {/* Admin dashboard: layout with sidebar, each section is a separate page */}
                <Route path="/admin-dashboard" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardHome />} />
                    <Route path="offers" element={<ManageOffers />} />
                    <Route path="approve-members" element={<ApproveMembers />} />
                    <Route path="applications" element={<Applications />} />
                    <Route path="members" element={<Members />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
                {/* Fallback */}
                <Route path="*" element={<Login />} />
            </Routes>
        </Router>
    );
};

export default App;
