import { useChatController } from '@/controllers/use-chat-controller';
import type { ChatUser, Room } from '@/models/chat';
import { createMockServices } from '@test/mock-services';
import { renderHookWithProviders } from '@test/render';

const friend: ChatUser = { id: 'u2', firstName: 'Grace', lastName: 'Hopper' };
const room: Room = { id: 'room-1', type: 'direct', users: [{ id: 'u1' }, friend] };

async function setup() {
  const services = createMockServices();
  services.chatService.createRoom.mockResolvedValue(room);
  const { result } = await renderHookWithProviders(useChatController, { services });
  return { services, controller: result.current };
}

describe('useChatController', () => {
  it('sendMessage delegates to chatService.sendMessage', async () => {
    const { services, controller } = await setup();
    await controller.sendMessage({ text: 'hi' }, 'room-1');
    expect(services.chatService.sendMessage).toHaveBeenCalledWith({ text: 'hi' }, 'room-1');
  });

  it('createRoom delegates to chatService.createRoom and returns the room', async () => {
    const { services, controller } = await setup();
    await expect(controller.createRoom(friend)).resolves.toBe(room);
    expect(services.chatService.createRoom).toHaveBeenCalledWith(friend);
  });

  it('updateRoom delegates to chatService.updateRoom', async () => {
    const { services, controller } = await setup();
    await controller.updateRoom(room);
    expect(services.chatService.updateRoom).toHaveBeenCalledWith(room);
  });

  it('addFriend delegates to userService.addUserToFriendsList', async () => {
    const { services, controller } = await setup();
    await controller.addFriend('u1', friend);
    expect(services.userService.addUserToFriendsList).toHaveBeenCalledWith('u1', friend);
  });

  it('startConversation opens the room and adds the friend', async () => {
    const { services, controller } = await setup();
    await expect(controller.startConversation('u1', friend)).resolves.toBe(room);
    expect(services.chatService.createRoom).toHaveBeenCalledWith(friend);
    expect(services.userService.addUserToFriendsList).toHaveBeenCalledWith('u1', friend);
  });

  it('follow delegates to userService.follow', async () => {
    const { services, controller } = await setup();
    await controller.follow('u1', 'u2');
    expect(services.userService.follow).toHaveBeenCalledWith('u1', 'u2');
  });

  it('unfollow delegates to userService.unfollow', async () => {
    const { services, controller } = await setup();
    await controller.unfollow('u1', 'u2');
    expect(services.userService.unfollow).toHaveBeenCalledWith('u1', 'u2');
  });
});
