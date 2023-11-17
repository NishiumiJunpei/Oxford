import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Image } from '@mui/material';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function Nav({ isOpen, drawerWidth }) {
  return (
    <Box
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        display: isOpen ? 'block' : 'none', // サイドバーの表示/非表示
        [`& .MuiBox-root`]: { width: drawerWidth, boxSizing: 'border-box' },
        bgcolor: '#dfedf0'
      }}
    >
      <Box sx={{ padding: 0 , marginTop: 2, textAlign: 'center' }}>
        <img src="/logo.png" alt="ロゴ" style={{ maxWidth: '50%', height: 'auto' }} />
      </Box>

      {/* <Typography variant="h6" noWrap component="div" sx={{ padding: 2, marginTop: 2 }}>
        単語マスター
      </Typography> */}
      <List>
        {/* ListItems... */}
        <ListItem button component="a" href="/">
          <ListItemIcon>
            <CheckCircleIcon />
          </ListItemIcon>
          <ListItemText primary="ホーム" />
        </ListItem>
        <ListItem button component="a" href="/word-master/progressByBlockTheme">
            <ListItemIcon>
              <ImportContactsIcon /> {/* 理解度ステータスのアイコン */}
            </ListItemIcon>
            <ListItemText primary="英単語マスター" />
          </ListItem>
          <ListItem button component="a" href="/word-master/myWordList">
            <ListItemIcon>
              <BookmarksIcon /> {/* マイ単語帳のアイコン */}
            </ListItemIcon>
            <ListItemText primary="マイ単語帳" />
          </ListItem>
      </List>
    </Box>
  );
}

export default Nav;



