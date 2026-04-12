import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '../../utils/api';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [members, setMembers] = useState([]);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [recipientType, setRecipientType] = useState('broadcast');
    const [selectedMemberIds, setSelectedMemberIds] = useState([]);
    const [sending, setSending] = useState(false);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');
    const [duration, setDuration] = useState('24'); // Default 24 hours
    const [durationUnit, setDurationUnit] = useState('hours');

    const loadData = () => {
        Promise.all([
            apiFetch('/api/admin/notifications'),
            apiFetch('/api/admin/memberships'),
        ]).then(([notifRes, membersRes]) => {
            setNotifications(notifRes?.notifications || []);
            setMembers(membersRes?.memberships || []);
        }).catch(console.error);
    };

    useEffect(() => {
        loadData();
    }, []);

    const approvedMembers = members.filter((m) => (m.status || '') === 'Approved');

    const toggleMember = (id) => {
        setSelectedMemberIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleSend = async () => {
        setErr('');
        setMsg('');
        if (!title?.trim()) {
            setErr('Title is required');
            return;
        }
        try {
            setSending(true);
            let recipientIds = [];
            if (recipientType === 'individual') {
                if (selectedMemberIds.length === 0) {
                    setErr('Select at least one member');
                    return;
                }
                const userIds = await Promise.all(
                    selectedMemberIds.map(async (membershipId) => {
                        const r = await apiFetch(`/api/admin/members/${membershipId}/detail`);
                        return r?.user?.id || null;
                    })
                );
                recipientIds = userIds.filter(Boolean);
            }
            const now = new Date();
            let expiresAt = new Date(now);
            if (durationUnit === 'hours') expiresAt.setHours(now.getHours() + parseInt(duration));
            else if (durationUnit === 'days') expiresAt.setDate(now.getDate() + parseInt(duration));
            else if (durationUnit === 'weeks') expiresAt.setDate(now.getDate() + (parseInt(duration) * 7));

            await apiFetch('/api/admin/notifications', {
                method: 'POST',
                body: { title: title.trim(), body: body.trim(), recipientIds, expiresAt },
            });
            setMsg('Notification sent successfully!');
            setTitle('');
            setBody('');
            setSelectedMemberIds([]);
            loadData();
        } catch (e) {
            setErr(e?.message || 'Failed to send');
        } finally {
            setSending(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Create Notification</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D59]/20"
                            placeholder="Notification title"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Message</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D59]/20"
                            placeholder="Notification message (optional)"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Send To</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="recipient" checked={recipientType === 'broadcast'} onChange={() => setRecipientType('broadcast')} />
                                <span>All Members (Broadcast)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="recipient" checked={recipientType === 'individual'} onChange={() => setRecipientType('individual')} />
                                <span>Selected Members</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Visible For (Duration)*</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="1"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D59]/20"
                            />
                            <select
                                value={durationUnit}
                                onChange={(e) => setDurationUnit(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D59]/20"
                            >
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                                <option value="weeks">Weeks</option>
                            </select>
                            <p className="text-[10px] text-gray-400 self-center">Notification will disappear after this time.</p>
                        </div>
                    </div>
                    {recipientType === 'individual' && (
                        <div className="border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Select Members</p>
                            <div className="space-y-2">
                                {approvedMembers.map((m) => (
                                    <label key={m._id || m.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedMemberIds.includes(m._id || m.id)}
                                            onChange={() => toggleMember(m._id || m.id)}
                                        />
                                        <span className="text-sm">{m.fullName} ({m.email})</span>
                                    </label>
                                ))}
                                {approvedMembers.length === 0 && <p className="text-sm text-gray-500">No approved members</p>}
                            </div>
                        </div>
                    )}
                    <button
                        type="button"
                        disabled={sending}
                        onClick={handleSend}
                        className="px-5 py-2 rounded-lg bg-[#0B3D59] text-white text-sm font-semibold hover:bg-[#09314a] disabled:opacity-60"
                    >
                        {sending ? 'Sending...' : 'Send Notification'}
                    </button>
                    {msg && <p className="text-sm text-green-600">{msg}</p>}
                    {err && <p className="text-sm text-red-600">{err}</p>}
                </div>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Notifications</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <p className="text-sm text-gray-500">No notifications yet</p>
                    ) : (
                        notifications.map((n) => {
                            const d = n.createdAt ? new Date(n.createdAt) : null;
                            const dateStr = d ? d.toLocaleString('en-IN') : '';
                            const recipients = n.recipientIds?.length ? `${n.recipientIds.length} member(s)` : 'All members';
                            return (
                                <div key={n._id} className="p-3 border border-gray-100 rounded-lg">
                                    <p className="font-semibold text-gray-800">{n.title}</p>
                                    {n.body && <p className="text-sm text-gray-600 mt-1">{n.body}</p>}
                                    <p className="text-xs text-gray-500 mt-2">To: {recipients} • {dateStr}</p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </motion.div>
    );
}
