import {
  LayoutDashboard,
  Ship,
  Map,
  CalendarCheck,
  User,
  Home,
  LogOut,
} from 'lucide-react';
import type { JSX } from 'react';
import { routeName } from '@/constants/route-name';

export interface NavLink {
  title: string;
  label?: string;
  href: string;
  icon: JSX.Element;
  end?: boolean;
}

export interface SideLink extends NavLink {
  sub?: NavLink[];
}

/**
 * Primary navigation items displayed in the owner sidebar.
 * `title` values are i18n translation keys.
 */
export const ownerSidelinks: SideLink[] = [
  {
    title: 'ownerLayout.nav.dashboard',
    href: routeName.owner,
    icon: <LayoutDashboard size={20} />,
    end: true,
  },
  {
    title: 'ownerLayout.nav.boats',
    href: routeName.ownerBoats,
    icon: <Ship size={20} />,
  },
  {
    title: 'ownerLayout.nav.tours',
    href: routeName.ownerTours,
    icon: <Map size={20} />,
  },
  {
    title: 'ownerLayout.nav.bookings',
    href: routeName.ownerBookings,
    icon: <CalendarCheck size={20} />,
  },
  {
    title: 'ownerLayout.nav.profile',
    href: routeName.ownerProfile,
    icon: <User size={20} />,
  },
];

/**
 * Secondary / utility links at the bottom of the sidebar.
 */
export const ownerSecondaryLinks: NavLink[] = [
  {
    title: 'ownerLayout.backHome',
    href: routeName.home,
    icon: <Home size={20} />,
  },
];

/**
 * Logout action (not a real link, but keeps the same shape for consistency).
 */
export const ownerLogoutLink: NavLink = {
  title: 'ownerLayout.logout',
  href: '#logout',
  icon: <LogOut size={20} />,
};
