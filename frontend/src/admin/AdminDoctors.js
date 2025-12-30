import React, { useState, useEffect } from 'react';
import { getDoctors, getSpecialties, createDoctor, updateDoctor, deleteDoctor } from '../services/api';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '', specialty_id: '', qualifications: '', bio: '',
    fee: 'Call for price', gender: '', experience_years: '',
    languages: 'Urdu, English', tags: '', phone: '', email: ''
  });

  const fetchData = async () => {
    try {
      const [doctorsRes, specialtiesRes] = await Promise.all([
        getDoctors({ active_only: false }),
        getSpecialties(false)
      ]);
      setDoctors(doctorsRes.data);
      setSpecialties(specialtiesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        languages: formData.languages.split(',').map(l => l.trim()),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null
      };

      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, data);
      } else {
        await createDoctor(data);
      }
      setShowModal(false);
      setEditingDoctor(null);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to save doctor');
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialty_id: doctor.specialty_id,
      qualifications: doctor.qualifications,
      bio: doctor.bio || '',
      fee: doctor.fee || 'Call for price',
      gender: doctor.gender || '',
      experience_years: doctor.experience_years || '',
      languages: doctor.languages?.join(', ') || 'Urdu, English',
      tags: doctor.tags?.join(', ') || '',
      phone: doctor.phone || '',
      email: doctor.email || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this doctor?')) {
      try {
        await deleteDoctor(id);
        fetchData();
      } catch (error) {
        alert('Failed to delete doctor');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', specialty_id: '', qualifications: '', bio: '',
      fee: 'Call for price', gender: '', experience_years: '',
      languages: 'Urdu, English', tags: '', phone: '', email: ''
    });
  };

  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button onClick={() => { resetForm(); setEditingDoctor(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Doctor
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Specialty</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Experience</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-600">
                        {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doctor.name}</p>
                        <p className="text-xs text-gray-500">{doctor.qualifications}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{doctor.specialty?.name || '-'}</td>
                  <td className="py-3 px-4 text-gray-600">{doctor.experience_years ? `${doctor.experience_years} years` : '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${doctor.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {doctor.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleEdit(doctor)} className="p-2 text-gray-500 hover:text-primary-600"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(doctor.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">{editingDoctor ? 'Edit Doctor' : 'Add Doctor'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
                  <select required value={formData.specialty_id} onChange={(e) => setFormData({...formData, specialty_id: e.target.value})} className="input-field">
                    <option value="">Select Specialty</option>
                    {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications *</label>
                  <input type="text" required value={formData.qualifications} onChange={(e) => setFormData({...formData, qualifications: e.target.value})} className="input-field" placeholder="MBBS, FCPS, etc." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                  <input type="number" value={formData.experience_years} onChange={(e) => setFormData({...formData, experience_years: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="input-field">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee</label>
                  <input type="text" value={formData.fee} onChange={(e) => setFormData({...formData, fee: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Languages (comma separated)</label>
                  <input type="text" value={formData.languages} onChange={(e) => setFormData({...formData, languages: e.target.value})} className="input-field" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="input-field" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="input-field" placeholder="heart, cardiac, etc." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input-field" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingDoctor ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
