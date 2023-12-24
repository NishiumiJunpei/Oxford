// userSettingMenu.jsx
import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import { useRouter } from "next/router";

const userSettingMenu = () => {
    const router = useRouter();

  const menuItems = [
    { text: 'チャレンジテーマ設定', path: '/user-setting/setChallengeTheme' },
    { text: 'ユーザプロファイル設定', path: '/user-setting/userProfile' },
    // 他のメニュー項目
  ];

  const handleMenuItemClick = (path) => {
    router.push(path); // React RouterのuseHistoryフックを使用
  };

  return (
    <List component="nav">
      {menuItems.map((item, index) => (
        <ListItem button key={index} onClick={() => handleMenuItemClick(item.path)}>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  );
};

export default userSettingMenu;
