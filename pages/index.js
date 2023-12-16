import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import WordExampleSentenceModal from '@/components/wordExampleSentenceModal';


export default function Home() {
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);


  useEffect(() => {
    const fetchWords = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/word-master/getTodaysWords');
        setWords(response.data);
        setCurrentWordIndex(0);
      } catch (error) {
        console.error('Failed to fetch words:', error);
      }
      setIsLoading(false);
    };

    fetchWords();
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

  const updateWordList = (newWordData) => {
    const updatedWordList = words.map(wordItem =>
      wordItem.id === newWordData.id ? newWordData : wordItem
    );
    setWords(updatedWordList);
  };


  return (
    <div>
      <Head>
        <title>すーすーEnglish</title>
      </Head>
      <h1>今日の単語</h1>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
          <CircularProgress />
        </div>
      ) : currentWord ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
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


          <Typography variant="body2" style={{ marginTop: '10px' }}>
            <Link href={`/word-master/wordList?block=${currentWord.block}&theme=${currentWord.theme}`} style={{color: 'blue'}}>({currentWord.theme} - {currentWord.block})</Link>
          </Typography>

        </div>
      ) : (
        <p>今日の単語はありません。</p>
      )}

      <WordExampleSentenceModal
        open={modalOpen}
        onClose={toggleModal}
        wordList={words}
        initialIndex={currentWordIndex}
        updateWordList={updateWordList}
      />

    </div>
  );
}
