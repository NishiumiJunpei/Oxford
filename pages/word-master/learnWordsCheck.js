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

      const handleAnswer = (known) => {
        const word = wordList[currentIndex];
        updateWordStatus(word.id, known);

        if (known) {
            setResult({ ...result, known: result.known + 1 });
            nextWord();
        } else {
            setShowJapanese(true);
            setButtonDisabled(true);
            setNextButtonDisabled(false);
        }
    };

    const handleShowAnswer = () => {
        setShowJapanese(true);
        setShowAnswerButton(false);
    };

    const nextWord = () => {
        if (currentIndex < wordList.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowJapanese(false);
            setShowAnswerButton(true);
            setButtonDisabled(false);
            setNextButtonDisabled(true);
        } else {
            // 終了処理
        }
    };

    const handleNext = () => {
        setResult({ ...result, unknown: result.unknown + 1 });
        nextWord();
    };

    const handleExit = () => {
        router.push(`/word-master/wordList?theme=${theme}&block=${block}`);
    };


  if (wordList.length === 0) {
    return <Typography>Loading...</Typography>;
  }

  const word = wordList[currentIndex];
  const remainingWords = wordList.length - currentIndex - 1; // 残りの問題数

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Button onClick={handleExit} sx={{ position: 'absolute', top: 20, right: 20 }}>
            <CloseIcon />
        </Button>
        <Typography variant="h6" sx={{ marginBottom: 2 }}>残りの問題数: {remainingWords}</Typography>
        <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: 'bold', fontSize: '2rem', color: 'primary.main' }}>
            {word.english}
        </Typography>
        {showJapanese && <Typography variant="subtitle1" sx={{ marginBottom: 2 }}>{word.japanese}</Typography>}
        <Box sx={{ '& > button': { margin: 1 } }}>
            <Button variant="contained" color="primary" onClick={() => handleAnswer(true)} disabled={buttonDisabled}>
                わかる
            </Button>
            <Button variant="contained" onClick={handleShowAnswer} disabled={!showAnswerButton}>
                答えチェック
            </Button>
            <Button variant="contained" color="secondary" onClick={() => handleAnswer(false)} disabled={buttonDisabled}>
                わからない
            </Button>
        </Box>
        {showJapanese && (
            <Button variant="contained" onClick={handleNext} disabled={nextButtonDisabled} sx={{ marginTop: 2 }}>
                次へ
            </Button>
        )}
    </Box>
);

};

export default LearnWordsCheck;
