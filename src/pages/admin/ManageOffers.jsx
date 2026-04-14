// --- PDF EXTRACTION LOGIC UPDATED ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  Work as WorkIcon,
  School as FieldIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { apiFetch, apiUploadOfferPdf, apiDeleteOfferPdf, API_BASE_URL, clearAuthSession } from '../../utils/api';

const OFFER_CATEGORIES = ['all', 'CS', 'IT', 'Mech', 'Civil', 'Elec', 'Electronics', 'Eco', 'Mgmt', 'Bio/Chem', 'Other'];

const mapFieldToCategory = (field) => {
    if (!field) return 'Other';
    const f = field.toLowerCase();
    if (f.includes('computer') || f.includes('software') || f.includes('cs')) return 'CS';
    if (f.includes('information technology') || f.includes('it')) return 'IT';
    return 'Other';
};

// FINAL SOLUTION: This MUST be "export default" to fix your App.jsx error
export default function ManageOffers() {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [showAddOfferModal, setShowAddOfferModal] = useState(false);
    const [editingOfferId, setEditingOfferId] = useState(null);
    const [offerSearch, setOfferSearch] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    const [selectedPdfFile, setSelectedPdfFile] = useState(null);

    const [newOffer, setNewOffer] = useState({
    offerNumber: '',
    company: '',
    position: '',
    country: '',
    stipend: '',
    duration: '',
    field: '',
    deadline: '',
    description: '',
    requirements: '',
});

    const handlePdfChange = async (e) => {
        const file = e.target.files?.[0] || null;
        setSelectedPdfFile(file);

        if (file) {
            const confirmAutoFill = window.confirm("Extract data from this PDF to auto-fill the form?");
            if (!confirmAutoFill) return;

            setIsExtracting(true);
            const formData = new FormData();
            formData.append('offerPdf', file);

            try {
                const response = await axios.post(`${API_BASE_URL}/api/offers/extract`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                // Mapping extracted data from source [cite: 4, 14, 24, 33, 38]
                const { offer_id, company, stipend, domain, tasks } = response.data.data;

                setNewOffer(prev => ({
                    ...prev,
                    position: offer_id || prev.position, // e.g., ES-2026-1700 
                    company: company || prev.company,     // e.g., Originaltec 
                    stipend: stipend || prev.stipend,     // e.g., 800 EUR 
                    field: Array.isArray(domain) ? domain.join(', ') : (domain || prev.field), // [cite: 33]
                    description: Array.isArray(tasks) ? tasks.join('\n') : (tasks || prev.description) // [cite: 38]
                }));

                alert("Data extracted successfully!");
            } catch (err) {
                console.error("Extraction failed:", err);
                alert("Could not extract data. Please fill manually.");
            } finally {
                setIsExtracting(false);
            }
        }
    };

    const loadOffers = () => {
        apiFetch('/api/admin/offers')
            .then((r) => setOffers(r.offers || []))
            .catch((err) => {
                if (err?.status === 403) {
                    clearAuthSession();
                    navigate('/login');
                }
            });
    };

    useEffect(() => {
        loadOffers();
    }, []);
const normalizedSearch = offerSearch.trim().toLowerCase();
const filteredOffers = offers.filter((offer) => {
    const deadline = offer.deadline || '';
    const matchesSearch =
        !normalizedSearch ||
        [offer.offerNumber, offer.company, offer.position, offer.country, offer.field].filter(Boolean).some((v) => v.toLowerCase().includes(normalizedSearch));
    if (!matchesSearch) return false;
    if (offerFromDate && deadline < offerFromDate) return false;
    if (offerToDate && deadline > offerToDate) return false;
    if (filterField !== 'all' && mapFieldToCategory(offer.field) !== filterField) return false;
    return true;
});

const handleOpenCreate = () => {
    setEditingOfferId(null);
    setSelectedPdfFile(null);
    setNewOffer({
        offerNumber: '', company: '', position: '', country: '', duration: '', stipend: '', field: '', deadline: '',
        urgent: false, deadlineNearby: false, description: '', requirements: '',
    });
    setShowAddOfferModal(true);
};

const handleEditOfferClick = (offer) => {
    setEditingOfferId(offer._id || offer.id);
    setSelectedPdfFile(null);
    setNewOffer({
        offerNumber: offer.offerNumber || '',
        company: offer.company || '',
        position: offer.position || '',
        country: offer.country || '',
        duration: offer.duration || '',
        stipend: offer.stipend || '',
        field: offer.field || '',
        deadline: offer.deadline || '',
        urgent: !!offer.urgent,
        deadlineNearby: !!offer.deadlineNearby,
        description: offer.description || '',
        requirements: offer.requirements || '',
    });
    setShowAddOfferModal(true);
};

const handleAddOffer = async (e) => {
    e.preventDefault();
    try {
        let offerId = editingOfferId;
        if (editingOfferId) {
            await apiFetch(`/api/admin/offers/${editingOfferId}`, { method: 'PATCH', body: newOffer });
        } else {
            const res = await apiFetch('/api/admin/offers', { method: 'POST', body: newOffer });
            offerId = res?.offer?._id || res?.offer?.id;
        }

        if (selectedPdfFile && offerId) {
            await apiUploadOfferPdf(offerId, selectedPdfFile);
        }

        loadOffers();
        setShowAddOfferModal(false);
        setEditingOfferId(null);
        setSelectedPdfFile(null);
        setNewOffer({
            offerNumber: '', company: '', position: '', country: '', duration: '', stipend: '', field: '', deadline: '',
            urgent: false, deadlineNearby: false, description: '', requirements: '',
        });
    } catch (err) {
        if (err?.status === 403 || err?.message === 'Forbidden') {
            clearAuthSession();
            navigate('/login');
            return;
        }
        alert(err?.message || 'Failed to save offer');
    }
};

const handleDeleteOffer = (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    apiFetch(`/api/admin/offers/${offerId}`, { method: 'DELETE' })
        .then(() => loadOffers())
        .catch((err) => {
            if (err?.status === 403 || err?.message === 'Forbidden') {
                clearAuthSession();
                navigate('/login');
                return;
            }
            alert(err?.message || 'Failed to delete offer');
        });
};

const closeModal = () => {
    setShowAddOfferModal(false);
    setEditingOfferId(null);
    setSelectedPdfFile(null);
    setNewOffer({
        offerNumber: '', company: '', position: '', country: '', duration: '', stipend: '', field: '', deadline: '',
        urgent: false, deadlineNearby: false, description: '', requirements: '',
    });
};

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Offer Management</h3>
                <button 
                    onClick={() => { setEditingOfferId(null); setShowAddOfferModal(true); }}
                    className="bg-[#0B3D59] text-white px-4 py-2 rounded-lg flex items-center"
                >
                    <AddIcon className="mr-2" /> Add Offer
                </button>
            </div>

{/* Search & Filter Bar */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
    <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="w-full md:w-1/3">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Search</label>
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={offerSearch}
                    onChange={(e) => setOfferSearch(e.target.value)}
                    placeholder="Search by employer, role, country..."
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D59]/20"
                />
            </div>
        </div>
    </div>
</div>

{/* Modal */}
{showAddOfferModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">{editingOfferId ? 'Edit' : 'New'} Offer</h2>
                <button onClick={() => setShowAddOfferModal(false)}><CancelIcon /></button>
            </div>
        </motion.div>
    </div>
)}

                        <form onSubmit={handleAddOffer} className="space-y-4">
                            <input 
                                type="file" 
                                accept="application/pdf" 
                                onChange={handlePdfChange} 
                                className="w-full border p-2 rounded"
                            />
                            {isExtracting && <p className="text-blue-600 animate-pulse">Extracting data...</p>}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Company" value={newOffer.company} onChange={e => setNewOffer({...newOffer, company: e.target.value})} className="border p-2 rounded" required />
                                <input placeholder="Position/ID" value={newOffer.position} onChange={e => setNewOffer({...newOffer, position: e.target.value})} className="border p-2 rounded" required />
                                <input placeholder="Stipend" value={newOffer.stipend} onChange={e => setNewOffer({...newOffer, stipend: e.target.value})} className="border p-2 rounded" />
                                <input placeholder="Field" value={newOffer.field} onChange={e => setNewOffer({...newOffer, field: e.target.value})} className="border p-2 rounded" />
                            </div>
<div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Employer/Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Location</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Applicants</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOffers.map((offer) => (
                                    <tr key={offer._id || offer.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-xl mr-3 text-[#0B3D59]">
                                                    <WorkIcon />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{offer.offerNumber || offer.company}</p>
                                                    <p className="text-sm text-gray-500">{offer.offerNumber ? offer.company : offer.position}</p>
                                                    <p className="text-xs text-gray-400">{offer.offerNumber ? offer.position : ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{offer.country}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm">+{offer.applicants ?? 0}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${offer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {offer.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button type="button" className="text-gray-400 hover:text-[#0B3D59] mx-1" onClick={() => handleEditOfferClick(offer)}>
                                                <EditIcon fontSize="small" />
                                            </button>
                                            <button type="button" className="text-gray-400 hover:text-red-500 mx-1" onClick={() => handleDeleteOffer(offer._id || offer.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOffers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">No offers found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            {showAddOfferModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-2xl font-bold text-[#0B3D59]">{editingOfferId ? 'Edit Offer' : 'Create New Offer'}</h3>
                            <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <CancelIcon />
                            </button>
                        </div>
                        <form onSubmit={handleAddOffer} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Offer Number (Will be Title in Member Portal)</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-[#0B3D59] outline-none"
                                    value={newOffer.offerNumber}
                                    onChange={(e) => setNewOffer({ ...newOffer, offerNumber: e.target.value })}
                                    placeholder="e.g. DE-2024-1234"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Employer Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-[#0B3D59] outline-none"
                                        value={newOffer.company}
                                        onChange={(e) => setNewOffer({ ...newOffer, company: e.target.value })}
                                        placeholder="e.g. Google"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Position Title</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-[#0B3D59] outline-none"
                                        value={newOffer.position}
                                        onChange={(e) => setNewOffer({ ...newOffer, position: e.target.value })}
                                        placeholder="e.g. Frontend Intern"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Country</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-[#0B3D59] outline-none"
                                        value={newOffer.country}
                                        onChange={(e) => setNewOffer({ ...newOffer, country: e.target.value })}
                                        placeholder="e.g. Germany"
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-sm font-bold text-gray-700">Deadline</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-[#0B3D59] outline-none"
                                        value={newOffer.deadline}
                                        onChange={(e) => setNewOffer({ ...newOffer, deadline: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Stipend</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-[#0B3D59] outline-none"
                                        value={newOffer.stipend}
                                        onChange={(e) => setNewOffer({ ...newOffer, stipend: e.target.value })}
                                        placeholder="e.g. €1200/mo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Period</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-[#0B3D59] outline-none"
                                        value={newOffer.duration}
                                        onChange={(e) => setNewOffer({ ...newOffer, duration: e.target.value })}
                                        placeholder="e.g. 6 Months"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Fields/Disciplines</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-[#0B3D59] outline-none"
                                    value={newOffer.field}
                                    onChange={(e) => setNewOffer({ ...newOffer, field: e.target.value })}
                                    placeholder="e.g. Computer Science"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Description</label>
                                <textarea
                                    rows="4"
                                    className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-[#0B3D59] outline-none resize-none"
                                    value={newOffer.description}
                                    onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                                    placeholder="Detailed job description..."
                                />
                            </div>
                            <div className="flex items-center space-x-2 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                <input
                                    type="checkbox"
                                    id="urgent"
                                    checked={newOffer.urgent}
                                    onChange={(e) => setNewOffer({ ...newOffer, urgent: e.target.checked })}
                                    className="w-5 h-5 text-[#0B3D59] rounded"
                                />
                                <label htmlFor="urgent" className="text-sm font-bold text-gray-700 cursor-pointer">Deadline Approaching</label>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Offer PDF (optional)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setSelectedPdfFile(e.target.files?.[0] || null)}
                                        className="flex-1 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-[#0B3D59] outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#0B3D59] file:text-white file:text-sm file:font-semibold"
                                    />
                                    {editingOfferId && offers.find((o) => (o._id || o.id) === editingOfferId)?.pdfPath && !selectedPdfFile && (
                                        <div className="flex items-center space-x-2">
                                            
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); const p = offers.find((o) => (o._id || o.id) === editingOfferId).pdfPath; if (p) window.open(`${API_BASE_URL}${p}`, '_blank'); }}
                                                className="text-xs text-gray-700 underline"
                                            >
                                                View uploaded PDF
                                            </a>
                                            <button
                                                type="button"
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    if (!window.confirm('Delete the uploaded PDF?')) return;
                                                    try {
                                                        await apiDeleteOfferPdf(editingOfferId);
                                                        alert('PDF deleted');
                                                        loadOffers();
                                                    } catch (err) {
                                                        alert(err?.message || 'Failed to delete PDF');
                                                    }
                                                }}
                                                className="text-xs text-red-600 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                    {selectedPdfFile && <p className="text-xs text-green-600">{selectedPdfFile.name}</p>}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-end space-x-4">
                                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-lg text-gray-500 font-bold hover:bg-gray-100">
                                    Cancel
                                </button>
                                <button type="submit" className="px-8 py-3 rounded-lg bg-[#0B3D59] text-white font-bold hover:bg-[#09314a]">
                                    {editingOfferId ? 'Save Changes' : 'Publish Offer'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
//                                 </button>
//                             </div>
//                         </form>
//                     </motion.div>
//                 </div>
//             )}
//         </div>
//     );
// }