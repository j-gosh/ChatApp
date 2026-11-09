import { isSingleEmoji } from '@/utils/emoji';

describe('isSingleEmoji', () => {
  it.each(['😀', '👍🏽', '👨‍👩‍👧', '❤️', ' 🎉 '])('treats %p as a single emoji', (text) => {
    expect(isSingleEmoji(text)).toBe(true);
  });

  it.each(['hi', '😀😀', '😀 hi', '', '1'])('does not treat %p as a single emoji', (text) => {
    expect(isSingleEmoji(text)).toBe(false);
  });
});
