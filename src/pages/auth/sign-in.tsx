import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useFormValidation, rules } from '@/hooks/use-form-validation';
import FormField from '@/components/shared/form-field';
import { useAuth } from '@/hooks/use-auth';
import { routeName } from '@/constants/route-name';
import { AuthServices } from '@/services/auth-service';
import { toast } from 'sonner';
import { localStorageService } from '@/services/local-storage-service';
import { localStorageKey } from '@/constants/local-storage';
import type { UserRole } from '@/data/user';
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
    try {
      const res = await AuthServices.login({
        email: emailProps.value,
        password: passwordProps.value,
      });

      if (res.status === 200 && res.data?.code === 1000) {
        const tokens = res.data.result;
        if (!tokens || !tokens.token) {
          toast.error(t('auth.signIn.error'));
          return;
        }

        // Save token to localStorage for axios authorization header
        localStorageService.setItem(localStorageKey.ACCESS_TOKEN, tokens.token);

        // Fetch profile
        const profileRes = await AuthServices.getProfile();
        if (profileRes.status === 200 && profileRes.data?.code === 1000) {
          const profile = profileRes.data.result;
          if (profile) {
            const isAdmin = profile.roles.includes('admin');
            if (!isAdmin) {
              localStorageService.clearAccessToken();
              toast.error('Tài khoản không có quyền truy cập trang quản trị!');
              return;
            }

            // Perform context login
            login(tokens.token, {
              name: profile.fullName,
              email: profile.email,
              roles: profile.roles as UserRole[],
              avatar_url: profile.avatarUrl || undefined,
            });

            toast.success(t('auth.signIn.success'));
            navigate(from, { replace: true });
            return;
          }
        }
      }
      toast.error(t('auth.signIn.error'));
    } catch (error: any) {
      const msg = error?.response?.data?.message || t('auth.signIn.error');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
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
    </div>
  );
}
