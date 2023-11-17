import React from 'react';
import { Box, useMediaQuery } from '@mui/material';
import Nav from './nav';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;

export default function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ display: 'flex' }}>
      <Nav isOpen={!isMobile} drawerWidth={drawerWidth} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: 'margin 0.3s',
          // marginLeft: !isMobile ? `${drawerWidth}px` : 0, // PCではサイドバー分のマージンを設定
          width: '100%',
          height: 'auto',
          overflow: 'visible',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
