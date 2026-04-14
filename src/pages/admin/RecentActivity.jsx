import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '../../utils/api';

function formatDateTime(value) {
    if (!value) return '-';
    const d = new Date(value);
    return `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function RecentActivity() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = () => {
        setLoading(true);
        setError('');
        apiFetch('/api/admin/activities?limit=100')
            .then((r) => setActivities(r?.activities || []))
            .catch((e) => setError(e?.message || 'Failed to load recent activities'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Recent Activity Status</h3>
                    <p className="text-sm text-gray-500 mt-1">Track all important actions performed by admin users.</p>
                </div>
                <button
                    type="button"
                    onClick={load}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg border border-[#0B3D59] text-[#0B3D59] text-sm font-semibold hover:bg-[#0B3D59] hover:text-white disabled:opacity-60 transition-colors"
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">When</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Action</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Admin</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Target</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Loading activities...</td>
                                </tr>
                            ) : activities.map((a) => (
                                <tr key={a._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(a.createdAt)}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">{a.action || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{a.description || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{a.adminEmail || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{a.targetType || '-'} {a.targetId ? `• ${a.targetId}` : ''}</td>
                                </tr>
                            ))}
                            {!loading && activities.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">No recent admin activity found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
