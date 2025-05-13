// mobile/src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Config from '../config';
import { useNetworkStatus } from './NetworkContext';

// Create Context
const SocketContext = createContext(null);

// Socket Provider Component
export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { isConnected } = useNetworkStatus();

  // Connect to socket when online
  useEffect(() => {
    let socketInstance = null;

    if (isConnected) {
      // Connect to Socket.IO server
      socketInstance = io(Config.SOCKET_URL, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Socket event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      // Set socket instance
      setSocket(socketInstance);
    } else {
      // Disconnect when offline
      if (socket) {
        socket.disconnect();
        setConnected(false);
      }
    }

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        setConnected(false);
      }
    };
  }, [isConnected]);

  // Context value
  const value = {
    socket,
    connected,
    isSocketConnected: connected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

// Custom hook to use socket context
export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}