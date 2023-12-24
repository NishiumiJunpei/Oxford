import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardMedia, CardContent, Typography, Button, Grid, Box } from '@mui/material';
import UserSettingMenu from '@/components/userSettingMenu';

const SetChallengeTheme = () => {
  const [currentChallengeThemeId, setCurrentChallengeThemeId] = useState(null);
  const [selectedThemeId, setSelectedThemeId] = useState(null);

  useEffect(() => {
    // APIからcurrentChallengeThemeIdを取得
    // axios.get('/api/path-to-your-endpoint').then(response => {
    //   setCurrentChallengeThemeId(response.data.currentChallengeThemeId);
    // });
  }, []);

  const challengeThemes = [
    { id: 1, name: '英検１級', image: 'eiken1.png' },
    { id: 2, name: '英検準１級', image: 'eiken1-sub.png' },
    { id: 3, name: '英検２級', image: 'eiken2.png' },
    { id: 4, name: '英検準２級', image: 'eiken2-sub.png' },
    { id: 5, name: '英検３級', image: 'eiken3.png' },
    { id: 6, name: '英検４級', image: 'eiken4.png' },
    { id: 7, name: '英検５級', image: 'eiken5.png' },
  ];

  const handleCardSelect = (id) => {
    setSelectedThemeId(id);
  };

  const handleChallenge = () => {
    // axios.post('/api/word-master/setChallengeTheme', { challengeThemeId: selectedThemeId });
    // 応答に基づいて何かをする...
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, // モバイルでは縦方向、それ以外では横方向
      maxWidth: '100%', 
      margin: 'auto' 
    }}>
      <UserSettingMenu/>

      <Box sx={{ maxWidth: '600px', margin: 'auto' }}> 
        <Typography variant="h5" sx={{marginTop: 5, marginBottom: 5}}>チャレンジしたいテーマを選択してください</Typography>

        <Grid container spacing={2} justifyContent="center"> {/* ここを更新 */}
          {challengeThemes.map(theme => (
              <Grid item xs={6} sm={6} md={4} key={theme.id}>
              <Card 
                  raised 
                  onClick={() => handleCardSelect(theme.id)} 
                  style={{ border: selectedThemeId === theme.id ? '2px solid blue' : '' }}
              >
                  <CardMedia
                  component="img"
                  image={`/images/${theme.image}`}
                  alt={theme.name}
                  style={{ height: '200px', objectFit: 'contain' }} // ここを更新
                  />
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
          {selectedThemeId && (
            <Grid item xs={12} textAlign="center" sx={{marginTop: 3}}> 
              <Typography>{`「${challengeThemes.find(theme => theme.id === selectedThemeId).name}」にチャレンジしますか？`}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }} sx={{margin:3}}> {/* ここを追加 */}
                  <Button variant="contained" color="primary" onClick={handleChallenge}>
                  チャレンジする
                  </Button>
              </Box>
              </Grid>
        )}
          </Grid>
      </Box>
    </Box>
  );
};

export default SetChallengeTheme;
