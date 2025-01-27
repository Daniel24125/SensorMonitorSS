"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import DevicesProvider from './devices';


// Define types for the socket context
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  emit: <T>(event: string, data?: T) => void;
  on: <T>(event: string, callback: (data: T) => void) => void;
  off: <T>(event: string, callback?: (data: T) => void) => void;
  connect: () => void;
  disconnect: () => void;
}

// Define props interface for the provider
interface SocketProviderProps {
  url?: string;
  options?: Record<string, any>;
  children: React.ReactNode;
}

// Create context with type
const SocketContext = createContext<SocketContextType | null>(null);

// Custom hook to use socket context with type safety
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ 
  url = 'http://localhost:8000',
  options = {},
  children 
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    // Initialize socket connection
    const socketInstance: Socket = io(url, {
      ...options,
      autoConnect: true,
      reconnection: true,
      transports: ['websocket'],
    });


    // Set up event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected with ID:', socketInstance.id);
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err: Error) => {
      setError(err.message);
      setIsConnected(false);
    });


    // Store socket instance
    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [url]);

  // Helper functions with type safety
  const emit = useCallback(async <T,>(event: string, data: T): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        const error = 'Socket instance not available';
        console.error(error);
        reject(new Error(error));
        return;
      }

      if (!isConnected) {
        const error = 'Socket is not connected';
        console.error(error);
        reject(new Error(error));
        return;
      }

      try {
        console.log(`Emitting ${event}:`, data);
        socket.emit(event, data, (error: any) => {
          if (error) {
            console.error('Emit error:', error);
            reject(error);
          } else {
            console.log(`Successfully emitted ${event}`);
            resolve();
          }
        });
      } catch (error) {
        console.error('Emit error:', error);
        reject(error);
      }
    });
  }, [socket, isConnected]);

  const on = <T,>(event: string, callback: (data: T) => void): void => {
    console.log(`On ${event}`);
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = <T,>(event: string, callback?: (data: T) => void): void => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const connect = (): void => {
    if (socket) {
      socket.connect();
    }
  };

  const disconnect = (): void => {
    if (socket) {
      socket.disconnect();
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    error,
    emit,
    on,
    off,
    connect,
    disconnect
  };

  return (
    <SocketContext.Provider value={value}>
        <DevicesProvider>
            {children}
        </DevicesProvider>
    </SocketContext.Provider>
  );
};