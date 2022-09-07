import MainPage from 'pages/Main';
import RoomPage from 'pages/Room';
import { Routes, Route } from 'react-router-dom';

export default function RoutesDefinition() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/rooms/:roomId" element={<RoomPage />} />
    </Routes>
  );
}
