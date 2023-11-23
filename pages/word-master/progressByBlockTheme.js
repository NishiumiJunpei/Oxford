import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AppBar, Toolbar, Button, ListItemButton, LinearProgress, Box, Typography, Avatar, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Tabs, Tab, CircularProgress, Chip } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StoryCreationDialog from '../../components/storyCreationDialog'
import WordStoryDetailsDialog from '../../components/wordStoryDetailsDialog'


const HomePage = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [tabValue, setTabValue] = useState(0); // タブの状態
  const [openStoryCreationDialog, setOpenStoryCreationDialog] = useState(false);
  const [openWordStoryDetailsDialog, setOpenWordStoryDetailsDialog] = useState(false);
  const [wordStoryList, setWordStoryList] = useState([]); // 新しいstateを追加
  const [selectedStory, setSelectedStory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  const { theme } = router.query; // URLのクエリパラメータからthemeを取得

  const fetchData = async (themeToFetch) => {
    setIsLoading(true);
    const response = await fetch(`/api/word-master/getProgressByBlockTheme?theme=${themeToFetch}`);
    const data = await response.json();
    setData(data);
    setIsLoading(false);
  };

  const fetchWordStoryList = async (themeToFetch) => {
    const response = await fetch(`/api/word-master/getWordStoryList?theme=${themeToFetch}`);
    const data = await response.json();
    if (Array.isArray(data)) {
      setWordStoryList(data);
    } else {
      console.error('Expected an array but got:', data);
      setWordStoryList([]);
    }
  };


  useEffect(() => {
    if (theme && theme !== selectedTheme) {
      setSelectedTheme(theme);
      fetchData(theme);
      fetchWordStoryList(theme);
    }
  }, [theme]);
  
  useEffect(() => {
    if (selectedTheme) {
      fetchData(selectedTheme);
      fetchWordStoryList(selectedTheme);
    }
  }, [selectedTheme]);


  const handleMenuClick = async (newTheme) => {
    setSelectedTheme(newTheme);
    router.push(`/word-master/progressByBlockTheme?theme=${newTheme}`);
    await fetchData(newTheme); 
    await fetchWordStoryList(newTheme);
  };
  
  const handleBlockClick = (block) => {
    router.push(`/word-master/wordList?block=${block}&theme=${selectedTheme}`);
  };

  const handleActionClick = (block) => {
    router.push(`/word-master/learnWordsCriteriaInput?block=${block}&theme=${selectedTheme}`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenStoryCreationDialog = () => {
    setOpenStoryCreationDialog(true);
  };

  const handleSaveStoryCreationDialog = (newStory) => {
    // 新しいストーリーをwordStoryListに追加
    setWordStoryList(prevList => [...prevList, newStory]);
    setOpenStoryCreationDialog(false);
  };


  const handleCloseStoryCreationDialog = () => {
    setOpenStoryCreationDialog(false);
  };


  const handleCloseStoryDetailsDialog = () => {
    setOpenWordStoryDetailsDialog(false);
  };

  const handleOpenWordStoryDetailsDialog = (story) => {
    setSelectedStory(story);
    setOpenWordStoryDetailsDialog(true);
  };

  const onDeleteWordStory = async (id) => {
    try {
      const response = await fetch('/api/word-master/deleteWordStoryByGPT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
  
      if (response.ok) {
        setWordStoryList(prevList => prevList.filter(story => story.id !== id));
      } else {
        throw new Error('API Error');
      }
    } catch (error) {
      console.error('Failed to delete story:', error);
    }
  };
  

  return (
    <div>
      <AppBar position="static" color="inherit" elevation={0}>
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

      {isLoading ? (
      <Box display="flex" justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
        <CircularProgress />
      </Box>
      ) : (
      <>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ marginLeft: 2 }}>
          <Tab label="単語" />
          <Tab label="ストーリー" />
        </Tabs>

        {tabValue === 0 && (
          <TableContainer component={Paper} sx={{ marginTop: 5 }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell align="left" style={{ fontWeight: 'bold', width: '10%' }}>ブロック</TableCell>
                    <TableCell align="left" style={{ fontWeight: 'bold', width: '30%' }}>進捗％</TableCell>
                    <TableCell align="left" style={{ fontWeight: 'bold', width: '60%' }}>アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        <ListItemButton onClick={() => handleBlockClick(item.block)}>
                          <Avatar sx={{ width: 24, height: 24, marginRight: 2, fontSize:'0.75rem', bgcolor: 'secondary.main' }}>{item.block}</Avatar>
                        </ListItemButton>
                      </TableCell>
                      <TableCell align="left">
                        <Box display="flex" alignItems="center">
                          {item.unknownCount > 0 ? (
                            <Chip variant="outlined" label="測定中" color="default" icon={<TimerIcon />} />
                          ) : item.progress === 100 ? (
                            <Chip label="マスター" color="success" icon={<CheckCircleIcon />} />
                          ) : (
                            <>
                              <LinearProgress variant="determinate" value={item.progress} sx={{ width: '50%' }} />
                              <Typography variant="body2" color="textSecondary" sx={{ marginLeft: 2 }}>{`${Math.round(item.progress)}%`}</Typography>
                            </>
                          )}
                        </Box>
                    </TableCell>
                      <TableCell align="left">
                        <Button variant="text" onClick={() => handleActionClick(item.block)}>
                          理解度チェック
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        )}

        {tabValue === 1 && (
          <>
          <Box sx={{ margin: 3 }}>
            <Button variant="contained" onClick={handleOpenStoryCreationDialog}>
              ストーリーを作る
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>テーマ</TableCell>
                  <TableCell>ブロック</TableCell>
                  <TableCell>ストーリー</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {wordStoryList.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.theme}</TableCell>
                    <TableCell>
                      <Avatar sx={{ width: 24, height: 24, marginRight: 2, fontSize:'0.75rem', bgcolor: 'secondary.main' }}>{item.block}</Avatar>
                    </TableCell>
                    <TableCell>
                      {item.storyContent.substring(0, 30)}
                      {item.storyContent.length > 30 && (
                        <Button onClick={() => handleOpenWordStoryDetailsDialog(item)}>もっと見る</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
        )}

      </>
      )}

      <StoryCreationDialog 
        open={openStoryCreationDialog} 
        onClose={handleCloseStoryCreationDialog} 
        onSave={handleSaveStoryCreationDialog} 
        blockList={data} 
        showAllinBlockList={true}
        theme={selectedTheme} 
      />
      <WordStoryDetailsDialog
        open={openWordStoryDetailsDialog}
        onClose={handleCloseStoryDetailsDialog}
        selectedStory={selectedStory}
        onDelete={onDeleteWordStory}
      />



    </div>
  );
};

export default HomePage;
