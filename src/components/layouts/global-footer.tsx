import { useTranslation } from 'react-i18next';
import { Anchor } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function GlobalFooter() {
  const { t } = useTranslation();

  return (
    <footer style={{ backgroundColor: '#112240' }}>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <img src={logo} alt="DDMS" className="mb-4 h-10 w-auto" />
            <p className="text-sm leading-relaxed" style={{ color: '#ecf0ff' }}>
              {t('home.footer.description')}
            </p>
          </div>
          {/* Links */}
          {(['explore', 'support', 'legal'] as const).map((section) => (
            <div key={section}>
              <h4
                className="mb-4 text-sm font-semibold"
                style={{
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.32px',
                }}
              >
                {t(`home.footer.${section}.title`)}
              </h4>
              <ul className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-sm transition-colors hover:text-[#00F0FF]"
                      style={{ color: '#ecf0ff' }}
                    >
                      {t(`home.footer.${section}.link${i}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-10 border-t pt-6"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm" style={{ color: '#ecf0ff' }}>
              © {new Date().getFullYear()} DDMS. {t('home.footer.rights')}
            </p>
            <div className="flex items-center gap-3">
              <Anchor size={16} style={{ color: '#ecf0ff' }} />
              <span className="text-sm" style={{ color: '#ecf0ff' }}>
                {t('home.footer.madeIn')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
