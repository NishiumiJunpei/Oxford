//WordDetailDialog.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, useMediaQuery, 
    useTheme,CircularProgress, Box,  Divider, Tooltip, IconButton, Tabs, Tab, Paper, TextField, Grid,
    Accordion, AccordionActions, AccordionSummary, AccordionDetails } from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const WordDetailDialog = ({ open, onClose, wordList, initialIndex, updateWordList, initialTabValue }) => {
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
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);


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
    

    const handleNext = () => {
        if (index < wordList.length - 1) {
            setIndex(index + 1);
        }
    };

    const handlePrev = () => {
        if (index > 0) {
            setIndex(index - 1);
        }
    };

    const handleClose = () => {
        setIsAutoPlaying(false)
        setIndex(initialIndex);
        setTabValue(0)
        setExampleSentenceForUser('')
        setUserSentence('')
        setReviewByAI('')
        onClose();
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
      

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };


    const createExampleSentenceForUser = async () => {
        setIsLoadingES(true);
        try {
            const response = await axios.post('/api/word-master/createExampleSentenceForUser', {
                wordListId: wordList[index].id,
                english: wordList[index].english,
                japanese: wordList[index].japanese,
            });

            const updatedWord = {
                ...wordList[index],
                userWordListStatus: {
                    ...wordList[index].userWordListStatus,
                    exampleSentenceForUser: response.data.exampleSentenceForUser
                }
            };    
            updateWordList(updatedWord);

            setExampleSentenceForUser(response.data.exampleSentenceForUser);

        } catch (error) {
            console.error('Error creating example sentence:', error);
            setExampleSentenceForUser('エラーが発生しました。');
        } finally {
            setIsLoadingES(false);
        }
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


    const handleAutoPlay = () => {
        setIsAutoPlaying(!isAutoPlaying);
    };

    let autoPlaying = isAutoPlaying;
    useEffect(() => {
        autoPlaying = isAutoPlaying;
      
        return () => {
          autoPlaying = false;
        };
      }, [isAutoPlaying]);
      
    useEffect(() => {
        let isCancelled = false;

        const autoPlaySequence = async () => {
            let currentIndex = index;
          
            while (!isCancelled && currentIndex < wordList.length && isAutoPlaying) {
                await playAudio(wordList[currentIndex].english);
                await new Promise(r => setTimeout(r, 500));
                if (!autoPlaying) break;
                await playAudio(wordList[currentIndex].japanese, 'ja');
                await new Promise(r => setTimeout(r, 500));
                if (!autoPlaying) break;
                await playAudio(wordList[currentIndex].exampleSentenceE);
                await new Promise(r => setTimeout(r, 500));
                if (!autoPlaying) break;
                await playAudio(wordList[currentIndex].exampleSentenceJ, 'ja');
                await new Promise(r => setTimeout(r, 500));
                if (!autoPlaying) break;
                        

                if (currentIndex+1 >= wordList.length) {
                    setIsAutoPlaying(false);
                    break;
                }else{
                    setIndex(index + 1);
                    currentIndex++
                }
                await new Promise(r => setTimeout(r, 2000));
            }
        };
            
      
        if (isAutoPlaying) {
          setTabValue(0);
          autoPlaySequence();
        }
      
        return () => {
          isCancelled = true;
        };
      }, [isAutoPlaying, index, wordList]);
      


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

        if (tabValue === 0) {
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
            {word?.english}
            <IconButton onClick={() => playAudio(word.english)}>
                <VolumeUpIcon />
            </IconButton>
            </DialogTitle>

            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
            >
                <Tab label="キホン" />
                <Tab label="パーソナライズ例文" />
                <Tab label="AIレビュー" />
            </Tabs>

            {tabValue === 0 && (
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" style={{ marginTop: 5, display: 'flex', alignItems: 'center' }}>
                                <span style={{ backgroundColor: '#D3D3D3', padding: '4px', marginRight: '8px' }}>意味</span>
                                <IconButton onClick={() => playAudio(word.japanese, 'ja')} size="small">
                                    <VolumeUpIcon />
                                </IconButton>
                            </Typography>
                            <Typography variant="body1">
                                {word?.japanese}
                            </Typography>

                            <Typography variant="body2" style={{ marginTop: 20, display: 'flex', alignItems: 'center' }}>
                                <span style={{ backgroundColor: '#D3D3D3', padding: '4px', marginRight: '8px' }}>例文</span>
                                <IconButton onClick={() => playAudio(word.exampleSentenceE)} size="small">
                                <VolumeUpIcon /><Typography variant="body2">(英)</Typography>
                                </IconButton>
                                <IconButton onClick={() => playAudio(word.exampleSentenceJ, 'ja')} size="small">
                                    <VolumeUpIcon /><Typography variant="body2">(日)</Typography>
                                </IconButton>
                            </Typography>

                            <Typography variant="body1">
                                {word?.exampleSentenceE}
                            </Typography>
                            <Typography variant="body1">
                                {word?.exampleSentenceJ}
                            </Typography>

                            <Typography variant="body2" style={{ marginTop: 20 }}>
                                <span style={{ backgroundColor: '#D3D3D3', padding: '4px' }}>類語</span>
                                <IconButton onClick={() => playAudio(word?.synonyms)} size="small">
                                    <VolumeUpIcon />
                                </IconButton>
                            </Typography>
                            <Typography variant="body1">
                                {word?.synonyms}
                            </Typography>

                            {word?.usage && (
                            <>
                                <Typography variant="body2" style={{ marginTop: 20, }}>
                                    <span style={{ backgroundColor: '#D3D3D3', padding: '4px' }}>シチュエーション</span>
                                    {/* <IconButton onClick={() => playAudio(word?.synonyms)} size="small">
                                        <VolumeUpIcon />
                                    </IconButton> */}
                                </Typography>
                                <Typography variant="body1">
                                    {word?.usage.map((u, index)=>(
                                        <Accordion key={index}>
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


                    <Divider sx={{mt: 3, mb: 3}}/>
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
                    </Box>

                </DialogContent>
            )}

            {tabValue === 1 && (
                <DialogContent>
                    <Typography variant="subtitle1">問題</Typography>
                    <Paper sx={{ mb: 4, p: 2, bgcolor: 'grey.100', minHeight: '150px', position: 'relative' }}>
                        {word.userWordListStatus?.questionJE ? (
                            <>
                                <Typography variant="h6"sx={{mb:2, fontWeight: 700}} color="primary">
                                {word.userWordListStatus?.questionJE}
                                </Typography>
                                <Typography variant="body2" sx={{mb:1}}>[使う単語]</Typography>
                                <Box sx={{display: 'flex', justifyContent: 'start', mb: 2}}>
                                    <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                        {word.english} / {word.japanese} 
                                    </Typography>
                                </Box>
                                <Box sx={{mb: 2}}>
                                    <IconButton onClick={() => playAudio(word.userWordListStatus?.questionJE, 'ja')} size="small">
                                        <VolumeUpIcon />
                                    </IconButton>
                                </Box>

                            </>
                        ) : (
                            <Typography>
                                問題が生成されていません。アセスメント(日⇨英)で生成できます。
                            </Typography>
                        )}
                    </Paper>

                    <Typography variant="subtitle1">モデルアンサー</Typography>
                    <Paper sx={{ mb: 4, p: 2, bgcolor: 'grey.100', minHeight: '100px', position: 'relative' }}>
                      <Typography variant="h6"sx={{mb:2, fontWeight: 700}} color="primary">
                        {word.userWordListStatus?.answerJE}
                      </Typography>
                      {word.userWordListStatus?.answerJE && (
                        <Box sx={{mb: 2}}>
                            <IconButton onClick={() => playAudio(word.userWordListStatus?.answerJE)} size="small">
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
                        onClick={handleAutoPlay} 
                        style={{ margin: 5, padding: 5, minWidth: 90 }}
                        variant="outlined"
                        endIcon={!isAutoPlaying ? <PlayArrowIcon/> : <StopIcon/>}
                    >
                        自動再生
                    </Button>

                    <Button 
                        onClick={handlePrev} 
                        disabled={index <= 0 || isAutoPlaying}
                        style={{ margin: 5, padding: 5, minWidth: 90 }}
                    >
                        前へ
                    </Button>
                    <Button 
                        onClick={handleNext} 
                        disabled={index >= wordList.length - 1 || isAutoPlaying}
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
        </Dialog>
    );
};

export default WordDetailDialog;
