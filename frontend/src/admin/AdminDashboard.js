import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardAnalytics, getBookingsAnalytics } from '../services/api';
import {
  Users, Calendar, TestTube, MessageSquare, TrendingUp,
  Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [bookingsTrend, setBookingsTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, trendsRes] = await Promise.all([
          getDashboardAnalytics(),
          getBookingsAnalytics(7)
        ]);
        setAnalytics(analyticsRes.data);
        setBookingsTrend(trendsRes.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Doctors', value: analytics?.total_doctors || 0, icon: Users, color: 'bg-blue-500' },
    { label: "Today's Appointments", value: analytics?.today_appointments || 0, icon: Calendar, color: 'bg-green-500' },
    { label: "Today's Tests", value: analytics?.today_diagnostics || 0, icon: TestTube, color: 'bg-purple-500' },
    { label: 'Unread Messages', value: analytics?.unread_messages || 0, icon: MessageSquare, color: 'bg-amber-500' },
  ];

  const appointmentStats = analytics?.appointment_stats || {};

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Appointment Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <Clock className="mx-auto text-blue-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-900">{appointmentStats.new || 0}</p>
              <p className="text-sm text-gray-500">New</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <CheckCircle className="mx-auto text-green-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-900">{appointmentStats.confirmed || 0}</p>
              <p className="text-sm text-gray-500">Confirmed</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <CheckCircle className="mx-auto text-purple-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-900">{appointmentStats.completed || 0}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <XCircle className="mx-auto text-red-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-900">{appointmentStats.cancelled || 0}</p>
              <p className="text-sm text-gray-500">Cancelled</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg text-center">
              <AlertCircle className="mx-auto text-amber-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-900">{appointmentStats.no_show || 0}</p>
              <p className="text-sm text-gray-500">No Show</p>
            </div>
          </div>
        </div>

        {/* 7-Day Trend */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">7-Day Booking Trend</h3>
          <div className="space-y-3">
            {bookingsTrend.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-24">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 flex gap-2">
                  <div
                    className="h-6 bg-primary-500 rounded"
                    style={{ width: `${Math.max((day.appointments / 10) * 100, 5)}%` }}
                    title={`${day.appointments} appointments`}
                  ></div>
                  <div
                    className="h-6 bg-accent-500 rounded"
                    style={{ width: `${Math.max((day.diagnostics / 10) * 100, 5)}%` }}
                    title={`${day.diagnostics} tests`}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">
                  {day.appointments + day.diagnostics}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded"></div>
              <span className="text-sm text-gray-500">Appointments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent-500 rounded"></div>
              <span className="text-sm text-gray-500">Tests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Appointments</h3>
          <Link to="/admin/appointments" className="text-sm text-primary-600 hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Reference</th>
                <th className="pb-3 font-medium">Patient</th>
                <th className="pb-3 font-medium">Date/Time</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {analytics?.recent_appointments?.map((apt) => (
                <tr key={apt.id} className="text-sm">
                  <td className="py-3 font-medium text-primary-600">{apt.reference_number}</td>
                  <td className="py-3 text-gray-900">{apt.patient_name}</td>
                  <td className="py-3 text-gray-600">{new Date(apt.date_time).toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      apt.status === 'new' ? 'bg-blue-100 text-blue-700' :
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      apt.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                      apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!analytics?.recent_appointments || analytics.recent_appointments.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No recent appointments
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/admin/doctors" className="card p-4 hover:shadow-md transition-shadow text-center">
          <Users className="mx-auto text-primary-600 mb-2" size={24} />
          <span className="text-sm font-medium text-gray-700">Manage Doctors</span>
        </Link>
        <Link to="/admin/appointments" className="card p-4 hover:shadow-md transition-shadow text-center">
          <Calendar className="mx-auto text-primary-600 mb-2" size={24} />
          <span className="text-sm font-medium text-gray-700">View Appointments</span>
        </Link>
        <Link to="/admin/diagnostics" className="card p-4 hover:shadow-md transition-shadow text-center">
          <TestTube className="mx-auto text-primary-600 mb-2" size={24} />
          <span className="text-sm font-medium text-gray-700">Manage Tests</span>
        </Link>
        <Link to="/admin/messages" className="card p-4 hover:shadow-md transition-shadow text-center">
          <MessageSquare className="mx-auto text-primary-600 mb-2" size={24} />
          <span className="text-sm font-medium text-gray-700">View Messages</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
