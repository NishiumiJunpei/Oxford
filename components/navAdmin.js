import React, { useState, useEffect } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography } from '@mui/material';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { signOut } from 'next-auth/react'; // NextAuthからsignOutをインポート


function NavAdmin({ isOpen, onClose, isMobile }) {

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
      <Box sx={{ padding: 0, marginTop: 5, marginBottom: 5, textAlign: 'center' }}>
        管理用 
      </Box>


      <List>
        <ListItem button component="a" href={`/admin/manageWordListByTheme`}>
          <ListItemIcon>
            <ImportContactsIcon /> {/* 理解度ステータスのアイコン */}
          </ListItemIcon>
          <ListItemText primary="テーマ" />
        </ListItem>
        <ListItem button component="a" href={`/admin/manageWordList`}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="ワード検索" />
        </ListItem>
        <ListItem button component="a" href={`/admin/autoPlayWords`}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="ワード再生" />
        </ListItem>
        <ListItem button component="a" href={`/admin/autoPlayScene`}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="英語シーン" />
        </ListItem>
      </List>
    </Drawer>
  );
}

export default NavAdmin;



