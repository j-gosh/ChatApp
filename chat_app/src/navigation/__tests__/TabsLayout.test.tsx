import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';

import TabsLayout from '@/app/(app)/(tabs)/_layout';
import { fakeUser } from '@test/mock-services';
import { createTestWrapper } from '@test/render';

async function renderTabs() {
  const { Wrapper } = createTestWrapper({ user: fakeUser() });
  await renderRouter(
    {
      _layout: () => (
        <Wrapper>
          <TabsLayout />
        </Wrapper>
      ),
      index: () => <Text>Chat screen</Text>,
      map: () => <Text>Map screen</Text>,
      video: () => <Text>Video screen</Text>,
      discover: () => <Text>Discover screen</Text>,
    },
    { initialUrl: '/' },
  );
}

describe('TabsLayout', () => {
  it('renders the four tabs', async () => {
    await renderTabs();
    for (const label of ['Chat', 'Map', 'Video', 'Discover']) {
      expect(screen.getByLabelText(label)).toBeOnTheScreen();
    }
  });

  it('starts on the Chat tab', async () => {
    await renderTabs();
    expect(screen).toHavePathname('/');
    expect(screen.getByText('Chat screen')).toBeOnTheScreen();
  });

  it('switches tabs when one is pressed', async () => {
    await renderTabs();
    await fireEvent.press(screen.getByLabelText('Discover'));
    expect(screen).toHavePathname('/discover');
    expect(screen.getByText('Discover screen')).toBeOnTheScreen();
  });
});
