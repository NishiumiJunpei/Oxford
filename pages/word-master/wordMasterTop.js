import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AppBar, Toolbar, Button, ListItemButton, LinearProgress, Box, Typography, Avatar, FormControlLabel,Switch,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Tabs, Tab, CircularProgress, Chip,
  Card, CardHeader, CardContent } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WeakWordsList from '../../components/weakWordList'; 
import ProgressCircle from '@/components/progressCircle';


const HomePage = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [tabValue, setTabValue] = useState(0); // タブの状態
  const [overallProgress, setOverallProgress] = useState({}); 
  const [blockToLearn, setBlockToLearn] = useState({}); 
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
      setBlockToLearn(response.data.blockToLearn)
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
            {/* <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginTop: 4 }}>
              <ProgressCircle value={overallProgress} />
            </Box> */}
            <Box display="flex" justifyContent="space-between" sx={{ width: '400px', mt: 5 }}>
              <Card sx={{ flex: 1, minWidth: 160, mr: 1 }}> {/* minWidth を追加 */}
                <CardHeader 
                  title={<Typography variant="subtitle1">英⇨日</Typography>} 
                  titleTypographyProps={{ variant: 'subtitle1' }} 
                />
                <CardContent>
                  <ProgressCircle value={overallProgress.EJ} />
                  {blockToLearn.EJ?.id && (
                    <Button variant="outlined" color="secondary" sx={{mt:3}} onClick={()=>handleBlockClick(blockToLearn.EJ.id)}>
                      学習する
                      <Avatar sx={{ width: 24, height: 24, marginLeft: 2, fontSize:'0.75rem', bgcolor: 'secondary.main', color: '#fff' }}>
                        {blockToLearn.EJ.name}
                      </Avatar>
                    </Button>
                  )}

                </CardContent>
              </Card>
              <Card sx={{ flex: 1, minWidth: 160, mr: 1 }}> {/* minWidth を追加 */}
                <CardHeader 
                  title={<Typography variant="subtitle1">日⇨英</Typography>} 
                  titleTypographyProps={{ variant: 'subtitle1' }} 
                />
                <CardContent>
                  <ProgressCircle value={overallProgress.JE} />
                  {blockToLearn.JE?.id && (
                    <Button variant="outlined" color="secondary" sx={{mt:3}} onClick={()=>handleBlockClick(blockToLearn.JE.id)}>
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
                    <TableCell align="left" style={{ fontWeight: 'bold', width: '15%' }}>英⇨日の理解度</TableCell>
                    <TableCell align="left" style={{ fontWeight: 'bold', width: '15%' }}>日⇨英の理解度</TableCell>
                    <TableCell align="left" style={{ fontWeight: 'bold', width: '60%' }}>アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow Button  key={index} onClick={() => handleBlockClick(item.block.id)} sx={{cursor: 'pointer'}}>
                      <TableCell component="th" scope="row">
                        <ListItemButton >
                          <Avatar sx={{ width: 24, height: 24, marginRight: 2, fontSize:'0.75rem', bgcolor: 'secondary.main', color: '#fff' }}>{item.block.name}</Avatar>
                        </ListItemButton>
                      </TableCell>

                      <TableCell component="th" scope="row">
                        <Typography variant="subtitle1" color={Math.round(item.progress?.EJ) < 100 ? 'textPrimary' : 'primary'} >
                          {`${Math.round(item.progress?.EJ)}%`}
                        </Typography>
                      </TableCell>
                      <TableCell component="th" scope="row">
                        <Typography variant="subtitle1" color={Math.round(item.progress?.JE) < 100 ? 'textPrimary' : 'primary'} >
                          {`${Math.round(item.progress?.JE)}%`}
                        </Typography>
                      </TableCell>

                      <TableCell align="left">
                        <Button variant="text" color="inherit" onClick={() => handleActionClick(item.block.id)}>
                          理解度チェック
                        </Button>
                      </TableCell>
                    </TableRow>
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
