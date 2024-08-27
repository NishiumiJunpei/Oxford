import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, Box, Snackbar, CircularProgress, Chip, Grid} from '@mui/material';
import UserSettingMenu from '@/components/userSettingMenu';
import SEOHeader from '@/components/seoHeader';

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState({ email: '', name: '', birthday: '', profile: '' });
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [profileKeywords, setProfileKeywords] = useState([]); // プロフィールキーワードの状態
  const [newProfile, setNewProfile] = useState(''); // 新しいキーワードの入力値
  const [interestKeywords, setInterestKeywords] = useState([]); // 興味・好きなことのキーワード
  const [newInterest, setNewInterest] = useState(''); // 新しい興味・好きなことの入力値
  const [IsloadingProfile, setIsLoadingProfile] = useState(false);
  const [IsloadingInterest, setIsLoadingInterest] = useState(false);


  // ユーザー情報をAPIから取得
  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/user-setting/getUserInfo');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        // userInfoの更新
        setUserInfo({ email: data.email, name: data.name, birthday: data.birthday, profile: data.profile });
  
        // profileKeywordsとinterestKeywordsの更新
        setProfileKeywords(data.profileKeywords || []);
        setInterestKeywords(data.interestKeywords || []);
  
      } catch (error) {
        console.error('There was an error fetching the user info:', error);
      }
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

  const updateProfileKeyword = async (keyword, action) => {
    setIsLoadingProfile(true)
    await fetch('/api/user-setting/updateProfileKeyword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileKeyword: keyword, action: action }),
    });
    if (action === 'UPDATE') {
      setProfileKeywords([...profileKeywords, keyword]);
    } else if (action === 'DELETE') {
      setProfileKeywords(profileKeywords.filter(k => k !== keyword));
    }
    setIsLoadingProfile(false)
  };

  // キーワードの追加
  const handleAddKeyword = () => {
    if (newProfile && profileKeywords.length < 10) {
      updateProfileKeyword(newProfile, 'UPDATE');
      setNewProfile('');
    }
  };

  // キーワードの削除
  const handleDeleteKeyword = (keyword) => () => {
    updateProfileKeyword(keyword, 'DELETE');
  };

  const updateInterestKeyword = async (keyword, action) => {
    setIsLoadingInterest(true)
    await fetch('/api/user-setting/updateInterestKeyword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interestKeyword: keyword, action: action }),
    });
    if (action === 'UPDATE') {
      setInterestKeywords([...interestKeywords, keyword]);
    } else if (action === 'DELETE') {
      setInterestKeywords(interestKeywords.filter(k => k !== keyword));
    }
    setIsLoadingInterest(false)
  };

  // キーワードの追加
  const handleAddInterest = () => {
    if (newInterest && interestKeywords.length < 10) {
      updateInterestKeyword(newInterest, 'UPDATE');
      setNewInterest('');
    }
  };

  // キーワードの削除
  const handleDeleteInterest = (keyword) => () => {
    updateInterestKeyword(keyword, 'DELETE');
  };



  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  
    return (
      <>
        <SEOHeader title="ユーザ設定"/>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, // モバイルでは縦方向、それ以外では横方向
          maxWidth: '100%', 
          margin: 'auto' 
          }}>
          <UserSettingMenu/>

          <Box sx={{ maxWidth: '600px', margin: 'auto' }}> 
            <TextField label="メールアドレス" variant="outlined" fullWidth margin="normal" value={userInfo.email} disabled autoComplete='off'/>
            <TextField label="名前" variant="outlined" fullWidth margin="normal" name="name" value={userInfo.name} onChange={handleChange} autoComplete='off'/>
            {/* <TextField
                label="誕生日"
                type="date"
                variant="outlined"
                fullWidth
                margin="normal"
                name="birthday"
                value={userInfo.birthday}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
            /> */}

            <Grid container spacing={1} alignItems="center">
              <Grid item xs>
                <TextField
                  label="プロフィール"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={newProfile}
                  onChange={(e) => setNewProfile(e.target.value)}
                  inputProps={{ maxLength: 15 }}
                  autoComplete='off'
                />
              </Grid>
              <Grid item>
                <Button variant="outlined" color="primary" onClick={handleAddKeyword} disabled={profileKeywords.length >= 3 || IsloadingProfile}>
                  セット
                </Button>
              </Grid>
            </Grid>
            <Typography variant="body2" color="GrayText" sx={{mb: 1}}>例：大学生、営業職、母親 (最大10個まで)</Typography>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {profileKeywords.map((keyword, index) => (
                <Chip
                  key={index}
                  label={keyword}
                  onDelete={handleDeleteKeyword(keyword)}
                  color="primary"
                />
              ))}
            </Box>

            <Grid container spacing={1} alignItems="center" sx={{mt: 5}}>
              <Grid item xs>
                <TextField
                  label="興味・好きなこと"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  inputProps={{ maxLength: 15 }}
                  autoComplete='off'
                />
              </Grid>
              <Grid item>
                <Button variant="outlined" color="primary" onClick={handleAddInterest} disabled={interestKeywords.length >= 5 || IsloadingInterest}>
                  セット
                </Button>
              </Grid>
            </Grid>
            <Typography variant="body2" color="GrayText" sx={{mb: 1}}>例：旅行、読書、映画鑑賞 (最大10個まで)</Typography>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {interestKeywords.map((keyword, index) => (
                <Chip
                  key={index}
                  label={keyword}
                  onDelete={handleDeleteInterest(keyword)}
                  color="primary"
                />
              ))}
            </Box>

            <Button variant="outlined" color="primary" fullWidth onClick={handleUpdate} sx={{ mt: 10 }}>更新</Button>
      
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="更新されました。" />
          </Box>
        </Box>
      </>

    );
  };
  
  export default UserProfile;
  

