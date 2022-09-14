import axios from 'axios';

export function isForbiddenError(error: any) {
  return error && axios.isAxiosError(error) && error.response?.status === 403;
}
