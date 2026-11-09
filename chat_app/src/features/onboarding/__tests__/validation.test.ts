import {
  hasErrors,
  validateLogin,
  validateRegister,
  validateResetEmail,
} from '@/features/onboarding/validation';

describe('validateLogin', () => {
  it('requires email and password', () => {
    expect(validateLogin({ email: ' ', password: '' })).toEqual({
      email: 'Please enter a valid email',
      password: 'Password cannot be empty',
    });
  });

  it('passes with both fields', () => {
    expect(hasErrors(validateLogin({ email: 'a@b.co', password: 'x' }))).toBe(false);
  });
});

describe('validateRegister', () => {
  const valid = { firstName: 'Ada', lastName: 'Lovelace', email: 'a@b.co', password: '12345678' };

  it('passes with valid values', () => {
    expect(hasErrors(validateRegister(valid))).toBe(false);
  });

  it('requires names and email', () => {
    expect(validateRegister({ ...valid, firstName: '', lastName: ' ', email: '' })).toEqual({
      firstName: 'Please enter your first name',
      lastName: 'Please enter your last name.',
      email: 'Please enter a valid email.',
    });
  });

  it('requires a password of at least 8 characters', () => {
    expect(validateRegister({ ...valid, password: '1234567' }).password).toBe(
      'Password must be at least 8 characters.',
    );
  });
});

describe('validateResetEmail', () => {
  it('requires an email', () => {
    expect(validateResetEmail('')).toBe('Please enter a valid email.');
    expect(validateResetEmail('a@b.co')).toBeUndefined();
  });
});
