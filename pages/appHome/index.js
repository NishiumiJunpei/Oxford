import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import { Typography, Box } from '@mui/material';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import { Error, StarBorder, Star } from '@mui/icons-material';
import SubTitleTypography from '@/components/subTitleTypography';

export default function Home() {
  const router = useRouter();
  const muiTheme = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState({});
  const [overallProgress, setOverallProgress] = useState({}); 
  const [blockToLearn, setBlockToLearn] = useState({}); 
  const [progressOverLastWeek, setProgressOverLastWeek] = useState({EJ:{},JE:{}}); 
  const [nextGoal, setNextGoal] = useState({EJ:{}, JE:{}}); 
  
  
  
  useEffect(() => {  
    const fetchData = async () => {
      try{
        setIsLoading(true);
        const response = await axios.get(`/api/word-master/getProgressByThemeId`);
        setTheme(response.data.theme)
        setOverallProgress(response.data.overallProgress)
        setProgressOverLastWeek(response.data.progressOverLastWeek)
        setIsLoading(false);  
      } catch(error){
        console.error('Error fetching words:', error);
      }
    };

    fetchData();
  
  }, []);


  const handleClickTheme = () => {
    router.push('/word-master/wordMasterTop');
  };

  const handleBlockClick = (blockId, languageDirection) => {
    router.push(`/word-master/wordList?blockId=${blockId}&languageDirection=${languageDirection || 'EJ'}`);
  };
  
  return (
    <Box maxWidth="lg">
      <Head>
        <link rel="icon" href="/icon/favicon.ico" type="image/x-icon" />
        <title>SusuEnglish</title>
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
        </Typography>

        <Box sx={{mt: 5}}>
          <Box sx={{ mt: 1, mb: 1}}>
            <SubTitleTypography text="全体進捗"/>
          </Box>
          <Box sx={{mt: 1, mb: 1}}>
            <Typography variant='body1' component="p">
              総単語数：{theme.totalWordCnt}件
            </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Error color="error" />覚えていない
            <Typography variant='body1' component="p" sx={{ ml: 1 }}>
              ：{overallProgress.memorizedCountEJ_NOT_STARTED}件 （{overallProgress.memorizedRatioEJ_NOT_STARTED}%）
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <StarBorder color="warning" />少し覚えた
            <Typography variant='body1' component="p" sx={{ ml: 1 }}>
              ：{overallProgress.memorizedCountEJ_MEMORIZED}件 （{overallProgress.memorizedRatioEJ_MEMORIZED}%）
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Star color="success" />完璧に覚えた
            <Typography variant='body1' component="p" sx={{ ml: 1 }}>
              ：{overallProgress.memorizedCountEJ_MEMORIZED2}件 （{overallProgress.memorizedRatioEJ_MEMORIZED2}%）
            </Typography>
          </Box>
          </Box>
        </Box>

        <Box sx={{mt: 10}}>
          <Box sx={{ mt: 1, mb: 1}}>
            <SubTitleTypography text="過去１週間に覚えた単語数"/>
          </Box>
          <Box sx={{mt: 1, mb: 1}}>
            <Typography variant='body1' component="p">
              合計：{progressOverLastWeek.EJ.memorizedNumNew + progressOverLastWeek.EJ.memorized2NumNew}件
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <StarBorder color="warning" />少し覚えた
              <Typography variant='body1' component="p" sx={{ ml: 1 }}>
                ：{progressOverLastWeek.EJ.memorizedNumNew}件 
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Star color="success" />完璧に覚えた
              <Typography variant='body1' component="p" sx={{ ml: 1 }}>
                ：{progressOverLastWeek.EJ.memorized2NumNew}件 
              </Typography>
            </Box>

          </Box>
        </Box>

        <Box sx={{mt: 5}}>
          <Typography variant='subtitle' component="p" onClick={handleClickTheme} style={{ cursor: 'pointer', color: muiTheme.palette.link.main }}>
              単語帳へ →
          </Typography>
        </Box>


      </>
      )}

    </Box>
  );
}
