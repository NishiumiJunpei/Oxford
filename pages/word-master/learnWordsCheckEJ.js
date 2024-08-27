import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Typography, Button, Box, CircularProgress, Container,Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Avatar, IconButton } from '@mui/material';
// import Link from 'next/link';
import CloseIcon from '@mui/icons-material/Close'; // 終了アイコンのインポート
import WordDetailDialog from '@/components/wordDetailDialog';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { playCorrectSound } from '@/utils/audioPlayer';
import SEOHeader from '@/components/seoHeader';


const FinishLearnWordsCheck = ({block, notMemorizedWordList, languageDirection, updateWordList, themeAllWordsFlag}) =>{
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false)

  const handleOpenModalWord = (index) => {
    setSelectedIndex(index);
    setOpenModal(true);
  };


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


  const handleClickSetSrWords = async () => {
    setLoading(true)
    try {
      const srStartTime = new Date().toISOString(); // 現在時刻をISO文字列としてセット
      const wordListIds = notMemorizedWordList.map(word => word.id);

      const response = await axios.post('/api/word-master/setSrWords', {
        wordListIds,
        srStartTime,
        srLanguageDirection: languageDirection,
      });

      if (response.status === 200) {
        setMessage('登録できました。');
        setLoading(false)
      }
    } catch (error) {
      console.log('error', error)
      setMessage('登録に失敗しました。');
      setLoading(false)

    }    
  };

  return (
    <>
      <SEOHeader title="アセスメント"/>

      <Container maxWidth="sm">
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="flex-start" // このプロパティを 'flex-start' に変更
          marginTop={2} // 上にマージンを追加
        >
          <Typography variant="h4" gutterBottom sx={{mb: 5}}>
            よくできました！
          </Typography>

          {notMemorizedWordList?.length > 0 ? (
            <>
              <Typography variant="h6" gutterBottom>
                わからなかった単語
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>英語</TableCell>
                      <TableCell>日本語</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notMemorizedWordList?.map((word, index) =>
                        <TableRow key={word.id} hover onClick={() => handleOpenModalWord(index)} sx={{cursor: 'pointer'}}>
                          <TableCell>{word.english}</TableCell>
                          <TableCell>{word.japanese}</TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{mt: 5, display: 'flex', justifyContent: 'center'}}>
                <Button variant="contained" color="secondary" onClick={handleClickSetSrWords} disabled={loading || message}>間隔反復をセットする</Button>
              </Box>
              {message && (
                <Box>
                  <Typography variant="body1">
                        {message} 
                    <Link href={`/word-master/wordMasterTop?tab=1`} passHref>
                        (間隔反復の単語リスト)
                    </Link>
                  </Typography>
                </Box>
              )}

            </>
          ) : (
            <>
              <img width="300" src={`/images/${randomImage}`} alt="Completion" />
            </>
          )}

          <Box display="flex" alignItems="center" justifyContent="flex-start" sx={{mt: 5, mb: 5}}>
            <Link href={`/word-master/wordMasterTop`} passHref>
              <Button variant="default" color="link" sx={{marginTop: 3}}>
                英単語マスタートップへ
              </Button>
            </Link>
            {themeAllWordsFlag == '0' &&(
              <Link href={`/word-master/wordList?blockId=${block.id}`} passHref>
                <Button variant="default" color="link" sx={{marginTop: 3}}>
                  <Avatar sx={{ bgcolor: 'secondary.main', color: '#fff', ml: 1, mr: 1, width: 32, height: 32, fontSize: '1rem' }}>
                    {block?.name}
                  </Avatar>  
                  へ戻る
                </Button>
              </Link>
            )}
          </Box>

        </Box>
        <WordDetailDialog
          open={openModal}
          onClose={()=>setOpenModal(false)}
          wordList={notMemorizedWordList}
          initialIndex={selectedIndex}
          updateWordList={updateWordList}
        />

      </Container>
    </>
  )
}

const LearnWordsCheck = () => {
    const router = useRouter();
    const { blockId, wordCount, languageDirection, includeMemorized, themeAllWordsFlag, themeId } = router.query;
    const [isLoading, setIsLoading] = useState(false);
    const [wordList, setWordList] = useState([]);
    const [block, setBlock] = useState();
    const [notMemorizedWordList, setNotMemorizedWordList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [showAnswerButton, setShowAnswerButton] = useState(true);
    const [result, setResult] = useState({ known: 0, unknown: 0 });
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [nextButtonDisabled, setNextButtonDisabled] = useState(true); // 次へボタンの無効化状態
    const [isFinish, setIsFinish] = useState(false);
    const [openModal, setOpenModal] = useState(false);


    useEffect(() => {
      // URLクエリパラメータを使用してAPIから単語データを取得する
      const fetchData = async () => {
        setIsLoading(true)
        const queryParams = new URLSearchParams({ blockId, wordCount, languageDirection, includeMemorized, themeAllWordsFlag, themeId }).toString();
        const response = await fetch(`/api/word-master/getWordsForCheck?${queryParams}`);
        const data = await response.json();
        setWordList(data.wordList);
        setBlock(data.block);
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
          setShowAnswer(false);
          setShowAnswerButton(true);
          setButtonDisabled(false);
          setNextButtonDisabled(true);
        }
      } else {
        setIsFinish(true)
        // router.push({
        //   pathname: '/word-master/learnWordsCheckCompletion',
        //   query: { blockId}
        // });
      }
    };
    
    const handleAnswer = (known) => {
      if (known) {
        // playCorrectSound()
      }
      
      if (currentIndex >= 0 && currentIndex < wordList.length) {
        const word = wordList[currentIndex];
        if (word){
          updateWordStatus(word.id, known);
    
          if (known) {
            setResult({ ...result, known: result.known + 1 });
            nextWord(true); // handleAnswerから呼ばれたことを示す引数を追加
          } else {
            setShowAnswer(true);
            setButtonDisabled(true);
            setNextButtonDisabled(false);
            setNotMemorizedWordList([...notMemorizedWordList, {...word}])
          }    
        }
        else{
          console.error('Current word is undefined.');
        }
      }
    };

    const handleShowAnswer = () => {
        setShowAnswer(true);
        // setShowAnswerButton(false);
        setOpenModal(true)        
    };

    const handleNext = () => {
        setResult({ ...result, unknown: result.unknown + 1 });
        nextWord();
    };


    const updateWordStatus = async (wordId, known) => {
        try {
          await fetch('/api/word-master/updateUserWordStatusForAssessment', {
            method: 'POST', // 通常、APIへのデータ更新はPOSTまたはPUTメソッドを使用
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wordId, status: known ? 'MEMORIZED' : 'NOT_MEMORIZED', languageDirection }),
          });
        } catch (error) {
          console.error('Error updating word status:', error);
        }
      };


    const handleExit = () => {
        router.push(`/word-master/wordList?blockId=${blockId}`);
    };


    const updateWordList = (newWordData) => {
      const updatedWordList = wordList.map(wordItem => 
        wordItem.id === newWordData.id ? newWordData : wordItem
      );
      setWordList(updatedWordList);
    };
      
    const updateWordListForNotMemorized = (newWordData) => {
      const updatedWordList = notMemorizedWordList.map(wordItem => 
        wordItem.id === newWordData.id ? newWordData : wordItem
      );
      setNotMemorizedWordList(updatedWordList);
    };

    const playAudio = (text, lang = 'en') => {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch('/api/common/synthesize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, lang }),
          });
    
          const data = await response.json();
          if (data.audioContent) {
            const audioBlob = new Blob([new Uint8Array(data.audioContent.data)], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
    
            audio.onended = () => {
              resolve();
            };
          }
        } catch (error) {
          console.error('Error during audio playback:', error);
          reject(error);
        }
      });
    };
        
  
      

    const word = wordList[currentIndex];
    const remainingWords = wordList.length - currentIndex; // 残りの問題数

    useEffect(() => {
      const handleKeyPress = (event) => {
        if (openModal) {
          // openModalがtrueの場合は何もしない
          return;
        }

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

      // openModalがfalseのときのみイベントリスナーを追加
      if (!openModal) {
        window.addEventListener('keydown', handleKeyPress);
      }
      
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }, [currentIndex, wordList, showAnswer, buttonDisabled, nextButtonDisabled, openModal]); // 依存配列に必要な状態や関数を追加


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
    <>
      {isFinish ? (
        <FinishLearnWordsCheck 
          block={block} 
          notMemorizedWordList={notMemorizedWordList} 
          languageDirection={languageDirection}
          updateWordList={updateWordListForNotMemorized}
          themeAllWordsFlag={themeAllWordsFlag}
        />
      ):(
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 5, height: 'calc(100vh - 10px)' }}>
          
          <Typography variant="h6" sx={{ marginBottom: 2 }}>残りの問題数: {remainingWords}</Typography>
          {languageDirection == 'EJ' ? (
            <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'ceter', marginBottom: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '2rem', color: 'primary.main' }}>
                {word.english}
              </Typography>
              <IconButton onClick={() => playAudio(word?.english)} size="small">
                  <VolumeUpIcon />
              </IconButton>
            </Box>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '2rem', color: 'primary.main' }}>
                {word.japanese}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: 2,  fontSize: '1.5rem', color: 'primary.light' }}>
                ({word.english.substring(0, 2) +
                word.english.substring(2)
                  .split('')
                  .map(char => char === ' ' ? ' ' : '-')
                  .join('')})
              </Typography>

            </>
          )}          
          {(languageDirection == 'JE' && word.synonyms) && (
            <>
              <Typography variant="body2" style={{ marginTop: 2 }}>
                <span style={{ backgroundColor: '#D3D3D3', padding: '4px' }}>類語</span>
              </Typography>
              <Typography variant="h5" sx={{ marginBottom: 2, fontSize: '1.5rem'}}>
                {word.synonyms}
              </Typography>

            </>
          )}

          <Box sx={{backgroundColor: '#d3d3d3', height: '200px', width: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            {showAnswer &&
              <Typography variant="subtitle1" sx={{  fontSize: '1.5rem' }}>
                {languageDirection == 'EJ' ? word.japanese : word.english}
              </Typography>}
          </Box>

          <Box sx={{ '& > button': { marginTop: 5, mr: 2, ml: 2, mb: 2 } }}>
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
          {showAnswer && (
              <Button variant="contained" onClick={handleNext} disabled={nextButtonDisabled} sx={{ marginTop: 2 }}>
                  次へ(n)
              </Button>
          )}

          <WordDetailDialog 
            open={openModal}
            onClose={()=>setOpenModal(false)}
            wordList={[{...word}]}
            initialIndex={0}
            updateWordList={updateWordList}
          />
      </Box>
      )}
    </>
);

};

export default LearnWordsCheck;
