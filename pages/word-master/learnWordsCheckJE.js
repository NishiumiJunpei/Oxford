import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Typography, Button, Box, CircularProgress, Container,Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Link, Avatar, IconButton,TextField, Tabs, Tab } from '@mui/material';
// import Link from 'next/link';
import CloseIcon from '@mui/icons-material/Close'; // 終了アイコンのインポート
import WordDetailDialog from '@/components/wordDetailDialog';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';


const FinishLearnWordsCheck = ({block, notMemorizedWordList, updateWordList, themeAllWordsFlag}) =>{
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
        srLanguageDirection: 'JE',
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
    <Container maxWidth="lg">
    <Box sx={{mt: 5}}>
      {notMemorizedWordList?.length > 0 ? (
        <>
          <Typography variant="h6" gutterBottom>
            わからなかった単語
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>問題</TableCell>
                  <TableCell>モデルアンサー</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notMemorizedWordList?.map((word, index) =>
                    <TableRow key={word.id} hover onClick={() => handleOpenModalWord(index)} sx={{cursor: 'pointer'}}>
                      <TableCell>
                        <Typography variant='subtitle1' fontWeight={600}>
                          {word.userWordListStatus.questionJE}
                        </Typography>
                        <Typography variant='body1'>
                          ({word.english} / {word.japanese})
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='subtitle1' fontWeight={600}>
                          {word.userWordListStatus.answerJE}
                        </Typography>

                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{mt: 5, display: 'flex', justifyContent: 'flex-start'}}>
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
  )
}

const LearnWordsCheck = () => {
    const router = useRouter();
    const { blockId, wordCount, languageDirection, includeMemorized, themeAllWordsFlag, themeId } = router.query;
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingQuestionJE, setIsLoadingQuestionJE] = useState(false);
    const [isLoadingReviewJE, setIsLoadingReviewJE] = useState(false);
    const [wordList, setWordList] = useState([]);
    const [block, setBlock] = useState();
    const [notMemorizedWordList, setNotMemorizedWordList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [showAnswerButton, setShowAnswerButton] = useState(true);
    const [knownButtonDisabled, setKnownButtonDisabled] = useState(false);
    const [nextButtonDisabled, setNextButtonDisabled] = useState(true); // 次へボタンの無効化状態
    const [isFinish, setIsFinish] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [showInputArea, setShowInputArea] = useState(false);
    const [streamQuestionJE, setStreamQuestionJE] = useState('');
    const [streamAnswerJE, setStreamAnswerJE] = useState('');
    const [userAnswerJE, setUserAnswerJE] = useState('');
    const [streamReviewCommentJE, setStreamReviewCommentJE] = useState('');
    const [streamReviewScoreJE, setStreamReviewScoreJE] = useState('');
    const [tabValue, setTabValue] = useState(0)
    const [errorMsg, setErrorMsg] = useState('')
    const [readyToAIReview, setReadyToAIReview] = useState(false)



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
        setReadyToAIReview(data.wordList[currentIndex].status?.questionJE !='' ? true : false)

      };
  
      if (blockId) {
        fetchData();
      }
    }, [blockId]); // 依存配列にクエリパラメータを追加

    const nextWord = (calledFromHandleAnswer = false) => {
      if (currentIndex < wordList.length - 1) {
        if (calledFromHandleAnswer || !nextButtonDisabled) {
          setKnownButtonDisabled(false);
          setNextButtonDisabled(true);
          setShowInputArea(false)
          setShowAnswer(false)
          setShowAnswerButton(true)
          setStreamAnswerJE('')
          setStreamQuestionJE('')
          setUserAnswerJE('')
          setStreamReviewCommentJE('')
          setStreamReviewScoreJE('')
          setErrorMsg('')
          setTabValue(0)
          setReadyToAIReview(wordList[currentIndex+1].status.questionJE ? true : false)

          setCurrentIndex(currentIndex + 1);
        
        }
      } else {
        setIsFinish(true)
      }
    };
    
    const handleAnswer = (known) => {
      if (currentIndex >= 0 && currentIndex < wordList.length) {
        const word = wordList[currentIndex];
        if (word){
          updateWordStatus(word.id, known);
    
          if (known) {
            nextWord(true); // handleAnswerから呼ばれたことを示す引数を追加
          } else {
            setShowAnswer(true);
            setKnownButtonDisabled(true);
            setNextButtonDisabled(false);
            setNotMemorizedWordList([...notMemorizedWordList, {...word}])
            setReadyToAIReview(false)
            setTabValue(1)
            setShowAnswer(true)
          }    
        }
        else{
          console.error('Current word is undefined.');
        }
      }
    };

    const handleShowAnswer = () => {
        setShowAnswer(true);
    };

    const handleNext = () => {
        nextWord();


    };


    const updateWordStatus = async (wordId, known) => {
        try {
          await fetch('/api/word-master/updateUserWordStatus', {
            method: 'POST', // 通常、APIへのデータ更新はPOSTまたはPUTメソッドを使用
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wordId, status: known ? 'MEMORIZED' : 'NOT_MEMORIZED', languageDirection: 'JE' }),
          });
        } catch (error) {
          console.error('Error updating word status:', error);
        }
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
        
    const handleCreateQuestion = async () => {
      setIsLoadingQuestionJE(true);
      setStreamQuestionJE('');
      setErrorMsg('')
      const newWordData = wordList.find(wordItem => wordItem.id === word.id);
      if (newWordData) {
        // userWordListStatus内のreviewScoreJEだけを更新する新しいオブジェクトを作成
        const updatedWordData = {
          ...newWordData,
          userWordListStatus: {
            ...newWordData.userWordListStatus,
            questionJE: '',
          },
        };
        updateWordList(updatedWordData);
      }

      try {
        const response = await fetch('/api/word-master/createQuestionJE', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordListId: word.id, 
            english: word.english,
            japanese: word.japanese,
          }),
        });

        setIsLoadingQuestionJE(false);
        if (response.body) {
          const reader = response.body.getReader();
          let receivedLength = 0; // 受信したデータの長さ
          let chunks = []; // 受信したチャンクを保存する配列
          let collectionData = ''

          while(true) {
            const {done, value} = await reader.read();
    
            if (done) {
              break;
            }
    
            chunks.push(value);
            receivedLength += value.length;
    
            // テキストとしてデータをデコード
            let decoder = new TextDecoder("utf-8");
            const chunkText = decoder.decode(value, {stream: true});
            collectionData += chunkText
            setStreamQuestionJE((prevData) => [...prevData, chunkText]);
           }

           const newWordData = wordList.find(wordItem => wordItem.id === word.id);
           if (newWordData) {
             // userWordListStatus内のreviewScoreJEだけを更新する新しいオブジェクトを作成
             const updatedWordData = {
               ...newWordData,
               userWordListStatus: {
                 ...newWordData.userWordListStatus,
                 questionJE: collectionData,
               },
             };
             updateWordList(updatedWordData);
            }

          handleCreateAnswer(collectionData)

        }

    
      } catch (error) {
        console.error('Error creating question:', error);
      } finally {
        setIsLoadingQuestionJE(false);
      }
    };

    const handleCreateAnswer = async (questionJE) => {
      try {
        const response = await fetch('/api/word-master/createAnswerJE', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordListId: word.id, 
            english: word.english,
            japanese: word.japanese,
            questionJE: questionJE
          }),
        });

        if (response.body) {
          const reader = response.body.getReader();
          let receivedLength = 0; // 受信したデータの長さ
          let chunks = []; // 受信したチャンクを保存する配列
          let collectionData = ''

          setStreamAnswerJE('');
          while(true) {
            const {done, value} = await reader.read();
    
            if (done) {
              break;
            }
    
            chunks.push(value);
            receivedLength += value.length;
    
            // テキストとしてデータをデコード
            let decoder = new TextDecoder("utf-8");
            const chunkText = decoder.decode(value, {stream: true});
            collectionData += chunkText
            setStreamAnswerJE((prevData) => [...prevData, chunkText]);
           }

           const newWordData = wordList.find(wordItem => wordItem.id === word.id);
           if (newWordData) {
             // userWordListStatus内のreviewScoreJEだけを更新する新しいオブジェクトを作成
             const updatedWordData = {
               ...newWordData,
               userWordListStatus: {
                 ...newWordData.userWordListStatus,
                 questionJE, questionJE,
                 answerJE: collectionData,
               },
             };
             updateWordList(updatedWordData);
            }

        }        

    
      } catch (error) {
        console.error('Error creating answer:', error);
      } finally {
        setReadyToAIReview(true)
      }
    };
    

    const handleCreateReview = async (userAnswerJE) =>{
      setStreamReviewScoreJE('')
      setStreamReviewCommentJE('')
      if (word.userWordListStatus.questionJE && word.userWordListStatus.answerJE && userAnswerJE){
        createReviewScore(word.id, userAnswerJE)
        createReviewComment(word.id, userAnswerJE)  
      }else {
        setErrorMsg('エラーが発生しました。問題生成からやり直してください')
      }
    }
    
    const createReviewScore = async (wordListId, userAnswerJE) => {
      try {
        const response = await fetch('/api/word-master/createReviewScoreJE', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordListId: word.id, // 仮にword.idをwordListUserStatusIdとして使用
            english: word.english,
            japanese: word.japanese,
            questionJE: word.userWordListStatus.questionJE, // APIから受け取ったquestionJE
            answerJE: word.userWordListStatus.answerJE, // APIから受け取ったanswerJE
            userAnswerJE: userAnswerJE, // ユーザーの回答
          }),
        });

        const data = await response.json();
        const newScore = data.score
        setStreamReviewScoreJE(newScore)
        const newWordData = wordList.find(wordItem => wordItem.id === wordListId);
        if (newWordData) {
          // userWordListStatus内のreviewScoreJEだけを更新する新しいオブジェクトを作成
          const updatedWordData = {
            ...newWordData,
            userWordListStatus: {
              ...newWordData.userWordListStatus,
              reviewScoreJE: newScore,
            },
          };
          updateWordList(updatedWordData);
        }

        if (parseInt(newScore) < 3){
          setNotMemorizedWordList([...notMemorizedWordList, {...word}])
        }


      } catch (error) {
        console.error('Error creating review:', error);
      } finally {
      }
    };

    const createReviewComment = async (wordListId, userAnswerJE) => {
      setIsLoadingReviewJE(true);
      setKnownButtonDisabled(true)
      setStreamReviewCommentJE('')
      try {
        const response = await fetch('/api/word-master/createReviewCommentJE', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordListId: word.id, // 仮にword.idをwordListUserStatusIdとして使用
            english: word.english,
            japanese: word.japanese,
            questionJE: word.userWordListStatus.questionJE, // APIから受け取ったquestionJE
            answerJE: word.userWordListStatus.answerJE, // APIから受け取ったanswerJE
            userAnswerJE: userAnswerJE, // ユーザーの回答
          }),
        });

        if (response.body) {
          setIsLoadingReviewJE(false);
          const reader = response.body.getReader();
          let receivedLength = 0; // 受信したデータの長さ
          let chunks = []; // 受信したチャンクを保存する配列
          let collectionData = ''

          while(true) {
            const {done, value} = await reader.read();
    
            if (done) {
              break;
            }
    
            chunks.push(value);
            receivedLength += value.length;
    
            // テキストとしてデータをデコード
            let decoder = new TextDecoder("utf-8");
            const chunkText = decoder.decode(value, {stream: true});
            collectionData += chunkText
            setStreamReviewCommentJE((prevData) => prevData + chunkText);
          }

           const newWordData = wordList.find(wordItem => wordItem.id === wordListId);
           if (newWordData) {
             // userWordListStatus内のreviewScoreJEだけを更新する新しいオブジェクトを作成
             const updatedWordData = {
               ...newWordData,
               userWordListStatus: {
                 ...newWordData.userWordListStatus,
                 reviewCommentJE: collectionData,
               },
             };
             updateWordList(updatedWordData);
            }

        }        

      } catch (error) {
        console.error('Error creating review:', error);
      } finally {
        setShowInputArea(false); // レビュー後は入力エリアを非表示に
        setNextButtonDisabled(false)
      }
    };

    const handleShowInputArea = () => {
      setShowInputArea(true);
    };
    
    const handleChangeTab = (event, newValue) =>{
      setTabValue(newValue)
    }
          

    const word = wordList[currentIndex];
    const remainingWords = wordList.length - currentIndex; // 残りの問題数

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
          updateWordList={updateWordListForNotMemorized}
          themeAllWordsFlag={themeAllWordsFlag}
        />
      ):(
        <Box sx={{mt: 5, mb: 10, maxWidth: '700px'}} >
          
          <Typography variant="h6" sx={{ marginBottom: 2 }}>残りの問題数: {remainingWords}</Typography>

          <Box sx={{mb:1}}>
            <Button onClick={handleCreateQuestion} disabled={isLoading || knownButtonDisabled} variant="outlined">
              問題生成
            </Button>
          </Box>
          {errorMsg && (
            <Typography color="error">{errorMsg}</Typography>
          )}

          <Paper sx={{ mt: 2, p: 2, bgcolor: 'grey.100', minHeight: '200px', position: 'relative' }}>
            {isLoadingQuestionJE && (
              <CircularProgress size={24} />          
            )}

            {(streamQuestionJE != '' || word.userWordListStatus.questionJE) && (
              <>
                <Typography variant="body2" sx={{mb:2}}>この文を英語にしてください。</Typography>
                <Typography variant="h6"sx={{mb:2, fontWeight: 700}} color="primary">
                  {word.userWordListStatus.questionJE || streamQuestionJE}
                </Typography>
                <Typography variant="body2" sx={{mb:1}}>[使う単語]</Typography>
                <Box sx={{display: 'flex', justifyContent: 'start'}}>
                  <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                    {word.english} / {word.japanese} 
                  </Typography>
                  {/* <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                    ({word.english.substring(0, 2) +
                    word.english.substring(2)
                      .split('')
                      .map(char => char === ' ' ? ' ' : '-')
                      .join('')})
                  </Typography> */}

                </Box>
              </>
            )}
          </Paper>

          
          {(streamQuestionJE != '' || word.userWordListStatus.questionJE) && !errorMsg && (
            <>
            <Box sx={{ '& > button': { marginTop: 5, mr: 2, ml: 2, mb: 2 } }}>
              <Button variant="contained" color="primary" onClick={() => handleAnswer(true)} disabled={knownButtonDisabled}>
                  わかる
              </Button>
              <Button variant="contained" color="secondary" onClick={() => handleAnswer(false)} disabled={knownButtonDisabled}>
                  わからない
              </Button>
              <Button variant="contained" onClick={handleNext} disabled={nextButtonDisabled}>
                  次へ(n)
              </Button>

            </Box>

            <Box sx={{ borderBottom: 1, mt: 3, mb: 3, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleChangeTab} >
              <Tab label="答えを書く(AIレビュー)" />
                <Tab label="モデルアンサー" />
              </Tabs>
            </Box>
            
            {tabValue == 0 && (
              <>
                <TextField
                  label="あなたの回答"
                  variant="outlined"
                  fullWidth
                  value={userAnswerJE}
                  onChange={(e) => setUserAnswerJE(e.target.value)}
                  sx={{mt: 2, mb: 2}}
                  autoComplete='off'
                />
                <Button variant="contained" 
                  onClick={() => handleCreateReview(userAnswerJE)} 
                  disabled={isLoadingReviewJE || !userAnswerJE || !readyToAIReview} 
                  sx={{mb: 2}}>
                  AIレビュー
                </Button>

                {streamReviewScoreJE && (
                    <Box sx={{display: 'flex', alignItems: 'flex-end', mt: 3}}>
                      <Typography variant="h5" color="secondary" >
                        {streamReviewScoreJE === '1' ? '1.全く適切でない' :
                        streamReviewScoreJE === '2' ? '2.やや適切でない' :
                        streamReviewScoreJE === '3' ? '3.やや適切' :
                        streamReviewScoreJE === '4' ? '4.非常に適切 (最高スコア)' : '採点不可'}
                      </Typography>
                    </Box>
                )}
                <Paper sx={{ mt: 2, mb: 10, p: 2, bgcolor: 'grey.100', minHeight: '200px', position: 'relative' }}>
                  {isLoadingReviewJE && (
                    <CircularProgress size={24} />          
                  )}
                  {(streamReviewCommentJE) && (
                      <Typography variant="body1">{`${streamReviewCommentJE}`}</Typography>
                  )}
                </Paper>
              </>
            )}

            {tabValue == 1 && (
              <>
                <Paper sx={{ mt: 2, mb: 2, p: 2, bgcolor: 'grey.100', minHeight: '100px', position: 'relative' }}>
                  {showAnswerButton && !showAnswer && (
                    <Button variant="outlined" onClick={handleShowAnswer}>
                      答え表示
                    </Button>
                  )}
                  {showAnswer && (
                    <>
                      <Typography variant="h6"sx={{mb:2, fontWeight: 700}} color="primary">
                        {word.userWordListStatus.answerJE || streamAnswerJE}
                      </Typography>

                      <Box sx={{mb: 2}}>
                        <IconButton onClick={() => playAudio(word.userWordListStatus.answerJE || streamAnswerJE)} size="small">
                            <VolumeUpIcon />
                        </IconButton>
                      </Box>

                      <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <IconButton onClick={()=>setOpenModal(true)} disableRipple={true}>
                          <Typography variant="subtitle1">
                            {word.english}
                          </Typography>
                          <OpenInNewIcon/>
                        </IconButton>
                      </Box>
                    </>

                )}
                </Paper>
              </>

            )}

            </>        
          )}

          <WordDetailDialog 
            open={openModal}
            onClose={()=>setOpenModal(false)}
            wordList={[{...word}]}
            initialIndex={0}
            updateWordList={updateWordList}
            tabDisabledAIReview={true}
            tabDisabledPersonalizedEx={true}
          />
      </Box>
      )}
    </>
);

};

export default LearnWordsCheck;
