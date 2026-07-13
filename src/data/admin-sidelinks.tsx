import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Anchor,
  Tag,
  BarChart3,
  Star,
  Bell,
  ScrollText,
  Ship,
  MessageSquare,
  HelpCircle,
  Home,
  LogOut,
  ClipboardCheck,
  Scale,
  QrCode,
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

/** Primary admin navigation — title values are i18n keys */
export const adminSidelinks: SideLink[] = [
  {
    title: 'adminLayout.nav.dashboard',
    href: routeName.admin,
    icon: <LayoutDashboard size={20} />,
    end: true,
  },
  {
    title: 'adminLayout.nav.kioskCheckin',
    href: routeName.kioskCheckin,
    icon: <QrCode size={20} />,
  },
  {
    title: 'adminLayout.nav.users',
    href: routeName.adminUsers,
    icon: <Users size={20} />,
  },
  {
    title: 'adminLayout.nav.ownerVerification',
    href: routeName.adminOwnerVerification,
    icon: <ShieldCheck size={20} />,
  },
  {
    title: 'adminLayout.nav.docks',
    href: routeName.adminDocks,
    icon: <Anchor size={20} />,
  },
  {
    title: 'adminLayout.nav.promotions',
    href: routeName.adminPromotions,
    icon: <Tag size={20} />,
  },
  {
    title: 'adminLayout.nav.revenue',
    href: routeName.adminRevenue,
    icon: <BarChart3 size={20} />,
  },
  {
    title: 'adminLayout.nav.topTours',
    href: routeName.adminTopTours,
    icon: <Star size={20} />,
  },
  {
    title: 'adminLayout.nav.boats',
    href: routeName.adminBoats,
    icon: <Ship size={20} />,
  },
  {
    title: 'adminLayout.nav.reviews',
    href: routeName.adminReviews,
    icon: <MessageSquare size={20} />,
  },
  {
    title: 'adminLayout.nav.faqs',
    href: routeName.adminFaqs,
    icon: <HelpCircle size={20} />,
  },
  {
    title: 'adminLayout.nav.notifications',
    href: routeName.adminNotifications,
    icon: <Bell size={20} />,
  },
  {
    title: 'adminLayout.nav.auditLogs',
    href: routeName.adminAuditLogs,
    icon: <ScrollText size={20} />,
  },
  {
    title: 'adminLayout.nav.approvals',
    href: routeName.adminApprovals,
    icon: <ClipboardCheck size={20} />,
  },
  {
    title: 'adminLayout.nav.legalCompliance',
    href: routeName.adminLegalCompliance,
    icon: <Scale size={20} />,
  },
];

export const adminSecondaryLinks: NavLink[] = [
  {
    title: 'adminLayout.backHome',
    href: routeName.home,
    icon: <Home size={20} />,
  },
];

export const adminLogoutLink: NavLink = {
  title: 'adminLayout.logout',
  href: '#logout',
  icon: <LogOut size={20} />,
};
