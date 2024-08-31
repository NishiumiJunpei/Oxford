import React, { useState, useEffect } from 'react';
import { AppBar, Box, IconButton, Toolbar, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Nav from './nav';
import { useTheme } from '@mui/material/styles';

const initialDrawerWidth = 280;
const minimizedDrawerWidth = 60; // サイドバーが非表示時の幅

export default function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerWidth, setDrawerWidth] = useState(initialDrawerWidth);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false); // モバイル表示ではサイドバーを初期状態で閉じる
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    const newSidebarState = !sidebarOpen;
    setSidebarOpen(newSidebarState);
    setDrawerWidth(newSidebarState ? initialDrawerWidth : minimizedDrawerWidth);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {isMobile ? (
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
      ) : (
        <Box
          sx={{
            position: 'fixed',
            zIndex: theme.zIndex.drawer + 1,
            top: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            height: '56px',
            bgcolor: 'transparent', // 背景を透明にする
          }}
        >
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            edge="start"
            onClick={handleSidebarToggle}
            sx={{ ml: 1, mb: 2 }}
          >
            {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      )}

      <Nav
        isOpen={isMobile ? mobileOpen : sidebarOpen} // モバイルとPCで異なる状態管理
        onClose={isMobile ? handleDrawerToggle : undefined} // モバイルではトグル関数を渡す
        isMobile={isMobile}
        drawerWidth={drawerWidth}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: 'margin 0.3s',
          width: '100%',
          height: 'auto',
          overflow: 'visible',
          marginTop: isMobile ? '56px' : '0', // モバイルではAppBarの高さに合わせて調整
          marginLeft: !isMobile ? `${drawerWidth}px` : 0,
          paddingLeft: isMobile ? '10px': '20px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
