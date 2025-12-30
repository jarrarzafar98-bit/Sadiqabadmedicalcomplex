import React from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { Heart, Target, Award, Users, Building, Clock, Shield, Star } from 'lucide-react';

const AboutPage = () => {
  const { settings } = useSite();

  const features = [
    { icon: Building, title: 'Modern Facility', desc: 'State-of-the-art medical equipment and comfortable environment' },
    { icon: Users, title: 'Expert Team', desc: 'Highly qualified and experienced medical professionals' },
    { icon: Clock, title: '24/7 Emergency', desc: 'Round-the-clock emergency medical services' },
    { icon: Shield, title: 'Quality Care', desc: 'Committed to providing the highest standards of healthcare' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
            <p className="text-xl text-primary-100">
              {settings.tagline} - Providing quality healthcare to our community.
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome to {settings.hospital_name}</h2>
              <div className="prose prose-lg text-gray-600">
                <p className="mb-4">
                  {settings.about_text || `${settings.hospital_name} is a leading healthcare facility dedicated to providing comprehensive medical services to our community. Our state-of-the-art facility combines modern medical technology with compassionate care, ensuring that every patient receives the best possible treatment.`}
                </p>
                <p className="mb-4">
                  With a team of highly qualified specialists and state-of-the-art diagnostic facilities, we offer a wide range of medical services under one roof. Our commitment to excellence and patient-centered care has made us a trusted name in healthcare.
                </p>
              </div>
              <div className="mt-8">
                <Link to="/doctors" className="btn-primary inline-flex items-center gap-2">
                  Meet Our Doctors
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="card p-6 text-center">
                  <feature.icon className="mx-auto text-primary-600 mb-3" size={32} />
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-8 bg-gradient-to-br from-primary-50 to-white">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <Target className="text-primary-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                {settings.mission_text || 'To provide accessible, high-quality healthcare services to our community with compassion, integrity, and excellence. We are committed to improving the health and well-being of every patient who walks through our doors.'}
              </p>
            </div>
            <div className="card p-8 bg-gradient-to-br from-accent-50 to-white">
              <div className="w-14 h-14 bg-accent-100 rounded-xl flex items-center justify-center mb-6">
                <Star className="text-accent-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the most trusted healthcare provider in our region, recognized for our commitment to patient care, medical excellence, and community service. We aspire to set new standards in healthcare delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Compassion</h3>
              <p className="text-gray-600">We treat every patient with empathy, kindness, and understanding.</p>
            </div>
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-blue-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">We strive for the highest standards in medical care and service.</p>
            </div>
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Integrity</h3>
              <p className="text-gray-600">We uphold the highest ethical standards in all our interactions.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
