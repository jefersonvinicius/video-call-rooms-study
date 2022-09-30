import { useUserState } from 'modules/users/state';
import React, { FormEvent, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API } from 'services/api';

export default function Login() {
  const [, setUser] = useUserState();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const usernameInput = useRef<HTMLInputElement>(null);

  const [query] = useSearchParams();
  const navigate = useNavigate();

  async function handleLoginSubmit(event: FormEvent) {
    event.preventDefault();
    setIsLoggingIn(true);

    const username = usernameInput.current!.value;

    API.Users.create(username)
      .then((created) => {
        setUser(created);
        const redirect = query.get('redirect') || '/';
        navigate(redirect, { replace: true });
      })
      .catch((error: any) => {
        alert('Error: ' + error.message);
      })
      .finally(() => {
        setIsLoggingIn(false);
      });
  }

  return (
    <form onSubmit={handleLoginSubmit}>
      <input ref={usernameInput} name="username" placeholder="Username" />
      <button type="submit" disabled={isLoggingIn}>
        Register
      </button>
    </form>
  );
}
