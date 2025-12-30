import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getDoctors, getSpecialties } from '../services/api';
import { Search, Filter, User, Clock, Languages, ArrowRight } from 'lucide-react';

const DoctorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, specialtiesRes] = await Promise.all([
          getDoctors({ specialty_id: selectedSpecialty || undefined, search: searchQuery || undefined }),
          getSpecialties(true)
        ]);
        setDoctors(doctorsRes.data);
        setSpecialties(specialtiesRes.data);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedSpecialty, searchQuery]);

  const handleSpecialtyChange = (value) => {
    setSelectedSpecialty(value);
    if (value) {
      searchParams.set('specialty', value);
    } else {
      searchParams.delete('specialty');
    }
    setSearchParams(searchParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      searchParams.set('search', searchQuery);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Doctors</h1>
          <p className="text-gray-600">Find and book appointments with our experienced specialists</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by doctor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </form>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={selectedSpecialty}
                onChange={(e) => handleSpecialtyChange(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none min-w-[200px]"
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <User className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No doctors found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="card hover:shadow-lg transition-shadow" data-testid={`doctor-card-${doctor.id}`}>
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-xl font-bold text-primary-600 flex-shrink-0">
                      {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{doctor.name}</h3>
                      <p className="text-sm text-primary-600">{doctor.specialty?.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{doctor.qualifications}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {doctor.experience_years && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} className="text-gray-400" />
                        <span>{doctor.experience_years} years experience</span>
                      </div>
                    )}
                    {doctor.languages?.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Languages size={16} className="text-gray-400" />
                        <span>{doctor.languages.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {doctor.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {doctor.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-gray-500">{doctor.fee}</span>
                    <div className="flex gap-2">
                      <Link
                        to={`/doctors/${doctor.id}`}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Profile
                      </Link>
                      <Link
                        to={`/book-appointment?doctor=${doctor.id}`}
                        className="btn-primary text-sm py-1.5 px-3"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsPage;
