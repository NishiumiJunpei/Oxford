import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography } from '@mui/material';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { signOut } from 'next-auth/react'; // NextAuthからsignOutをインポート


function Nav({ isOpen, onClose, isMobile }) {

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = '/auth/signin';
  };


  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      open={isOpen}
      onClose={onClose}
    >
      <Box sx={{ padding: 0, marginTop: 2, textAlign: 'center' }}>
        <img src="/logo.png" alt="ロゴ" style={{ maxWidth: '50%', height: 'auto' }} />
      </Box>


      <List>
        {/* ListItems... */}
        <ListItem button component="a" href="/">
          <ListItemIcon>
            <HomeIcon />
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
          <ListItem button component="a" href="/user-setting/userProfile">
            <ListItemIcon>
              <SettingsIcon /> {/* マイ単語帳のアイコン */}
            </ListItemIcon>
            <ListItemText primary="ユーザアカウント" />
          </ListItem>
          <ListItem button component="a" onClick={handleLogout}>
            <ListItemIcon>
            </ListItemIcon>
            <ListItemText primary="ログアウト" />
          </ListItem>
      </List>
    </Drawer>
  );
}

export default Nav;



