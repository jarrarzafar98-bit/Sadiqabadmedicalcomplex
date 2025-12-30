import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Appointments',
      questions: [
        {
          q: 'How do I book an appointment?',
          a: 'You can book an appointment through our website by clicking on "Book Appointment" button, selecting your preferred doctor, date, and time slot. You can also call us directly or visit our reception.'
        },
        {
          q: 'Can I cancel or reschedule my appointment?',
          a: 'Yes, you can cancel or reschedule your appointment by contacting our reception via phone or WhatsApp. We recommend doing this at least 24 hours in advance.'
        },
        {
          q: 'What should I bring to my appointment?',
          a: 'Please bring your ID card (CNIC), any previous medical records, current medications list, and your appointment reference number if booked online.'
        },
        {
          q: 'How early should I arrive for my appointment?',
          a: 'We recommend arriving 15 minutes before your scheduled appointment time for registration and any necessary paperwork.'
        }
      ]
    },
    {
      category: 'Diagnostic Tests',
      questions: [
        {
          q: 'Do I need to fast before blood tests?',
          a: 'Some tests require fasting (usually 8-12 hours). Common tests requiring fasting include blood sugar (fasting), lipid profile, and liver function tests. The specific preparation instructions are shown when you book a test.'
        },
        {
          q: 'How long does it take to get test results?',
          a: 'Most routine lab tests are available same day. Some specialized tests may take 24-48 hours. The expected report time is mentioned with each test on our website.'
        },
        {
          q: 'Can I get my reports online?',
          a: 'Currently, reports can be collected from our diagnostic center. We are working on an online portal for report access.'
        }
      ]
    },
    {
      category: 'Payments',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept cash payments at our facility. Online payment options will be available soon.'
        },
        {
          q: 'Do you accept health insurance?',
          a: 'Please contact our billing department for information about insurance coverage and accepted insurance providers.'
        },
        {
          q: 'What are the consultation fees?',
          a: 'Consultation fees vary by doctor and specialty. Please call our reception or check the doctor\'s profile on our website for fee information.'
        }
      ]
    },
    {
      category: 'General',
      questions: [
        {
          q: 'What are your working hours?',
          a: 'We are open Monday to Saturday from 8:00 AM to 10:00 PM, and Sundays from 9:00 AM to 5:00 PM. Emergency services are available 24/7.'
        },
        {
          q: 'Do you have parking facilities?',
          a: 'Yes, we have dedicated parking space for patients and visitors.'
        },
        {
          q: 'Is wheelchair access available?',
          a: 'Yes, our facility is wheelchair accessible with ramps and elevators available.'
        },
        {
          q: 'Do you have a pharmacy?',
          a: 'An on-site pharmacy is planned for the near future. Currently, we can provide prescriptions that can be filled at any pharmacy.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleFaq = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-primary-100">
              Find answers to common questions about our services and facilities.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          {/* FAQs */}
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <HelpCircle className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
              <p className="text-gray-500">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFaqs.map((category, categoryIndex) => (
                <div key={category.category}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{category.category}</h2>
                  <div className="card divide-y">
                    {category.questions.map((faq, questionIndex) => {
                      const isOpen = openIndex === `${categoryIndex}-${questionIndex}`;
                      return (
                        <div key={questionIndex}>
                          <button
                            onClick={() => toggleFaq(categoryIndex, questionIndex)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                            {isOpen ? (
                              <ChevronUp className="text-gray-400 flex-shrink-0" size={20} />
                            ) : (
                              <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-4 text-gray-600 animate-fadeIn">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Still have questions */}
          <div className="mt-12 card p-8 text-center bg-primary-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Contact us directly.
            </p>
            <Link to="/contact" className="btn-primary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
