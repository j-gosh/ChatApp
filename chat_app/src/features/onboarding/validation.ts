export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export interface LoginValues {
  email: string;
  password: string;
}

export interface RegisterValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const MIN_PASSWORD_LENGTH = 8;

const isBlank = (value: string) => value.trim().length === 0;

export function validateLogin({ email, password }: LoginValues): FieldErrors<keyof LoginValues> {
  return {
    ...(isBlank(email) && { email: 'Please enter a valid email' }),
    ...(password.length === 0 && { password: 'Password cannot be empty' }),
  };
}

export function validateRegister(values: RegisterValues): FieldErrors<keyof RegisterValues> {
  return {
    ...(isBlank(values.firstName) && { firstName: 'Please enter your first name' }),
    ...(isBlank(values.lastName) && { lastName: 'Please enter your last name.' }),
    ...(isBlank(values.email) && { email: 'Please enter a valid email.' }),
    ...(values.password.length < MIN_PASSWORD_LENGTH && {
      password: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    }),
  };
}

export function validateResetEmail(email: string): string | undefined {
  return isBlank(email) ? 'Please enter a valid email.' : undefined;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
