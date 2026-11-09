import { getStartCallErrorMessage } from '@/features/video-chat/call-errors';

describe('getStartCallErrorMessage', () => {
  it('explains when the friend has no Stream account yet', () => {
    const error = new Error(
      "The following users are involved in call create operation, but don't exist: [u2]",
    );
    expect(getStartCallErrorMessage(error)).toBe("This friend hasn't set up video calls yet.");
  });

  it('falls back to a generic message', () => {
    expect(getStartCallErrorMessage(new Error('timeout'))).toBe(
      "Couldn't start the call. Please try again.",
    );
  });
});
