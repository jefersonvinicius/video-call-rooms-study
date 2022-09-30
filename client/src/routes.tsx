import RequireAuth from 'components/RequireAuth';
import Login from 'pages/Login';
import MainPage from 'pages/Main';
import RoomPage from 'pages/Room';
import WaitingRoom from 'pages/WaitingRoom';
import { Routes, Route } from 'react-router-dom';

export default function RoutesDefinition() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <MainPage />
          </RequireAuth>
        }
      />
      <Route
        path="/rooms/:roomId"
        element={
          <RequireAuth>
            <RoomPage />
          </RequireAuth>
        }
      />
      <Route
        path="/waiting-room/:roomId"
        element={
          <RequireAuth>
            <WaitingRoom />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
