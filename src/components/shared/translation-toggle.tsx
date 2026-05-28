import { Globe } from 'lucide-react';
import useLanguage from '@/contexts/LanguageContext';

export default function TranslationToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'VN' ? 'EN' : 'VN');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all hover:shadow-md active:scale-95"
      style={{
        borderColor: 'rgba(255,255,255,0.15)',
        color: '#ffffff',
        backgroundColor: '#112240',
      }}
      aria-label="Toggle language"
    >
      <Globe size={16} />
      <span>{language === 'VN' ? 'VI' : 'EN'}</span>
      <span
        className="h-4 w-px"
        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
      />
      <span className="text-xs" style={{ color: '#ecf0ff' }}>
        {language === 'VN' ? 'English' : 'Tiếng Việt'}
      </span>
    </button>
  );
}
