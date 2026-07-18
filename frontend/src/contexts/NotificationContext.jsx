import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Snackbar, Alert, Box, Typography } from '@mui/material';
import { getWsBaseUrl } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState({ open: false, title: '', message: '' });

  useEffect(() => {
    let ws;
    if (user && user.id) {
      const wsUrl = `${getWsBaseUrl()}/ws/notifications/${user.id}`;
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => console.log('Connected to Global Notifications');
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        const newNotif = {
          id: Date.now() + Math.random(),
          type: data.type,
          title: data.title,
          message: data.message,
          timestamp: new Date(),
          read: false
        };
        
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show Toast popup for real-time feel
        setToast({
          open: true,
          title: data.title,
          message: data.message
        });
      };
      
      ws.onclose = () => console.log('Disconnected from Global Notifications');
    }
    
    return () => {
      if (ws) ws.close();
    };
  }, [user]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead, clearNotifications }}>
      {children}
      
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setToast({ ...toast, open: false })} 
          severity="info" 
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight={800}>{toast.title}</Typography>
            <Typography variant="body2">{toast.message}</Typography>
          </Box>
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
