import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import CircularProgress from '@mui/material/CircularProgress';
import {Typography, IconButton, Box, Card, CardHeader, CardContent} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import WordExampleSentenceModal from '@/components/wordExampleSentenceModal';
import ProgressCircle from '@/components/progressCircle';
import SubTitleTypography from '@/components/subTitleTypography';


export default function Home() {
  const router = useRouter();

  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isLoadingTodaysWords, setIsLoadingTodaysWords] = useState(true);
  const [isLoadingProgressRatio, setIsLoadingProgressRatio] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [themeName, setThemeName] = useState('');
  const [progressRatio, setProgressRatio] = useState({});
  

  useEffect(() => {
    const fetchWords = async () => {
      setIsLoadingTodaysWords(true);
      try {
        const response = await axios.get('/api/word-master/getTodaysWords');
        setWords(response.data);
        setCurrentWordIndex(0);
      } catch (error) {
        console.error('Failed to fetch words:', error);
      }
      setIsLoadingTodaysWords(false);
    };

    // 新しいAPIを呼び出してテーマと進捗率を取得
    const fetchThemeProgress = async () => {
      setIsLoadingProgressRatio(true);
      try {
        const response = await axios.get('/api/word-master/getProgressRatio');
        setThemeName(response.data.theme.name);
        setProgressRatio(response.data.overallProgress);
      } catch (error) {
        console.error('Failed to fetch theme progress:', error);
      }
      setIsLoadingProgressRatio(false);
    };

    fetchWords();
    fetchThemeProgress();

  }, []);

  const currentWord = words[currentWordIndex];

  const handleNext = () => {
    setCurrentWordIndex((prevIndex) => Math.min(words.length - 1, prevIndex + 1));
  };

  const handlePrevious = () => {
    setCurrentWordIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  // モーダルの開閉を制御する関数
  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };
  const handleClickTheme = () => {
    router.push('/word-master/wordMasterTop');
  };

  const updateWordList = (newWordData) => {
    const updatedWordList = words.map(wordItem =>
      wordItem.id === newWordData.id ? newWordData : wordItem
    );
    setWords(updatedWordList);
  };


  return (
    <Box maxWidth="lg">
      <Head>
        <link rel="icon" href="/icon/favicon.ico" type="image/x-icon" />
        <title>すーすーEnglish</title>
      </Head>

      <>
        <SubTitleTypography text="チャレンジ中のテーマ"/>
        {isLoadingProgressRatio && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
          <CircularProgress />
        </div>
        )}

        {themeName && (
        <>
          <Typography variant='h5' component="p" onClick={handleClickTheme} style={{ cursor: 'pointer' }}>
              {themeName}
              <OpenInBrowserIcon fontSize="small" style={{ marginLeft: 4, cursor: 'pointer' }} />
          </Typography>

          <Box display="flex" justifyContent="space-between" sx={{ width: '400px', mt: 3 }}>
            <Card sx={{ flex: 1, minWidth: 160, mr: 1 }}> {/* minWidth を追加 */}
              <CardHeader 
                title={<Typography variant="subtitle1">英⇨日</Typography>} 
                titleTypographyProps={{ variant: 'subtitle1' }} 
              />
              <CardContent>
                <ProgressCircle value={progressRatio.EJ} />
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, minWidth: 160, mr: 1 }}> {/* minWidth を追加 */}
              <CardHeader 
                title={<Typography variant="subtitle1">日⇨英</Typography>} 
                titleTypographyProps={{ variant: 'subtitle1' }} 
              />
              <CardContent>
                <ProgressCircle value={progressRatio.JE} />
              </CardContent>
            </Card>
          </Box>
        </>
        )}
      </>

      {isLoadingTodaysWords && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
          <CircularProgress />
        </div>
      )}
      {currentWord && (
        <Box sx={{marginTop: 5}}>
          <SubTitleTypography text="今日の単語"/>          
          <div style={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
            <IconButton onClick={handlePrevious} disabled={currentWordIndex === 0}>
              <ArrowBackIcon />
            </IconButton>
            <IconButton onClick={handleNext} disabled={currentWordIndex === words.length - 1}>
              <ArrowForwardIcon />
            </IconButton>
          </div>

          <Typography variant="h1" component="p" onClick={toggleModal} style={{ cursor: 'pointer' }}>
            {currentWord.english}
            <OpenInBrowserIcon fontSize="small" style={{ marginLeft: 4, cursor: 'pointer' }} />
          </Typography>

          <Typography variant="subtitle1" style={{ marginTop: '10px' }}>
            {currentWord.japanese}
          </Typography>

          {currentWord.exampleSentence && (
            <Typography variant="body1" className="preformatted-text" style={{ marginTop: '10px' }}>
              {currentWord.exampleSentence}
            </Typography>
          )}
          {currentWord.imageUrl && (
            <img src={currentWord.imageUrl} alt="例文の画像" style={{ marginTop: 20, width: '100%', height: '400px', objectFit: 'contain' }} />
          )}


          {/* <Typography variant="body2" style={{ marginTop: '10px' }}>
            <Link href={`/word-master/wordList?blockId=${currentWord.block.id}&theme=${currentWord.block.theme.name}`} style={{color: 'blue'}}>({currentWord.block.theme.name} - {currentWord.block.name})</Link>
          </Typography> */}

        </Box>

      )}



      <WordExampleSentenceModal
        open={modalOpen}
        onClose={toggleModal}
        wordList={words}
        initialIndex={currentWordIndex}
        updateWordList={updateWordList}
      />

    </Box>
  );
}
