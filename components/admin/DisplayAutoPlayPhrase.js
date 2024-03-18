//DisplayAutoPlayWordsBasic.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, useMediaQuery, Link,
    useTheme,CircularProgress, Box,  Divider, Tooltip, IconButton, Tabs, Tab, Paper, TextField, Grid,
    Accordion, AccordionActions, AccordionSummary, AccordionDetails, Step, Stepper, StepLabel, List, ListItem, Avatar } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { playAudio, stopAudio, pauseAudio } from '@/utils/audioPlayer';
import { speakerInfo } from '@/utils/variables';


const DisplayAutoPlayPhrase = ({ open, onClose, categoryList, phraseList, openingScript, selectedSpeaker }) => {
    const router = useRouter();
    const theme = useTheme();
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [activeStep, setActiveStep] = useState('tableOfContents');
        
    const handleReset = () =>{
        stopAudio()
        setPhraseIndex(0);
        setActiveStep('tableOfContents')
        setIsAutoPlaying(false)
    
    }


    const handleNextStep = () => {
        switch (activeStep) {
            case 'tableOfContents':
                setActiveStep('playAudio');  
                break;
            // case 'title':
            //     setActiveStep('playAudio');  
            //     break;
            case 'playAudio':
                setActiveStep('playAudioWithSentences');
                break;
            case 'playAudioWithSentences':
                if (phraseIndex < phraseList.length - 1) {
                    setActiveStep('playAudio');
                    setPhraseIndex(phraseIndex + 1);
                } else {
                    setActiveStep('end');

                }
                break;
            default:
            break;
        }
    };

    const handlePrevStep = () => {
        switch (activeStep) {
          case 'playAudio':
            if (phraseIndex != 0){
                setPhraseIndex(phraseIndex - 1)
                setActiveStep('playAudioWithSentences');
            }
            break;
          case 'playAudioWithSentences':
            setActiveStep('playAudio');
            break;
          default:
            // 他のステップに戻る場合、ここにロジックを追加
            break;
        }
    };
      
    
    useEffect(()=>{
        const playAudioPhrase = async () => {
            if (activeStep == 'tableOfContents'){
                if (isAutoPlaying){
                    await new Promise(r => setTimeout(r, 2000));
                    if(openingScript){
                        await playAudio({text: openingScript, specifiedVoice: selectedSpeaker.voice})
                    }
        
        
                    await new Promise(r => setTimeout(r, 2000));
                    handleNextStep()    
                }

            }else if(activeStep == 'title'){
                playAudio({text: phraseList[phraseIndex].category2, lang: 'ja', gender: 'female'})
                if (isAutoPlaying){
                    await new Promise(r => setTimeout(r, 5000));
                    handleNextStep()
                }

            }else if (activeStep == 'playAudio') {
                await playAudio({
                    text: phraseList[phraseIndex].sentenceE, 
                });

                if (isAutoPlaying){
                    await new Promise(r => setTimeout(r, 3000));
                    handleNextStep()
                } 

            } else if (activeStep == 'playAudioWithSentences') {
                await playAudio({
                    text: phraseList[phraseIndex].sentenceE, 
                });

                await new Promise(r => setTimeout(r, 2000));

                await playAudio({
                    text: phraseList[phraseIndex].sentenceJ,
                    lang: 'ja',
                    gender: 'female' 
                });


                if (isAutoPlaying){
                    if (phraseList.length -1 == phraseIndex){
                        await new Promise(r => setTimeout(r, 3000));
                    }
                    handleNextStep()
                } 


            }
        }

        playAudioPhrase()

    },[activeStep, phraseIndex, isAutoPlaying])



    const handleAutoPlayToggle = () => {
        if (!isAutoPlaying) {
            setIsAutoPlaying(true);
        } else {
            stopAudio(); // 再生中のオーディオを停止し、currentTimeを0にリセット
            setIsAutoPlaying(false); // 自動再生を停止
        }
    };

    const handlePlayStop = () => {
        stopAudio(); // 再生中のオーディオを停止し、currentTimeを0にリセット
        setIsAutoPlaying(false); // 自動再生を停止
    };


    const adjustFontSize = (text) => {
        if (text.length > 100) {
            return "h5"; // より小さいフォントサイズ
        } else {
            return "h4"; // 標準のフォントサイズ
        }
    };

    const bg = 'radial-gradient( circle 610px at 5.2% 51.6%,  rgba(5,8,114,1) 0%, rgba(7,3,53,1) 97.5% )'
    const textColor = '#EEEEEE'
    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ width: 800, height: 450, padding: 3, pt: 2, border: 'solid', borderWidth: 0.5,
                background: bg, gackgroundRepeat: 'no-repeat'}}>
                {activeStep === 'tableOfContents' && (
                    <>
                    <Grid container spacing={2}>
                        <Grid item xs={6} > {/* 左側のコンテンツエリア */}                    
                            <Avatar alt="Selected Speaker" src={selectedSpeaker.imageUrl} sx={{ width: 70, height: 70, mt: 5, mb: 5 }} />
                            <Box sx={{width: '80%'}}>
                                <Typography variant="h5" sx={{color: textColor, padding: '0.5em 0', borderTop: `solid 3px ${textColor}`, borderBottom: `solid 3px ${textColor}`}}>
                                    {categoryList[0].category1}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}> {/* 右側の目次エリア */}
                            <Typography variant="h5" color={textColor} sx={{mt:5}}>Table of Contents</Typography>
                            <List>
                                {categoryList.map((cate, index) => (
                                    <ListItem key={index}><Typography color={textColor}>{index+1}.{cate.category2}</Typography></ListItem>
                                ))}
                            </List>
                        </Grid>                    
                    </Grid>
                    </>
                )}

                {activeStep === 'title' && (
                    <Box sx={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                        <Typography color="primary" variant="h4" sx={{mt:3}}>{phraseList[phraseIndex].categoryNo}.{phraseList[phraseIndex].category2}</Typography>
                    </Box>
                )}

                {activeStep === 'playAudio' && (
                    <>
                    <Box>
                        <Typography variant="subtitle1" sx={{fontSize: '1.2rem'}} color={'#98ABEE'} >{phraseIndex+1} / {phraseList.length}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{fontSize: '1.2rem'}} color={'#98ABEE'} >{phraseList[phraseIndex].categoryNo}.{phraseList[phraseIndex].category2}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', pb: 10 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', animation: 'pulse 2s infinite' }}>
                            <VolumeUpIcon sx={{ fontSize: '3rem', color: `${textColor}`}}/> 
                        </Box>
                        <style>{`
                            @keyframes pulse {
                                0% {
                                    transform: scale(1);
                                }
                                50% {
                                    transform: scale(1.2);
                                }
                                100% {
                                    transform: scale(1);
                                }
                            }
                        `}</style>
                    </Box>
                    </>

                )}

                {activeStep === 'playAudioWithSentences' && (
                    <>
                    <Box>
                        <Typography variant="subtitle1" sx={{fontSize: '1.2rem'}} color={'#98ABEE'} >{phraseIndex+1} / {phraseList.length}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{fontSize: '1.2rem'}} color={'#98ABEE'} >{phraseList[phraseIndex].categoryNo}.{phraseList[phraseIndex].category2}</Typography>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center', // 水平方向の中央
                        alignItems: 'center', // 垂直方向の中央
                        minHeight: '100%', // 親コンテナの高さに合わせる
                        p: 2, // コンテンツ周りのパディングを設定
                        pb: 15,
                    }}
                    >
                    <Typography
                        color={textColor}
                        variant={adjustFontSize(phraseList[phraseIndex].sentenceE)}
                        sx={{
                            wordWrap: 'break-word',
                            textAlign: 'center', // テキストを中央揃えにする
                            maxWidth: '100%', // テキストの最大幅を親要素の幅に合わせる
                        }}
                    >
                        {phraseList[phraseIndex].sentenceE}
                    </Typography>
                    <Typography
                        color={'#DEDEDE'}
                        variant="h6"
                        sx={{
                            mt: 3,
                            wordWrap: 'break-word',
                            textAlign: 'center',
                            maxWidth: '100%',
                        }}
                    >
                        {phraseList[phraseIndex].sentenceJ}
                    </Typography>
                    </Box>

                    </>

                )}


                {activeStep === 'end' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}> {/* mb は margin-bottom の略で、要素間の間隔を開けます */}
                            <Typography color={textColor} variant="h5">この動画を見てくださり、本当にありがとうございます</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography color={textColor} variant="h5">チャンネル登録して応援していただけると嬉しいです</Typography>
                        </Box>
                    </Box>
                )}

            </Box>

            <Box sx={{ mt: 2, width: 800 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt:5 }}>
                    <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={handleAutoPlayToggle}>
                        自動再生({isAutoPlaying ? 'オン' : 'オフ'})
                    </Button>
                    <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handlePlayStop}>停止</Button>
                    <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handleReset}>リセット</Button>
                    <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handlePrevStep}>＜</Button>
                    <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handleNextStep}>＞</Button>
                </Box>
            </Box>

            <Box>
                <Typography varaint="body2">
                    {openingScript}
                </Typography>
            </Box>
        </Box>

    );
};

export default DisplayAutoPlayPhrase;
