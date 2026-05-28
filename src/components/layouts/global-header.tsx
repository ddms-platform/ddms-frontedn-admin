import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  LogOut,
  MapPin,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import TranslationToggle from '@/components/shared/translation-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { routeName } from '@/constants/route-name';
import logo from '@/assets/logo.png';

interface NavLink {
  label: string;
  href: string;
}

interface GlobalHeaderProps {
  /** Navigation links (anchors or routes) */
  navLinks?: NavLink[];
  transparent?: boolean;
}

export default function GlobalHeader({
  navLinks,
  transparent = false,
}: GlobalHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate(routeName.signIn);
  };

  // Avatar initials from user name
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';
  const isOwner = user?.roles.includes('owner') ?? false;

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: transparent ? 'transparent' : '#0A192F',
        boxShadow: transparent ? 'none' : '0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to={routeName.home} className="flex items-center gap-2">
          <img src={logo} alt="DDMS" className="h-10 w-auto" />
        </Link>

        {/* Nav Links */}
        {navLinks && navLinks.length > 0 && (
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-[#00F0FF]"
                style={{ color: '#ecf0ff' }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <TranslationToggle />

          {!isOwner && (
            <Link
              to={routeName.becomeOwner}
              className="hidden items-center rounded-full px-3 py-2 text-sm font-semibold transition-colors hover:bg-white/5 hover:text-[#00F0FF] sm:inline-flex"
              style={{ color: '#ecf0ff' }}
            >
              {t('becomeOwner.navLink')}
            </Link>
          )}

          {isAuthenticated ? (
            /* ── Logged-in: Avatar + Dropdown ── */
            <div className="relative" ref={dropdownRef}>
              <button
                id="user-menu-button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 transition-all hover:bg-white/5 active:scale-[0.97]"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {/* Avatar */}
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #00F0FF, #00d4e0)',
                      color: '#0A192F',
                    }}
                  >
                    {initials}
                  </div>
                )}

                {/* Name + chevron (hidden on mobile) */}
                <span
                  className="hidden text-sm font-medium sm:inline"
                  style={{ color: '#ffffff' }}
                >
                  {user?.name || 'User'}
                </span>
                <ChevronDown
                  size={14}
                  className="transition-transform duration-200"
                  style={{
                    color: '#ecf0ff',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl py-1 shadow-xl"
                  style={{
                    backgroundColor: '#112240',
                    border: '1px solid rgba(255,255,255,0.08)',
                    animation: 'fadeInDown 0.15s ease-out',
                  }}
                  role="menu"
                >
                  {/* User info */}
                  <div
                    className="border-b px-4 py-3"
                    style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <p
                      className="text-sm font-semibold"
                      style={{ color: '#ffffff' }}
                    >
                      {user?.name || 'User'}
                    </p>
                    <p
                      className="mt-0.5 truncate text-xs"
                      style={{ color: '#ecf0ff' }}
                    >
                      {user?.email || ''}
                    </p>
                  </div>

                  {/* Menu items */}
                  {isOwner && (
                    <Link
                      to={routeName.owner}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                      style={{ color: '#ecf0ff' }}
                      role="menuitem"
                    >
                      <LayoutDashboard size={16} />
                      {t('header.user.ownerDashboard')}
                    </Link>
                  )}
                  <Link
                    to={routeName.profile}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: '#ecf0ff' }}
                    role="menuitem"
                  >
                    <User size={16} />
                    {t('header.user.profile')}
                  </Link>
                  <Link
                    to={routeName.myTours}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: '#ecf0ff' }}
                    role="menuitem"
                  >
                    <MapPin size={16} />
                    {t('header.user.myTours')}
                  </Link>

                  <div
                    className="my-1 h-px"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  />

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: '#EF4444' }}
                    role="menuitem"
                  >
                    <LogOut size={16} />
                    {t('header.user.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Not logged-in: Sign In button ── */
            <Button variant="cyan" size="action" asChild>
              <Link to={routeName.signIn}>{t('home.nav.signIn')}</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Dropdown animation keyframes */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}
