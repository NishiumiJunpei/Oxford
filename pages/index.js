import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import CircularProgress from '@mui/material/CircularProgress';
import {Typography, IconButton, Box, Card, CardHeader, CardContent, Button, Avatar, Grid} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import WordDetailDialog from '@/components/wordDetailDialog';
import ProgressCircle from '@/components/progressCircle';
import SubTitleTypography from '@/components/subTitleTypography';
import { badgeImages } from '@/utils/variables';


export default function Home() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState({});
  const [overallProgress, setOverallProgress] = useState({}); 
  const [blockToLearn, setBlockToLearn] = useState({}); 
  const [progressOverLastWeek, setProgressOverLastWeek] = useState({EJ:{},JE:{}}); 
  const [nextGoal, setNextGoal] = useState({EJ:{}, JE:{}}); 
  
  
  
  useEffect(() => {  
    const fetchData = async (themeToFetch) => {
      try{
        setIsLoading(true);
        const response = await axios.get(`/api/word-master/getProgressByThemeId`);
        setOverallProgress(response.data.overallProgress)
        setBlockToLearn(response.data.blockToLearn)
        setTheme(response.data.theme)
        setProgressOverLastWeek(response.data.progressOverLastWeek)
        setNextGoal(response.data.nextGoal)
        setIsLoading(false);  
        console.log(response.data.progressOverLastWeek)
      } catch(error){
        console.error('Error fetching words:', error);
      }
    };

    fetchData();
  
  }, []);


  const handleClickTheme = () => {
    router.push('/word-master/wordMasterTop');s
  };

  
  return (
    <Box maxWidth="lg">
      <Head>
        <link rel="icon" href="/icon/favicon.ico" type="image/x-icon" />
        <title>susu English</title>
      </Head>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : (
      <>
        <Box sx={{mt: 2}}>
          <Typography variant="subtitle2" color="GrayText">チャレンジ中のテーマ</Typography>
        </Box>
        <Typography variant='h4' component="p" onClick={handleClickTheme} style={{ cursor: 'pointer' }}>
              <Box sx={{mb: 1, mt: 1}}>
                {theme?.name}
                <OpenInBrowserIcon fontSize="small" style={{ marginLeft: 4, cursor: 'pointer' }} />
              </Box>
              <Box>
                <Typography variant="body2" color="GrayText">総単語数 : {theme.wordNum}</Typography>                    
              </Box>

        </Typography>



        <Box sx={{mt: 8, mb: 8}}>
          <SubTitleTypography text="理解できる"/>
          
          <Grid container alignItems={"stretch"}>
            <Grid item justifyContent="flex-start" sx={{mb: 3}}>
              <Card sx={{ mr: 1, mb: 2, pl: 5, pr: 5, height: '100%' }}> 
              <CardHeader 
                title={
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1">全体進捗</Typography>
                  </Box>
                } 
                titleTypographyProps={{ variant: 'subtitle1' }} 
              />
                <CardContent>                  
                  <ProgressCircle value={overallProgress.EJ} />
                  {overallProgress.EJ == 200 ? (
                      <Box display="flex" justifyContent="center" alignItems="center" sx={{mt: 2}}>
                        <img src={"/icon/trophy.png"} width="70px"/>
                      </Box>
                  ) : (
                    <>
                      <Box display="flex" alignItems="center">
                        <Typography variant="subtitle2" sx={{mt: 2}}>目標</Typography>
                      </Box>
                      <Box>
                        <Typography variant="h4">{nextGoal?.EJ.goalProgress}%</Typography>                    
                      </Box>
                      <Box>
                        <Typography variant="body2">(単語数：+{nextGoal?.EJ.wordNumToGoal})</Typography>                    
                      </Box>

                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item justifyContent="flex-start" sx={{mb: 3}}>
              <Card sx={{ mr: 1, mb: 2, height: '100%' }}> 
              <CardHeader 
                title={
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1">過去１週間</Typography>
                  </Box>
                } 
                titleTypographyProps={{ variant: 'subtitle1' }} 
              />
                <CardContent>

                  <Grid container>
                    <Grid item justifyContent="flex-start">
                      <Card sx={{ mr: 1, pl: 1, pr: 1, height: '100%' }} > 
                        <CardHeader 
                          title={
                            <Box display="flex" alignItems="center">
                              <Typography variant="subtitle1">覚えた単語数</Typography>
                            </Box>
                          } 
                          titleTypographyProps={{ variant: 'subtitle1' }} 
                        />
                        <CardContent>
                            <Box sx={{mb:2}}>
                              <Typography variant="h3" color={"primary"}>+{progressOverLastWeek?.EJ.memorizedNumNew}</Typography>                    
                            </Box>
                            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                              <img src={badgeImages[progressOverLastWeek.EJ.memorizedNumNewImageIndex]} width="50px"/>
                            </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item justifyContent="flex-start">
                      <Card sx={{ mr: 1, pl: 1, pr: 1,  height: '100%' }}> 
                        <CardHeader 
                          title={
                            <Box display="flex" alignItems="center">
                              <Typography variant="subtitle1">深く覚えた単語数</Typography>
                            </Box>
                          } 
                          titleTypographyProps={{ variant: 'subtitle1' }} 
                        />
                        <CardContent>
                          <Box sx={{mb:2}}>
                            <Typography variant="h3" color={"primary"}>+{progressOverLastWeek?.EJ.memorized2NumNew}</Typography>                    
                          </Box>
                          <Box sx={{display: 'flex', justifyContent: 'center'}}>
                            <img src={badgeImages[progressOverLastWeek.EJ.memorized2NumNewImageIndex]} width="50px"/>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                  </Grid>

                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {blockToLearn.EJ?.id && (
            <>
            <Button variant="outlined" color="secondary" onClick={()=>handleBlockClick(blockToLearn.EJ.id, 'EJ')}>
              学習する
              <Avatar sx={{ width: 24, height: 24, marginLeft: 2, fontSize:'0.75rem', bgcolor: 'secondary.main', color: '#fff' }}>
                {blockToLearn.EJ.name}
              </Avatar>
            </Button>

            </>
          )}
        </Box>





        <Box sx={{mt: 5, mb: 5}}>
          <SubTitleTypography text="使える"/>
          
          <Grid container alignItems={"stretch"}>
            <Grid item justifyContent="flex-start" sx={{mb: 3}}>
              <Card sx={{ mr: 1, mb: 2, pl: 5, pr: 5, height: '100%' }}> 
              <CardHeader 
                title={
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1">全体進捗</Typography>
                  </Box>
                } 
                titleTypographyProps={{ variant: 'subtitle1' }} 
              />
                <CardContent>                  
                  <ProgressCircle value={overallProgress.JE} />
                  {overallProgress.JE == 200 ? (
                      <Box display="flex" justifyContent="center" alignItems="center" sx={{mt: 2}}>
                        <img src={"/icon/trophy.png"} width="70px"/>
                      </Box>
                  ) : (
                    <>
                      <Box display="flex" alignItems="center">
                        <Typography variant="subtitle2" sx={{mt: 2}}>目標</Typography>
                      </Box>
                      <Box>
                        <Typography variant="h4">{nextGoal?.JE.goalProgress}%</Typography>                    
                      </Box>
                      <Box>
                        <Typography variant="body2">(単語数：+{nextGoal?.JE.wordNumToGoal})</Typography>                    
                      </Box>

                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item justifyContent="flex-start" sx={{mb: 3}}>
              <Card sx={{ mr: 1, mb: 2, height: '100%' }}> 
              <CardHeader 
                title={
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1">過去１週間</Typography>
                  </Box>
                } 
                titleTypographyProps={{ variant: 'subtitle1' }} 
              />
                <CardContent>

                  <Grid container>
                    <Grid item justifyContent="flex-start">
                      <Card sx={{ mr: 1, pl: 1, pr: 1, height: '100%' }} > 
                        <CardHeader 
                          title={
                            <Box display="flex" alignItems="center">
                              <Typography variant="subtitle1">覚えた単語数</Typography>
                            </Box>
                          } 
                          titleTypographyProps={{ variant: 'subtitle1' }} 
                        />
                        <CardContent>
                            <Box sx={{mb:2}}>
                              <Typography variant="h3" color={"primary"}>+{progressOverLastWeek.JE.memorizedNumNew}</Typography>                    
                            </Box>
                            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                              <img src={badgeImages[progressOverLastWeek.JE.memorizedNumNewImageIndex]}width="50px"/>
                            </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item justifyContent="flex-start">
                      <Card sx={{ mr: 1, pl: 1, pr: 1,  height: '100%' }}> 
                        <CardHeader 
                          title={
                            <Box display="flex" alignItems="center">
                              <Typography variant="subtitle1">深く覚えた単語数</Typography>
                            </Box>
                          } 
                          titleTypographyProps={{ variant: 'subtitle1' }} 
                        />
                        <CardContent>
                          <Box sx={{mb:2}}>
                            <Typography variant="h3" color={"primary"}>+{progressOverLastWeek.JE.memorized2NumNew}</Typography>                    
                          </Box>
                          <Box sx={{display: 'flex', justifyContent: 'center'}}>
                            <img src={badgeImages[progressOverLastWeek.JE.memorized2NumNewImageIndex]}width="50px"/>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                  </Grid>

                </CardContent>
              </Card>
            </Grid>
          </Grid>
          {blockToLearn.JE?.id && (
            <>
            <Button variant="outlined" color="secondary" onClick={()=>handleBlockClick(blockToLearn.JE.id, 'JE')}>
              学習する
              <Avatar sx={{ width: 24, height: 24, marginLeft: 2, fontSize:'0.75rem', bgcolor: 'secondary.main', color: '#fff' }}>
                {blockToLearn.JE.name}
              </Avatar>
            </Button>

            </>
          )}




        </Box>


      </>
      )}

    </Box>
  );
}
