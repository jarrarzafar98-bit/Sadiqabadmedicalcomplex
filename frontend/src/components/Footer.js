import React from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import {
  Heart, Phone, Mail, MapPin, Clock,
  Facebook, Twitter, Instagram, MessageCircle
} from 'lucide-react';

const Footer = () => {
  const { settings } = useSite();

  const quickLinks = [
    { path: '/doctors', label: 'Find a Doctor' },
    { path: '/diagnostics', label: 'Book a Test' },
    { path: '/doctor-timings', label: 'Doctor Timings' },
    { path: '/departments', label: 'Departments' },
    { path: '/blog', label: 'Health Articles' },
    { path: '/contact', label: 'Contact Us' },
  ];

  const legalLinks = [
    { path: '/privacy-policy', label: 'Privacy Policy' },
    { path: '/terms', label: 'Terms of Service' },
    { path: '/disclaimer', label: 'Disclaimer' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Heart className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold">{settings.hospital_name}</h3>
                <p className="text-xs text-gray-400">{settings.tagline}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {settings.about_text?.substring(0, 150) || 'Providing quality healthcare services to our community with compassion and excellence.'}
              {settings.about_text?.length > 150 && '...'}
            </p>
            <div className="flex gap-3">
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <Facebook size={18} />
                </a>
              )}
              {settings.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <Twitter size={18} />
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <Instagram size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li>
                <a href={`tel:${settings.phone}`} className="flex items-start gap-3 text-sm hover:text-primary-400 transition-colors">
                  <Phone size={18} className="mt-0.5 flex-shrink-0" />
                  <span>{settings.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${settings.whatsapp?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm hover:text-green-400 transition-colors"
                >
                  <MessageCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-start gap-3 text-sm hover:text-primary-400 transition-colors">
                  <Mail size={18} className="mt-0.5 flex-shrink-0" />
                  <span>{settings.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div>
            <h4 className="text-white font-semibold mb-4">Working Hours</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Clock size={18} className="mt-0.5 flex-shrink-0 text-primary-400" />
                <div>
                  <p className="text-gray-300">{settings.working_hours}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] text-white font-bold">24</span>
                </div>
                <div>
                  <p className="text-red-400 font-medium">{settings.emergency_hours}</p>
                </div>
              </li>
            </ul>
            
            {/* CTA */}
            <div className="mt-6">
              <Link
                to="/book-appointment"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {settings.hospital_name}. All rights reserved.
            </p>
            <div className="flex gap-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
