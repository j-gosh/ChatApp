import { GroupSchema } from '@/models/group';
import { FriendLocationSchema } from '@/models/map-friend';
import { MemberSchema } from '@/models/member';
import { NewsSchema } from '@/models/news';
import { SnapSchema } from '@/models/snap';
import { groupStoriesByOwner, StoryPostSchema, type StoryPost } from '@/models/story';
import { SubscriptionSchema } from '@/models/subscription';
import { UserProfileSchema } from '@/models/user-profile';

const member = { userName: 'ada_lovelace', first: 'Ada', last: 'Lovelace' };
const group = { createdBy: 'user-1', groupId: 'group-1', members: [member] };

describe('MemberSchema', () => {
  it('parses all fields', () => {
    expect(MemberSchema.parse(member)).toEqual(member);
  });

  it('reads the "first" key (regression for the "firs" typo)', () => {
    expect(() => MemberSchema.parse({ userName: 'x', firs: 'Ada', last: 'L' })).toThrow();
  });
});

describe('GroupSchema', () => {
  it('parses all fields', () => {
    expect(GroupSchema.parse(group)).toEqual(group);
  });

  it('accepts an empty members list', () => {
    expect(GroupSchema.parse({ ...group, members: [] }).members).toEqual([]);
  });
});

describe('UserProfileSchema', () => {
  it('parses all fields, including nested groups', () => {
    const profile = {
      userName: 'ada_lovelace',
      first: 'Ada',
      last: 'Lovelace',
      groups: [group],
      snapCount: 3,
      locationSharing: 'always',
    };
    expect(UserProfileSchema.parse(profile)).toEqual(profile);
  });

  it('defaults groups, snap count, and location sharing for older profiles', () => {
    expect(UserProfileSchema.parse({ userName: 'a', first: 'A', last: 'B' })).toMatchObject({
      groups: [],
      snapCount: 0,
      locationSharing: 'off',
    });
  });

  it('rejects unknown location sharing modes', () => {
    expect(() =>
      UserProfileSchema.parse({
        userName: 'a',
        first: 'A',
        last: 'B',
        locationSharing: 'sometimes',
      }),
    ).toThrow();
  });
});

describe('StoryPostSchema', () => {
  const story = {
    ownerId: 'u1',
    ownerName: 'Ada',
    imageUrl: 'https://img/1.jpg',
    storagePath: 'stories/u1/s1/image.jpg',
    visibility: 'friends',
  };

  it('defaults the caption and accepts a missing owner photo', () => {
    expect(StoryPostSchema.parse({ ...story, ownerImageUrl: null })).toEqual({
      ...story,
      caption: '',
      ownerImageUrl: null,
    });
  });

  it('rejects unknown visibilities', () => {
    expect(() => StoryPostSchema.parse({ ...story, visibility: 'public' })).toThrow();
  });
});

describe('groupStoriesByOwner', () => {
  const post = (id: string, ownerId: string, createdAt: number): StoryPost => ({
    id,
    ownerId,
    ownerName: ownerId.toUpperCase(),
    imageUrl: `https://img/${id}.jpg`,
    storagePath: `stories/${ownerId}/${id}/image.jpg`,
    caption: '',
    visibility: 'everyone',
    createdAt,
  });

  it('puts the current user first, then owners by most recent post, items oldest first', () => {
    const stories = groupStoriesByOwner(
      [
        post('a2', 'alan', 50),
        post('g1', 'grace', 40),
        post('me1', 'me', 10),
        post('a1', 'alan', 5),
      ],
      'me',
    );

    expect(stories.map((story) => story.userId)).toEqual(['me', 'alan', 'grace']);
    expect(stories[1]?.items.map((item) => item.id)).toEqual(['a1', 'a2']);
    expect(stories[1]).toMatchObject({ displayName: 'ALAN' });
  });

  it('returns an empty list for no posts', () => {
    expect(groupStoriesByOwner([], 'me')).toEqual([]);
  });
});

describe('NewsSchema', () => {
  it('defaults the summary and content', () => {
    expect(
      NewsSchema.parse({ title: 'T', thumbnailUrl: 'https://img/t.jpg', category: 'Tech' }),
    ).toEqual({
      title: 'T',
      thumbnailUrl: 'https://img/t.jpg',
      category: 'Tech',
      summary: '',
      content: '',
    });
  });
});

describe('SubscriptionSchema', () => {
  it('defaults the order', () => {
    expect(SubscriptionSchema.parse({ label: 'L', imageUrl: 'https://img/l.jpg' }).order).toBe(0);
  });
});

describe('SnapSchema', () => {
  it('requires the storage path', () => {
    expect(() =>
      SnapSchema.parse({ batchId: 'b', senderId: 's', senderName: 'S', recipientId: 'r' }),
    ).toThrow();
  });
});

describe('FriendLocationSchema', () => {
  it('parses a shared location without a photo', () => {
    expect(
      FriendLocationSchema.parse({
        latitude: 1,
        longitude: 2,
        displayName: 'Grace',
        imageUrl: null,
      }),
    ).toEqual({ latitude: 1, longitude: 2, displayName: 'Grace', imageUrl: null });
  });
});
