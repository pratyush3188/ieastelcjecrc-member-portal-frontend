import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Dashboard as DashboardIcon,
    WorkOutline as OffersIcon,
    Assignment as ApplicationsIcon,
    People as MembersIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    CheckCircle as CheckCircleIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Campaign as CampaignIcon,
    History as HistoryIcon
} from '@mui/icons-material';

const NAV_ITEMS = [
    { path: '/admin-dashboard', pathMatch: 'exact', label: 'Dashboard', icon: DashboardIcon },
    { path: '/admin-dashboard/offers', label: 'Manage Offers', icon: OffersIcon },
    { path: '/admin-dashboard/approve-members', label: 'Approve Members', icon: CheckCircleIcon },
    { path: '/admin-dashboard/applications', label: 'Applications', icon: ApplicationsIcon },
    { path: '/admin-dashboard/members', label: 'Members', icon: MembersIcon },
    { path: '/admin-dashboard/notifications', label: 'Notifications', icon: CampaignIcon },
    { path: '/admin-dashboard/recent-activity', label: 'Recent Activity', icon: HistoryIcon },
    { path: '/admin-dashboard/settings', label: 'Settings', icon: SettingsIcon },
];

export default function AdminSidebar({ sidebarOpen, setSidebarOpen, isMobile, onLogout, onLogoutRequest }) {
    const navigate = useNavigate();

    return (
        <>
            {isMobile && sidebarOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
                />
            )}

            <motion.aside
                initial={false}
                animate={{
                    width: isMobile ? 280 : (sidebarOpen ? 280 : 88),
                    x: isMobile && !sidebarOpen ? -280 : 0
                }}
                transition={{ duration: 0.3 }}
                className={`fixed left-0 top-0 h-full bg-white text-gray-400 ${isMobile ? 'z-[70]' : 'z-40'} flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] pt-20 border-r border-gray-100 overflow-hidden`}
            >
                <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                    <p className={`px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 transition-opacity duration-200 ${!isMobile && !sidebarOpen ? 'opacity-0 hidden' : 'opacity-100'}`}>
                        Admin Menu
                    </p>
                    {NAV_ITEMS.map(({ path, pathMatch, label, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={pathMatch === 'exact'}
                            onClick={() => isMobile && setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `relative flex items-center py-3 px-3.5 rounded-xl transition-all duration-300 group overflow-hidden w-full ${
                                    isActive
                                        ? 'bg-gradient-to-r from-[#003366] to-[#004080] text-white shadow-md shadow-blue-900/20'
                                        : 'text-gray-600 hover:bg-blue-50 hover:text-[#003366]'
                                }`
                            }
                        >
                            <span className="flex items-center justify-center w-6 h-6 flex-shrink-0 z-10">
                                <Icon fontSize="medium" />
                            </span>
                            {(isMobile || sidebarOpen) && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="ml-4 font-medium truncate z-10 text-sm"
                                >
                                    {label}
                                </motion.span>
                            )}
                            {!isMobile && !sidebarOpen && (
                                <span className="sr-only">{label}</span>
                            )}
                        </NavLink>
                    ))}

                    <div className={`my-4 border-t border-gray-100 mx-2 transition-opacity ${!isMobile && !sidebarOpen ? 'opacity-0' : 'opacity-100'}`} />
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                        type="button"
                        onClick={() => {
                            if (onLogoutRequest) {
                                onLogoutRequest();
                            } else {
                                onLogout?.();
                                navigate('/');
                            }
                        }}
                        className="flex items-center text-red-400 hover:text-red-300 transition-colors w-full p-2 rounded-lg hover:bg-white/5"
                    >
                        <LogoutIcon className="mr-3 flex-shrink-0" />
                        {(sidebarOpen || isMobile) && (
                            <span className="font-semibold text-gray-500 hover:text-red-400">Logout</span>
                        )}
                    </button>
                </div>

                {!isMobile && (
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="absolute -right-3 top-24 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md text-[#003366] hover:bg-[#003366] hover:text-white transition-all duration-200 z-50"
                    >
                        {sidebarOpen ? <ChevronLeftIcon style={{ fontSize: 16 }} /> : <ChevronRightIcon style={{ fontSize: 16 }} />}
                    </button>
                )}
            </motion.aside>
        </>
    );
}
