import { useState } from 'react';
import RoomLobby from './RoomLobby';
import ActiveRoom from './ActiveRoom';

interface StudyRoomContainerProps {
  isFocusMode: boolean;
}

export default function StudyRoomContainer({ isFocusMode }: StudyRoomContainerProps) {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  if (activeRoomId) {
    return (
      <ActiveRoom 
        roomId={activeRoomId} 
        onLeave={() => setActiveRoomId(null)} 
        isFocusMode={isFocusMode}
      />
    );
  }

  return <RoomLobby onJoinRoom={setActiveRoomId} />;
}
