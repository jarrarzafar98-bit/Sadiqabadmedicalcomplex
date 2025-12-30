import React, { useState, useEffect } from 'react';
import { getDiagnosticBookings, getDiagnosticTests, updateDiagnosticBooking } from '../services/api';
import { Search, Eye, Phone, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const AdminDiagnosticBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const statuses = ['new', 'confirmed', 'completed', 'cancelled', 'no_show'];

  const fetchData = async () => {
    try {
      const params = {};
      if (selectedStatus) params.status = selectedStatus;
      if (selectedDate) params.date = selectedDate;

      const [bookingsRes, testsRes] = await Promise.all([
        getDiagnosticBookings(params),
        getDiagnosticTests()
      ]);
      setBookings(bookingsRes.data);
      setTests(testsRes.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedStatus, selectedDate]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateDiagnosticBooking(id, { status });
      fetchData();
    } catch (error) {
      alert('Failed to update status');
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
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-field max-w-xs" />
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="input-field max-w-xs">
            <option value="">All Status</option>
            {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Reference</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Patient</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Test</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date/Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-accent-600">{booking.reference_number}</td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{booking.patient_name}</p>
                    <p className="text-xs text-gray-500">{booking.patient_phone}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{booking.test?.name || '-'}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {format(parseISO(booking.date_time.replace(' ', 'T')), 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 ${getStatusColor(booking.status)}`}
                    >
                      {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => { setSelectedBooking(booking); setShowModal(true); }} className="p-2 text-gray-500 hover:text-primary-600"><Eye size={18} /></button>
                    <a href={`tel:${booking.patient_phone}`} className="p-2 text-gray-500 hover:text-green-600 inline-block"><Phone size={18} /></a>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">No bookings found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Booking Details</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Reference:</span><span className="font-medium">{selectedBooking.reference_number}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Patient:</span><span>{selectedBooking.patient_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span>{selectedBooking.patient_phone}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Test:</span><span>{selectedBooking.test?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date/Time:</span><span>{format(parseISO(selectedBooking.date_time.replace(' ', 'T')), 'PPp')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status:</span><span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedBooking.status)}`}>{selectedBooking.status}</span></div>
              {selectedBooking.notes && <div><span className="text-gray-500">Notes:</span><p className="mt-1 text-sm">{selectedBooking.notes}</p></div>}
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

export default AdminDiagnosticBookings;
