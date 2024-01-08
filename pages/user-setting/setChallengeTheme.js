import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getSession, signIn } from 'next-auth/react';
import { Card, CardMedia, CardContent, Typography, Button, Grid, Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from '@mui/material';
import UserSettingMenu from '@/components/userSettingMenu';
import {challengeThemes} from '@/utils/variables'

const SetChallengeTheme = () => {
  const [currentChallengeThemeId, setCurrentChallengeThemeId] = useState(null);
  const [selectedThemeId, setSelectedThemeId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchCurrentChallengeThemeId = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/user-setting/getUserInfo');
        setCurrentChallengeThemeId(response.data.currentChallengeThemeId);
        setSelectedThemeId(response.data.currentChallengeThemeId);
      } catch (error) {
        console.error('Error fetching current challenge theme id', error);
      }
      setIsLoading(false);
    };

    fetchCurrentChallengeThemeId();
  }, []);

  const handleCardSelect = (id) => {
    setSelectedThemeId(id);
    setOpenPopup(true);
  };

  const handleChallenge = async () => {
    setIsLoading(true);
    try {
      await axios.post('/api/user-setting/updateCurrentChallengeTheme', { challengeThemeId: selectedThemeId });
      setIsLoading(false);
      setOpenSnackbar(true);
      setCurrentChallengeThemeId(selectedThemeId); // 現在チャレンジ中のテーマIDを更新
      await getSession();  // セッションを再取得


    } catch (error) {
      console.error('Error setting challenge theme', error);
    }
    setOpenPopup(false);
  };

  const handleClosePopup = () => {
    setSelectedThemeId(currentChallengeThemeId);
    setOpenPopup(false);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, 
      maxWidth: '100%', 
      margin: 'auto' 
    }}>
      <UserSettingMenu/>

      <Box sx={{ maxWidth: '600px', margin: 'auto' }}> 
        <Typography variant="subtitle1" sx={{marginTop: 5, marginBottom: 5}}>チャレンジしたいテーマを選択してください</Typography>

        <Grid container spacing={2} justifyContent="center">
          {challengeThemes.map(theme => (
            <Grid item xs={6} sm={6} md={4} key={theme.id}>
              <Card 
                raised 
                onClick={() => theme.activeStatus !== 'PREPARING' && handleCardSelect(theme.id)} 
                style={{ 
                  border: selectedThemeId === theme.id ? '2px solid blue' : '',
                  opacity: theme.activeStatus === 'PREPARING' ? 0.5 : 1,
                  pointerEvents: theme.activeStatus === 'PREPARING' ? 'none' : 'auto',
                  cursor: theme.activeStatus !== 'PREPARING' ? 'pointer' : 'default', // カーソルのスタイルを変更
                  transition: 'transform 0.3s ease', // トランジション効果を追加
                }}
                sx={{
                  '&:hover': {
                    transform: theme.activeStatus !== 'PREPARING' ? 'scale(1.05)' : 'none', // ホバー時のスケール変更
                    boxShadow: theme.activeStatus !== 'PREPARING' ? 3 : 'none', // ホバー時の影の強調
                  }
                }}
        
              >
                <div style={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    image={`/images/${theme.imageFilename}`}
                    alt={theme.name}
                    style={{ height: '200px', objectFit: 'contain' }}
                  />
                  {theme.activeStatus === 'PREPARING' && (
                    <Typography style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'white',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      padding: '5px'
                    }}>
                      準備中
                    </Typography>
                  )}
                </div>
                <CardContent>
                  <Typography gutterBottom variant="subtitle1" component="div">
                    {theme.name}
                  </Typography>
                  {currentChallengeThemeId === theme.id && (
                    <Typography variant="body2" color="text.secondary">
                      現在チャレンジ中
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>


      </Box>

      <Dialog open={openPopup} onClose={handleClosePopup}>
        <DialogTitle>確認</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`「${challengeThemes.find(theme => theme.id === selectedThemeId)?.name}」にチャレンジしますか？`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleChallenge} color="primary">
            はい
          </Button>
          <Button onClick={handleClosePopup} color="primary">
            いいえ
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="チャレンジテーマが更新されました"
      />
    </Box>
  );
};

export default SetChallengeTheme;
