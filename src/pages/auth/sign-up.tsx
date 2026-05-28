import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useFormValidation, rules } from '@/hooks/use-form-validation';
import FormField from '@/components/shared/form-field';
import { GoogleIcon } from '@/components/shared/google-icon';
import { routeName } from '@/constants/route-name';
import logo from '@/assets/logo.png';

export default function SignUpPage() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsError, setTermsError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const { values, getFieldProps, validateAll } = useFormValidation(
    { fullName: '', email: '', password: '', confirmPassword: '' },
    {
      fullName: [rules.required(t('auth.signUp.fullName')), rules.minLength(2)],
      email: [rules.required(t('auth.signUp.email')), rules.email()],
      password: [rules.required(t('auth.signUp.password')), rules.minLength(8)],
      confirmPassword: [
        rules.required(t('auth.signUp.confirmPassword')),
        rules.match('password', 'auth.signUp.passwordsDoNotMatch'),
      ],
    },
    t,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateAll();
    if (!agreeTerms) {
      setTermsError(t('validation.termsRequired'));
      if (!isValid) return;
      return;
    }
    if (!isValid) return;

    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const fullNameProps = getFieldProps('fullName');
  const emailProps = getFieldProps('email');
  const passwordProps = getFieldProps('password');
  const confirmPasswordProps = getFieldProps('confirmPassword');

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
            {t('auth.signUp.title')}
          </h1>
          <p className="text-sm leading-[1.43]" style={{ color: '#ecf0ff' }}>
            {t('auth.signUp.description')}
          </p>
        </div>
      </div>

      {/* Social Sign-up */}
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

      {/* Divider */}
      <div className="relative flex items-center">
        <div
          className="flex-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        />
        <span className="px-4 text-xs font-medium" style={{ color: '#ecf0ff' }}>
          {t('auth.signUp.orSignUpWithEmail')}
        </span>
        <div
          className="flex-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>

      {/* Sign-up Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormField
          id="fullName"
          label={t('auth.signUp.fullName')}
          placeholder={t('auth.signUp.fullNamePlaceholder')}
          autoComplete="name"
          autoFocus
          {...fullNameProps}
        />

        <FormField
          id="email"
          label={t('auth.signUp.email')}
          type="email"
          placeholder={t('auth.signUp.emailPlaceholder')}
          autoComplete="email"
          {...emailProps}
        />

        <div className="flex flex-col gap-2">
          <FormField
            id="password"
            label={t('auth.signUp.password')}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.signUp.passwordPlaceholder')}
            autoComplete="new-password"
            {...passwordProps}
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

          {/* Password strength indicator */}
          {values.password && (
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((level) => {
                const strength = getPasswordStrength(values.password);
                return (
                  <div
                    key={level}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor:
                        level <= strength
                          ? strength <= 1
                            ? '#c13515'
                            : strength <= 2
                              ? '#FBBC05'
                              : '#34A853'
                          : '#e0e0e0',
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        <FormField
          id="confirmPassword"
          label={t('auth.signUp.confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder={t('auth.signUp.confirmPasswordPlaceholder')}
          autoComplete="new-password"
          {...confirmPasswordProps}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors"
              style={{ color: '#ecf0ff' }}
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        {/* Terms Checkbox */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                setTermsError(
                  e.target.checked ? undefined : t('validation.termsRequired'),
                );
              }}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded accent-[#00F0FF]"
            />
            <label
              htmlFor="terms"
              className="cursor-pointer text-sm leading-relaxed"
              style={{ color: '#ecf0ff' }}
            >
              {t('auth.signUp.agreeToTerms')}{' '}
              <Link
                to={routeName.terms}
                className="font-medium underline underline-offset-4 transition-colors"
                style={{ color: '#ffffff' }}
              >
                {t('auth.signUp.termsOfService')}
              </Link>{' '}
              {t('auth.signUp.and')}{' '}
              <Link
                to={routeName.privacy}
                className="font-medium underline underline-offset-4 transition-colors"
                style={{ color: '#ffffff' }}
              >
                {t('auth.signUp.privacyPolicy')}
              </Link>
            </label>
          </div>
          {termsError && (
            <p className="text-xs" style={{ color: '#c13515' }}>
              {termsError}
            </p>
          )}
        </div>

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
              <span>{t('auth.signUp.creatingAccount')}</span>
            </div>
          ) : (
            t('auth.signUp.createAccount')
          )}
        </Button>
      </form>

      {/* Sign-in Link */}
      <p className="text-center text-sm" style={{ color: '#ecf0ff' }}>
        {t('auth.signUp.alreadyHaveAccount')}?{' '}
        <Link
          to={routeName.signIn}
          className="font-semibold transition-colors hover:underline"
          style={{ color: '#00F0FF' }}
        >
          {t('auth.signUp.signInLink')}
        </Link>
      </p>
    </div>
  );
}

function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
}
