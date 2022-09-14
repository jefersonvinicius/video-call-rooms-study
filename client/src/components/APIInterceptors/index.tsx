import { useEffect } from 'react';
import { configureUserIdHeaderInterceptor, removeRequestInterceptor } from 'services/api/interceptors';
import { useUser } from 'modules/users/state';

export default function APIInterceptors() {
  const user = useUser();
  useEffect(() => {
    if (!user) return;

    const interceptorId = configureUserIdHeaderInterceptor(user?.id);
    return () => {
      removeRequestInterceptor(interceptorId);
    };
  }, [user]);

  return null;
}
