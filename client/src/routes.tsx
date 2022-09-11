import MainPage from 'pages/Main';
import RoomPage from 'pages/Room';
import WaitingRoom from 'pages/WaitingRoom';
import { Routes, Route } from 'react-router-dom';

export default function RoutesDefinition() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/rooms/:roomId" element={<RoomPage />} />
      <Route path="/waiting-room/:roomId" element={<WaitingRoom />} />
    </Routes>
  );
}
