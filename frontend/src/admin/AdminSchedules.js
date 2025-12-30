import React, { useState, useEffect } from 'react';
import { getDoctors, getSchedules, createSchedule, updateSchedule, deleteSchedule, getScheduleExceptions, createScheduleException, deleteScheduleException } from '../services/api';
import { Plus, Edit, Trash2, X, Calendar } from 'lucide-react';

const AdminSchedules = () => {
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ doctor_id: '', day_of_week: 0, start_time: '09:00', end_time: '17:00', slot_minutes: 15, active: true });
  const [exceptionForm, setExceptionForm] = useState({ doctor_id: '', date: '', is_available: false, notes: '' });

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchData = async () => {
    try {
      const [doctorsRes, schedulesRes, exceptionsRes] = await Promise.all([
        getDoctors(),
        getSchedules(selectedDoctor || undefined),
        getScheduleExceptions(selectedDoctor || undefined)
      ]);
      setDoctors(doctorsRes.data);
      setSchedules(schedulesRes.data);
      setExceptions(exceptionsRes.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedDoctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateSchedule(editing.id, formData);
      } else {
        await createSchedule(formData);
      }
      setShowModal(false);
      setEditing(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to save');
    }
  };

  const handleExceptionSubmit = async (e) => {
    e.preventDefault();
    try {
      await createScheduleException(exceptionForm);
      setShowExceptionModal(false);
      fetchData();
    } catch (error) {
      alert('Failed to save exception');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this schedule?')) {
      await deleteSchedule(id);
      fetchData();
    }
  };

  const handleDeleteException = async (id) => {
    if (window.confirm('Delete this exception?')) {
      await deleteScheduleException(id);
      fetchData();
    }
  };

  const handleEdit = (schedule) => {
    setEditing(schedule);
    setFormData({ ...schedule });
    setShowModal(true);
  };

  const getDoctorName = (id) => doctors.find(d => d.id === id)?.name || 'Unknown';

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} className="input-field max-w-xs">
          <option value="">All Doctors</option>
          {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={() => { setFormData({ doctor_id: selectedDoctor || '', day_of_week: 0, start_time: '09:00', end_time: '17:00', slot_minutes: 15, active: true }); setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Add Schedule
          </button>
          <button onClick={() => { setExceptionForm({ doctor_id: selectedDoctor || '', date: '', is_available: false, notes: '' }); setShowExceptionModal(true); }} className="btn-secondary flex items-center gap-2">
            <Calendar size={20} /> Add Exception
          </button>
        </div>
      </div>

      {/* Schedules */}
      <div className="card overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b"><h3 className="font-semibold">Regular Schedules</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Day</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Slot</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{getDoctorName(schedule.doctor_id)}</td>
                  <td className="py-3 px-4 text-gray-600">{dayNames[schedule.day_of_week]}</td>
                  <td className="py-3 px-4 text-gray-600">{schedule.start_time} - {schedule.end_time}</td>
                  <td className="py-3 px-4 text-gray-600">{schedule.slot_minutes} min</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${schedule.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {schedule.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleEdit(schedule)} className="p-2 text-gray-500 hover:text-primary-600"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(schedule.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-500">No schedules</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exceptions */}
      <div className="card overflow-hidden">
        <div className="p-4 bg-gray-50 border-b"><h3 className="font-semibold">Schedule Exceptions (Leave Days)</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Notes</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {exceptions.map((exc) => (
                <tr key={exc.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{getDoctorName(exc.doctor_id)}</td>
                  <td className="py-3 px-4 text-gray-600">{exc.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${exc.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {exc.is_available ? 'Available' : 'Not Available'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{exc.notes || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleDeleteException(exc.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {exceptions.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-500">No exceptions</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'Edit' : 'Add'} Schedule</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
                <select required value={formData.doctor_id} onChange={(e) => setFormData({...formData, doctor_id: e.target.value})} className="input-field">
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day *</label>
                <select required value={formData.day_of_week} onChange={(e) => setFormData({...formData, day_of_week: parseInt(e.target.value)})} className="input-field">
                  {dayNames.map((day, i) => <option key={i} value={i}>{day}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="time" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (minutes)</label>
                <input type="number" value={formData.slot_minutes} onChange={(e) => setFormData({...formData, slot_minutes: parseInt(e.target.value)})} className="input-field" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={formData.active} onChange={(e) => setFormData({...formData, active: e.target.checked})} className="rounded" />
                <label htmlFor="active" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exception Modal */}
      {showExceptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Add Exception</h2>
              <button onClick={() => setShowExceptionModal(false)} className="p-2 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleExceptionSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
                <select required value={exceptionForm.doctor_id} onChange={(e) => setExceptionForm({...exceptionForm, doctor_id: e.target.value})} className="input-field">
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" required value={exceptionForm.date} onChange={(e) => setExceptionForm({...exceptionForm, date: e.target.value})} className="input-field" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_available" checked={exceptionForm.is_available} onChange={(e) => setExceptionForm({...exceptionForm, is_available: e.target.checked})} className="rounded" />
                <label htmlFor="is_available" className="text-sm text-gray-700">Doctor is available (with custom hours)</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input type="text" value={exceptionForm.notes} onChange={(e) => setExceptionForm({...exceptionForm, notes: e.target.value})} className="input-field" placeholder="e.g., Annual leave" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowExceptionModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Exception</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedules;
