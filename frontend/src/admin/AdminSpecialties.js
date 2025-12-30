import React, { useState, useEffect } from 'react';
import { getSpecialties, createSpecialty, updateSpecialty, deleteSpecialty } from '../services/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const AdminSpecialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '' });

  const fetchData = async () => {
    try {
      const res = await getSpecialties(false);
      setSpecialties(res.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateSpecialty(editing.id, formData);
      } else {
        await createSpecialty(formData);
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ name: '', description: '', icon: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to save');
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({ name: item.name, description: item.description || '', icon: item.icon || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteSpecialty(id);
        fetchData();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Specialties</h2>
        <button onClick={() => { setFormData({ name: '', description: '', icon: '' }); setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Specialty
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specialties.map((specialty) => (
          <div key={specialty.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{specialty.icon || '🏥'}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{specialty.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{specialty.description || 'No description'}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(specialty)} className="p-1.5 text-gray-500 hover:text-primary-600"><Edit size={16} /></button>
                <button onClick={() => handleDelete(specialty.id)} className="p-1.5 text-gray-500 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded ${specialty.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {specialty.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'Edit' : 'Add'} Specialty</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input-field" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <input type="text" value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} className="input-field" placeholder="🫀" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpecialties;
