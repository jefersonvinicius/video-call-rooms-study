import { api } from 'api';

export function configureUserIdHeaderInterceptor(userId: string) {
  return api.interceptors.request.use((config) => {
    if (config.headers) config.headers.userId = userId;
    return config;
  });
}

export function removeRequestInterceptor(interceptorId: number) {
  api.interceptors.request.eject(interceptorId);
}
