import React, { useState, useEffect } from 'react';
import { getDiagnosticTests, createDiagnosticTest, updateDiagnosticTest, deleteDiagnosticTest } from '../services/api';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

const AdminDiagnostics = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '', category: 'lab_tests', description: '',
    preparation: '', price: 'Call for price', report_time: '', duration_minutes: ''
  });

  const categories = [
    { value: 'lab_tests', label: 'Lab Tests' },
    { value: 'imaging', label: 'Imaging' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'other', label: 'Other' }
  ];

  const fetchData = async () => {
    try {
      const res = await getDiagnosticTests({ active_only: false });
      setTests(res.data);
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
      const data = {
        ...formData,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null
      };
      if (editing) {
        await updateDiagnosticTest(editing.id, data);
      } else {
        await createDiagnosticTest(data);
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to save');
    }
  };

  const handleEdit = (test) => {
    setEditing(test);
    setFormData({
      name: test.name,
      category: test.category,
      description: test.description || '',
      preparation: test.preparation || '',
      price: test.price || 'Call for price',
      report_time: test.report_time || '',
      duration_minutes: test.duration_minutes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteDiagnosticTest(id);
        fetchData();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', category: 'lab_tests', description: '',
      preparation: '', price: 'Call for price', report_time: '', duration_minutes: ''
    });
  };

  const filteredTests = tests.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search tests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10" />
        </div>
        <button onClick={() => { resetForm(); setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Test
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Test Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Report Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTests.map((test) => (
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{test.name}</p>
                    {test.preparation && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{test.preparation}</p>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                      {test.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{test.report_time || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${test.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {test.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleEdit(test)} className="p-2 text-gray-500 hover:text-primary-600"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(test.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Test' : 'Add Test'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="input-field">
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input-field" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Instructions</label>
                <textarea value={formData.preparation} onChange={(e) => setFormData({...formData, preparation: e.target.value})} className="input-field" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input type="text" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Time</label>
                  <input type="text" value={formData.report_time} onChange={(e) => setFormData({...formData, report_time: e.target.value})} className="input-field" placeholder="Same day" />
                </div>
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

export default AdminDiagnostics;
