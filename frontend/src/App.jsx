
import React, { Suspense, lazy } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import OfflineIndicator from './components/OfflineIndicator';
import InstallPrompt from './components/InstallPrompt';
import PushNotificationPrompt from './components/PushNotificationPrompt';
import { AuthProvider } from './contexts/AuthContext';
import { UserTypeProvider } from './contexts/UserTypeContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Lazy loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ThemeCustomizer = lazy(() => import('./pages/ThemeCustomizer'));

const CandidateDashboard = lazy(() => import('./pages/CandidateDashboard'));
const CandidateMatchesPage = lazy(() => import('./pages/CandidateMatchesPage'));
const CandidateInterviewPage = lazy(() => import('./pages/CandidateInterviewPage'));
const CandidateMyGigsPage = lazy(() => import('./pages/CandidateMyGigsPage'));
const CandidateMyCoursesPage = lazy(() => import('./pages/CandidateMyCoursesPage'));

const CompanyDashboard = lazy(() => import('./pages/CompanyDashboard'));
const CompanyCandidatesPage = lazy(() => import('./pages/CompanyCandidatesPage'));

const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./pages/PaymentFailed'));

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminCompaniesPage = lazy(() => import('./pages/AdminCompaniesPage'));
const AdminCandidatesPage = lazy(() => import('./pages/AdminCandidatesPage'));
const AdminJobsPage = lazy(() => import('./pages/AdminJobsPage'));
const AdminContractsPage = lazy(() => import('./pages/AdminContractsPage'));
const AdminPaymentsPage = lazy(() => import('./pages/AdminPaymentsPage'));

const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const GigDetailPage = lazy(() => import('./pages/GigDetailPage'));
const CreateGigPage = lazy(() => import('./pages/CreateGigPage'));
const GigCheckoutPage = lazy(() => import('./pages/GigCheckoutPage'));

const AcademyPage = lazy(() => import('./pages/AcademyPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const InstructorMyCoursesPage = lazy(() => import('./pages/InstructorMyCoursesPage'));

function App() {
    return (
        <AuthProvider>
            <UserTypeProvider>
                <ThemeProvider>
                  <Router>
                      <ScrollToTop />
                      <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
                          <Header />
                          <OfflineIndicator />
                          <InstallPrompt />
                          <PushNotificationPrompt />
                          <main className="flex-1 flex flex-col">
                              <Suspense fallback={<LoadingSpinner />}>
                                  <Routes>
                                      <Route path="/" element={<LandingPage />} />
                                      <Route path="/auth/login" element={<LoginPage />} />
                                      <Route path="/auth/signup" element={<SignupPage />} />
                                      <Route path="/settings/appearance" element={<ProtectedRoute><ThemeCustomizer /></ProtectedRoute>} />
                                      
                                      {/* Marketplace Routes */}
                                      <Route path="/marketplace" element={<MarketplacePage />} />
                                      <Route path="/marketplace/gig/:gigId" element={<GigDetailPage />} />
                                      <Route path="/marketplace/create-gig" element={<ProtectedRoute><CreateGigPage /></ProtectedRoute>} />
                                      <Route path="/marketplace/checkout/:gigId" element={<ProtectedRoute><GigCheckoutPage /></ProtectedRoute>} />

                                      {/* Academy Routes */}
                                      <Route path="/academy" element={<AcademyPage />} />
                                      <Route path="/academy/course/:courseId" element={<CourseDetailPage />} />
                                      <Route path="/academy/course/:courseId/lesson/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
                                      <Route path="/academy/course/:courseId/quiz/:quizId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
                                      <Route path="/instructor/my-courses" element={<ProtectedRoute><InstructorMyCoursesPage /></ProtectedRoute>} />

                                      {/* Candidate Routes */}
                                      <Route path="/candidate/dashboard" element={<ProtectedRoute><CandidateDashboard /></ProtectedRoute>} />
                                      <Route path="/candidate/matches" element={<ProtectedRoute><CandidateMatchesPage /></ProtectedRoute>} />
                                      <Route path="/candidate/interview/:jobId" element={<ProtectedRoute><CandidateInterviewPage /></ProtectedRoute>} />
                                      <Route path="/candidate/my-gigs" element={<ProtectedRoute><CandidateMyGigsPage /></ProtectedRoute>} />
                                      <Route path="/candidate/my-courses" element={<ProtectedRoute><CandidateMyCoursesPage /></ProtectedRoute>} />

                                      {/* Company Routes */}
                                      <Route path="/company/dashboard" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
                                      <Route path="/company/candidates" element={<ProtectedRoute><CompanyCandidatesPage /></ProtectedRoute>} />
                                      
                                      {/* Payments & Checkout */}
                                      <Route path="/checkout/:contractId" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                                      <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
                                      <Route path="/payment/failed" element={<ProtectedRoute><PaymentFailed /></ProtectedRoute>} />

                                      {/* Admin Routes */}
                                      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                                      <Route path="/admin/companies" element={<ProtectedRoute><AdminCompaniesPage /></ProtectedRoute>} />
                                      <Route path="/admin/candidates" element={<ProtectedRoute><AdminCandidatesPage /></ProtectedRoute>} />
                                      <Route path="/admin/jobs" element={<ProtectedRoute><AdminJobsPage /></ProtectedRoute>} />
                                      <Route path="/admin/contracts" element={<ProtectedRoute><AdminContractsPage /></ProtectedRoute>} />
                                      <Route path="/admin/payments" element={<ProtectedRoute><AdminPaymentsPage /></ProtectedRoute>} />
                                  </Routes>
                              </Suspense>
                          </main>
                          <Footer />
                      </div>
                  </Router>
                </ThemeProvider>
            </UserTypeProvider>
        </AuthProvider>
    );
}

export default App;
