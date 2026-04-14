import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    WorkOutline as OffersIcon,
    Assignment as ApplicationsIcon,
    People as MembersIcon,
    Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { apiFetch } from '../../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function StatCard({ title, value, icon, color, change }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-gray-500 text-sm font-medium">{title}</h4>
                    <span className="text-2xl md:text-3xl font-bold text-gray-800">{value}</span>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20`, color }}>
                    {icon}
                </div>
            </div>
            <p className="text-xs font-medium text-green-600 flex items-center">
                <span className="bg-green-100 px-1.5 py-0.5 rounded mr-2">↑</span>
                {change}
            </p>
        </div>
    );
}

export default function AdminDashboardHome() {
    const [offers, setOffers] = useState([]);
    const [members, setMembers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [summary, setSummary] = useState({
        totalOffers: 0,
        totalApplicants: 0,
        pendingReview: 0,
        approved: 0,
        rejected: 0,
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [sum, offersRes, membershipsRes, activitiesRes] = await Promise.all([
                    apiFetch('/api/admin/summary'),
                    apiFetch('/api/admin/offers'),
                    apiFetch('/api/admin/memberships'),
                    apiFetch('/api/admin/activities?limit=5'),
                ]);
                setSummary(sum || {});
                setOffers(offersRes?.offers || []);
                setMembers(membershipsRes?.memberships || []);
                setActivities(activitiesRes?.activities || []);
            } catch (e) {
                console.error('Failed to load dashboard', e);
            }
        };
        load();
    }, []);

    const totalMembers = summary.totalApplicants ?? members.length;
    const totalApplicants = summary.totalApplicants ?? members.length;
    const pendingReviewCount = summary.pendingReview ?? members.filter((m) => (m.status || '').toLowerCase().includes('pending')).length;
    const inStationCount = members.filter((m) => m.memberType === 'in-station').length;
    const outStationCount = members.filter((m) => m.memberType === 'out-station').length;
    const passportYesCount = members.filter((m) => m.hasPassport === 'yes').length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard title="Total Offers" value={offers.length} icon={<OffersIcon />} color="#003366" change="+2 this week" />
                <StatCard title="Total Applicants" value={totalApplicants} icon={<ApplicationsIcon />} color="#D62828" change="+15% vs last month" />
                <StatCard title="Total Members" value={totalMembers} icon={<MembersIcon />} color="#10B981" change="+5 new today" />
                <StatCard title="Pending Review" value={pendingReviewCount} icon={<NotificationsIcon />} color="#F59E0B" change="Action needed" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Application Trends</h3>
                        <select className="text-sm border border-gray-200 rounded-lg text-gray-500 bg-gray-50 px-2 py-1">
                            <option>Last 6 Months</option>
                        </select>
                    </div>
                    <div className="h-64 md:h-72 w-full">
                        <Line
                            data={{
                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                datasets: [{
                                    label: 'Applications',
                                    data: [12, 19, 3, 5, 2, 3],
                                    borderColor: '#0B3D59',
                                    tension: 0.4,
                                    fill: true,
                                    backgroundColor: 'rgba(11, 61, 89, 0.1)',
                                }],
                            }}
                            options={{ maintainAspectRatio: false, responsive: true, plugins: { legend: { display: false } } }}
                        />
                    </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activities</h3>
                    <div className="space-y-4">
                        {activities.length === 0 ? (
                            <p className="text-sm text-gray-500">No recent activity.</p>
                        ) : activities.map((a) => (
                            <div key={a._id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#0B3D59] font-bold mr-3 text-[10px]">
                                    ADM
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 break-words">{a.description || a.action}</p>
                                    <p className="text-xs text-gray-500">
                                        {a.createdAt ? new Date(a.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">In-Station Members</p>
                    <p className="text-2xl font-bold text-gray-800">{inStationCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Out-Station Members</p>
                    <p className="text-2xl font-bold text-gray-800">{outStationCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Members with Passport</p>
                    <p className="text-2xl font-bold text-gray-800">{passportYesCount}</p>
                </div>
            </div>
        </motion.div>
    );
}
