//DisplayAutoPlayWordsBasic.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, useMediaQuery, Link,
    useTheme,CircularProgress, Box,  Divider, Tooltip, IconButton, Tabs, Tab, Paper, TextField, Grid,
    Accordion, AccordionActions, AccordionSummary, AccordionDetails } from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { playAudio, stopAudio, pauseAudio } from '@/utils/audioPlayer';
import { playAudioMP3, stopAudioMP3 } from '@/utils/audioPlayer';


const DisplayAutoPlayWordsExpScript = ({ open, onClose, wordList, selectedTheme }) => {
    const router = useRouter();
    const theme = useTheme();
    const [index, setIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [accordionExpanded, setAccordionExpanded] = useState(false);


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


    const handleAutoPlayToggle = () => {
        if (!isAutoPlaying) {
            setIsAutoPlaying(true);
            // ここで playAudio を呼び出す場合は、必要なパラメータを渡して再生を開始します。
            // 例: playAudio('Your text here', 'en').then(() => setIsAutoPlaying(false));
        } else {
            stopAudio(); // 再生中のオーディオを停止し、currentTimeを0にリセット
            stopAudioMP3()
            setIsAutoPlaying(false); // 自動再生を停止
        }
    };

    useEffect(() => {
        let isCancelled = false;
    
        const autoPlaySequence = async () => {
            let currentIndex = index;        

            while (!isCancelled && currentIndex < wordList.length && isAutoPlaying) {

                await playAudio({text: wordList[currentIndex].english});
                if (!isAutoPlaying || isCancelled) break; // 同上


                // await playAudio({text: wordList[currentIndex].exampleSentenceE});
                // if (!isAutoPlaying || isCancelled) break; // 同上

                await playAudioMP3(wordList[currentIndex].explanationAudioUrl);
                if (!isAutoPlaying || isCancelled) break; // 同上

                await new Promise(r => setTimeout(r, 1000)); // 次の音声再生までの間隔


                currentIndex++;
                if (currentIndex < wordList.length) {
                    setIndex(currentIndex); // 次の単語にインデックスを更新
                } else {
                    setIsAutoPlaying(false); // 単語リストの最後に到達したら自動再生を停止
                    break;
                }
                await new Promise(r => setTimeout(r, 2000)); // 次の音声再生までの間隔
            }
        };
          
        if (isAutoPlaying) {
            autoPlaySequence();
        }
      
        return () => {
            isCancelled = true; // コンポーネントがアンマウントされるか、依存配列に含まれる値が変更された場合にキャンセルフラグをtrueに設定
        };
    }, [isAutoPlaying, index, wordList]); // 依存配列に`index`と`wordList`を追加

          


    const handleAutoPlayStart = () => {
        setIsAutoPlaying(true);
    };

    const handleAutoPlayStop = () => {
        setIsAutoPlaying(false);
    };

    const handleChangeAccordion = (panel) => (event, isExpanded) => {
    setAccordionExpanded(isExpanded ? panel : false);
    };
    

      

    const word = wordList[index];


    const colorPallete = {
        bg: '#D0E7D2',
        main: '#618264',
        text: '#79AC78',
    }

    return (
        <Box sx={{ p: 2, }}>
            <Typography>{selectedTheme.name}</Typography>
            <Typography>{index+1} / {wordList.length}</Typography>
    
            {/* <Box sx={{width: 1200, height: 675, backgroundImage: 'url("/images/backgroundForAutoPlay1.webp")', backgroundSize:'cover', padding: 3, pt: 6}}> */}
            <Box sx={{width: 1200, height: 675, backgroundColor: colorPallete.bg, padding: 3, pt: 2, border: 'solid', borderWidth: 0.5}}>
                <Box>
                    <Typography color="GrayText">{index+1} / {wordList.length}</Typography>
                </Box>
                <Grid container spacing={2} sx={{display: 'flex', justifyContent: 'center'}}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h1" sx={{fontSize: 80, color: colorPallete.main, mt: 2, mb: 2}}>
                            {word?.english}
                        </Typography>
                        {/* <Typography variant="body1" style={{ marginTop: 5, display: 'flex', alignItems: 'center' }}>
                            <span style={{ backgroundColor: '#D3D3D3', padding: '4px', marginRight: '8px' }}>意味</span>
                        </Typography> */}
                        <Typography variant="h6" sx={{fontSize: 50, color:colorPallete.main, mb: 3}}>
                            {word?.japanese}
                        </Typography>

                        {/* <Typography variant="body2" style={{ marginTop: 40, display: 'flex', alignItems: 'center' }}>
                            <span style={{ backgroundColor: '#D3D3D3', padding: '4px', marginRight: '8px' }}>例文</span>
                        </Typography> */}

                        <Typography variant="h4" sx={{color:colorPallete.text, mt: 3, mb: 3}}>
                            {word?.exampleSentenceE}
                        </Typography>
                        <Typography variant="h5" sx={{color:colorPallete.text, mt:1}}>
                            {word?.exampleSentenceJ}
                        </Typography>

                        {/* <Typography variant="body1" style={{ marginTop: 20 }}>
                            <span style={{ backgroundColor: '#D3D3D3', padding: '4px' }}>類語</span>
                        </Typography>
                        <Typography variant="body1" sx={{fontSize: '0.8rem'}}>
                            {word?.synonyms}
                        </Typography> */}

                        {/* {word?.usage && (
                        <>

                            <Box sx={{mb:1}}>
                                <Typography variant="body2" style={{ marginTop: 20, mb:1}}>
                                    <span style={{ backgroundColor: '#D3D3D3', padding: '4px' }}>単語利用シーン</span>
                                </Typography>
                            </Box>
                            <Box sx={{mb:3}}>
                                <Typography variant="body1" sx={{fontWeight: 600, fontSize: '0.8rem'}}>{1}. {word.usage[0].situation}</Typography>
                                <Typography variant="body1">{word.usage[0].exampleE}</Typography>
                                <Typography variant="body1">{word.usage[0].exampleJ}</Typography>
                            </Box>
                            <Box sx={{mb:1}}>
                                <Typography variant="body1" sx={{fontWeight: 600, fontSize: '0.8rem'}}>{2}. {word.usage[1].situation}</Typography>
                                <Typography variant="body1">{word.usage[1].exampleE}</Typography>
                                <Typography variant="body1">{word.usage[1].exampleJ}</Typography>
                            </Box>
                        </>
                        )} */}


                    </Grid>
                    <Grid item xs={12} md={6}>
                        {word?.imageUrl ? (
                            <>
                                <img 
                                    src={word.imageUrl} 
                                    alt={word.english} 
                                    style={{ marginTop: 20, maxWidth: '100%', maxHeight: '100%%', objectFit: 'contain' }} 
                                />
                                <Typography variant="body2" sx={{fontSize: 18, color:colorPallete.text, mb: 2}}>
                                    Created by GPT & DALLE3 / susuEnglish
                                </Typography>
                            </>
                        ) : (
                            <div style={{ marginTop: 20, width: '100%', height: '100%', backgroundColor: '#d3d3d3', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Typography variant="body1">
                                    画像準備中
                                </Typography>
                            </div>
                        )}
                        
                    </Grid>

                </Grid>

            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={handleAutoPlayToggle}>自動再生</Button>
                <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handleAutoPlayToggle}>停止</Button>
                <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={()=>setIndex(0)}>リセット</Button>
                <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handlePrev}>←</Button>
                <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handleNext}>⇨</Button>
            </Box>

        </Box>
    );
};

export default DisplayAutoPlayWordsExpScript;
