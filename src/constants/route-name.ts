export const routeName = Object.freeze({
  // Auth
  signIn: '/sign-in',
  signUp: '/sign-up',
  forgotPassword: '/forgot-password',

  // Public
  home: '/',
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

  // Admin
  admin: '/admin',
  adminUsers: '/admin/users',
  adminOwnerVerification: '/admin/owner-verification',
  adminDocks: '/admin/docks',
  adminPromotions: '/admin/promotions',
  adminRevenue: '/admin/revenue',
  adminTopTours: '/admin/top-tours',
  adminBoats: '/admin/boats',
  adminReviews: '/admin/reviews',
  adminFaqs: '/admin/faqs',
  adminNotifications: '/admin/notifications',
  adminAuditLogs: '/admin/audit-logs',

  // System
  maintenance: '/maintenance',
  dashboard: '/dashboard',
});
