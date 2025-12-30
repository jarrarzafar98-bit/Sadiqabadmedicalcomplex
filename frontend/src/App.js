import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SiteProvider } from './context/SiteContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import DoctorTimingsPage from './pages/DoctorTimingsPage';
import DiagnosticsPage from './pages/DiagnosticsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import BookDiagnosticPage from './pages/BookDiagnosticPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import DisclaimerPage from './pages/DisclaimerPage';

// Admin Pages
import AdminLoginPage from './admin/AdminLoginPage';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminDoctors from './admin/AdminDoctors';
import AdminSpecialties from './admin/AdminSpecialties';
import AdminSchedules from './admin/AdminSchedules';
import AdminAppointments from './admin/AdminAppointments';
import AdminDiagnostics from './admin/AdminDiagnostics';
import AdminDiagnosticBookings from './admin/AdminDiagnosticBookings';
import AdminBlog from './admin/AdminBlog';
import AdminMessages from './admin/AdminMessages';
import AdminSettings from './admin/AdminSettings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Public Layout
const PublicLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <SiteProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/doctors" element={<PublicLayout><DoctorsPage /></PublicLayout>} />
            <Route path="/doctors/:id" element={<PublicLayout><DoctorProfilePage /></PublicLayout>} />
            <Route path="/doctor-timings" element={<PublicLayout><DoctorTimingsPage /></PublicLayout>} />
            <Route path="/diagnostics" element={<PublicLayout><DiagnosticsPage /></PublicLayout>} />
            <Route path="/departments" element={<PublicLayout><DepartmentsPage /></PublicLayout>} />
            <Route path="/book-appointment" element={<PublicLayout><BookAppointmentPage /></PublicLayout>} />
            <Route path="/book-diagnostic" element={<PublicLayout><BookDiagnosticPage /></PublicLayout>} />
            <Route path="/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
            <Route path="/blog/:slug" element={<PublicLayout><BlogPostPage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
            <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />
            <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
            <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
            <Route path="/disclaimer" element={<PublicLayout><DisclaimerPage /></PublicLayout>} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="specialties" element={<AdminSpecialties />} />
              <Route path="schedules" element={<AdminSchedules />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="diagnostics" element={<AdminDiagnostics />} />
              <Route path="diagnostic-bookings" element={<AdminDiagnosticBookings />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SiteProvider>
    </AuthProvider>
  );
}

export default App;
