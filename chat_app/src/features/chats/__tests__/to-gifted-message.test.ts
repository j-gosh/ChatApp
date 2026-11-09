import { toGiftedMessage } from '@/features/chats/to-gifted-message';

describe('toGiftedMessage', () => {
  it('maps a text message and its author', () => {
    expect(
      toGiftedMessage({
        id: 'm1',
        type: 'text',
        text: 'Hello',
        createdAt: 1000,
        author: { id: 'u1', firstName: 'Ada', lastName: 'Lovelace' },
      }),
    ).toEqual({
      _id: 'm1',
      text: 'Hello',
      createdAt: 1000,
      user: { _id: 'u1', name: 'Ada Lovelace', avatar: undefined },
    });
  });

  it('labels unsupported messages and defaults a missing timestamp', () => {
    jest.spyOn(Date, 'now').mockReturnValue(42);
    const message = toGiftedMessage({ id: 'm2', type: 'unsupported', author: { id: 'u1' } });
    expect(message).toMatchObject({
      text: 'Unsupported message',
      createdAt: 42,
      user: { name: undefined },
    });
  });
});
