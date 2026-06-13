import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { ChevronLeft, Menu, X, Shield } from 'lucide-react';
import { routeName } from '@/constants/route-name';
import logo from '@/assets/logo.png';
import TranslationToggle from '@/components/shared/translation-toggle';
import {
  adminSidelinks,
  adminSecondaryLinks,
  adminLogoutLink,
} from '@/data/admin-sidelinks';
import { useTranslation } from 'react-i18next';

/* Admin accent: Rausch Red — highest authority colour in the design system */
const ACCENT = '#FF385C';
const ACCENT_BG = 'rgba(255,56,92,0.12)';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const handleLogout = () => {
    logout();
    navigate(routeName.signIn);
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: '#060f1e' }}
    >
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'w-[72px]' : 'w-[264px]'}`}
        style={{
          backgroundColor: '#0a0f1e',
          borderColor: 'rgba(255,56,92,0.12)',
        }}
      >
        {/* Logo */}
        <div
          className="flex h-16 items-center justify-between border-b px-4"
          style={{ borderColor: 'rgba(255,56,92,0.12)' }}
        >
          {!collapsed && (
            <Link to={routeName.admin} className="flex items-center gap-2.5">
              <img src={logo} alt="DDMS" className="h-8 w-auto" />
              <div>
                <span
                  className="block text-xs font-bold tracking-widest uppercase"
                  style={{ color: ACCENT }}
                >
                  Admin
                </span>
                <span
                  className="block text-[10px] font-medium"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  Control Center
                </span>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link to={routeName.admin} className="mx-auto">
              <img src={logo} alt="DDMS" className="h-8 w-auto" />
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 transition-colors hover:bg-white/5 lg:hidden"
            style={{ color: '#ecf0ff' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Admin badge */}
        {!collapsed && (
          <div
            className="mx-3 mt-3 flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ backgroundColor: ACCENT_BG }}
          >
            <Shield size={14} style={{ color: ACCENT }} />
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: ACCENT }}
            >
              System Administrator
            </span>
          </div>
        )}

        {/* Primary Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10">
          <ul className="space-y-0.5">
            {adminSidelinks.map((link) => (
              <li key={link.href}>
                <NavLink
                  to={link.href}
                  end={link.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? 'shadow-sm' : 'hover:bg-white/5'} ${collapsed ? 'justify-center' : ''}`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? ACCENT_BG : undefined,
                    color: isActive ? ACCENT : '#c8d0e0',
                  })}
                >
                  <span className="shrink-0">{link.icon}</span>
                  {!collapsed && <span>{t(link.title)}</span>}
                </NavLink>
              </li>
            ))}
          </ul>

          <div
            className="mx-2 my-3 h-px"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          />

          {/* Secondary Nav */}
          <ul className="space-y-0.5">
            {adminSecondaryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
                  style={{ color: '#c8d0e0' }}
                >
                  <span className="shrink-0">{link.icon}</span>
                  {!collapsed && <span>{t(link.title)}</span>}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
                style={{ color: '#EF4444' }}
              >
                <span className="shrink-0">{adminLogoutLink.icon}</span>
                {!collapsed && <span>{t(adminLogoutLink.title)}</span>}
              </button>
            </li>
          </ul>
        </nav>

        {/* Collapse toggle */}
        <div
          className="hidden border-t p-3 lg:block"
          style={{ borderColor: 'rgba(255,56,92,0.12)' }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
            style={{ color: '#c8d0e0' }}
          >
            <ChevronLeft
              size={18}
              className="shrink-0 transition-transform duration-200"
              style={{
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
            {!collapsed && <span>Thu gọn</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header
          className="flex h-16 shrink-0 items-center justify-between border-b px-4 lg:px-6"
          style={{
            backgroundColor: '#060f1e',
            borderColor: 'rgba(255,56,92,0.1)',
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 transition-colors hover:bg-white/5 lg:hidden"
            style={{ color: '#ecf0ff' }}
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <TranslationToggle />
            <div className="text-right">
              <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                {user?.name || 'Admin'}
              </p>
              <p
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: ACCENT }}
              >
                Administrator
              </p>
            </div>
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover border-2"
                style={{ borderColor: ACCENT }}
              />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, #c00030)`,
                  color: '#ffffff',
                }}
              >
                {initials}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: '#060f1e' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
