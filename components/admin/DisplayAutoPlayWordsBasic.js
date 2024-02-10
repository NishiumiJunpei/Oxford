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

const DisplayAutoPlayWordsBasic = ({ open, onClose, wordList }) => {
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
      


    const handleAutoPlayStart = () => {
        setIsAutoPlaying(true);
    };

    const handleAutoPlayStop = () => {
        setIsAutoPlaying(false);
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
                // await new Promise(r => setTimeout(r, 500));
                // if (!autoPlaying) break;
                await playAudio(wordList[currentIndex].japanese, 'ja');
                // await new Promise(r => setTimeout(r, 500));
                // if (!autoPlaying) break;
                await playAudio(wordList[currentIndex].exampleSentenceE);
                // await new Promise(r => setTimeout(r, 500));
                // if (!autoPlaying) break;
                await playAudio(wordList[currentIndex].exampleSentenceJ, 'ja');
                // await new Promise(r => setTimeout(r, 500));
                // if (!autoPlaying) break;
                        

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
          autoPlaySequence();
        }
      
        return () => {
          isCancelled = true;
        };
      }, [isAutoPlaying, index, wordList]);
      


      const handleChangeAccordion = (panel) => (event, isExpanded) => {
        setAccordionExpanded(isExpanded ? panel : false);
      };
    

      

    const word = wordList[index];

    return (
        <Box sx={{ p: 2, }}>
            <Typography>{index+1} / {wordList.length}</Typography>
    
            {/* <Box sx={{width: 1200, height: 675, backgroundImage: 'url("/images/backgroundForAutoPlay1.webp")', backgroundSize:'cover', padding: 3, pt: 6}}> */}
            <Box sx={{width: 800, height: 450, backgroundColor: 'white', padding: 3, pt: 2, border: 'solid', borderWidth: 0.5}}>
                <Grid container spacing={2} sx={{display: 'flex', justifyContent: 'center'}}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h2" sx={{mt: 2, mb: 2}}>
                            {word?.english}
                        </Typography>
                        {/* <Typography variant="body1" style={{ marginTop: 5, display: 'flex', alignItems: 'center' }}>
                            <span style={{ backgroundColor: '#D3D3D3', padding: '4px', marginRight: '8px' }}>意味</span>
                        </Typography> */}
                        <Typography variant="body1" sx={{fontSize: '2rem'}}>
                            {word?.japanese}
                        </Typography>

                        <Typography variant="body2" style={{ marginTop: 40, display: 'flex', alignItems: 'center' }}>
                            <span style={{ backgroundColor: '#D3D3D3', padding: '4px', marginRight: '8px' }}>例文</span>
                        </Typography>

                        <Typography variant="body1" sx={{fontSize: '1.2rem'}}>
                            {word?.exampleSentenceE}
                        </Typography>
                        <Typography variant="body1" sx={{fontSize: '1.2rem'}}>
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
                                <Typography variant="body2" sx={{mb: 2}}>
                                    Created by GPT & DALLE3 / susu English
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
                <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={handleAutoPlayStart}>自動再生</Button>
                <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handleAutoPlayStop}>停止</Button>
                <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={()=>setIndex(0)}>リセット</Button>
                <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handlePrev}>←</Button>
                <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handleNext}>⇨</Button>
            </Box>

        </Box>
    );
};

export default DisplayAutoPlayWordsBasic;
