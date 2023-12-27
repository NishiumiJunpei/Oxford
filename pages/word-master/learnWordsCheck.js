import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Typography, Button, Box, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // 終了アイコンのインポート


const LearnWordsCheck = () => {
    const router = useRouter();
    const { blockId, wordCount, languageDirection, includeMemorized } = router.query;
    const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true)
        const queryParams = new URLSearchParams({ blockId, wordCount, languageDirection, includeMemorized }).toString();
        const response = await fetch(`/api/word-master/getWordsForCheck?${queryParams}`);
        const data = await response.json();
        setWordList(data);
        setIsLoading(false)
      };
  
      if (blockId) {
        fetchData();
      }
    }, [blockId]); // 依存配列にクエリパラメータを追加

    const nextWord = (calledFromHandleAnswer = false) => {
      if (currentIndex < wordList.length - 1) {
        // handleAnswerからの呼び出しの場合、またはnextButtonDisabledがfalseの場合のみ進む
        if (calledFromHandleAnswer || !nextButtonDisabled) {
          setCurrentIndex(currentIndex + 1);
          setShowJapanese(false);
          setShowAnswerButton(true);
          setButtonDisabled(false);
          setNextButtonDisabled(true);
        }
      } else {
        router.push({
          pathname: '/word-master/learnWordsCheckCompletion',
          query: { blockId}
        });
      }
    };
    
    const handleAnswer = (known) => {
      if (currentIndex >= 0 && currentIndex < wordList.length) {
        const word = wordList[currentIndex];
        if (word){
          updateWordStatus(word.id, known);
    
          if (known) {
            setResult({ ...result, known: result.known + 1 });
            nextWord(true); // handleAnswerから呼ばれたことを示す引数を追加
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


    const updateWordStatus = async (wordId, known) => {
        try {
          await fetch('/api/word-master/updateUserWordStatus', {
            method: 'POST', // 通常、APIへのデータ更新はPOSTまたはPUTメソッドを使用
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wordId, status: known ? 'MEMORIZED' : 'NOT_MEMORIZED' }),
          });

          // const word = wordList[currentIndex];
          // if (!known && !word.imageUrl){
          //   axios.post('/api/word-master/createExampleSentenceByGPT', {
          //     wordListId: wordId, 
          //     english: word.english, 
          //     japanese: word.japanese
          //   });
  
          // }
        } catch (error) {
          console.error('Error updating word status:', error);
        }
      };


    const handleExit = () => {
        router.push(`/word-master/wordList?blockId=${blockId}`);
    };


  const word = wordList[currentIndex];
  const remainingWords = wordList.length - currentIndex; // 残りの問題数

  useEffect(() => {
    const handleKeyPress = (event) => {
      switch (event.key) {
        case 'j':
          if (!buttonDisabled) {
            handleAnswer(true);
          }
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


  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'start'}}>
        <CircularProgress />
      </div>

    )
  }

  if (wordList.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'start' }}>
        <Typography>対象データがありません。</Typography>
      </Box>
    );
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
            <Button variant="contained" color="secondary" onClick={() => handleAnswer(false)} disabled={buttonDisabled}>
                わからない(l)
            </Button>
        </Box>
        <Box>
          <Button variant="outlined" onClick={handleShowAnswer} disabled={!showAnswerButton}>
              答えチェック(k)
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
