import { atom, useRecoilState, useRecoilValue } from 'recoil';
import { User } from '..';

const userAtom = atom<User | null>({
  key: 'user',
  default: null,
});

export function useUserState() {
  return useRecoilState(userAtom);
}

export function useUser() {
  return useRecoilValue(userAtom);
}
