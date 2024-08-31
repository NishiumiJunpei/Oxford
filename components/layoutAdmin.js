import React, { useState, useEffect } from 'react';
import { AppBar, Box, IconButton, Toolbar, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NavAdmin from './navAdmin';
import { useTheme } from '@mui/material/styles';

const initialDrawerWidth = 280;
const minimizedDrawerWidth = 60; // 小さくしたい場合のサイドバーの幅

export default function LayoutAdmin({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerWidth, setDrawerWidth] = useState(initialDrawerWidth);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false); // モバイル時にサイドバーを最初に閉じる
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
              sx={{ mr: 2 }}
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
            sx={{ ml: 1 }}
          >
            {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      )}

      <NavAdmin
        isOpen={isMobile ? mobileOpen : sidebarOpen} // モバイルとPCで状態を分ける
        onClose={isMobile ? handleDrawerToggle : undefined} // モバイルではトグル関数を渡す
        isMobile={isMobile}
        drawerWidth={drawerWidth}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0.5,
          transition: 'margin 0.3s',
          width: '100%',
          height: 'auto',
          overflow: 'visible',
          marginTop: isMobile ? '56px' : '0', // モバイルではAppBarの高さに合わせて調整
          marginLeft: !isMobile ? `${drawerWidth}px` : 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
