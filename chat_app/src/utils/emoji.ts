const SINGLE_EMOJI =
  /^\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*$/u;

/** True when `text` is exactly one emoji (including ZWJ sequences and skin tones). */
export function isSingleEmoji(text: string): boolean {
  return SINGLE_EMOJI.test(text.trim());
}
