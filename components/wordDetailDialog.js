//WordDetailDialog.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, useMediaQuery, 
    useTheme,CircularProgress, Box,  Divider, Tooltip, IconButton, Tabs, Tab, Paper, TextField, Link } from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';


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

    useEffect(() => {
        setIndex(initialIndex);
    }, [initialIndex]);

    useEffect(() => {
        setTabValue(initialTabValue || 0);
    }, [initialTabValue]);

    useEffect(() => {
        if (wordList[index]?.userWordListStatus) {
            setExampleSentenceForUser(wordList[index].userWordListStatus.exampleSentenceForUser || '');
            setUserSentence(wordList[index].userWordListStatus.userSentence || '');
            setReviewByAI(wordList[index].userWordListStatus.reviewByAI || '');
        }
    }, [index, wordList]);
    

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
        setIndex(initialIndex);
        onClose();
    };

    const playAudio = async (text) => {
        try {
          const response = await fetch('/api/common/synthesize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text }),
          });
      
          const data = await response.json();
          if (data.audioContent) {
            const audioBlob = new Blob([new Uint8Array(data.audioContent.data)], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
          }
        } catch (error) {
          console.error('Error during audio playback:', error);
        }
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
            onClose={onClose}
            fullScreen={fullScreen}
            PaperProps={{
                sx: {
                    width: fullScreen ? '100%' : '50%', // モバイルでは100%、それ以外では70%
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
                    <Typography variant="subtitle1" style={{ marginTop: 10 }}>{word?.japanese}</Typography>

                    <Typography variant="body2" style={{ marginTop: 20, display: 'flex', alignItems: 'center' }}>
                        <span style={{ backgroundColor: '#D3D3D3', padding: '4px', marginRight: '8px' }}>例文</span>
                        <IconButton onClick={() => playAudio(word.exampleSentenceE)} size="small">
                            <VolumeUpIcon />
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
                    </Typography>
                    <Typography variant="body1">
                        {word?.synonyms}
                    </Typography>
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
                    <Typography variant="body1">
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
                    </Paper>
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
                    disabled={(index <= 0)}
                    style={{ margin: 5, padding: 5, minWidth: 90 }}
                    >
                    前へ
                    </Button>
                    <Button 
                    onClick={handleNext} 
                    disabled={(index >= wordList.length - 1)}
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
