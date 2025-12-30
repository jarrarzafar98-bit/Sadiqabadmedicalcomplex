import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getDoctors, getSpecialties, getAvailableSlots, createAppointment } from '../services/api';
import { useSite } from '../context/SiteContext';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';

const BookAppointmentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings } = useSite();
  
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState('');

  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(searchParams.get('doctor') || '');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState('');
  const [patientData, setPatientData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, specialtiesRes] = await Promise.all([
          getDoctors({ active_only: true }),
          getSpecialties(true)
        ]);
        setDoctors(doctorsRes.data);
        setSpecialties(specialtiesRes.data);

        if (searchParams.get('doctor')) {
          const doc = doctorsRes.data.find(d => d.id === searchParams.get('doctor'));
          if (doc) {
            setSelectedSpecialty(doc.specialty_id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const fetchSlots = async () => {
        try {
          const response = await getAvailableSlots(selectedDoctor, selectedDate);
          setAvailableSlots(response.data.slots || []);
        } catch (error) {
          console.error('Failed to fetch slots:', error);
          setAvailableSlots([]);
        }
      };
      fetchSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const filteredDoctors = selectedSpecialty
    ? doctors.filter(d => d.specialty_id === selectedSpecialty)
    : doctors;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await createAppointment({
        doctor_id: selectedDoctor,
        date_time: selectedSlot,
        patient_name: patientData.name,
        patient_phone: patientData.phone,
        patient_email: patientData.email || undefined,
        patient_gender: patientData.gender || undefined,
        notes: patientData.notes || undefined
      });

      setConfirmation({
        referenceNumber: response.data.reference_number,
        whatsappMessage: response.data.whatsapp_template,
        doctor: doctors.find(d => d.id === selectedDoctor),
        dateTime: selectedSlot
      });
      setStep(4);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to book appointment. Please try again.');
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
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h1>
            <p className="text-gray-600 mb-6">Your appointment has been successfully scheduled.</p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Reference No:</span>
                  <span className="font-semibold text-primary-600">{confirmation.referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Doctor:</span>
                  <span className="font-medium">{confirmation.doctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date & Time:</span>
                  <span className="font-medium">
                    {format(parseISO(confirmation.dateTime), 'PPp')}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Please arrive 15 minutes before your scheduled appointment.
            </p>

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
                onClick={() => navigate('/doctors')}
                className="w-full btn-secondary"
              >
                Back to Doctors
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
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Appointment</h1>
          <p className="text-gray-600">Schedule an appointment with our doctors</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
          {['Doctor', 'Date & Time', 'Details'].map((label, index) => (
            <div key={label} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                step > index + 1 ? 'bg-green-500 text-white' :
                step === index + 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
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

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Doctor</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Specialty</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => {
                  setSelectedSpecialty(e.target.value);
                  setSelectedDoctor('');
                }}
                className="input-field"
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedDoctor === doctor.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-lg font-bold text-primary-600">
                      {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-primary-600">{doctor.specialty?.name}</p>
                      <p className="text-xs text-gray-500">{doctor.qualifications}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{doctor.fee}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedDoctor}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      setSelectedSlot('');
                    }}
                    className={`flex-shrink-0 w-16 py-3 rounded-lg text-center transition-all ${
                      selectedDate === day.date
                        ? 'bg-primary-600 text-white'
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
              <label className="block text-sm font-medium text-gray-700 mb-3">Available Slots</label>
              {availableSlots.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Clock className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-gray-500">No slots available for this date</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.datetime}
                      onClick={() => setSelectedSlot(slot.datetime)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        selectedSlot === slot.datetime
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
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
                disabled={!selectedSlot}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  placeholder="Any specific concerns or requirements..."
                />
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Appointment Summary</h3>
              <div className="text-sm space-y-1">
                <p><span className="text-gray-500">Doctor:</span> {doctors.find(d => d.id === selectedDoctor)?.name}</p>
                <p><span className="text-gray-500">Date & Time:</span> {format(parseISO(selectedSlot), 'PPp')}</p>
              </div>
            </div>

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
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
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

export default BookAppointmentPage;
