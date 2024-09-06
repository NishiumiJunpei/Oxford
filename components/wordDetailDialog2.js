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
import { playAudioMP3, stopAudioMP3 } from '@/utils/audioPlayer';


const WordDetailDialog = ({ open, onClose, wordList, initialIndex, updateWordList, initialTabValue, tabDisabledPersonalizedEx, tabDisabledAIReview }) => {
    const router = useRouter();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [index, setIndex] = useState(initialIndex);
    const [tabValue, setTabValue] = useState(0); // タブの状態を管理するためのステート
    const [accordionExpanded, setAccordionExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);  // AudioオブジェクトをuseRefで管理
        

    useEffect(() => {
        setIndex(initialIndex);
    }, [initialIndex]);

    useEffect(() => {
        setTabValue(initialTabValue || 0);
    }, [initialTabValue]);

    
    

    // 次へボタンが押されたときに音声をリセット
    const handleNext = () => {
        stopAudioMP3();  // 再生中の音声を停止

        if (index < wordList.length - 1) {
            setIndex(index + 1);
            setIsPlaying(false);  // 再生中の状態をリセット
            setAccordionExpanded(false);  
        }
    };

    // 前へボタンが押されたときにも同様に音声をリセット
    const handlePrev = () => {
        stopAudioMP3();  // 再生中の音声を停止

        if (index > 0) {
            setIndex(index - 1);
            setIsPlaying(false);  // 再生中の状態をリセット
            setAccordionExpanded(false);  
        }
    };

    // ダイアログを閉じるときに音声を停止
    const handleClose = () => {
        stopAudioMP3();  // 再生中の音声を停止

        setIndex(initialIndex);
        setTabValue(0);
        setAccordionExpanded(false);            
        setIsPlaying(false)        
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
      


          
    const handleExplanationAudioPlayToggle = async () => {
        if (!isPlaying) {
            setIsPlaying(true);  // 再生中の状態を更新
            await playAudioMP3(word.explanationAudioUrl);  // 再生終了まで待機
            setIsPlaying(false);  // 再生終了後に状態をリセット
        } else {
            stopAudioMP3();  // 手動で停止
            setIsPlaying(false);
        }
    };
            


    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
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
                        {/* <GPTCoachButton words={[word]} styleType='LINK'/> */}
                        {word?.explanationAudioUrl && (
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

                        )}
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
                <Tab label="1000字解説" disabled={tabDisabledPersonalizedEx || false}/>
            </Tabs>

            {tabValue === 0 && (
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" style={{ marginTop: 5, display: 'flex', alignItems: 'center' }}>
                                <span style={{ backgroundColor: '#D3D3D3', padding: '4px', marginRight: '8px' }}>意味</span>
                                {/* <IconButton onClick={() => playAudio({text: word.japanese, lang: 'ja'})} size="small">
                                    <VolumeUpIcon />
                                </IconButton> */}
                            </Typography>
                            <Typography variant="body1">
                                {word?.japanese}
                            </Typography>

                            <Typography variant="body2" style={{ marginTop: 20, display: 'flex', alignItems: 'center' }}>
                                <span style={{ backgroundColor: '#D3D3D3', padding: '4px', marginRight: '8px' }}>例文</span>
                                {/* <IconButton onClick={() => playAudio({text: word.exampleSentenceE})} size="small">
                                <VolumeUpIcon /><Typography variant="body2">(英)</Typography>
                                </IconButton>
                                <IconButton onClick={() => playAudio({text: word.exampleSentenceJ, lang: 'ja'})} size="small">
                                    <VolumeUpIcon /><Typography variant="body2">(日)</Typography>
                                </IconButton> */}
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
                                {/* <IconButton onClick={() => playAudio({text: word?.synonyms})} size="small">
                                    <VolumeUpIcon />
                                </IconButton> */}
                            </Typography>
                            <Typography variant="body1">
                                {word?.synonyms}
                            </Typography>



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

        </Dialog>
    );
};

export default WordDetailDialog;
