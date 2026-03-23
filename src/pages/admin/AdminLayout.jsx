import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, Search as SearchIcon } from '@mui/icons-material';
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
    '/admin-dashboard/settings': 'Settings',
};

function getPageTitle(pathname) {
    return PATH_TITLES[pathname] || pathname.replace('/admin-dashboard', '').replace(/^\//, '').replace(/-/g, ' ') || 'Admin';
}

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
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
                    <div className="relative hidden md:block">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-[#0B3D59]/20 w-48 lg:w-64 text-sm"
                        />
                    </div>
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
            />

            <div className={`flex-1 transition-all duration-300 pt-20 ${mainMargin}`}>
                <main className="p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
