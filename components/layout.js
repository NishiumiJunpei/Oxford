import React, { useState, useEffect } from 'react';
import { AppBar, Box, IconButton, Toolbar, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Nav from './nav';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 200;

export default function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const [initialRender, setInitialRender] = useState(true);

  useEffect(() => {
    setInitialRender(false);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };


  const handleCloseDrawer = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };


  return (
    <Box sx={{ display: 'flex' }}>
      {isMobile && (
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      <Nav isOpen={!initialRender && (isMobile ? mobileOpen : true)} onClose={handleCloseDrawer} isMobile={isMobile}/>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: 'margin 0.3s',
          width: '100%',
          height: 'auto',
          overflow: 'visible',
          ...(isMobile && {
            marginTop: '56px', // AppBarの高さに合わせて調整する
          }),
          marginLeft: !isMobile ? `${drawerWidth}px` : 0,
          paddingLeft: isMobile ? '10px': '20px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}


