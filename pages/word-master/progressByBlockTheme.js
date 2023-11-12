import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AppBar, Toolbar, Button, List, ListItem, ListItemText, ListItemButton, LinearProgress, Box, Typography, Avatar } from '@mui/material';

const HomePage = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('');
  const { theme } = router.query; // URLのクエリパラメータからthemeを取得

  useEffect(() => {
    if (theme) {
      setSelectedTheme(theme);
    }
    
    const fetchData = async () => {
      const response = await fetch(`/api/word-master/getProgressByBlockTheme?theme=${selectedTheme}`);
      const data = await response.json();
      setData(data);
    };

    if (selectedTheme) {
      fetchData();
    }
  }, [theme, selectedTheme]);

  const handleMenuClick = (theme) => {
    setSelectedTheme(theme);
  };

  const handleBlockClick = (block) => {
    router.push(`/word-master/wordList?block=${block}&theme=${selectedTheme}`);
  };

  const handleActionClick = (block) => {
    router.push(`/word-master/learnWordsCriteriaInput?block=${block}&theme=${selectedTheme}`);
  };

  return (
    <div>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Button 
            color={selectedTheme === '英検４級' ? 'primary' : 'inherit'}
            onClick={() => handleMenuClick('英検４級')}>
            英検４級
          </Button>
          <Button 
            color={selectedTheme === '英検準１級' ? 'primary' : 'inherit'}
            onClick={() => handleMenuClick('英検準１級')}>
            英検準１級
          </Button>
          <Button 
            color={selectedTheme === '英検１級' ? 'primary' : 'inherit'}
            onClick={() => handleMenuClick('英検１級')}>
            英検１級
          </Button>
        </Toolbar>
      </AppBar>
      <Box display="flex" p={2}>
        <Box width="10%" fontWeight="fontWeightBold">ブロック</Box>
        <Box width="30%" fontWeight="fontWeightBold">進捗％</Box>
        <Box width="60%" fontWeight="fontWeightBold">アクション</Box>
      </Box>
      <List>
        {data.map((item, index) => (
          <ListItem key={index} divider>
            <Box width="10%">
              <ListItemButton onClick={() => handleBlockClick(item.block)}>
                <Avatar sx={{ width: 24, height: 24, marginRight: 2, bgcolor: 'secondary.main' }}>{item.block}</Avatar>
              </ListItemButton>
            </Box>
            <Box width="30%" display="flex" alignItems="center">
              <LinearProgress variant="determinate" value={item.progress} sx={{ width: '50%' }} />
              <Typography variant="body2" color="textSecondary" sx={{ marginLeft: 2 }}>{`${Math.round(item.progress)}%`}</Typography>
            </Box>
            <Box width="60%">
              <Button variant="outlined" onClick={() => handleActionClick(item.block)}>
                理解度チェック
              </Button>
            </Box>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default HomePage;
