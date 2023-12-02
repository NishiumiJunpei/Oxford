import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';


export default function Home() {
  const [word, setWord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWord = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/word-master/getTodaysWord'); // APIのパスを適切に設定してください
        if (!response.ok) {
          throw new Error('Something went wrong');
        }
        const data = await response.json();
        setWord(data);
      } catch (error) {
        console.error('Failed to fetch word:', error);
      }
      setIsLoading(false);
    };

    fetchWord();
  }, []);

  return (
    <div>
      <Head>
        <title>すーすーEnglish</title>
      </Head>
      <h1>英検アプリへようこそ</h1>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
          <CircularProgress />
        </div>
      ) : word ? (
        <div>
          <Typography variant="subtitle1" component="p" sx={{mt:5}}>
            今日の単語
          </Typography>

          <Typography variant="h1" component="p">
            {word.english}
          </Typography>
          <Typography variant="subtitle1" style={{ marginTop: '10px' }}>
            {word.japanese}
          </Typography>

          {word.exampleSentence && (
            <Typography variant="body1" style={{ marginTop: '10px' }}>
              例文: {word.exampleSentence}
            </Typography>
          )}
          {word.imageUrl && (
            <img src={word.imageUrl} alt="例文の画像" style={{ marginTop: 20, maxWidth: '100%', maxHeight: '50%', objectFit: 'contain' }}  />
          )}


          <Typography variant="body2" style={{ marginTop: '10px' }}>
            ({word.theme} - {word.block})
          </Typography>


        </div>
      ) : (
        <p>今日の単語はありません。</p>
      )}
      {/* ここにトップページの他のコンテンツを追加します */}
    </div>
  );
}
