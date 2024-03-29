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


const DisplayAutoPlayScene = ({ open, onClose, sceneList, openingScript, selectedSpeaker }) => {
    const router = useRouter();
    const theme = useTheme();
    const [sceneIndex, setSceneIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [sentence, setSentence] = useState('');
    const [sentenceIndex, setSentenceIndex] = useState(0);
    const [phraseToLearnIndex, setPhraseToLearnIndex] = useState(0);
    const [activeStep, setActiveStep] = useState('tableOfContents');
        
    const handleNextScene = async () => {

        if (activeStep == 'tableOfContents'){
            setActiveStep('title')
        }else if (sceneIndex < sceneList.length - 1) {
            setSceneIndex(sceneIndex + 1);
            setSentenceIndex(0)
            setPhraseToLearnIndex(0)
            setActiveStep('title')
        }else{
            // setSceneIndex(0);
            setSentenceIndex(0)
            setPhraseToLearnIndex(0)
            setActiveStep('end')
        }
    };

    const handlePrevScene = () => {
        if (sceneIndex > 0) {
            setSceneIndex(sceneIndex - 1);
            setSentenceIndex(0)
            setPhraseToLearnIndex(0)
            setActiveStep('title')
        }
    };

    const handleReset = () =>{
        stopAudio()
        setSceneIndex(0);
        setSentenceIndex(0)
        setPhraseToLearnIndex(0)
        setActiveStep('tableOfContents')
        setIsAutoPlaying(false)
    
    }


    const handleNextStep = () => {
        switch (activeStep) {
            case 'title':
                if (sceneList[sceneIndex].type == 'news'){
                    setActiveStep('playAudioWithSentences');
                }else{
                    setActiveStep('playAudioWithSentences'); // 音だけはなしにする
                    // setActiveStep('playAudio');  
                }
                break;
            case 'playAudio':
                setActiveStep('playAudioWithSentences');
                break;
            case 'playAudioWithSentences':
                if (sentenceIndex < sceneList[sceneIndex].sentences.length - 1) {
                    setSentenceIndex(sentenceIndex + 1);
                } else {
                    if (sceneList[sceneIndex].phraseToLearn.length > 0){
                        setActiveStep('PlayAudioPhraseToLearn');
                        setSentenceIndex(0); // インデックスをリセット    
                        setPhraseToLearnIndex(0); // インデックスをリセット    
                    }else{
                        if (typeof phraseToLearnIndex !== 'undefined' && phraseToLearnIndex < sceneList[sceneIndex].phraseToLearn.length - 1) {
                            setPhraseToLearnIndex(phraseToLearnIndex + 1);
                        } else {
                            // ここでhandleNextSceneなど、次のシーンに進む関数を呼び出すか、activeStepを更新
                            handleNextScene(); // または適切な処理
                        }        
                    }
                }
                break;
            case 'PlayAudioPhraseToLearn':
                if (typeof phraseToLearnIndex !== 'undefined' && phraseToLearnIndex < sceneList[sceneIndex].phraseToLearn.length - 1) {
                    setPhraseToLearnIndex(phraseToLearnIndex + 1);
                } else {
                    handleNextScene();
                }
                break;
            default:
            break;
        }
    };

    const handlePrevStep = () => {
        switch (activeStep) {
          case 'title':
            break;
    
          case 'playAudio':
            setActiveStep('title');
            break;
          case 'playAudioWithSentences':
            if (sentenceIndex > 0){
                setSentenceIndex(sentenceIndex-1); // インデックスをリセット    
            }else{
                setActiveStep('playAudio');
            }
            break;
          case 'PlayAudioPhraseToLearn':
            if (sentenceIndex > 0) {
              setActiveStep('playAudioWithSentences');
              setSentenceIndex(sceneList[sceneIndex].sentences.length - 1);
            } else if (typeof phraseToLearnIndex !== 'undefined' && phraseToLearnIndex > 0) {
              setPhraseToLearnIndex(phraseToLearnIndex - 1);
            } else {
              setActiveStep('playAudioWithSentences');
              setSentenceIndex(sceneList[sceneIndex].sentences.length - 1); // センテンスの最後にセット
            }
            break;
          default:
            // 他のステップに戻る場合、ここにロジックを追加
            break;
        }
    };
      
    
    useEffect(()=>{
        const playAudioScene = async () => {
            if (activeStep == 'tableOfContents'){
                if (isAutoPlaying){
                    await new Promise(r => setTimeout(r, 3000));
                    if(openingScript){
                        await playAudio({text: openingScript, specifiedVoice: selectedSpeaker.voice})
                    }
        
        
                    await new Promise(r => setTimeout(r, 2000));
                    handleNextScene()    
                }

            }else if(activeStep == 'title'){
                playAudio({text: sceneList[sceneIndex].title, lang: 'ja', gender: 'female'})
                if (isAutoPlaying){
                    await new Promise(r => setTimeout(r, 5000));
                    handleNextStep()
                }

            }else if (activeStep == 'playAudio') {
                for (const sentence of sceneList[sceneIndex].sentences) {
                    await playAudio({
                        text: sentence.sentenceE, 
                        specifiedVoice: sentence.voice
                    });
                }

                if (isAutoPlaying){
                    await new Promise(r => setTimeout(r, 3000));
                    handleNextStep()
                } 

            } else if (activeStep == 'playAudioWithSentences') {
                const sentence = sceneList[sceneIndex].sentences[sentenceIndex];
                await playAudio({
                    text: sentence.sentenceE, 
                    specifiedVoice: sentence.voice
                });

                if (isAutoPlaying){
                    if (sceneList[sceneIndex].sentences.length -1 == sentenceIndex){
                        await new Promise(r => setTimeout(r, 3000));
                    }
                    handleNextStep()
                } 

            } else if (activeStep == 'PlayAudioPhraseToLearn') {
                const ptl = sceneList[sceneIndex].phraseToLearn[phraseToLearnIndex];
                for (const phrase of ptl) {
                    await playAudio({text: phrase.phraseE, lang: 'en', gender: 'female'});
                    await playAudio({text: phrase.explanation, lang: 'ja', gender: 'male'});
                }
                

                if (isAutoPlaying){
                    if (phraseToLearnIndex == sceneList[sceneIndex].phraseToLearn.length - 1){
                        await new Promise(r => setTimeout(r, 3000));
                    }
                    handleNextStep()
    
                }

            }
        }

        playAudioScene()

    },[activeStep, sentenceIndex, phraseToLearnIndex, isAutoPlaying])



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
        if (text.length > 250) {
            return "subtitle1"; // より小さいフォントサイズ
        } else {
            return "h6"; // 標準のフォントサイズ
        }
    };
    
    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ width: 800, height: 450, backgroundColor: 'white', padding: 3, pt: 2, border: 'solid', borderWidth: 0.5 }}>
                {activeStep === 'tableOfContents' && (
                    <>
                    <Grid container spacing={2}>
                        <Grid item xs={6}> {/* 左側のコンテンツエリア */}                    
                            <Avatar alt="Selected Speaker" src={selectedSpeaker.imageUrl} sx={{ width: 70, height: 70, mt: 3, mb: 5 }} />
                            <Typography variant="h5" sx={{color: '#364e96', padding: '0.5em 0', borderTop: 'solid 3px #364e96', borderBottom: 'solid 3px #364e96'}}>
                                {sceneList[0].movieTitle
                            }</Typography>
                        </Grid>
                        <Grid item xs={6}> {/* 右側の目次エリア */}
                            <Typography variant="h5" sx={{mt:5}}>Table of Contents</Typography>
                            <List>
                                {sceneList.map((scene, index) => (
                                    <ListItem key={index}>{index+1}.{scene.title}</ListItem>
                                ))}
                            </List>
                        </Grid>                    
                    </Grid>
                    </>
                )}

                {activeStep === 'title' && (
                    <Box sx={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                        <Typography color="primary" variant="h4" sx={{mt:3}}>{sceneIndex+1}.{sceneList[sceneIndex].title}</Typography>
                    </Box>
                )}

                {activeStep === 'playAudio' && (
                    <>
                    <Box>
                        <Typography sx={{mr: 3}} variant="h6" color="GrayText">{sceneIndex+1}.{sceneList[sceneIndex].title}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', animation: 'pulse 2s infinite' }}>
                            <VolumeUpIcon sx={{ mr: 1 }} /> {/* 音声アイコン */}
                            {/* <Typography>音声再生中...</Typography> */}
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
                        <Typography sx={{mr: 3}} variant="h6" color="GrayText">{sceneIndex+1}.{sceneList[sceneIndex].title}</Typography>
                    </Box>

                    <Box sx={{mt:1}}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={sceneList[sceneIndex].sentences[sentenceIndex].speakerAvatarImageUrl} sx={{width: 70, height: 70}}/>
                            <Typography variant="h6">{sceneList[sceneIndex].sentences[sentenceIndex].speakerName}</Typography>
                        </Box>

                        <Box sx={{ ml: 1, mt: 2 }}>
                            <Typography variant={adjustFontSize(sceneList[sceneIndex].sentences[sentenceIndex].sentenceE)}>
                                {sceneList[sceneIndex].sentences[sentenceIndex].sentenceE}
                            </Typography>
                            <Typography variant="body1" color="GrayText" sx={{mt:3}}>{sceneList[sceneIndex].sentences[sentenceIndex].sentenceJ}</Typography>
                        </Box>
                    </Box>
                    </>

                )}

                {activeStep === 'PlayAudioPhraseToLearn' && (
                    <>
                        <Box>
                            <Typography sx={{mr: 3}} variant="h6" color="GrayText">{sceneIndex+1}.{sceneList[sceneIndex].title}</Typography>
                        </Box>
                        {sceneList[sceneIndex].phraseToLearn[phraseToLearnIndex].map((ptl, index)=>(
                            <Box key={index}>
                                <Box sx={{display: 'flex', justifyContent: 'start', alignItems: 'center', mt: 2, mb: 2}}>
                                    <Typography variant="h6" sx={{ textDecoration: 'underline', textDecorationColor: 'yellow', backgroundColor: 'rgba(255, 255, 0, 0.3)' }}>{ptl?.phraseE}</Typography>：
                                    <Typography variant="h6">{ptl?.phraseJ}</Typography>
                                </Box>

                                <Box sx={{mb:1}}>
                                    <span style={{ backgroundColor: '#D3D3D3', padding: '4px', marginRight: '8px', fontSize: '0.8rem' }}>解説</span>                                
                                </Box>
                                <Box sx={{mb:1}}>
                                    <Typography variant="body1">{ptl?.explanation}</Typography>
                                </Box>
    
                                <Box sx={{mb:1}}>
                                    <span style={{ backgroundColor: '#D3D3D3', padding: '4px', marginRight: '8px', fontSize: '0.8rem' }}>元の文</span>                                
                                </Box>
                                <Box sx={{mb:1}}>
                                    <Typography variant="body1" color="GrayText">{ptl?.originalSentenceE}</Typography>
                                </Box>

                            </Box>                        
                        ))}
                    </>
                )}

                {activeStep === 'end' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}> {/* mb は margin-bottom の略で、要素間の間隔を開けます */}
                            <Typography variant="h5">この動画を見てくださり、本当にありがとうございます</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h5">チャンネル登録して応援していただけると嬉しいです</Typography>
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
                    <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handlePrevScene}>＜＜</Button>
                    <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handlePrevStep}>＜</Button>
                    <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handleNextStep}>＞</Button>
                    <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handleNextScene}>＞＞</Button>
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

export default DisplayAutoPlayScene;
