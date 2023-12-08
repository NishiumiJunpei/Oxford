//wordExampleSentenceModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, useMediaQuery, useTheme,CircularProgress } from '@mui/material';

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

    const handleExampleSentenceGenerate = async () =>{
        setIsLoading(true); // ローディング開始
        try {
          const response = await axios.post('/api/word-master/createExampleSentenceByGPT', {
            wordListByThemeId: wordList[index].id, 
            english: wordList[index].english, 
            japanese: wordList[index].japanese
          });
      
          const data = response.data;
          const newWordData = {
            ...wordList[index],
            exampleSentence: data.exampleSentence,
            imageUrl: data.imageUrl
          };
          updateWordList(index, newWordData);
      
          setIsLoading(false); // ローディング終了
        } catch (error) {
          console.error('Error generating example sentence:', error);
          setIsLoading(false); // ローディング終了
        }
      
    }

    const word = wordList[index];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={fullScreen}
            PaperProps={{
                sx: {
                    width: '80%',
                    height: '80%',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    overflow: 'auto'
                }
            }}
        >
            <DialogTitle>{word?.english}</DialogTitle>
            <DialogContent>
                <Typography variant="subtitle1" style={{ marginTop: 20 }}>{word?.japanese}</Typography>
                <Typography className="preformatted-text" style={{ marginTop: 20 }}>
                    {word?.exampleSentence}
                </Typography>
                {word?.imageUrl && (
                    <img 
                        src={word.imageUrl} 
                        alt={word.english} 
                        style={{ marginTop: 20, maxWidth: '100%', maxHeight: '50%', objectFit: 'contain' }} 
                    />
                )}


            </DialogContent>
            <DialogActions>
                {isLoading ? (
                    <CircularProgress /> // ローディングインジケーターの表示
                ) : (
                    <Button onClick={handleExampleSentenceGenerate} variante="outlined" disabled={isLoading}>例文生成</Button>
                )}
                <Button onClick={handlePrev} disabled={index <= 0}>前へ</Button>
                <Button onClick={handleNext} disabled={index >= wordList.length - 1}>次へ</Button>
                <Button onClick={onClose}>閉じる</Button>
            </DialogActions>
        </Dialog>
    );
};

export default WordExampleSentenceModal;
