import React, { useState, useEffect } from 'react';
import { getDoctors, getSchedules } from '../services/api';
import { Calendar, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorTimingsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, schedulesRes] = await Promise.all([
          getDoctors({ active_only: true }),
          getSchedules()
        ]);
        setDoctors(doctorsRes.data);
        setSchedules(schedulesRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDoctorScheduleForDay = (doctorId, dayOfWeek) => {
    return schedules.find(
      (s) => s.doctor_id === doctorId && s.day_of_week === dayOfWeek && s.active
    );
  };

  const doctorsForSelectedDay = doctors.filter((doctor) =>
    getDoctorScheduleForDay(doctor.id, selectedDay)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Timings</h1>
          <p className="text-gray-600">View weekly schedules of our doctors</p>
        </div>

        {/* Day Selector */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {dayNames.map((day, index) => (
              <button
                key={day}
                onClick={() => setSelectedDay(index)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedDay === index
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Timetable */}
        <div className="card overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-primary-600" />
              {dayNames[selectedDay]} Schedule
            </h2>
          </div>

          {doctorsForSelectedDay.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No doctors available on {dayNames[selectedDay]}</p>
            </div>
          ) : (
            <div className="divide-y">
              {doctorsForSelectedDay.map((doctor) => {
                const schedule = getDoctorScheduleForDay(doctor.id, selectedDay);
                return (
                  <div
                    key={doctor.id}
                    className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-lg font-bold text-primary-600">
                        {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-sm text-primary-600">{doctor.specialty?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {schedule?.start_time} - {schedule?.end_time}
                        </p>
                        <p className="text-sm text-gray-500">
                          {schedule?.slot_minutes} min slots
                        </p>
                      </div>
                      <Link
                        to={`/book-appointment?doctor=${doctor.id}`}
                        className="btn-primary text-sm py-2 px-4"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Full Schedule Table */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Overview</h2>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Doctor</th>
                  {dayNames.map((day) => (
                    <th key={day} className="text-center py-3 px-2 font-semibold text-gray-700 text-sm">
                      {day.substring(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                          {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{doctor.name}</p>
                          <p className="text-xs text-gray-500">{doctor.specialty?.name}</p>
                        </div>
                      </div>
                    </td>
                    {dayNames.map((_, dayIndex) => {
                      const schedule = getDoctorScheduleForDay(doctor.id, dayIndex);
                      return (
                        <td key={dayIndex} className="text-center py-3 px-2">
                          {schedule ? (
                            <span className="text-xs text-gray-600">
                              {schedule.start_time}-{schedule.end_time}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorTimingsPage;
