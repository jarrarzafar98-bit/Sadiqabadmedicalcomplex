import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSpecialties, getDoctors } from '../services/api';
import { Heart, Brain, Eye, Wind, Stethoscope, ArrowRight, Users } from 'lucide-react';

const DepartmentsPage = () => {
  const [specialties, setSpecialties] = useState([]);
  const [doctorCounts, setDoctorCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specialtiesRes, doctorsRes] = await Promise.all([
          getSpecialties(true),
          getDoctors({ active_only: true })
        ]);
        setSpecialties(specialtiesRes.data);
        
        // Count doctors per specialty
        const counts = {};
        doctorsRes.data.forEach(doc => {
          counts[doc.specialty_id] = (counts[doc.specialty_id] || 0) + 1;
        });
        setDoctorCounts(counts);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
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

  const specialtyColors = {
    'Cardiology': 'bg-red-50 text-red-600',
    'Neurology': 'bg-purple-50 text-purple-600',
    'Eye Specialist': 'bg-blue-50 text-blue-600',
    'Chest Specialist': 'bg-cyan-50 text-cyan-600',
    'General Medicine': 'bg-green-50 text-green-600',
  };

  const specialtyDescriptions = {
    'Cardiology': 'Our cardiology department provides comprehensive care for heart conditions including diagnosis, treatment, and prevention of cardiovascular diseases. Services include ECG, echocardiography, stress testing, and cardiac consultations.',
    'Neurology': 'Our neurology team specializes in disorders of the nervous system including the brain, spinal cord, and nerves. We treat conditions like epilepsy, stroke, migraines, and movement disorders.',
    'Eye Specialist': 'Our ophthalmology department offers complete eye care services from routine eye exams to advanced surgical procedures. We treat cataracts, glaucoma, retinal diseases, and refractive errors.',
    'Chest Specialist': 'Our pulmonology department focuses on respiratory system diseases. We diagnose and treat asthma, COPD, pneumonia, tuberculosis, and other lung conditions.',
    'General Medicine': 'Our general medicine department provides primary healthcare services including routine check-ups, management of chronic diseases like diabetes and hypertension, and treatment of common illnesses.',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Departments</h1>
            <p className="text-xl text-primary-100">
              Specialized medical care across multiple disciplines with expert doctors.
            </p>
          </div>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            {specialties.map((specialty) => {
              const IconComponent = specialtyIcons[specialty.name] || Stethoscope;
              const colorClass = specialtyColors[specialty.name] || 'bg-gray-50 text-gray-600';
              const description = specialtyDescriptions[specialty.name] || specialty.description;
              const doctorCount = doctorCounts[specialty.id] || 0;

              return (
                <div key={specialty.id} className="card overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-3">
                    <div className={`p-8 ${colorClass.split(' ')[0]} flex flex-col justify-center items-center text-center`}>
                      <div className={`w-20 h-20 rounded-full ${colorClass} flex items-center justify-center mb-4`}>
                        <IconComponent size={40} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{specialty.name}</h2>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={18} />
                        <span>{doctorCount} Doctor{doctorCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="lg:col-span-2 p-8">
                      <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={`/doctors?specialty=${specialty.id}`}
                          className="btn-primary inline-flex items-center gap-2"
                        >
                          View Doctors
                          <ArrowRight size={18} />
                        </Link>
                        <Link
                          to={`/book-appointment`}
                          className="btn-secondary inline-flex items-center gap-2"
                        >
                          Book Appointment
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help Choosing a Department?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Our general medicine doctors can help guide you to the right specialist.
          </p>
          <Link to="/contact" className="btn-secondary bg-white text-primary-600 hover:bg-primary-50">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DepartmentsPage;
