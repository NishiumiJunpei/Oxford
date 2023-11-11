import useSWR from "swr";
import { useState, useEffect } from "react";
import styles from '../../styles/word-master/wordTest.module.css';  // CSSモジュールをインポート
import StartUI from '../../components/wordTestStartUI'
import { Box, Paper, Grid, Button, Typography, CircularProgress} from '@mui/material';


// const fetcher = (url) => fetch(url).then((res) => res.json());

export default function WordTest() {
  const [wordList, setWordList] = useState([]); // 単語リストのステート
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // 現在の単語のインデックス
  const [loading, setLoading] = useState(false); // ローディングのステート
  const [showJapanese, setShowJapanese] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [quizOptions, setQuizOptions] = useState({
    maxItems: 20,
    lastChecked: 'day', // 'day', 'week', 'month'
    includeMemorized: false,
  }); // クイズのオプション

  // 最初の50件のデータを取得する関数を`useEffect`の外に移動
  const fetchData = async () => {
    try {
      const result = await fetch(`/api/initialFetch?maxItems=${quizOptions.maxItems}&lastChecked=${quizOptions.lastChecked}&includeMemorized=${quizOptions.includeMemorized}`);
      const data = await result.json();
      setWordList(data.words);
    } catch (error) {
      console.error("Fetching words failed", error);
    }
  };
  // console.log('wordList', wordList)


  const handleStart = async () => {
    setLoading(true); // ローディング状態を開始
    await fetchData(); // データをフェッチ
    setLoading(false); // ローディング状態を終了
  };

  const handleReset = () => {
    setWordList([]); // 単語リストをリセット
    setCurrentWordIndex(0); // インデックスをリセット
  };

  // 次の単語に進む処理
  const handleNextWord = () => {
    setCurrentWordIndex((prevIndex) => (prevIndex + 1) % wordList.length);
    setShowJapanese(false);
    setButtonsDisabled(false);
    setLoading(false);
};

  // 現在の単語を取得するヘルパー関数
  const currentWord = () => {
    return wordList[currentWordIndex];
  };

  // クイズのオプションを設定するハンドラー
  const handleQuizOptionChange = (option, value) => {
    setQuizOptions((prevOptions) => ({ ...prevOptions, [option]: value }));
  };


  const handleButtonClick = async (answer) => {
    setLoading(true); // ボタンがクリックされたらローディング状態にする
    if (answer === 0) {
      setShowJapanese(true);
      setButtonsDisabled(true);
      setLoading(false); // 即時のフィードバックがあるため、ローディングは不要
    } else {
      await fetch(`/api/updateStatus?pageId=${wordList[currentWordIndex].id}&status=${answer}`);
      handleNextWord();
    }
  };
  
  const handleNextClick = async () => {
    setLoading(true); // ローディング状態を開始
    await fetch(`/api/updateStatus?pageId=${wordList[currentWordIndex].id}&status=${showJapanese ? 0 : 1}`);
    setShowJapanese(false);
    setButtonsDisabled(false);
    handleNextWord();
  };
  
  const renderJapanese = (japanese) => {
    return japanese.rich_text.map((text) => text.plain_text).join('');
  };

return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        p: 3,
        bgcolor: 'background.default',
        boxShadow: 1,
        borderRadius: 2,
        minWidth: 300,
        maxWidth: '100%',
        my: 4,
        position: 'relative'
      }}
    >      

      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        英単語 理解度チェック
      </Typography>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      )}      
      {/* スタートUI */}
      {!loading && wordList.length === 0 && (
      <StartUI
        quizOptions={quizOptions}
        setQuizOptions={setQuizOptions}
        handleStart={handleStart}
      />
      )}
      {/* 問題表示UI */}
      {loading && <CircularProgress />}
      {!loading && wordList.length > 0 && (
      <Paper sx={{ p: 3, my: 2 }}>
        <Typography variant="h5" component="p" sx={{ mb: 3 }}>
          {`問題 ${currentWordIndex + 1} / ${wordList.length}`}
        </Typography>
        <Typography variant="h6" component="p" sx={{ mb: 2 }}>
          
          {wordList[currentWordIndex].properties.Name.title[0].text.content}
        </Typography>
        {showJapanese && (
          <Typography variant="body1" sx={{ mb: 2 }}>
            {renderJapanese(wordList[currentWordIndex].properties.Japanese)}
          </Typography>
        )}
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button
              variant="outlined"
              disabled={buttonsDisabled}
              onClick={() => handleButtonClick(0)}
            >
              わからない
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              disabled={buttonsDisabled}
              onClick={() => handleButtonClick(1)}
            >
              わかる
            </Button>
          </Grid>
          {showJapanese && (
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleNextClick}
              >
                次へ
              </Button>
            </Grid>
          )}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="text"
            onClick={handleReset}
          >
            終了
          </Button>
        </Box>
      </Paper>
    )}

    </Box> 
  )
}
