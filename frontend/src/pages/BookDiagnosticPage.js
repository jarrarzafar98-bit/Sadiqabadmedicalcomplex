import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getDiagnosticTests, createDiagnosticBooking } from '../services/api';
import { useSite } from '../context/SiteContext';
import { Calendar, Clock, TestTube, CheckCircle, ArrowLeft, ArrowRight, MessageCircle, FileText } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';

const BookDiagnosticPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings } = useSite();
  
  const [step, setStep] = useState(1);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTest, setSelectedTest] = useState(searchParams.get('test') || '');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState('');
  const [patientData, setPatientData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: '',
    notes: ''
  });

  const categories = [
    { value: '', label: 'All Tests' },
    { value: 'lab_tests', label: 'Lab Tests' },
    { value: 'imaging', label: 'Imaging' },
    { value: 'cardiology', label: 'Cardiology' },
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await getDiagnosticTests({ active_only: true });
        setTests(response.data);
      } catch (error) {
        console.error('Failed to fetch tests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const filteredTests = selectedCategory
    ? tests.filter(t => t.category === selectedCategory)
    : tests;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await createDiagnosticBooking({
        test_id: selectedTest,
        date_time: `${selectedDate} ${selectedTime}`,
        patient_name: patientData.name,
        patient_phone: patientData.phone,
        patient_email: patientData.email || undefined,
        patient_gender: patientData.gender || undefined,
        notes: patientData.notes || undefined
      });

      const testInfo = tests.find(t => t.id === selectedTest);
      setConfirmation({
        referenceNumber: response.data.reference_number,
        whatsappMessage: response.data.whatsapp_template,
        test: testInfo,
        dateTime: `${selectedDate} ${selectedTime}`,
        preparation: response.data.preparation
      });
      setStep(4);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to book test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const date = addDays(new Date(), i);
      days.push({
        date: format(date, 'yyyy-MM-dd'),
        day: format(date, 'EEE'),
        dayNum: format(date, 'd'),
        month: format(date, 'MMM')
      });
    }
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-accent-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Confirmation Page
  if (step === 4 && confirmation) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="card p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500" size={48} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Booked!</h1>
            <p className="text-gray-600 mb-6">Your diagnostic test has been successfully scheduled.</p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Reference No:</span>
                  <span className="font-semibold text-accent-600">{confirmation.referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Test:</span>
                  <span className="font-medium">{confirmation.test?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date & Time:</span>
                  <span className="font-medium">
                    {format(parseISO(confirmation.dateTime.replace(' ', 'T')), 'PPp')}
                  </span>
                </div>
              </div>
            </div>

            {confirmation.preparation && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-amber-800 flex items-center gap-2 mb-2">
                  <FileText size={18} />
                  Preparation Instructions
                </h3>
                <p className="text-sm text-amber-700">{confirmation.preparation}</p>
              </div>
            )}

            <div className="space-y-3">
              <a
                href={`https://wa.me/${settings.whatsapp?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(confirmation.whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                <MessageCircle size={20} />
                Share on WhatsApp
              </a>
              <button
                onClick={() => navigate('/diagnostics')}
                className="w-full btn-secondary"
              >
                Back to Diagnostics
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-accent-600 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Diagnostic Test</h1>
          <p className="text-gray-600">Schedule a diagnostic test at our center</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
          {['Test', 'Date & Time', 'Details'].map((label, index) => (
            <div key={label} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                step > index + 1 ? 'bg-green-500 text-white' :
                step === index + 1 ? 'bg-accent-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > index + 1 ? '✓' : index + 1}
              </div>
              <span className={`ml-2 text-sm hidden sm:block ${
                step >= index + 1 ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {label}
              </span>
              {index < 2 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-2 ${
                  step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Select Test */}
        {step === 1 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Test</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setSelectedCategory(cat.value);
                      setSelectedTest('');
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === cat.value
                        ? 'bg-accent-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredTests.map((test) => (
                <div
                  key={test.id}
                  onClick={() => setSelectedTest(test.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTest === test.id
                      ? 'border-accent-500 bg-accent-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{test.name}</h3>
                      {test.description && (
                        <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        {test.report_time && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {test.report_time}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{test.price}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedTest}
                className="btn-accent flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Date & Time</h2>
            
            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Date</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {getNextDays().map((day) => (
                  <button
                    key={day.date}
                    onClick={() => {
                      setSelectedDate(day.date);
                      setSelectedTime('');
                    }}
                    className={`flex-shrink-0 w-16 py-3 rounded-lg text-center transition-all ${
                      selectedDate === day.date
                        ? 'bg-accent-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <p className="text-xs">{day.day}</p>
                    <p className="text-lg font-semibold">{day.dayNum}</p>
                    <p className="text-xs">{day.month}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Time</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      selectedTime === time
                        ? 'bg-accent-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedTime}
                className="btn-accent flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Patient Details */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={patientData.name}
                  onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                  className="input-field"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={patientData.phone}
                  onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
                  className="input-field"
                  placeholder="03XX-XXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={patientData.email}
                  onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={patientData.gender}
                  onChange={(e) => setPatientData({...patientData, gender: e.target.value})}
                  className="input-field"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  value={patientData.notes}
                  onChange={(e) => setPatientData({...patientData, notes: e.target.value})}
                  className="input-field"
                  rows={3}
                  placeholder="Any specific concerns..."
                />
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Booking Summary</h3>
              <div className="text-sm space-y-1">
                <p><span className="text-gray-500">Test:</span> {tests.find(t => t.id === selectedTest)?.name}</p>
                <p><span className="text-gray-500">Date & Time:</span> {format(parseISO(`${selectedDate}T${selectedTime}`), 'PPp')}</p>
              </div>
            </div>

            {/* Preparation Notice */}
            {tests.find(t => t.id === selectedTest)?.preparation && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="font-medium text-amber-800 flex items-center gap-2 mb-1">
                  <FileText size={16} />
                  Preparation Required
                </h3>
                <p className="text-sm text-amber-700">
                  {tests.find(t => t.id === selectedTest)?.preparation}
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-accent flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Booking...' : 'Confirm Booking'}
                <CheckCircle size={18} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookDiagnosticPage;
