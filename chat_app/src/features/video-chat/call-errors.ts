/** Maps a Stream call-creation error to a message suitable for the user. */
export function getStartCallErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  // Stream rejects ringing users who have never connected (and so don't exist in Stream yet).
  if (/don't exist|do not exist/i.test(message)) {
    return "This friend hasn't set up video calls yet.";
  }
  return "Couldn't start the call. Please try again.";
}
