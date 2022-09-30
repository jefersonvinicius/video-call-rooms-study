import React, { ReactNode } from 'react';
import { useUser } from 'modules/users/state';
import { Navigate, useLocation } from 'react-router-dom';

type Props = {
  children: ReactNode;
};

export default function RequireAuth({ children }: Props) {
  const user = useUser();
  const location = useLocation();

  if (!user)
    return <Navigate to={'/login' + (location.pathname === '/' ? '' : `?redirect=${location.pathname}`)} replace />;

  return <>{children}</>;
}
