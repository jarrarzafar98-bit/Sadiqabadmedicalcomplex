import React from 'react';
import { useSite } from '../context/SiteContext';

const TermsPage = () => {
  const { settings } = useSite();

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="card p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>
            
            <p>
              Welcome to {settings.hospital_name}. By accessing and using our website and services,
              you agree to comply with and be bound by the following terms and conditions.
            </p>

            <h2>Use of Services</h2>
            <p>
              Our online booking system is provided for your convenience. You agree to provide
              accurate and complete information when booking appointments or diagnostic tests.
            </p>

            <h2>Appointment Booking</h2>
            <ul>
              <li>Appointments are subject to availability</li>
              <li>We reserve the right to reschedule or cancel appointments due to unforeseen circumstances</li>
              <li>Please arrive on time for your scheduled appointments</li>
              <li>Cancellations should be made at least 24 hours in advance</li>
            </ul>

            <h2>Medical Disclaimer</h2>
            <p>
              The information provided on this website is for general informational purposes only
              and should not be considered as medical advice. Always consult with a qualified
              healthcare provider for medical concerns.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              {settings.hospital_name} shall not be liable for any indirect, incidental, special,
              or consequential damages arising from the use of our website or services.
            </p>

            <h2>Intellectual Property</h2>
            <p>
              All content on this website, including text, graphics, logos, and images, is the
              property of {settings.hospital_name} and is protected by copyright laws.
            </p>

            <h2>Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of our
              services constitutes acceptance of any changes.
            </p>

            <h2>Contact</h2>
            <p>
              For questions about these Terms of Service, contact us at {settings.email}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
