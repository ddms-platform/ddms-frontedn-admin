import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ---- Validation rule types ----

type ValidationRule<T> = (value: string, allValues: T) => string | undefined;

type FieldRules<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

// ---- Hook return type ----

interface UseFormValidationReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  setValue: (field: keyof T, value: string) => void;
  setFieldTouched: (field: keyof T) => void;
  handleBlur: (field: keyof T) => void;
  validateAll: () => boolean;
  resetForm: () => void;
  getFieldProps: (field: keyof T) => {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    hasError: boolean;
    error: string | undefined;
  };
}

// ---- Built-in validation rules ----

export const rules = {
  required: (fieldLabel: string): ValidationRule<Record<string, string>> => {
    return (value) => {
      if (!value || !value.trim()) return `required:${fieldLabel}`;
      return undefined;
    };
  },

  email: (): ValidationRule<Record<string, string>> => {
    return (value) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return 'invalidEmail';
      return undefined;
    };
  },

  minLength: (min: number): ValidationRule<Record<string, string>> => {
    return (value) => {
      if (value && value.length < min) return `minLength:${min}`;
      return undefined;
    };
  },

  match: (
    otherField: string,
    errorKey: string,
  ): ValidationRule<Record<string, string>> => {
    return (value, allValues) => {
      if (value && value !== allValues[otherField]) return errorKey;
      return undefined;
    };
  },
};

// ---- Hook ----

export function useFormValidation<T extends Record<string, string>>(
  initialValues: T,
  fieldRules: FieldRules<T>,
  translationFn?: (key: string, options?: Record<string, unknown>) => string,
): UseFormValidationReturn<T> {
  const { t: defaultT } = useTranslation();
  const t = translationFn || defaultT;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback(
    (field: keyof T, currentValues: T): string | undefined => {
      const fieldValidators = fieldRules[field];
      if (!fieldValidators) return undefined;

      for (const rule of fieldValidators) {
        const rawError = rule(currentValues[field], currentValues);
        if (rawError) {
          // Parse structured markers and translate
          if (rawError.startsWith('required:')) {
            const fieldLabel = rawError.substring(9);
            return t('validation.required', { field: fieldLabel });
          }
          if (rawError === 'invalidEmail') {
            return t('validation.invalidEmail');
          }
          if (rawError.startsWith('minLength:')) {
            const count = rawError.split(':')[1];
            return t('validation.minLength', { count });
          }
          // Try as a direct translation key (e.g. 'auth.signUp.passwordsDoNotMatch')
          const translated = t(rawError);
          return translated !== rawError ? translated : rawError;
        }
      }
      return undefined;
    },
    [fieldRules, t],
  );

  const setValue = useCallback(
    (field: keyof T, value: string) => {
      const newValues = { ...values, [field]: value } as T;
      setValues(newValues);

      // Re-validate if already touched
      if (touched[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: validateField(field, newValues),
        }));
      }
    },
    [values, touched, validateField],
  );

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors((prev) => ({ ...prev, [field]: validateField(field, values) }));
    },
    [values, validateField],
  );

  const validateAll = useCallback((): boolean => {
    const allTouched = Object.keys(initialValues).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof T, boolean>,
    );
    setTouched(allTouched);

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const field of Object.keys(fieldRules) as Array<keyof T>) {
      const error = validateField(field, values);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, fieldRules, initialValues, validateField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const getFieldProps = useCallback(
    (field: keyof T) => ({
      value: values[field],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setValue(field, e.target.value),
      onBlur: () => handleBlur(field),
      hasError: !!(touched[field] && errors[field]),
      error: touched[field] ? errors[field] : undefined,
    }),
    [values, errors, touched, setValue, handleBlur],
  );

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    handleBlur,
    validateAll,
    resetForm,
    getFieldProps,
  };
}
