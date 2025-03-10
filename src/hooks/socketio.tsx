import { useEffect, useState } from 'react';
import io, { ManagerOptions, Socket, SocketOptions } from 'socket.io-client';

// Set your server's Socket.io endpoint
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_BASE_URL ?? location.host;  // Update with your server URL

const useSocket = (namespace = '/', implicitConnect = false) => {
  const [socket, setSocket] = useState<Socket| null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if(implicitConnect) {
        connect()
    }
    return () => {
      if(socket) socket.disconnect();
    };
  }, [namespace]);

  const connect: (ppt?: Partial<ManagerOptions & SocketOptions>) => Socket = (options = {})=>{
    const socketIo = io( SOCKET_SERVER_URL+ namespace, {
        transports: ['websocket'],
        ...options,
      });


      setSocket(socketIo)
  
      // Handle connection
      socketIo.on('connect', () => {
        console.log('Connected to socket server');
        setConnected(true);
      });
  
      socketIo.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setConnected(false);
      });

      return socketIo;
  }

  // Function to emit messages to the server
  const sendMessage: <T>(a: string, b: T)=> void = (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  // Function to listen for messages from the server
  const listenToEvent = (event: string, callback: <T>(payload: T)=> void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  return {
    socket,
    connected,
    sendMessage,
    listenToEvent,
    connect
  };
};

export default useSocket;
