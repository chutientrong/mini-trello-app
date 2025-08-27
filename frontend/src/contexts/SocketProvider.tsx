/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthContext } from '@/contexts';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinBoards: (boardIds: string[]) => void;
  leaveBoards: (boardIds: string[]) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) {
      // Disconnect if no user
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Get access token from localStorage
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.warn('No access token found for WebSocket connection');
      return;
    }

    // Create socket connection
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  const joinBoards = (boardIds: string[]) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-boards', boardIds);
    }
  };

  const leaveBoards = (boardIds: string[]) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-boards', boardIds);
    }
  };

  const value: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    joinBoards,
    leaveBoards,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
