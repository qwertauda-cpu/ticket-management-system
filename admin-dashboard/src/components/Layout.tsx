import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Dashboard,
  Business,
  Subscriptions,
  Receipt,
  Logout,
  AdminPanelSettings,
} from '@mui/icons-material';
import { api } from '../services/api';

const drawerWidth = 260;

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = api.getUser();

  const handleLogout = () => {
    api.logout();
    navigate('/');
  };

  const menuItems = [
    { text: 'لوحة المعلومات', icon: <Dashboard />, path: '/dashboard' },
    { text: 'الشركات', icon: <Business />, path: '/companies' },
    { text: 'الاشتراكات', icon: <Subscriptions />, path: '/subscriptions' },
    { text: 'الفواتير', icon: <Receipt />, path: '/invoices' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            لوحة تحكم السوبر أدمن
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <AdminPanelSettings sx={{ fontSize: 60, color: '#667eea' }} />
          <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
            السوبر أدمن
          </Typography>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#667eea20',
                    borderRight: '4px solid #667eea',
                  },
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? '#667eea' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          pt: '64px',
          p: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

