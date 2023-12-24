import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, Box, Snackbar, CircularProgress } from '@mui/material';
import UserSettingMenu from '@/components/userSettingMenu';

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState({ email: '', name: '', birthday: '', profile: '' });
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);


  // ユーザー情報をAPIから取得
  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      const response = await fetch('/api/user-setting/getUserInfo');
      const data = await response.json();
      setUserInfo(data);
      setLoading(false);
    };
    fetchUserInfo();
  }, []);

  // 更新ボタンのクリックイベント
  const handleUpdate = async () => {
    setLoading(true);
    await fetch('/api/user-setting/updateUserInfo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userInfo),
    });
    setOpenSnackbar(true);
    setLoading(false);
  };

  // フォームの入力値を処理
  const handleChange = (event) => {
    setUserInfo({ ...userInfo, [event.target.name]: event.target.value });
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleMenuItemClick = (path) => {
    // ここでリダイレクト処理を行います。例：window.location.href = path;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, // モバイルでは縦方向、それ以外では横方向
        maxWidth: '100%', 
        margin: 'auto' 
      }}>
        <UserSettingMenu/>

        <Box sx={{ maxWidth: '600px', margin: 'auto' }}> 
          <Typography variant="h6" sx={{ mb: 2 }}>ユーザープロファイル</Typography>
          <TextField label="メールアドレス" variant="outlined" fullWidth margin="normal" value={userInfo.email} disabled />
          <TextField label="名前" variant="outlined" fullWidth margin="normal" name="name" value={userInfo.name} onChange={handleChange} />
          <TextField
              label="誕生日"
              type="date"
              variant="outlined"
              fullWidth
              margin="normal"
              name="birthday"
              value={userInfo.birthday}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
          />

          <TextField label="プロフィール" variant="outlined" fullWidth multiline rows={4} margin="normal" name="profile" value={userInfo.profile} onChange={handleChange} />
          <Button variant="contained" color="primary" fullWidth onClick={handleUpdate} sx={{ mt: 2 }}>更新</Button>
    
          <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="更新されました。" />
        </Box>
      </Box>
    );
  };
  
  export default UserProfile;
  

