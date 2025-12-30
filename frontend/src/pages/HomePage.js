import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { getDoctors, getSpecialties, getDiagnosticTests } from '../services/api';
import {
  Phone, Calendar, TestTube, Stethoscope, Heart, Brain,
  Eye, Wind, Search, ArrowRight, Star, Clock, MapPin,
  MessageCircle, Shield, Users, Award
} from 'lucide-react';

const HomePage = () => {
  const { settings } = useSite();
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('doctor');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, specialtiesRes] = await Promise.all([
          getDoctors({ active_only: true }),
          getSpecialties(true)
        ]);
        setDoctors(doctorsRes.data.slice(0, 4));
        setSpecialties(specialtiesRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const specialtyIcons = {
    'Cardiology': Heart,
    'Neurology': Brain,
    'Eye Specialist': Eye,
    'Chest Specialist': Wind,
    'General Medicine': Stethoscope,
  };

  const stats = [
    { value: '8+', label: 'Expert Doctors', icon: Users },
    { value: '25+', label: 'Diagnostic Tests', icon: TestTube },
    { value: '24/7', label: 'Emergency Care', icon: Shield },
    { value: '10+', label: 'Years Experience', icon: Award },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Your Health,<br />Our Priority
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Comprehensive healthcare services with expert doctors and state-of-the-art diagnostic facilities.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/book-appointment"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 font-semibold py-4 px-8 rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl"
                data-testid="hero-book-appointment"
              >
                <Calendar size={22} />
                Book Appointment
              </Link>
              <Link
                to="/book-diagnostic"
                className="inline-flex items-center justify-center gap-2 bg-accent-500 text-white font-semibold py-4 px-8 rounded-xl hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl"
                data-testid="hero-book-test"
              >
                <TestTube size={22} />
                Book Diagnostic Test
              </Link>
            </div>

            {/* Contact Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`tel:${settings.phone}`}
                className="inline-flex items-center justify-center gap-2 bg-primary-500/30 backdrop-blur text-white font-medium py-3 px-6 rounded-lg hover:bg-primary-500/40 transition-all"
              >
                <Phone size={20} />
                Call Now
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp?.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-green-600 transition-all"
              >
                <MessageCircle size={20} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white py-8 shadow-sm relative -mt-6 mx-4 md:mx-auto max-w-4xl rounded-2xl z-10">
        <div className="px-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSearchType('doctor')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'doctor' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
                }`}
              >
                Find Doctor
              </button>
              <button
                onClick={() => setSearchType('test')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'test' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
                }`}
              >
                Find Test
              </button>
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={searchType === 'doctor' ? 'Search by doctor name or specialty...' : 'Search diagnostic tests...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <Link
              to={searchType === 'doctor' ? `/doctors?search=${searchQuery}` : `/diagnostics?search=${searchQuery}`}
              className="btn-primary flex items-center justify-center gap-2"
            >
              Search
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm">
                <stat.icon className="mx-auto text-primary-600 mb-3" size={32} />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments/Specialties */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Departments</h2>
            <p className="section-subtitle">Expert care across multiple specialties</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {specialties.map((specialty) => {
              const IconComponent = specialtyIcons[specialty.name] || Stethoscope;
              return (
                <Link
                  key={specialty.id}
                  to={`/doctors?specialty=${specialty.id}`}
                  className="card p-6 text-center hover:shadow-lg transition-shadow group"
                >
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
                    <IconComponent className="text-primary-600" size={28} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{specialty.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{specialty.description}</p>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link to="/departments" className="btn-secondary inline-flex items-center gap-2">
              View All Departments
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Meet Our Doctors</h2>
            <p className="section-subtitle">Experienced specialists dedicated to your care</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="card overflow-hidden group">
                <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-primary-600">
                    {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-1">{doctor.name}</h3>
                  <p className="text-sm text-primary-600 mb-2">{doctor.specialty?.name}</p>
                  <p className="text-xs text-gray-500 mb-3">{doctor.qualifications}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{doctor.experience_years} years exp.</span>
                    <Link
                      to={`/doctors/${doctor.id}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/doctors" className="btn-primary inline-flex items-center gap-2">
              View All Doctors
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Diagnostic Center CTA */}
      <section className="py-16 bg-accent-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <TestTube className="mx-auto mb-6" size={48} />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Diagnostic Center</h2>
            <p className="text-xl text-accent-100 mb-8">
              Comprehensive lab tests and imaging services with accurate results and quick turnaround time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/diagnostics"
                className="inline-flex items-center justify-center gap-2 bg-white text-accent-600 font-semibold py-3 px-8 rounded-lg hover:bg-accent-50 transition-all"
              >
                View All Tests
              </Link>
              <Link
                to="/book-diagnostic"
                className="inline-flex items-center justify-center gap-2 bg-accent-700 text-white font-semibold py-3 px-8 rounded-lg hover:bg-accent-800 transition-all"
              >
                Book a Test
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Strip */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="text-primary-600" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Phone</h4>
                <a href={`tel:${settings.phone}`} className="text-primary-600 hover:underline">
                  {settings.phone}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="text-primary-600" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Working Hours</h4>
                <p className="text-gray-600 text-sm">{settings.working_hours}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="text-primary-600" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Location</h4>
                <p className="text-gray-600 text-sm">{settings.address}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
