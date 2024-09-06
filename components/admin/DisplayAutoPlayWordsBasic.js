import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { playAudio, stopAudio } from '@/utils/audioPlayer';

const DisplayAutoPlayWordsBasic = ({ open, onClose, wordList, selectedTheme }) => {
    const [index, setIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [showDetails, setShowDetails] = useState(false); // 新しく追加
    const [isCancelled, setIsCancelled] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        const autoPlaySequence = async () => {
            let currentIndex = index;
            while (!isCancelled && currentIndex < wordList.length && isAutoPlaying) {
                // 英単語を再生するまで詳細情報を非表示
                setShowDetails(false);
                await new Promise(r => setTimeout(r, 1000)); // 次の音声再生までの間隔

                // 英単語の音声再生
                await playAudio({ text: wordList[currentIndex].english });
                if (!isAutoPlaying || isCancelled) break;

                await new Promise(r => setTimeout(r, 1500)); // 次の音声再生までの間隔


                // 音声再生が終わったら詳細情報を表示
                setShowDetails(true);

                // 例文の再生
                await playAudio({ text: wordList[currentIndex].exampleSentenceE });
                if (!isAutoPlaying || isCancelled) break;

                // 例文の再生
                await playAudio({ text: wordList[currentIndex].exampleSentenceE });
                if (!isAutoPlaying || isCancelled) break;


                // 次の単語に進む
                currentIndex++;
                if (currentIndex < wordList.length) {
                    setIndex(currentIndex);
                } else {
                    setIsAutoPlaying(false); // リストの最後に到達したら停止
                    break;
                }

                await new Promise(r => setTimeout(r, 1000)); // 次の音声再生までの間隔


            }
        };

        if (isAutoPlaying) {
            autoPlaySequence();
        }

        return () => {
            isCancelled = true;
        };
    }, [isAutoPlaying, index, wordList]);

    const handleAutoPlayToggle = () => {
        if (!isAutoPlaying) {
            setIsAutoPlaying(true);
        } else {
            stopAudio();
            setIsAutoPlaying(false);
        }
    };

    const handleNext = () => {
        if (index < wordList.length - 1) {
            setIndex(index + 1);
            setShowDetails(false); // 新しい単語に進んだら詳細を非表示
        }
    };

    const handlePrev = () => {
        if (index > 0) {
            setIndex(index - 1);
            setShowDetails(false); // 新しい単語に進んだら詳細を非表示
        }
    };

    const word = wordList[index];

    return (
        <Box sx={{ p: 2 }}>
            <Typography>{selectedTheme.name}</Typography>
            <Typography>{index + 1} / {wordList.length}</Typography>

            <Box sx={{ width: 1200, height: 675, backgroundColor: '#F8EDED', padding: 3, pt: 2, border: 'solid', borderWidth: 0.5 }}>
                <Box>
                    <Typography color="GrayText">{index+1} / {wordList.length}</Typography>
                </Box>
                <Grid container spacing={2} sx={{ height: '100%' }}>
                {showDetails ? (
                    <>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h1" sx={{ fontSize: 70, color: '#B43F3F', mt: 2, mb: 2 }}>
                                {word?.english}
                            </Typography>
                            <Typography variant="h6" sx={{ fontSize: 30, color: '#173B45', mb: 3 }}>
                                {word?.japanese}
                            </Typography>
                            <Typography variant="h4" sx={{ color: '#173B45', mt: 3, mb: 3 }}>
                                {word?.exampleSentenceE}
                            </Typography>
                            <Typography variant="h5" sx={{ color: '#173B45', mt: 1 }}>
                                {word?.exampleSentenceJ}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {word?.imageUrl ? (
                                <>
                                    <img
                                        src={word.imageUrl}
                                        alt={word.english}
                                        style={{ marginTop: 20, maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    />
                                    <Typography variant="body2" sx={{ fontSize: 18, color: '#173B45', mb: 2 }}>
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
                    </>
                ) : (
                    <Grid
                        item
                        xs={12}
                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
                    >
                        <Typography variant="h1" sx={{ fontSize: 120, color: '#B43F3F', textAlign: 'center' }}>
                            {word?.english}
                        </Typography>
                    </Grid>
                )}
                </Grid>

            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={handleAutoPlayToggle}>
                    自動再生
                </Button>
                <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handleAutoPlayToggle}>
                    停止
                </Button>
                <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={() => setIndex(0)}>
                    リセット
                </Button>
                <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handlePrev}>
                    ←
                </Button>
                <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handleNext}>
                    ⇨
                </Button>
            </Box>
        </Box>
    );
};

export default DisplayAutoPlayWordsBasic;
