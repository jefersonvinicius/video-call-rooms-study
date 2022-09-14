import { useQuery } from '@tanstack/react-query';
import { API } from 'services/api';

export type RoomParams = {
  roomId: string | undefined;
};

export function useRoomQuery({ roomId }: RoomParams) {
  const { data, isLoading, error, refetch } = useQuery(['room', roomId], () => API.Rooms.fetchOne({ id: roomId! }), {
    enabled: !!roomId,
    refetchOnWindowFocus: false,
  });

  return {
    room: data,
    isLoadingRoom: isLoading,
    errorOnRoomQuery: error,
    refetchRoom: refetch,
  };
}

export function useWaitingRoomQuery({ roomId }: RoomParams) {
  const { data, isFetching } = useQuery(['room', roomId], () => API.Rooms.fetchWaitingRoom({ id: roomId! }), {
    enabled: !!roomId,
  });

  return {
    room: data,
    isFetching,
  };
}
