// pages/learnWordsCheckCompletion.js
import React from 'react';
import { Typography, Box, Container, Button } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';


const LearnWordsCheckCompletion = () => {
    const router = useRouter();
    const { theme } = router.query;


    // 画像ファイル名の配列
  const images = [
    'learnWordsCheckCompletionImage1.png',
    'learnWordsCheckCompletionImage2.png',
    'learnWordsCheckCompletionImage3.png',
    'learnWordsCheckCompletionImage4.png',
    'learnWordsCheckCompletionImage5.png',
    'learnWordsCheckCompletionImage6.png',
    'learnWordsCheckCompletionImage7.png',
    'learnWordsCheckCompletionImage8.png',
    'learnWordsCheckCompletionImage9.png',
    'learnWordsCheckCompletionImage10.png',
  ];

  // ランダムに画像を選択
  const randomImage = images[Math.floor(Math.random() * images.length)];

  return (
    <Container maxWidth="sm">
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        height="100vh"
      >
        <Typography variant="h3" gutterBottom>
          よくできました！
        </Typography>
        <img width="300" src={`/images/${randomImage}`} alt="Completion" />
        <Link href={`/word-master/progressByBlockTheme?theme=${theme}`} passHref>
          <Button variant="default" color="primary" sx={{marginTop: 3}}>
            戻る
          </Button>
        </Link>
      </Box>
    </Container>
  );
};

export default LearnWordsCheckCompletion;
