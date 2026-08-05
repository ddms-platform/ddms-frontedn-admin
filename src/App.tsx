import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '@/components/layouts/auth-layout';
import AdminLayout from '@/components/layouts/admin-layout';
import OwnerLayout from '@/components/layouts/owner-layout';
import { ErrorBoundary } from './components/shared/error-boundary';
import ProtectedRoute from './components/routes/ProtectedRoute';
import { lazy, Suspense } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { routeName } from '@/constants/route-name';
import { Toaster } from '@/components/ui/sonner';
import { AdminSosAlertWidget } from '@/components/sos/AdminSosAlertWidget';

const SignInPage = lazy(() => import('@/pages/auth/sign-in'));
const SignUpPage = lazy(() => import('@/pages/auth/sign-up'));

// ── Admin pages ──────────────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('@/pages/admin/index'));
const AdminUsers = lazy(() => import('@/pages/admin/users/index'));
const AdminOwnerVerification = lazy(
  () => import('@/pages/admin/owner-verification/index'),
);
const AdminDocks = lazy(() => import('@/pages/admin/docks/index'));
const AdminPromotions = lazy(() => import('@/pages/admin/promotions/index'));
const AdminRevenue = lazy(() => import('@/pages/admin/revenue/index'));
const AdminTopTours = lazy(() => import('@/pages/admin/top-tours/index'));
const AdminTourApprovals = lazy(
  () => import('@/pages/admin/tour-approvals/index'),
);
const AdminBoats = lazy(() => import('@/pages/admin/boats/index'));
const AdminReviews = lazy(() => import('@/pages/admin/reviews/index'));
const AdminFaqs = lazy(() => import('@/pages/admin/faqs/index'));
const AdminNotifications = lazy(
  () => import('@/pages/admin/notifications/index'),
);
const AdminAuditLogs = lazy(() => import('@/pages/admin/audit-logs/index'));
const AdminApprovals = lazy(() => import('@/pages/admin/approvals/index'));
const AdminLegalCompliance = lazy(
  () => import('@/pages/admin/legal-compliance/index'),
);
const AdminSosPage = lazy(() => import('@/pages/admin/sos/index'));
const KioskCheckinPage = lazy(() => import('@/pages/kiosk-checkin/index'));

// ── Owner pages ──────────────────────────────────────────────────────────────
const OwnerBoats = lazy(() => import('@/pages/owner/boats/index'));
const OwnerPromotions = lazy(() => import('@/pages/owner/promotions/index'));

function PageLoader() {
  return <LoadingSpinner fullScreen />;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <Toaster position="top-right" richColors closeButton />
            <AdminSosAlertWidget />
            <Routes>
              {/* Auth Routes - own layout, no header/footer */}
              <Route element={<AuthLayout />}>
                <Route
                  path="/sign-in"
                  element={<Navigate to={routeName.signIn} replace />}
                />
                <Route
                  path="/sign-up"
                  element={<Navigate to={routeName.signUp} replace />}
                />
                <Route
                  path={routeName.signIn}
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <SignInPage />
                    </Suspense>
                  }
                />
                <Route
                  path={routeName.signUp}
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <SignUpPage />
                    </Suspense>
                  }
                />
              </Route>

              {/* Kiosk Check-in — fullscreen, không sidebar */}
              <Route
                path={routeName.kioskCheckin}
                element={
                  <Suspense fallback={<PageLoader />}>
                    <KioskCheckinPage />
                  </Suspense>
                }
              />

              {/* Admin pages — role-gated */}
              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route element={<AdminLayout />}>
                  <Route
                    path={routeName.admin}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminDashboard />
                      </Suspense>
                    }
                  />
                  <Route
                    path={routeName.adminSos}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminSosPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path={routeName.adminUsers}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminUsers />
                      </Suspense>
                    }
                  />
                  <Route
                    path={routeName.adminOwnerVerification}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminOwnerVerification />
                      </Suspense>
                    }
                  />
                  <Route
                    path={routeName.adminDocks}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminDocks />
                      </Suspense>
                    }
                  />
                  <Route
                    path={routeName.adminPromotions}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminPromotions />
                      </Suspense>
                    }
                  />
                  <Route
                    path={routeName.adminRevenue}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminRevenue />
                      </Suspense>
                    }
                  />
                  <Route
                    path={routeName.adminTopTours}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminTopTours />
                      </Suspense>
                    }
                  />
                  <Route
                    path={routeName.adminTourApprovals}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminTourApprovals />
                      </Suspense>
                    }
                  />
                  <Route
                    path={routeName.adminBoats}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminBoats />
                      </Suspense>
                    }
                  />
                  <Route
                    path={routeName.adminReviews}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminReviews />
                      </Suspense>
                    }
                  />
                  <Route
                    path={routeName.adminFaqs}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminFaqs />
                      </Suspense>
                    }
                  />
                  <Route
                    path={routeName.adminNotifications}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminNotifications />
                      </Suspense>
                    }
                  />
                  <Route
                    path={routeName.adminAuditLogs}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminAuditLogs />
                      </Suspense>
                    }
                  />
                  <Route
                    path={routeName.adminApprovals}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminApprovals />
                      </Suspense>
                    }
                  />
                  <Route
                    path={routeName.adminLegalCompliance}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminLegalCompliance />
                      </Suspense>
                    }
                  />
                </Route>
              </Route>

              {/* Owner pages — role-gated */}
              <Route element={<ProtectedRoute roles={['owner']} />}>
                <Route element={<OwnerLayout />}>
                  <Route
                    path={routeName.ownerBoats}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <OwnerBoats />
                      </Suspense>
                    }
                  />
                  <Route
                    path={routeName.ownerPromotions}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <OwnerPromotions />
                      </Suspense>
                    }
                  />
                  {/* Default fallback for owner to boats for now */}
                  <Route
                    path={routeName.owner}
                    element={<Navigate to={routeName.ownerBoats} replace />}
                  />
                </Route>
              </Route>

              {/* Catch-all */}
              <Route
                path="*"
                element={<Navigate to={routeName.admin} replace />}
              />
            </Routes>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
