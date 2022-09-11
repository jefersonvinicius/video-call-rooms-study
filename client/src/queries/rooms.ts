import { useQuery } from '@tanstack/react-query';
import { API } from 'api';

export type RoomParams = {
  roomId: string | undefined;
};

export function useRoom({ roomId }: RoomParams) {
  const { data, isFetching } = useQuery(['room', roomId], () => API.Rooms.fetchOne({ id: roomId! }), {
    enabled: !!roomId,
  });

  return {
    room: data,
    isFetching,
  };
}
