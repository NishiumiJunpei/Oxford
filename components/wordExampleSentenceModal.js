//wordExampleSentenceModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, useMediaQuery, useTheme,CircularProgress, Box,  Divider, Tooltip, IconButton } from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';


const WordExampleSentenceModal = ({ open, onClose, wordList, initialIndex, updateWordList }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [index, setIndex] = useState(initialIndex);
    const [isLoading, setIsLoading] = useState(false); // ローディング状態の管理

    useEffect(() => {
        setIndex(initialIndex);
    }, [initialIndex]);

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

    //将来のために残しているが、現在無効中
    const handleExampleSentenceGenerate = async () =>{
        setIsLoading(true); // ローディング開始
        try {
          const response = await axios.post('/api/word-master/createExampleSentenceByGPT', {
            wordListId: wordList[index].id, 
            english: wordList[index].english, 
            japanese: wordList[index].japanese
          });
      
          const data = response.data;
          const newWordData = {
            ...wordList[index],
            ...data,
          };
          updateWordList(newWordData);
      
          setIsLoading(false); // ローディング終了
        } catch (error) {
          console.error('Error generating example sentence:', error);
          setIsLoading(false); // ローディング終了
        }
      
    }

    const handlePlayPhrase = (englishWord) => {
        const url = `https://playphrase.me/#/search?q=${englishWord}`;
        window.open(url, 'playphraseWindow');
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

    
    useEffect(() =>{
        // キーボードイベントのハンドラを追加
        const handleKeyPress = (event) => {
            if (event.key === 'ArrowLeft') {
                handlePrev();
            } else if (event.key === 'ArrowRight') {
                handleNext();
            } else if (event.key === 'Space' || event.key === ' ') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        // コンポーネントのクリーンアップ時にイベントリスナーを削除
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };

    },[handlePrev, handleNext]);

      

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
            <DialogContent>
                <Typography variant="subtitle1" style={{ marginTop: 20 }}>{word?.japanese}</Typography>

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
                {word?.imageUrl && (
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
            <DialogActions style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ width: '100%', textAlign: 'center', marginBottom: 5 }}> 

                {isLoading ? (
                    <CircularProgress /> // ローディングインジケーターの表示
                ) : (
                    <div>
                        {/* <Button 
                            onClick={handleExampleSentenceGenerate} 
                            variant="outlined" 
                            disabled={isLoading}
                            style={{ margin: 5, padding: 5, minWidth: 90 }} // ボタンのスタイルを調整
                            >
                            例文生成
                        </Button>                 */}
                    </div>
                )}
                
                <Button 
                    onClick={() => handlePlayPhrase(word.english)} 
                    variant="outlined" 
                    disabled={isLoading}
                    style={{ margin: 5, padding: 5, minWidth: 90 }} // 同様にスタイル調整
                >
                    PlayPhrase.me
                </Button>
                </div>
                <div style={{ width: '100%', textAlign: 'center' }}> 
                {/* 前へ、次へ、閉じるのボタンをここに配置 */}
                    <Button 
                    onClick={handlePrev} 
                    disabled={(index <= 0) || isLoading}
                    style={{ margin: 5, padding: 5, minWidth: 90 }}
                    >
                    前へ
                    </Button>
                    <Button 
                    onClick={handleNext} 
                    disabled={(index >= wordList.length - 1) || isLoading}
                    style={{ margin: 5, padding: 5, minWidth: 90 }}
                    >
                    次へ
                    </Button>
                    <Button 
                    onClick={onClose}
                    style={{ margin: 5, padding: 5, minWidth: 90 }}
                    >
                    閉じる
                    </Button>
            </div>
            </DialogActions>
        </Dialog>
    );
};

export default WordExampleSentenceModal;
