import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { apiFetch } from '../../utils/api';

function DetailRow({ label, value }) {
    return (
        <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm font-medium text-gray-800 break-words">{value || '-'}</p>
        </div>
    );
}

function ApplicationDetailModal({ application, onClose, onApprove }) {
    const [loginEmail, setLoginEmail] = useState(application?.email || '');
    const [loginPassword, setLoginPassword] = useState('');
    const [saving, setSaving] = useState(false);

    if (!application) return null;
    const createdDate = application.createdAt ? application.createdAt.slice(0, 10) : '';

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h3 className="text-2xl font-bold text-[#0B3D59]">Application Details</h3>
                        <p className="text-xs text-gray-500 mt-1">Review membership details and create login.</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <CancelIcon />
                    </button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-white rounded-xl p-4 md:p-6 border border-gray-100">
                        <DetailRow label="Full Name" value={application.fullName} />
                        <DetailRow label="Registration/Roll No." value={application.registrationNumber} />
                        <DetailRow label="Email Address" value={application.email} />
                        <DetailRow label="WhatsApp No." value={application.whatsappNumber} />
                        <DetailRow label="Course" value={application.course} />
                        <DetailRow label="Branch & Section" value={application.branchSection} />
                        <DetailRow label="Semester" value={application.semester} />
                        <DetailRow label="Type of Membership" value={application.memberType?.replace('-', ' ')} />
                        <DetailRow label="Passport" value={application.hasPassport === 'yes' ? 'Yes' : application.hasPassport === 'no' ? 'No' : '-'} />
                        <DetailRow label="Created On" value={createdDate} />
                        <DetailRow label="Status" value={application.status || 'Pending Review'} />
                    </div>
                    {application.memberType === 'out-station' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-xl p-4 border border-gray-100">
                            <DetailRow label="University Name" value={application.universityName} />
                            <DetailRow label="University State" value={application.universityState} />
                            <DetailRow label="University City" value={application.universityCity} />
                            <DetailRow label="University Address" value={application.universityAddress} />
                        </div>
                    )}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 space-y-4">
                        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Create Login Credentials</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Login Email</label>
                                <input
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D59]/20"
                                    placeholder="member@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Temporary Password</label>
                                <input
                                    type="text"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D59]/20"
                                    placeholder="At least 6 characters"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 md:p-6 bg-white border-t border-gray-100 flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-500 text-sm font-semibold hover:bg-gray-100">
                        Close
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={async () => {
                            if (!onApprove) return;
                            try {
                                setSaving(true);
                                await onApprove(application._id || application.id, loginEmail, loginPassword);
                            } finally {
                                setSaving(false);
                            }
                        }}
                        className="px-6 py-2 rounded-lg bg-[#0B3D59] text-white text-sm font-bold hover:bg-[#09314a] disabled:opacity-70"
                    >
                        {saving ? 'Approving...' : 'Approve & Create Login'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function ApproveMembers() {
    const [members, setMembers] = useState([]);
    const [filters, setFilters] = useState({ search: '', fromDate: '', toDate: '' });
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const loadMembers = () => {
        setLoadError('');
        setLoading(true);
        apiFetch('/api/admin/memberships')
            .then((r) => {
                const list = r?.memberships ?? r?.members ?? [];
                setMembers(Array.isArray(list) ? list : []);
            })
            .catch((err) => {
                setLoadError(err?.message || 'Failed to load registrations. Check your connection and try again.');
                setMembers([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadMembers();
    }, []);

    const normalizedSearch = (filters.search || '').trim().toLowerCase();
    const filtered = members.filter((m) => {
        const createdDate = (m.createdAt || '').slice(0, 10);
        const matchesSearch =
            !normalizedSearch ||
            [m.fullName, m.registrationNumber, m.email, m.whatsappNumber].filter(Boolean).some((v) => v.toLowerCase().includes(normalizedSearch));
        if (!matchesSearch) return false;
        if (filters.fromDate && createdDate < filters.fromDate) return false;
        if (filters.toDate && createdDate > filters.toDate) return false;
        return true;
    });

    const pendingOnly = filtered.filter((m) => (m.status || 'Pending Review') === 'Pending Review');

    const handleFilterChange = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }));

    const updateMemberStatus = (memberId, status) => {
        apiFetch(`/api/admin/memberships/${memberId}/status`, { method: 'PATCH', body: { status } })
            .then(() => loadMembers())
            .catch((err) => alert(err?.message || 'Failed to update status'));
    };

    const handleApprove = async (id, loginEmail, loginPassword) => {
        try {
            await apiFetch(`/api/admin/memberships/${id}/status`, {
                method: 'PATCH',
                body: { status: 'Approved', loginEmail, password: loginPassword },
            });
            setSelectedApplication(null);
            loadMembers(); // Refetch so list updates; approved member will now show in Members page
            alert('Member approved and login created. They can now log in and will appear in Members.');
        } catch (err) {
            alert(err?.message || 'Failed to approve member');
        }
    };

    return (
        <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="text-xl font-bold text-gray-800">Approve Members</h3>
                    <button
                        type="button"
                        onClick={loadMembers}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg border border-[#0B3D59] text-[#0B3D59] text-sm font-semibold hover:bg-[#0B3D59] hover:text-white disabled:opacity-60 transition-colors"
                    >
                        {loading ? 'Loading...' : 'Refresh list'}
                    </button>
                </div>
                {loadError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {loadError}
                    </div>
                )}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                        <div className="w-full md:w-1/3">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Search Applicant</label>
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Search by name, roll no, email..."
                                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D59]/20"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">From Date</label>
                                <input
                                    type="date"
                                    value={filters.fromDate}
                                    onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                                    className="w-full md:w-40 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">To Date</label>
                                <input
                                    type="date"
                                    value={filters.toDate}
                                    onChange={(e) => handleFilterChange('toDate', e.target.value)}
                                    className="w-full md:w-40 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[900px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Full Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Registration/Roll No.</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Membership Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Created On</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            Loading registrations...
                                        </td>
                                    </tr>
                                ) : pendingOnly.map((member) => {
                                    const createdDate = (member.createdAt || '').slice(0, 10);
                                    const status = member.status || 'Pending Review';
                                    return (
                                        <tr key={member._id || member.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-bold text-gray-800">{member.fullName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{member.registrationNumber}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 capitalize">{member.memberType?.replace('-', ' ') || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{createdDate || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        status === 'Approved' ? 'bg-green-100 text-green-700' : status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                                >
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    type="button"
                                                    className="text-[#0B3D59] hover:underline text-sm font-semibold"
                                                    onClick={() => setSelectedApplication(member)}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100"
                                                    title="Approve"
                                                    onClick={() => setSelectedApplication(member)}
                                                >
                                                    <CheckCircleIcon fontSize="small" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                                                    title="Reject"
                                                    onClick={() => updateMemberStatus(member._id || member.id, 'Rejected')}
                                                >
                                                    <CancelIcon fontSize="small" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center justify-center px-2.5 h-8 rounded-full bg-gray-800 text-white hover:bg-gray-900 text-[10px] font-bold uppercase tracking-wide"
                                                    title="Blocklist"
                                                    onClick={() => updateMemberStatus(member._id || member.id, 'Blocklisted')}
                                                >
                                                    Block
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {!loading && pendingOnly.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                                            No pending applications. New registrations will appear here.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            {selectedApplication && (
                <ApplicationDetailModal
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                    onApprove={handleApprove}
                />
            )}
        </>
    );
}
