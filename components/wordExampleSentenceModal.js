import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, useMediaQuery, useTheme } from '@mui/material';

const WordExampleSentenceModal = ({ open, onClose, wordList, initialIndex }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [index, setIndex] = useState(initialIndex);

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
            </DialogContent>
            <DialogActions>
                <Button onClick={handlePrev} disabled={index <= 0}>前へ</Button>
                <Button onClick={handleNext} disabled={index >= wordList.length - 1}>次へ</Button>
                <Button onClick={onClose}>閉じる</Button>
            </DialogActions>
        </Dialog>
    );
};

export default WordExampleSentenceModal;
