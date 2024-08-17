//WordDetailDialog.js
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, useMediaQuery, Link,
    useTheme,CircularProgress, Box,  Divider, Tooltip, IconButton, Tabs, Tab, Paper, TextField, Grid,
    Accordion, AccordionActions, AccordionSummary, AccordionDetails, Checkbox, FormControlLabel } from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ProfileKeywordsSettingDialog from './profileKeywordsSettingDialog';
import SettingsIcon from '@mui/icons-material/Settings';
import { playAudio, stopAudio, pauseAudio } from '@/utils/audioPlayer';
import GPTCoachButton from './gptCoachButton';


const WordDetailDialog = ({ open, onClose, wordList, initialIndex, updateWordList, initialTabValue, tabDisabledPersonalizedEx, tabDisabledAIReview }) => {
    const router = useRouter();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [index, setIndex] = useState(initialIndex);
    const [IsLoadingES, setIsLoadingES] = useState(false); // ローディング状態の管理
    const [IsloadingReview, setIsLoadingReview] = useState(false); // ローディング状態の管理
    const [tabValue, setTabValue] = useState(0); // タブの状態を管理するためのステート
    const [exampleSentenceForUser, setExampleSentenceForUser] = useState('');
    const [userSentence, setUserSentence] = useState('');
    const [reviewByAI, setReviewByAI] = useState('');
    const [errorMsg, setErrorMsg] = useState('')
    const [streamQuestionJE, setStreamQuestionJE] = useState('');
    const [streamAnswerJE, setStreamAnswerJE] = useState('');
    const [isLoadingQuestionJE, setIsLoadingQuestionJE] = useState(false);
    const [noKeyword, setNoKeyword] = useState(false)
    const [openProfileKeywordsSettingDialog, setOpenProfileKeywordsSettingDialog] = useState(false)  
    const [accordionExpanded, setAccordionExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);  // AudioオブジェクトをuseRefで管理
        

    useEffect(() => {
        setIndex(initialIndex);
    }, [initialIndex]);

    useEffect(() => {
        setTabValue(initialTabValue || 0);
    }, [initialTabValue]);

    useEffect(() => {
        if (open && wordList[index]?.userWordListStatus) {
            setExampleSentenceForUser(wordList[index].userWordListStatus.exampleSentenceForUser || '');
            setUserSentence(wordList[index].userWordListStatus.userSentence || '');
            setReviewByAI(wordList[index].userWordListStatus.reviewByAI || '');
        }
    }, [index, wordList, open]);
    
    useEffect(() => {
        const fetchUserData = async () =>{
        //   setIsLoading(true); // データ取得開始前にローディング状態をtrueに設定
          const response = await fetch(`/api/user-setting/getUserInfo`);
          const data = await response.json();
          if (data) {
            const {interestKeywords, profileKeywords} = data
            if (interestKeywords && profileKeywords){
              setNoKeyword(false)
            }else{
              setNoKeyword(true)
            }
          }
        //   setIsLoading(false); // データ取得後にローディング状態をfalseに設定
        }
        fetchUserData()
    
    }, [openProfileKeywordsSettingDialog, setOpenProfileKeywordsSettingDialog]);
    
// 次へボタンが押されたときに音声をリセット
const handleNext = () => {
    if (audioRef.current) {
      audioRef.current.pause();  // 前の音声を停止
      audioRef.current.currentTime = 0;  // 再生位置をリセット
      audioRef.current = null;  // Audioオブジェクトをクリア
    }
    
    if (index < wordList.length - 1) {
      setIndex(index + 1);
      setIsPlaying(false);  // 再生中の状態をリセット
      setStreamQuestionJE('');
      setStreamAnswerJE('');
      setAccordionExpanded(false);  
    }
  };
  
  // 前へボタンが押されたときにも同様に音声をリセット
  const handlePrev = () => {
    if (audioRef.current) {
      audioRef.current.pause();  // 前の音声を停止
      audioRef.current.currentTime = 0;  // 再生位置をリセット
      audioRef.current = null;  // Audioオブジェクトをクリア
    }
    
    if (index > 0) {
      setIndex(index - 1);
      setIsPlaying(false);  // 再生中の状態をリセット
      setStreamQuestionJE('');
      setStreamAnswerJE('');
      setAccordionExpanded(false);  
    }
  };

  const handleClose = () => {
        setIndex(initialIndex);
        setTabValue(0)
        setExampleSentenceForUser('')
        setUserSentence('')
        setReviewByAI('')
        setStreamQuestionJE('')
        setStreamAnswerJE('')
        setAccordionExpanded(false)            
        onClose();
    };

    useEffect(() => {
        // 次の単語が切り替わった際に、解説の音声をリセット
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
          setIsPlaying(false);
        }
      }, [index]);  // indexが変わったらリセット
      


    const handleExplanationAudioPlayToggle = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio(word.explanationAudioUrl);  // オーディオオブジェクトを初期化
          }
        
          if (!isPlaying) {
            audioRef.current.play();  // 音声を再生
            setIsPlaying(true);  // 再生中の状態を更新
            audioRef.current.onended = () => setIsPlaying(false);  // 再生終了時に状態をリセット
          } else {
            audioRef.current.pause();  // 音声を一時停止
            audioRef.current.currentTime = 0;  // 再生位置をリセット
            setIsPlaying(false);
          }
    };
      
        


    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };


    const createReviewByAI = async () => {
        setIsLoadingReview(true);
        try {
            const response = await axios.post('/api/word-master/createReviewByAI', {
                wordListId: wordList[index].id,
                userSentence: userSentence,
                english: wordList[index].english,
                japanese: wordList[index].japanese,
            });

            const updatedWord = {
                ...wordList[index],
                userWordListStatus: {
                    ...wordList[index].userWordListStatus,
                    userSentence: userSentence,
                    reviewByAI: response.data.reviewByAI
                }
            };    
            updateWordList(updatedWord);

            setReviewByAI(response.data.reviewByAI);
        } catch (error) {
            console.error('Error creating review:', error);
            setReviewByAI('エラーが発生しました。');
        } finally {
            setIsLoadingReview(false);
        }
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
              answerJE: '',
              userAnswerJE: '',
              reviewScoreJE: '',
              reviewCommentJE: '',
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
        }
      };
  

    const handleChangeAccordion = (panel) => (event, isExpanded) => {
        setAccordionExpanded(isExpanded ? panel : false);
    };
    
    useEffect(() =>{
        // キーボードイベントのハンドラを追加
        const handleKeyPress = (event) => {
            if (event.key === 'ArrowLeft') {
                handlePrev();
            } else if (event.key === 'ArrowRight') {
                handleNext();
            } else if (event.key === 'k') {
                onClose();
            }
        };

        if (tabValue === 0 ) {
            window.addEventListener('keydown', handleKeyPress);
        }
    
        // コンポーネントのクリーンアップ時にイベントリスナーを削除
        return () => {
            if (tabValue === 0) {
                window.removeEventListener('keydown', handleKeyPress);
            }
        };
    
    },[handlePrev, handleNext, tabValue]);

      

    const word = wordList[index];

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullScreen={fullScreen}
            PaperProps={{
                sx: {
                    width: fullScreen ? '100%' : '90%', // モバイルでは100%、それ以外では70%
                    height: '90%',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    overflow: 'auto'
                }
            }}
        >
            <DialogTitle>
                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                    <Box>
                        {word?.english}            
                        <IconButton onClick={() => playAudio({text: word.english})}>
                            <VolumeUpIcon />
                        </IconButton>

                    </Box>
                     <Box>
                        <GPTCoachButton words={[word]} dialogFlag={false} styleType='LINK'/>

                    </Box> 

                </Box>
            </DialogTitle>

            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
            >
                <Tab label="キホン" />
                <Tab label="パーソナライズ例文" disabled={tabDisabledPersonalizedEx || false}/>
                <Tab label="AIレビュー" disabled={tabDisabledAIReview || false}/>
            </Tabs>

            {tabValue === 0 && (
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" style={{ marginTop: 5, display: 'flex', alignItems: 'center' }}>
                                <span style={{ backgroundColor: '#D3D3D3', padding: '4px', marginRight: '8px' }}>意味</span>
                                <IconButton onClick={() => playAudio({text: word.japanese, lang: 'ja'})} size="small">
                                    <VolumeUpIcon />
                                </IconButton>
                            </Typography>
                            <Typography variant="body1">
                                {word?.japanese}
                            </Typography>

                            <Typography variant="body2" style={{ marginTop: 20, display: 'flex', alignItems: 'center' }}>
                                <span style={{ backgroundColor: '#D3D3D3', padding: '4px', marginRight: '8px' }}>例文</span>
                                <IconButton onClick={() => playAudio({text: word.exampleSentenceE})} size="small">
                                <VolumeUpIcon /><Typography variant="body2">(英)</Typography>
                                </IconButton>
                                <IconButton onClick={() => playAudio({text: word.exampleSentenceJ, lang: 'ja'})} size="small">
                                    <VolumeUpIcon /><Typography variant="body2">(日)</Typography>
                                </IconButton>
                            </Typography>

                            <Typography variant="body1">
                                {word?.exampleSentenceE}
                            </Typography>
                            <Typography variant="body1">
                                {word?.exampleSentenceJ}
                            </Typography>

                            {word?.usage && (
                            <>
                                <Typography variant="body2" style={{ marginTop: 20, }}>
                                    <span style={{ backgroundColor: '#D3D3D3', padding: '4px' }}>単語を使うシーン</span>
                                </Typography>
                                <Typography variant="body1">
                                    {word?.usage.map((u, index)=>(
                                        <Accordion key={index} expanded={accordionExpanded === `panel${index}`} onChange={handleChangeAccordion(`panel${index}`)}>
                                            <AccordionSummary  expandIcon={<ExpandMoreIcon />}>
                                                <Typography variant="body1">{index+1}.{u.situation}</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Typography variant="body1">{u.exampleE}</Typography>
                                                <Typography variant="body1">{u.exampleJ}</Typography>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </Typography>
                            </>
                            )}

                            <Typography variant="body2" style={{ marginTop: 20 }}>
                                <span style={{ backgroundColor: '#D3D3D3', padding: '4px' }}>類語</span>
                                <IconButton onClick={() => playAudio({text: word?.synonyms})} size="small">
                                    <VolumeUpIcon />
                                </IconButton>
                            </Typography>
                            <Typography variant="body1">
                                {word?.synonyms}
                            </Typography>

                            {word?.explanationAudioUrl && (
                                <Box sx={{mt:5}}>
                                    <Button 
                                        onClick={handleExplanationAudioPlayToggle} 
                                        style={{ margin: 5, padding: 5, minWidth: 90 }}
                                        variant="outlined"
                                        startIcon={!isPlaying ? <PlayArrowIcon /> : <StopIcon />}  // 再生中はStopアイコンを表示
                                        disabled={tabValue === 2}
                                        color="inherit"
                                        sx={{ml:3}}
                                        >
                                        解説再生
                                    </Button>

                                </Box>
                            )}

                        </Grid>
                        <Grid item xs={12} md={6}>
                            {word?.imageUrl ? (
                                <>
                                    <img 
                                        src={word.imageUrl} 
                                        alt={word.english} 
                                        style={{ marginTop: 20, maxWidth: '100%', maxHeight: '80%', objectFit: 'contain' }} 
                                    />
                                    <Typography variant="body2" sx={{mb: 2}}>
                                        Created by GPT & DALLE3 / susu English
                                    </Typography>
                                </>
                            ) : (
                                <div style={{ marginTop: 20, width: '80%', height: '50%', backgroundColor: '#d3d3d3', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Typography variant="body1">
                                        画像準備中
                                    </Typography>
                                </div>
                            )}
                            
                        </Grid>

                    </Grid>

                    

                    {/* <Divider sx={{mt: 3, mb: 3}}/>
                    <Typography variant="h6">
                        ステータス
                        <Tooltip 
                            title="理解度テストで正解すると星マークが１つ付きます。24時間後にもう一度連続で正解すると2つ星マークがつきます。" 
                            arrow
                        >
                            <IconButton size="small">
                            <HelpOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1">英⇨日</Typography> 
                            <Box sx={{ ml: 1, ml: 3 }}>
                            {word?.memorizeStatusEJ === 'NOT_MEMORIZED' && (
                                <>
                                <StarBorderIcon style={{ color: '#D3D3D3' }}/>
                                <StarBorderIcon style={{ color: '#D3D3D3' }}/>
                                </>
                            )}
                            {word?.memorizeStatusEJ === 'MEMORIZED' && (
                                <>
                                <StarIcon style={{ color: 'gold' }} />
                                <StarBorderIcon style={{ color: '#D3D3D3' }}/>
                                </>
                            )}
                            {word?.memorizeStatusEJ === 'MEMORIZED2' && (
                                <>
                                <StarIcon style={{ color: 'gold' }} />
                                <StarIcon style={{ color: 'gold' }} />
                                </>
                            )}
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                            <Typography variant="subtitle1">日⇨英</Typography> 
                            <Box sx={{ ml: 1, ml: 3 }}>
                            {word?.memorizeStatusJE === 'NOT_MEMORIZED' && (
                                <>
                                <StarBorderIcon style={{ color: '#D3D3D3' }}/>
                                <StarBorderIcon style={{ color: '#D3D3D3' }}/>
                                </>
                            )}
                            {word?.memorizeStatusJE === 'MEMORIZED' && (
                                <>
                                <StarIcon style={{ color: 'gold' }} />
                                <StarBorderIcon style={{ color: '#D3D3D3' }}/>
                                </>
                            )}
                            {word?.memorizeStatusJE === 'MEMORIZED2' && (
                                <>
                                <StarIcon style={{ color: 'gold' }} />
                                <StarIcon style={{ color: 'gold' }} />
                                </>
                            )}
                            </Box>
                        </Box>
                    </Box> */}

                </DialogContent>
            )}

            {tabValue === 1 && (
                <DialogContent>

                    <Box sx={{mb: 2}}>
                        <Link sx={{cursor: 'pointer'}} color={theme.palette.link.main} onClick={()=>setOpenProfileKeywordsSettingDialog(true)}>
                            プロフィール・興味のキーワード設定
                        </Link>
                        {noKeyword && (
                            <Typography color="error">
                                プロフィール・興味のキーワードを設定してください。
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{mb:1}}>
                        <Button onClick={handleCreateQuestion} disabled={isLoadingQuestionJE || noKeyword} variant="outlined" >
                            問題生成
                        </Button>
                    </Box>
                    {errorMsg && (
                        <Typography color="error">{errorMsg}</Typography>
                    )}
                    <Paper sx={{ mb: 4, p: 2, bgcolor: 'grey.100', minHeight: '150px', position: 'relative' }}>
                        {isLoadingQuestionJE && (
                            <CircularProgress size={24} />          
                        )}

                        {(word.userWordListStatus?.questionJE || streamQuestionJE != '') && (
                            <>
                                <Typography variant="body2" sx={{mb:2}}>この文を英語にしてください。</Typography>
                                <Typography variant="h6"sx={{mb:2, fontWeight: 700}} color="primary">
                                    {word.userWordListStatus?.questionJE || streamQuestionJE}
                                </Typography>
                                <Typography variant="body2" sx={{mb:1}}>[使う単語]</Typography>
                                <Box sx={{display: 'flex', justifyContent: 'start', mb: 2}}>
                                    <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                        {word.english} / {word.japanese} 
                                    </Typography>
                                </Box>
                                <Box sx={{mb: 2}}>
                                    <IconButton onClick={() => playAudio({text:word.userWordListStatus?.questionJE, lang:'ja'})} size="small">
                                        <VolumeUpIcon />
                                    </IconButton>
                                </Box>

                            </>
                        )}
                    </Paper>

                    <Typography variant="subtitle1">モデルアンサー</Typography>
                    <Paper sx={{ mb: 4, p: 2, bgcolor: 'grey.100', minHeight: '100px', position: 'relative' }}>
                      <Typography variant="h6"sx={{mb:2, fontWeight: 700}} color="primary">
                        {word.userWordListStatus?.answerJE || streamAnswerJE}
                      </Typography>
                      {word.userWordListStatus?.answerJE && (
                        <Box sx={{mb: 2}}>
                            <IconButton onClick={() => playAudio({text: word.userWordListStatus?.answerJE})} size="small">
                                <VolumeUpIcon />
                            </IconButton>
                        </Box>
                      )}
                    </Paper>

                    {word.userWordListStatus?.userAnswerJE  && (
                        <>
                            <Typography variant="subtitle1">あなたの回答</Typography>

                            <Paper sx={{ mb: 4, p: 2, bgcolor: 'grey.100', minHeight: '100px', position: 'relative' }}>
                                <Typography variant="h6"sx={{mb:2, fontWeight: 700}} color="primary">
                                    {word.userWordListStatus?.userAnswerJE}
                                </Typography>
                            </Paper>
                        </>
                    )}

                    {!!word.userWordListStatus?.reviewScoreJE && (
                        <>
                            <Typography variant="subtitle1">AIレビュー</Typography>
                            <Box sx={{display: 'flex', alignItems: 'flex-end', mt: 3}}>
                                <Typography variant="h5" color="secondary" >
                                    {word.userWordListStatus?.reviewScoreJE === 1 ? '1.全く適切でない' :
                                    word.userWordListStatus?.reviewScoreJE === 2 ? '2.やや適切でない' :
                                    word.userWordListStatus?.reviewScoreJE === 3 ? '3.やや適切' :
                                    word.userWordListStatus?.reviewScoreJE === 4 ? '4.非常に適切 (最高スコア)' : '採点不可'}
                                </Typography>
                            </Box>

                            <Paper sx={{ mt: 2, mb: 10, p: 2, bgcolor: 'grey.100', minHeight: '200px', position: 'relative' }}>
                                <Typography variant="body1">{`${word.userWordListStatus?.reviewCommentJE}`}</Typography>
                            </Paper>
                            </>

                    )}




                    {/* <Typography variant="body1">
                        あなたのプロフィールや興味
                        (<Link onClick={()=>router.push("/user-setting/userProfile")} sx={{color: '#0000EE', cursor:'pointer'}} >設定</Link>)
                        に関連する例文をGPTが作ります。
                    </Typography>
                    <Button variant="outlined" onClick={createExampleSentenceForUser} disabled={IsLoadingES}>
                        例文生成
                    </Button>
                    <Paper sx={{ mt: 2, p: 2, bgcolor: 'grey.100', minHeight: '200px', position: 'relative' }}>
                        {IsLoadingES ? (
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px'
                                }}
                            />
                        ) : (
                            <Typography className="preformatted-text">
                                {exampleSentenceForUser}
                            </Typography>
                        )}
                    </Paper> */}
                </DialogContent>
            )}

            {tabValue === 2 && (
                <DialogContent>
                    <Typography variant="body1">
                        この単語を使って例文を作ってください。AIがレビューしてくれます。
                    </Typography>
                    <TextField
                        fullWidth
                        label="あなたの例文"
                        value={userSentence}
                        onChange={(e) => setUserSentence(e.target.value)}
                        margin="normal"
                        inputProps={{ maxLength: 200 }}
                    />
                    <Button variant="outlined" onClick={createReviewByAI} disabled={IsloadingReview}>
                        AIレビュー
                    </Button>
                    <Paper sx={{ mt: 2, p: 2, bgcolor: 'grey.100', minHeight: '300px', position: 'relative' }}>
                        {IsloadingReview ? (
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px'
                                }}
                            />
                        ) : (
                            <Typography>
                                {reviewByAI}
                            </Typography>
                        )}
                    </Paper>
                </DialogContent>
        )}

            <DialogActions style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ width: '100%', textAlign: 'center' }}> 
                    <Button 
                        onClick={handlePrev} 
                        disabled={index <= 0}
                        style={{ margin: 5, padding: 5, minWidth: 90 }}
                    >
                        前へ
                    </Button>
                    <Button 
                        onClick={handleNext} 
                        disabled={index >= wordList.length - 1}
                        style={{ margin: 5, padding: 5, minWidth: 90 }}
                    >
                        次へ
                    </Button>
                    <Button 
                        onClick={handleClose}
                        style={{ margin: 5, padding: 5, minWidth: 90 }}
                    >
                        閉じる
                    </Button>
                </div>
            </DialogActions>

            <ProfileKeywordsSettingDialog
                open={openProfileKeywordsSettingDialog}
                onClose={()=>setOpenProfileKeywordsSettingDialog(false)}
            />


        </Dialog>
    );
};

export default WordDetailDialog;
