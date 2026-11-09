import { getAuthErrorMessage, getErrorMessage } from '@/utils/errors';

describe('getAuthErrorMessage', () => {
  it('maps known Firebase auth codes', () => {
    expect(getAuthErrorMessage({ code: 'auth/invalid-credential' })).toBe(
      'Incorrect email or password.',
    );
    expect(getAuthErrorMessage({ code: 'auth/email-already-in-use' })).toBe(
      'An account already exists for that email.',
    );
  });

  it('falls back to a generic message', () => {
    expect(getAuthErrorMessage({ code: 'auth/something-new' })).toBe(
      'Something went wrong. Please try again.',
    );
    expect(getAuthErrorMessage(new Error('boom'))).toBe('Something went wrong. Please try again.');
    expect(getAuthErrorMessage(null)).toBe('Something went wrong. Please try again.');
  });
});

describe('getErrorMessage', () => {
  it('uses the error message when present', () => {
    expect(getErrorMessage(new Error('Disk full'))).toBe('Disk full');
    expect(getErrorMessage('nope')).toBe('Something went wrong. Please try again.');
  });
});
