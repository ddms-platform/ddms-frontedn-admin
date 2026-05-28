import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import TranslationToggle from '@/components/shared/translation-toggle';

export default function AuthLayout() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding / Decorative */}
      <div className="relative hidden flex-1 overflow-hidden lg:block">
        {/* Gradient background with Rausch Red */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #0A192F 0%, #112240 40%, #0d2847 70%, #001a3a 100%)',
          }}
        />

        {/* Decorative circles */}
        <div
          className="absolute -left-20 -top-20 h-80 w-80 rounded-full opacity-15"
          style={{ backgroundColor: '#00F0FF' }}
        />
        <div
          className="absolute -bottom-10 right-10 h-60 w-60 rounded-full opacity-10"
          style={{ backgroundColor: '#00F0FF' }}
        />
        <div
          className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full opacity-8"
          style={{ backgroundColor: '#00F0FF' }}
        />

        {/* Content */}
        <div className="relative flex h-full flex-col items-center justify-center px-12">
          <div className="max-w-md space-y-8 text-center">
            <h1
              className="text-4xl font-bold tracking-tight"
              style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
            >
              {t('auth.layout.welcomeTitle')}
            </h1>
            <p
              className="text-lg leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              {t('auth.layout.welcomeDescription')}
            </p>

            {/* Feature highlights */}
            <div className="mt-12 space-y-4">
              {[
                { icon: '🚢', text: t('auth.layout.feature1') },
                { icon: '📅', text: t('auth.layout.feature2') },
                { icon: '🌊', text: t('auth.layout.feature3') },
              ].map((feature) => (
                <div
                  key={feature.text}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                >
                  <span className="text-xl">{feature.icon}</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: '#ffffff' }}
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form area */}
      <div
        className="relative flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
        style={{ backgroundColor: '#0A192F' }}
      >
        {/* Language Toggle */}
        <div className="absolute right-6 top-6">
          <TranslationToggle />
        </div>
        <div className="w-full max-w-105">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
