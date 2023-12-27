import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AppBar, Toolbar, Button, ListItemButton, LinearProgress, Box, Typography, Avatar, FormControlLabel,Switch,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Tabs, Tab, CircularProgress, Chip } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WeakWordsList from '../../components/weakWordList'; 
import ProgressCircle from '@/components/progressCircle';


const HomePage = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [tabValue, setTabValue] = useState(0); // タブの状態
  const [overallProgress, setOverallProgress] = useState(0); 
  const [isLoading, setIsLoading] = useState(false);
  const [showMaster, setShowMaster] = useState(true); // デフォルトでは「マスター」を表示
 const [weakWordList, setWeakWordList] = useState([]);
 

  const { themeId } = router.query; // URLのクエリパラメータからthemeを取得

  const fetchData = async (themeToFetch) => {
    try{
      setIsLoading(true);
      const response = await axios.get(`/api/word-master/getProgressByThemeId?themeId=${themeToFetch}`);
      setData(response.data.blocks);
      setOverallProgress(response.data.overallProgress)
      setIsLoading(false);  
    } catch(error){
      console.error('Error fetching words:', error);
    }
  };


  useEffect(() => {
    fetchData(themeId);
  }, []);
  
  
  const handleBlockClick = (blockId) => {
    router.push(`/word-master/wordList?blockId=${blockId}`);
  };

  const handleActionClick = (blockId) => {
    router.push(`/word-master/learnWordsCriteriaInput?blockId=${blockId}`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
        </Tabs>

        {tabValue === 0 && (
          <>
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginTop: 4 }}>
              <ProgressCircle value={overallProgress} />
            </Box>

            <FormControlLabel
            control={<Switch checked={showMaster} onChange={() => setShowMaster(!showMaster)} />}
            label="マスターを表示"
            sx={{ margin: 2 }}
            />
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
                    showMaster || item.progress < 100 ? ( // スイッチがオフの場合は進捗が100%未満の行のみ表示
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        <ListItemButton onClick={() => handleBlockClick(item.block.id)}>
                          <Avatar sx={{ width: 24, height: 24, marginRight: 2, fontSize:'0.75rem', bgcolor: 'secondary.main' }}>{item.block.name}</Avatar>
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
                        <Button variant="text" onClick={() => handleActionClick(item.block.id)}>
                          理解度チェック
                        </Button>
                      </TableCell>
                    </TableRow>
                ) : null
                ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {tabValue === 1 && (
          <WeakWordsList wordList={weakWordList} setWordList={setWeakWordList}/> 
        )}

      </>
      )}

    </Box>
  );
};

export default HomePage;
