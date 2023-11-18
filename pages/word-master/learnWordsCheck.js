import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Typography, Button, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // 終了アイコンのインポート


const LearnWordsCheck = () => {
    const router = useRouter();
    const { theme, block, wordStatus, wordCount, lastCheck } = router.query;

    const [wordList, setWordList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showJapanese, setShowJapanese] = useState(false);
    const [showAnswerButton, setShowAnswerButton] = useState(true);
    const [result, setResult] = useState({ known: 0, unknown: 0 });
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [nextButtonDisabled, setNextButtonDisabled] = useState(true); // 次へボタンの無効化状態
  
    useEffect(() => {
      // URLクエリパラメータを使用してAPIから単語データを取得する
      const fetchData = async () => {
        const queryParams = new URLSearchParams({ theme, block, wordStatus, wordCount, lastCheck }).toString();
        const response = await fetch(`/api/word-master/getWordsForCheck?${queryParams}`);
        const data = await response.json();
        setWordList(data);
      };
  
      if (theme && block) {
        fetchData();
      }
    }, [theme, block]); // 依存配列にクエリパラメータを追加

    const handleAnswer = (known) => {
        if (currentIndex >= 0 && currentIndex < wordList.length) {
            const word = wordList[currentIndex];
            if (word){
                updateWordStatus(word.id, known);

                if (known) {
                    setResult({ ...result, known: result.known + 1 });
                    nextWord();
                } else {
                    setShowJapanese(true);
                    setButtonDisabled(true);
                    setNextButtonDisabled(false);
                }    
            }
            else{
                console.error('Current word is undefined.');
            }
        }
    };

    const handleShowAnswer = () => {
        setShowJapanese(true);
        setShowAnswerButton(false);
    };

    const handleNext = () => {
        setResult({ ...result, unknown: result.unknown + 1 });
        nextWord();
    };

    const nextWord = () => {
        if (currentIndex < wordList.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowJapanese(false);
            setShowAnswerButton(true);
            setButtonDisabled(false);
            setNextButtonDisabled(true);
        } else {
          router.push({
              pathname: '/word-master/learnWordsCheckCompletion',
              query: { theme: theme }
          });
        }
    };

    const updateWordStatus = async (wordId, known) => {
        try {
          await fetch('/api/word-master/updateUserWordStatus', {
            method: 'POST', // 通常、APIへのデータ更新はPOSTまたはPUTメソッドを使用
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wordId, status: known ? 'MEMORIZED' : 'NOT_MEMORIZED' }),
          });
        } catch (error) {
          console.error('Error updating word status:', error);
        }
      };


    const handleExit = () => {
        router.push(`/word-master/wordList?theme=${theme}&block=${block}`);
    };


  const word = wordList[currentIndex];
  const remainingWords = wordList.length - currentIndex; // 残りの問題数


  useEffect(() => {
    const handleKeyPress = (event) => {
      switch (event.key) {
        case 'j':
          handleAnswer(true);
          break;
        case 'k':
          handleShowAnswer();
          break;
        case 'l':
          handleAnswer(false);
          break;
        case 'n':
          handleNext();
          break;
        default:
          break;
      }
    };
  
    window.addEventListener('keydown', handleKeyPress);
  
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentIndex, wordList, showJapanese, buttonDisabled, nextButtonDisabled]); // 依存配列に必要な状態や関数を追加


  if (wordList.length === 0) {
    return <Typography>Loading...</Typography>;
  }


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 10, height: 'calc(100vh - 10px)' }}>
        <Button onClick={handleExit} sx={{ position: 'absolute', top: 20, right: 20, zIndex: 1500 }}>
          <CloseIcon />
        </Button>
        <Typography variant="h6" sx={{ marginBottom: 2 }}>残りの問題数: {remainingWords}</Typography>
        <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: 'bold', fontSize: '2rem', color: 'primary.main' }}>
            {word.english}
        </Typography>
        {showJapanese && <Typography variant="subtitle1" sx={{ marginBottom: 2 }}>{word.japanese}</Typography>}
        <Box sx={{ '& > button': { margin: 1 } }}>
            <Button variant="contained" color="primary" onClick={() => handleAnswer(true)} disabled={buttonDisabled}>
                わかる(j)
            </Button>
            <Button variant="contained" onClick={handleShowAnswer} disabled={!showAnswerButton}>
                答えチェック(k)
            </Button>
            <Button variant="contained" color="secondary" onClick={() => handleAnswer(false)} disabled={buttonDisabled}>
                わからない(l)
            </Button>
        </Box>
        {showJapanese && (
            <Button variant="contained" onClick={handleNext} disabled={nextButtonDisabled} sx={{ marginTop: 2 }}>
                次へ(n)
            </Button>
        )}
    </Box>
);

};

export default LearnWordsCheck;
