import React, { useState, useEffect } from 'react';
import { getAppointments, getDoctors, updateAppointment, exportAppointments } from '../services/api';
import { Search, Filter, Download, Eye, Edit, X, Phone } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const statuses = ['new', 'confirmed', 'completed', 'cancelled', 'no_show'];

  const fetchData = async () => {
    try {
      const params = {};
      if (selectedDoctor) params.doctor_id = selectedDoctor;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedDate) params.date = selectedDate;

      const [appointmentsRes, doctorsRes] = await Promise.all([
        getAppointments(params),
        getDoctors()
      ]);
      setAppointments(appointmentsRes.data);
      setDoctors(doctorsRes.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedDoctor, selectedStatus, selectedDate]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateAppointment(id, { status });
      fetchData();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleExport = async () => {
    try {
      const response = await exportAppointments(selectedDate, selectedDate);
      const csv = [
        Object.keys(response.data[0] || {}).join(','),
        ...response.data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `appointments_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      alert('Failed to export');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-green-100 text-green-700',
      completed: 'bg-purple-100 text-purple-700',
      cancelled: 'bg-red-100 text-red-700',
      no_show: 'bg-amber-100 text-amber-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div>
      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field max-w-xs"
          />
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">All Doctors</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">All Status</option>
            {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 ml-auto">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Reference</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Patient</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date/Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-primary-600">{apt.reference_number}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-gray-900">{apt.patient_name}</p>
                      <p className="text-xs text-gray-500">{apt.patient_phone}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{apt.doctor?.name || '-'}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {format(parseISO(apt.date_time), 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 ${getStatusColor(apt.status)}`}
                    >
                      {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => { setSelectedAppointment(apt); setShowModal(true); }}
                      className="p-2 text-gray-500 hover:text-primary-600"
                    >
                      <Eye size={18} />
                    </button>
                    <a href={`tel:${apt.patient_phone}`} className="p-2 text-gray-500 hover:text-green-600 inline-block">
                      <Phone size={18} />
                    </a>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">No appointments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Appointment Details</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Reference:</span><span className="font-medium">{selectedAppointment.reference_number}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Patient:</span><span>{selectedAppointment.patient_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span>{selectedAppointment.patient_phone}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email:</span><span>{selectedAppointment.patient_email || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Doctor:</span><span>{selectedAppointment.doctor?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date/Time:</span><span>{format(parseISO(selectedAppointment.date_time), 'PPp')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status:</span><span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedAppointment.status)}`}>{selectedAppointment.status}</span></div>
              {selectedAppointment.notes && <div><span className="text-gray-500">Notes:</span><p className="mt-1 text-sm">{selectedAppointment.notes}</p></div>}
            </div>
            <div className="p-4 border-t">
              <button onClick={() => setShowModal(false)} className="btn-primary w-full">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
