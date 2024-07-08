import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AppBar, Toolbar, Button, ListItem, LinearProgress, Box, Typography, Avatar, IconButton,Switch,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel, Paper, Tabs, Tab, CircularProgress, Tooltip,
  Card, CardHeader, CardContent, Link } from '@mui/material';
import WeakWordsList from '../../components/weakWordList'; 
import ProgressCircle from '@/components/progressCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SrWordList from '@/components/srWordList';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { useTheme } from '@mui/material/styles';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';


const ThickProgressBar = ({ value }) => {
  // プログレスバーの最大値と最小値
  const min = 0;
  const max = 200;
  const progressValue = Math.round((value / max) * 100); // パーセンテージに変換

  return (
    <Box display="flex" alignItems="center" flexDirection="column" width="100%">
      <Box width="100%" mr={1}>
        <LinearProgress 
          variant="determinate" 
          value={progressValue} 
          sx={{ height: 20 }} // 太いプログレスバー
        />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${progressValue}%`}</Typography>
      </Box>
    </Box>
  );
};


const WordMasterTop = () => {
  const router = useRouter();
  const theme = useTheme(); // テーマフックの使用
  const [data, setData] = useState([]);
  const [tabValue, setTabValue] = useState(0); // タブの状態
  const [overallProgress, setOverallProgress] = useState({}); 
  const [blockToLearn, setBlockToLearn] = useState({}); 
  const [isLoading, setIsLoading] = useState(false);
  const [weakWordList, setWeakWordList] = useState([]);
  const [srWordList, setSrWordList] = useState({});
  const [srWordCount, setSrWordCount] = useState(0); // 追加: 復習すべき単語の数を格納するstate
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('block');
  

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
    router.push(`/word-master/wordList?blockId=${blockId}&languageDirection=${languageDirection || 'EJ'}`);
  };

  const handleActionClick = (blockId) => {
    router.push(`/word-master/learnWordsCriteriaInput?blockId=${blockId}`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    router.push(`/word-master/wordMasterTop?tab=${newValue}`, undefined, { shallow: true });
  };

  const updateWordListForWeak = (newWordData) => {
    const updatedWordList = weakWordList.map(wordItem => 
      wordItem.id === newWordData.id ? newWordData : wordItem
    );
    setWeakWordList(updatedWordList);
  };

  const updateWordListForSR = (newWordData) => {
    const updatedSrWordList = { ...srWordList };

    Object.keys(updatedSrWordList['EJ']).forEach(date => {
      const index = updatedSrWordList['EJ'][date].findIndex(item => item.id === newWordData.id);
      if (index !== -1) {
        // idが一致するデータが見つかった場合、新しいデータで置き換える
        updatedSrWordList['EJ'][date][index] = newWordData;
      }
    });


    Object.keys(updatedSrWordList['JE']).forEach(date => {
      const index = updatedSrWordList['JE'][date].findIndex(item => item.id === newWordData.id);
      if (index !== -1) {
        // idが一致するデータが見つかった場合、新しいデータで置き換える
        updatedSrWordList['JE'][date][index] = newWordData;
      }
    });

    // srWordListの状態を更新
    setSrWordList(updatedSrWordList);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const sortedData = (data) => {
    return data.slice().sort((a, b) => {
      if (orderBy === 'block') {
        return (a.block.displayOrder < b.block.displayOrder ? -1 : 1) * (order === 'asc' ? 1 : -1);
      } else if (orderBy === 'status') {
        return (a.progress.EJ < b.progress.EJ ? -1 : 1) * (order === 'asc' ? 1 : -1);
      } else if (orderBy === 'lastStudy') {
        return (new Date(a.lastUpdatedAt.datetime) < new Date(b.lastUpdatedAt.datetime) ? -1 : 1) * (order === 'asc' ? 1 : -1);
      }
      return 0;
    });
  };
  
  // console.log('test',data)
  return (
    <Box maxWidth="lg">
      {isLoading ? (
      <Box display="flex" justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
        <CircularProgress />
      </Box>
      ) : (
      <>

        <Tabs value={tabValue} onChange={handleTabChange} >
          <Tab label="学習進捗" />
          <Tab 
            label="間隔反復" 
            icon={srWordCount > 0 ? (<PriorityHighIcon sx={{ color: theme.palette.error.main }}/>) : (<></>)} 
            iconPosition="end" />
          <Tab label="苦手単語" />
        </Tabs>

        {tabValue === 0 && (
          <>
            <Box display="flex" justifyContent="space-between" sx={{ width: '400px', mt: 5 }}>
              <Card sx={{ flex: 1, minWidth: 160, mr: 1 }}> 
              <CardHeader 
                title={
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1">進捗</Typography>
                    {/* <Tooltip title="アセスメントですべての単語に１度正解すると100％、24時間あけて2回連続で成果すると200％になります。200%を目指しましょう。">
                      <IconButton size="small" sx={{ marginLeft: 1 }}>
                        <HelpOutlineIcon />
                      </IconButton>
                    </Tooltip> */}
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

            </Box>
    
            <TableContainer component={Paper} sx={{ marginTop: 5 }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" style={{ fontWeight: 'bold', width: '10px'}}>
                    <TableSortLabel
                      active={orderBy === 'block'}
                      direction={orderBy === 'block' ? order : 'asc'}
                      onClick={(e) => handleRequestSort(e, 'block')}
                    >
                      ブロック
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left" style={{ fontWeight: 'bold' }}>
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                      onClick={(e) => handleRequestSort(e, 'status')}
                    >
                      ステータス
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left" style={{ fontWeight: 'bold' }}>
                    <TableSortLabel
                      active={orderBy === 'lastStudy'}
                      direction={orderBy === 'lastStudy' ? order : 'asc'}
                      onClick={(e) => handleRequestSort(e, 'lastStudy')}
                    >
                      最後に勉強した日
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData(data).map((item, index) => (
                  <TableRow key={index} sx={{cursor: 'pointer'}}>
                    <TableCell component="th" scope="row" align="left">
                      <ListItem>
                        <Avatar sx={{ width: 24, height: 24, marginRight: 2, fontSize:'0.75rem', bgcolor: 'secondary.main', color: '#fff' }}>
                          {item.block.name}
                        </Avatar>
                      </ListItem>
                    </TableCell>
                    <TableCell component="th" scope="row" align="left">
                      <Typography variant="subtitle1" color={Math.round(item.progress?.EJ) < 100 ? 'textPrimary' : 'primary'}>
                        <Link onClick={() => handleBlockClick(item.block.id, 'EJ')}>
                          { Math.round(item.progress?.EJ) == 200 ? (
                            <WorkspacePremiumIcon fontSize='large' color='success' />
                          ) : (
                            <ThickProgressBar value={item.progress?.EJ} />
                          )}
                        </Link>
                      </Typography>
                    </TableCell>
                    <TableCell component="th" scope="row" align="left">
                      <Typography variant="subtitle1" color={item.lastUpdatedAt?.within7day ? 'primary' : 'textPrimary'}>
                        {item.lastUpdatedAt?.datetimeText}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>



              </Table>
            </TableContainer>
          </>
        )}

        {tabValue === 1 && (
          <SrWordList srWordList={srWordList} setSrWordList={setSrWordList} updateWordList={updateWordListForSR}/> 
        )}


      {tabValue === 2 && (
          <WeakWordsList wordList={weakWordList} setWordList={setWeakWordList} updateWordList={updateWordListForWeak}/> 
        )}



      </>
      )}

    </Box>
  );
};

export default WordMasterTop;
