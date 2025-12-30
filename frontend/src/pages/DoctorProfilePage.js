import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDoctor } from '../services/api';
import { User, Clock, Languages, Calendar, Phone, Mail, ArrowLeft, Award } from 'lucide-react';

const DoctorProfilePage = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await getDoctor(id);
        setDoctor(response.data);
      } catch (error) {
        console.error('Failed to fetch doctor:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-700">Doctor not found</h2>
          <Link to="/doctors" className="text-primary-600 hover:underline mt-2 inline-block">
            Back to Doctors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/doctors"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Doctors
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-4xl font-bold text-primary-600 mx-auto mb-4">
                  {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
                <p className="text-primary-600 font-medium">{doctor.specialty?.name}</p>
                <p className="text-sm text-gray-500 mt-1">{doctor.qualifications}</p>
              </div>

              <div className="space-y-3 mb-6">
                {doctor.experience_years && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Award size={18} className="text-primary-500" />
                    <span>{doctor.experience_years} years experience</span>
                  </div>
                )}
                {doctor.languages?.length > 0 && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Languages size={18} className="text-primary-500" />
                    <span>{doctor.languages.join(', ')}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock size={18} className="text-primary-500" />
                  <span>{doctor.fee}</span>
                </div>
              </div>

              <Link
                to={`/book-appointment?doctor=${doctor.id}`}
                className="btn-primary w-full flex items-center justify-center gap-2"
                data-testid="book-appointment-btn"
              >
                <Calendar size={18} />
                Book Appointment
              </Link>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {doctor.bio && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
              </div>
            )}

            {/* Tags/Specializations */}
            {doctor.tags?.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {doctor.tags.map((tag, index) => (
                    <span key={index} className="bg-primary-50 text-primary-600 px-3 py-1.5 rounded-lg text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Schedule</h2>
              {doctor.schedules?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctor.schedules
                    .sort((a, b) => a.day_of_week - b.day_of_week)
                    .map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-700">
                          {dayNames[schedule.day_of_week]}
                        </span>
                        <span className="text-gray-600">
                          {schedule.start_time} - {schedule.end_time}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500">Schedule not available. Please contact for appointment.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
