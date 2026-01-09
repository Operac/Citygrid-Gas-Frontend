import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      // Initialize socket connection
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected:', newSocket.id);
        
        // Register user roles for room joining
        if (user?.role) {
          newSocket.emit('join_room', `role_${user.role}`);
        }
        if (user?.id) {
          newSocket.emit('join_room', `user_${user.id}`);
        }
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });

      newSocket.on('notification', (data) => {
        const { title, message, type } = data;
        // Show toast based on type
        switch(type) {
          case 'success': toast.success(message); break;
          case 'error': toast.error(message); break;
          default: toast(message, { icon: '🔔' });
        }
      });

      // Specific event listeners
      newSocket.on('order_status_update', (data) => {
        toast.success(`Order #${data.orderId} is now ${data.status}`);
      });
      
      newSocket.on('new_order_assigned', (data) => {
        toast.custom((t) => (
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-600 flex items-center justify-between">
             <div>
               <div className="font-bold">New Order Assigned!</div>
               <div className="text-sm text-gray-600">Order #{data.orderId}</div>
             </div>
          </div>
        ));
      });

      setSocket(newSocket);

      return () => {
        console.log('🔌 Disconnecting socket...');
        newSocket.close();
      };
    } else {
      // Close socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, token, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
