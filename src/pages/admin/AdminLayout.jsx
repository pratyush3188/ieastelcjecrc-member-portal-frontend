import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';
import logo from '../../assets/Iaeste Logo Standard 2.png';
import AdminSidebar from '../../components/AdminSidebar';
import { apiFetch, clearAuthSession, getAuthToken } from '../../utils/api';

const PATH_TITLES = {
    '/admin-dashboard': 'Admin Overview',
    '/admin-dashboard/offers': 'Manage Offers',
    '/admin-dashboard/approve-members': 'Approve Members',
    '/admin-dashboard/applications': 'Applications',
    '/admin-dashboard/members': 'Members',
    '/admin-dashboard/notifications': 'Notifications',
    '/admin-dashboard/recent-activity': 'Recent Activity',
    '/admin-dashboard/settings': 'Settings',
};

function getPageTitle(pathname) {
    return PATH_TITLES[pathname] || pathname.replace('/admin-dashboard', '').replace(/^\//, '').replace(/-/g, ' ') || 'Admin';
}

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [logoutCountdown, setLogoutCountdown] = useState(4);
    const navigate = useNavigate();
    const location = useLocation();
    const pageTitle = getPageTitle(location.pathname);

    const verifyAdmin = () => {
        const token = getAuthToken();
        if (!token) {
            navigate('/login');
            return;
        }
        apiFetch('/api/me')
            .then((me) => {
                if (me?.user?.role !== 'admin') {
                    clearAuthSession();
                    navigate('/login');
                }
            })
            .catch(() => {
                clearAuthSession();
                navigate('/login');
            });
    };

    useEffect(() => {
        document.title = `Admin | IAESTE LC JECRC`;
        verifyAdmin();
    }, [navigate]);

    useEffect(() => {
        const onFocus = () => {
            const token = getAuthToken();
            if (!token) return;
            apiFetch('/api/me')
                .then((me) => {
                    if (me?.user?.role !== 'admin') {
                        clearAuthSession();
                        navigate('/login');
                    }
                })
                .catch(() => {
                    clearAuthSession();
                    navigate('/login');
                });
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [navigate]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setSidebarOpen(!mobile);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!showLogoutConfirm) return undefined;
        setLogoutCountdown(4);
        const id = setInterval(() => {
            setLogoutCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(id);
                    clearAuthSession();
                    navigate('/login');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [showLogoutConfirm, navigate]);

    const mainMargin = isMobile ? 'ml-0' : (sidebarOpen ? 'ml-[280px]' : 'ml-[88px]');

    return (
        <div className="min-h-screen bg-[#F4F6F8] font-sans text-[#1F2937] relative">
            <div className="fixed top-0 left-0 right-0 z-50 h-20 bg-white flex items-center justify-between px-4 md:px-8 shadow-sm border-b border-gray-200">
                <div className="flex items-center">
                    {isMobile && (
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <MenuIcon />
                        </button>
                    )}
                    <img src={logo} alt="IAESTE" className="h-8 md:h-12 w-auto object-contain mr-4 md:mr-6" />
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 border-l border-gray-200 pl-4 md:pl-6 truncate max-w-[150px] md:max-w-none capitalize">
                        {pageTitle}
                    </h2>
                </div>
                <div className="flex items-center space-x-2 md:space-x-6">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#0B3D59] text-white flex items-center justify-center font-bold text-sm md:text-base">
                        A
                    </div>
                </div>
            </div>

            <AdminSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                isMobile={isMobile}
                onLogout={clearAuthSession}
                onLogoutRequest={() => setShowLogoutConfirm(true)}
            />

            <div className={`flex-1 transition-all duration-300 pt-20 ${mainMargin}`}>
                <main className="p-4 md:p-8">
                    <Outlet />
                </main>
            </div>

            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-800">Confirm Logout</h3>
                        <p className="text-sm text-gray-600 mt-2">
                            You will be logged out automatically in <span className="font-bold text-[#0B3D59]">{logoutCountdown}s</span>.
                        </p>
                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
                            >
                                Stay Logged In
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    clearAuthSession();
                                    navigate('/login');
                                }}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                            >
                                Logout Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
