import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getSocket } from '../services/socket';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const socket = useRef(null);
  const location = useLocation();
  const currentRoom = useRef('');

  const getRoomFromPath = (path) => {
    if (path === '/display') return 'display-room';
    if (path.startsWith('/doctor')) return 'doctor-room';
    if (path === '/reception' || path === '/') return 'reception-room';
    return 'general-room';
  };

  useEffect(() => {
    socket.current = getSocket();

    const room = getRoomFromPath(location.pathname);
    if (room !== currentRoom.current) {
      // Leave old room
      if (currentRoom.current) {
        socket.current.emit('leave-room', currentRoom.current);
      }
      // Join new room
      socket.current.emit('join-room', room);
      currentRoom.current = room;
      console.log(`Joined room: ${room}`);
    }

    return () => {
      if (currentRoom.current) {
        socket.current.emit('leave-room', currentRoom.current);
      }
    };
  }, [location.pathname]);

  return (
    <SocketContext.Provider value={{ socket: socket.current, currentRoom: currentRoom.current }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

