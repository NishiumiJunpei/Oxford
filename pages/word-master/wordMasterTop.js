import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AppBar, Toolbar, Button, ListItem, LinearProgress, Box, Typography, Avatar, IconButton,Switch,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Tabs, Tab, CircularProgress, Tooltip,
  Card, CardHeader, CardContent, Link } from '@mui/material';
import WeakWordsList from '../../components/weakWordList'; 
import ProgressCircle from '@/components/progressCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SrWordList from '@/components/srWordList';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { useTheme } from '@mui/material/styles';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';


const WordMasterTop = () => {
  const router = useRouter();
  const theme = useTheme(); // テーマフックの使用
  const [data, setData] = useState([]);
  const [tabValue, setTabValue] = useState(0); // タブの状態
  const [overallProgress, setOverallProgress] = useState({}); 
  const [blockToLearn, setBlockToLearn] = useState({}); 
  const [isLoading, setIsLoading] = useState(false);
  const [weakWordList, setWeakWordList] = useState([]);
  const [srWordList, setSrWordList] = useState([]);
  const [srWordCount, setSrWordCount] = useState(0); // 追加: 復習すべき単語の数を格納するstate


  const { themeId } = router.query; // URLのクエリパラメータからthemeを取得
  const fetchData = async (themeToFetch) => {
    try{
      setIsLoading(true);
      const response = await axios.get(`/api/word-master/getProgressByThemeId?themeId=${themeToFetch}`);
      setData(response.data.blocks);
      setOverallProgress(response.data.overallProgress)
      setBlockToLearn(response.data.blockToLearn)
      setIsLoading(false);  
    } catch(error){
      console.error('Error fetching words:', error);
    }
  };


  useEffect(() => {
    fetchData(themeId);
  }, []);

  useEffect(() => {
    // URLからtabの値を取得し、タブの状態を設定
    const tabFromUrl = parseInt(router.query.tab, 10);
    if (!isNaN(tabFromUrl)) {
      setTabValue(tabFromUrl);
    }

    if (themeId) {
      fetchData(themeId);
    }
  }, [router.query, themeId]);

  useEffect(() => {
    // タブ値が変更されたときに実行
    const fetchSrWordsToReview = async () => {
      try {
        const currentTime = new Date().toISOString(); // 現在時刻をISO形式で取得
        const response = await axios.get(`/api/word-master/checkSrWordsToReview?currentTime=${currentTime}`);
        setSrWordCount(response.data.count); // 復習すべき単語の数を設定
      } catch (error) {
        console.error('Error fetching SrWordsToReview:', error);
      }
    };

    fetchSrWordsToReview();
  }, [tabValue, srWordList]); // タブの値が変更されるたびに実行

  
  const handleBlockClick = (blockId, languageDirection) => {
    console.log('langu', languageDirection)
    router.push(`/word-master/wordList?blockId=${blockId}&languageDirection=${languageDirection || 'EJ'}`);
  };

  const handleActionClick = (blockId) => {
    router.push(`/word-master/learnWordsCriteriaInput?blockId=${blockId}`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    router.push(`/?tab=${newValue}`, undefined, { shallow: true });
  };

  const updateWordListForWeak = (newWordData) => {
    const updatedWordList = weakWordList.map(wordItem => 
      wordItem.id === newWordData.id ? newWordData : wordItem
    );
    setWeakWordList(updatedWordList);
  };

  const updateWordListForSR = (newWordData) => {
    const updatedWordList = Object.entries(srWordList).reduce((acc, [srNextTime, words]) => {
      const updatedWords = words.map(wordItem => 
        wordItem.id === newWordData.id ? newWordData : wordItem
      );
      acc[srNextTime] = updatedWords;
      return acc;
    }, {});
  
    setSrWordList(updatedWordList);
  };
  

  return (
    <Box maxWidth="lg">
      {isLoading ? (
      <Box display="flex" justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
        <CircularProgress />
      </Box>
      ) : (
      <>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ marginLeft: 2 }}>
          <Tab label="学習進捗" />
          <Tab label="苦手単語" />
          <Tab 
            label="間隔反復" 
            icon={srWordCount > 0 ? (<PriorityHighIcon sx={{ color: theme.palette.error.main }}/>) : (<></>)} 
            iconPosition="end" />
        </Tabs>

        {tabValue === 0 && (
          <>
            {/* <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginTop: 4 }}>
              <ProgressCircle value={overallProgress} />
            </Box> */}
            <Box display="flex" justifyContent="space-between" sx={{ width: '500px', mt: 5 }}>
              <Card sx={{ flex: 1, minWidth: 200, mr: 1 }}> 
              <CardHeader 
                title={
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1">英単語を理解できる</Typography>
                    <Tooltip title="理解度チェックですべての単語に１度正解すると100％、24時間あけて2回連続で成果すると200％になります。200%を目指しましょう。">
                      <IconButton size="small" sx={{ marginLeft: 1 }}>
                        <HelpOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                } 
                titleTypographyProps={{ variant: 'subtitle1' }} 
              />
                <CardContent>
                  <ProgressCircle value={overallProgress.EJ} />
                  {blockToLearn.EJ?.id && (
                    <Button variant="outlined" color="secondary" sx={{mt:3}} onClick={()=>handleBlockClick(blockToLearn.EJ.id, 'EJ')}>
                      学習する
                      <Avatar sx={{ width: 24, height: 24, marginLeft: 2, fontSize:'0.75rem', bgcolor: 'secondary.main', color: '#fff' }}>
                        {blockToLearn.EJ.name}
                      </Avatar>
                    </Button>
                  )}

                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 200, mr: 1 }}> 
              <CardHeader 
                title={
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1">英単語を使える</Typography>
                    <Tooltip title="理解度チェックですべての単語に１度正解すると100％、24時間あけて2回連続で成果すると200％になります。200%を目指しましょう。">
                      <IconButton size="small" sx={{ marginLeft: 1 }}>
                        <HelpOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                } 
                titleTypographyProps={{ variant: 'subtitle1' }} 
              />
                <CardContent>
                <ProgressCircle value={overallProgress.JE} />
                {blockToLearn.JE?.id && (
                  <Button variant="outlined" color="secondary" sx={{mt:3}} onClick={()=>handleBlockClick(blockToLearn.JE.id, 'JE')}>
                    学習する
                    <Avatar sx={{ width: 24, height: 24, marginLeft: 2, fontSize:'0.75rem', bgcolor: 'secondary.main', color: '#fff' }}>
                      {blockToLearn.JE.name}
                    </Avatar>
                  </Button>
                )}

                </CardContent>
              </Card>
            </Box>
      



            {/* <FormControlLabel
              control={<Switch checked={showMaster} onChange={() => setShowMaster(!showMaster)} />}
              label="マスターを表示"
              sx={{ mt: 5 }}
            /> */}
            <TableContainer component={Paper} sx={{ marginTop: 5 }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell align="left" style={{ fontWeight: 'bold', width: '10%' }}>ブロック</TableCell>
                    <TableCell align="left" style={{ fontWeight: 'bold', width: '15%' }}>英単語を理解できる</TableCell>
                    <TableCell align="left" style={{ fontWeight: 'bold', width: '15%' }}>英単語を使える</TableCell>
                    <TableCell align="left" style={{ fontWeight: 'bold', width: '60%' }}>アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index} sx={{cursor: 'pointer'}}>
                      <TableCell component="th" scope="row">
                        <ListItem >
                          <Avatar sx={{ width: 24, height: 24, marginRight: 2, fontSize:'0.75rem', bgcolor: 'secondary.main', color: '#fff' }}>{item.block.name}</Avatar>
                        </ListItem>
                      </TableCell>

                      <TableCell component="th" scope="row">
                        <Typography variant="subtitle1" color={Math.round(item.progress?.EJ) < 100 ? 'textPrimary' : 'primary'} >
                          <Link onClick={() => handleBlockClick(item.block.id, 'EJ')}>
                            { Math.round(item.progress?.EJ) == 200 ? (
                              <WorkspacePremiumIcon fontSize='large' color='success' />
                            ) : (
                              <>
                                {`${Math.round(item.progress?.EJ)}%`}
                              </>                              
                            )}
                          </Link>
                        </Typography>
                      </TableCell>
                      <TableCell component="th" scope="row">
                        <Typography variant="subtitle1" color={Math.round(item.progress?.JE) < 100 ? 'textPrimary' : 'primary'} >
                          <Link onClick={() => handleBlockClick(item.block.id, 'JE')}>
                            { Math.round(item.progress?.JE) == 200 ? (
                              <WorkspacePremiumIcon fontSize='large' color='success' />
                            ) : (
                              <>
                                {`${Math.round(item.progress?.JE)}%`}
                              </>                              
                            )}
                          </Link>
                        </Typography>
                      </TableCell>

                      <TableCell align="left">
                        <Link variant="text" color="inherit" onClick={() => handleActionClick(item.block.id)}>
                          理解度チェック
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {tabValue === 1 && (
          <WeakWordsList wordList={weakWordList} setWordList={setWeakWordList} updateWordList={updateWordListForWeak}/> 
        )}

        {tabValue === 2 && (
          <SrWordList srWordList={srWordList} setSrWordList={setSrWordList} updateWordList={updateWordListForSR}/> 
        )}

      </>
      )}

    </Box>
  );
};

export default WordMasterTop;
