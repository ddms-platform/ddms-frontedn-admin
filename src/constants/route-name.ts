export const routeName = Object.freeze({
  // Auth
  signIn: '/admin/sign-in',
  signUp: '/admin/sign-up',
  forgotPassword: '/admin/forgot-password',

  // Public
  home: '/admin',
  tours: '/tours',
  tourDetail: '/tours/:id',
  tourBooking: '/tours/:id/booking',
  boatDetail: '/boats/:boatId',
  becomeOwner: '/become-owner',
  profile: '/profile',
  myTours: '/my-tours',

  // Legal
  terms: '/terms',
  privacy: '/privacy',

  // Owner
  owner: '/owner',
  ownerBoats: '/owner/boats',
  ownerBoatsNew: '/owner/boats/new',
  ownerBoatEdit: '/owner/boats/:boatId/edit',
  ownerTours: '/owner/tours',
  ownerBookings: '/owner/bookings',
  ownerProfile: '/owner/profile',
  ownerPromotions: '/owner/promotions',

  // Admin
  admin: '/admin',
  adminUsers: '/admin/users',
  adminOwnerVerification: '/admin/owner-verification',
  adminDocks: '/admin/docks',
  adminPromotions: '/admin/promotions',
  adminRevenue: '/admin/revenue',
  adminTopTours: '/admin/top-tours',
  adminTourApprovals: '/admin/tour-approvals',
  adminBoats: '/admin/boats',
  adminReviews: '/admin/reviews',
  adminFaqs: '/admin/faqs',
  adminNotifications: '/admin/notifications',
  adminAuditLogs: '/admin/audit-logs',
  adminApprovals: '/admin/approvals',
  adminLegalCompliance: '/admin/legal-compliance',
  kioskCheckin: '/kiosk-checkin',

  // System
  maintenance: '/maintenance',
  dashboard: '/dashboard',
});
