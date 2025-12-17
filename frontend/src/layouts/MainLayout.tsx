import { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Stack,
  useMediaQuery,
  useTheme,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 280;

type MenuItem = {
  text: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
};

const menuItems: MenuItem[] = [
  { text: 'لوحة التحكم', icon: <DashboardIcon />, path: '/' },
  { text: 'التذاكر', icon: <ConfirmationNumberIcon />, path: '/tickets', badge: 5 },
  { text: 'المستخدمين', icon: <PeopleIcon />, path: '/users' },
  { text: 'الإعدادات', icon: <SettingsIcon />, path: '/settings' },
];

type User = {
  id: string;
  email: string;
  name: string;
  isOwner: boolean;
  permissions: string[];
};

type Props = {
  children: React.ReactNode;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  user?: User;
  onLogout?: () => void;
};

export function MainLayout({ children, currentPath = '/', onNavigate, user, onLogout }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const filteredMenuItems = menuItems.filter((item) => {
    // Hide Users and Settings for non-owners
    if ((item.path === '/users' || item.path === '/settings') && !user?.isOwner) {
      return false;
    }
    return true;
  });

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 900,
              fontSize: '1.5rem',
            }}
          >
            T
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              نظام التذاكر
            </Typography>
            <Typography variant="caption" color="text.secondary">
              إدارة احترافية
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {filteredMenuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={currentPath === item.path}
                onClick={() => onNavigate?.(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: currentPath === item.path ? 'white' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: currentPath === item.path ? 700 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))
        }
      </List>

      <Divider />

      {/* User Profile */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: user?.isOwner ? 'error.main' : 'secondary.main',
              width: 44,
              height: 44,
              fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, noWrap: true }}>
              {user?.name || 'مستخدم'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.isOwner ? 'المالك' : 'موظف'}
            </Typography>
          </Box>
          <IconButton size="small" color="error" onClick={onLogout}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default', direction: 'rtl' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: 0 },
          mr: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 700 }}>
            {filteredMenuItems.find(item => item.path === currentPath)?.text ?? 'لوحة التحكم'}
          </Typography>

          <Stack direction="row" spacing={1}>
            <IconButton color="inherit" sx={{ color: 'text.primary' }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          anchor="right"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              borderLeft: '1px solid',
              borderColor: 'divider',
              height: '100vh',
              overflow: 'auto',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
        <Box sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3, md: 4 },
          overflow: 'auto',
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

