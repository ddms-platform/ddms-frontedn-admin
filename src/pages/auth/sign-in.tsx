import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useFormValidation, rules } from '@/hooks/use-form-validation';
import FormField from '@/components/shared/form-field';
import { useAuth } from '@/hooks/use-auth';
import { GoogleIcon } from '@/components/shared/google-icon';
import { routeName } from '@/constants/route-name';
import logo from '@/assets/logo.png';

export default function SignInPage() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || '/';

  const { getFieldProps, validateAll } = useFormValidation(
    { email: '', password: '' },
    {
      email: [rules.required(t('auth.signIn.email')), rules.email()],
      password: [rules.required(t('auth.signIn.password')), rules.minLength(6)],
    },
    t,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsLoading(true);
    // TODO: Replace with real API call
    setTimeout(() => {
      // Mock login — save token + user info via AuthContext
      const isAdmin = emailProps.value.toLowerCase().includes('admin');
      login('mock-jwt-token', {
        name: isAdmin ? 'Admin User' : 'Nguyễn Văn A',
        email: emailProps.value,
        roles: isAdmin ? ['admin'] : ['owner'],
      });
      setIsLoading(false);
      navigate(from, { replace: true });
    }, 1500);
  };

  const emailProps = getFieldProps('email');
  const passwordProps = getFieldProps('password');

  return (
    <div className="flex flex-col gap-8">
      {/* Logo & Header */}
      <div className="flex flex-col items-center gap-6">
        <Link
          to={routeName.home}
          className="transition-transform hover:scale-105 active:scale-95"
        >
          <img src={logo} alt="DDMS Logo" className="h-16 w-auto" />
        </Link>
        <div className="space-y-2 text-center">
          <h1
            className="text-[28px] font-bold leading-[1.43]"
            style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
          >
            {t('auth.signIn.title')}
          </h1>
          <p className="text-sm leading-[1.43]" style={{ color: '#ecf0ff' }}>
            {t('auth.signIn.description')}
          </p>
        </div>
      </div>

      {/* Sign-in Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormField
          id="email"
          label={t('auth.signIn.email')}
          type="email"
          placeholder={t('auth.signIn.emailPlaceholder')}
          autoComplete="email"
          autoFocus
          {...emailProps}
        />

        <FormField
          id="password"
          label={t('auth.signIn.password')}
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.signIn.passwordPlaceholder')}
          autoComplete="current-password"
          {...passwordProps}
          labelExtra={
            <Link
              to={routeName.forgotPassword}
              className="text-sm font-medium transition-colors hover:underline"
              style={{ color: '#00F0FF' }}
            >
              {t('auth.signIn.forgotPassword')}
            </Link>
          }
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors"
              style={{ color: '#ecf0ff' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          variant="cyan"
          className="mt-2 h-12 w-full text-base"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('auth.signIn.signingIn')}</span>
            </div>
          ) : (
            t('auth.signIn.signIn')
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center">
        <div
          className="flex-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        />
        <span className="px-4 text-xs font-medium" style={{ color: '#ecf0ff' }}>
          {t('auth.signIn.orContinueWith')}
        </span>
        <div
          className="flex-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>

      {/* Social Login */}
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="dark-outline"
          className="h-11 w-full gap-2"
        >
          <GoogleIcon />
          Google
        </Button>
      </div>

      {/* Sign-up Link */}
      <p className="text-center text-sm" style={{ color: '#ecf0ff' }}>
        {t('auth.signIn.dontHaveAccount')}?{' '}
        <Link
          to={routeName.signUp}
          className="font-semibold transition-colors hover:underline"
          style={{ color: '#00F0FF' }}
        >
          {t('auth.signIn.signUpLink')}
        </Link>
      </p>
    </div>
  );
}
