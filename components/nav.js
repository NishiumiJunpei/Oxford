import React, { useState, useEffect } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography } from '@mui/material';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { signOut } from 'next-auth/react'; // NextAuthからsignOutをインポート


function Nav({ isOpen, onClose, isMobile }) {
  const [currentChallengeThemeId, setCurrentChallengeThemeId] = useState('');

  // useEffect(() => {
  //   const fetchUserInfo = async () => {
  //     try {
  //       const response = await fetch('/api/user-setting/getUserInfo');
  //       if (!response.ok) {
  //         throw new Error('ネットワークレスポンスが不正です。');
  //       }
  //       const data = await response.json();
  //       setCurrentChallengeThemeId(data.currentChallengeThemeId);
  //     } catch (error) {
  //       console.error('ユーザ情報の取得に失敗しました', error);
  //     }
  //   };

  //   fetchUserInfo();
  // }, []);


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
        <img src="/logo.png" alt="ロゴ" style={{ maxWidth: '150px', height: 'auto' }} />
      </Box>


      <List>
        {/* ListItems... */}
        <ListItem button component="a" href="/appHome">
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="ホーム" />
        </ListItem>
        <ListItem button component="a" href={`/word-master/wordMasterTop`}>
            <ListItemIcon>
              <ImportContactsIcon /> {/* 理解度ステータスのアイコン */}
            </ListItemIcon>
            <ListItemText primary="英単語帳" />
          </ListItem>
          {/* <ListItem button component="a" href="/word-master/myWordList">
            <ListItemIcon>
              <BookmarksIcon /> 
            </ListItemIcon>
            <ListItemText primary="マイ単語帳" />
          </ListItem> */}
          <ListItem button component="a" href="/user-setting/userProfile">
            <ListItemIcon>
              <SettingsIcon /> {/* マイ単語帳のアイコン */}
            </ListItemIcon>
            <ListItemText primary="設定" />
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



