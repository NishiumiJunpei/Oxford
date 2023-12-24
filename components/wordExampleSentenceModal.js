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
            wordListId: wordList[index].id, 
            english: wordList[index].english, 
            japanese: wordList[index].japanese
          });
      
          const data = response.data;
          const newWordData = {
            ...wordList[index],
            exampleSentence: data.exampleSentence,
            imageUrl: data.imageUrl
          };
          updateWordList(newWordData);
      
          setIsLoading(false); // ローディング終了
        } catch (error) {
          console.error('Error generating example sentence:', error);
          setIsLoading(false); // ローディング終了
        }
      
    }

    const handleSearch = (englishWord) => {
        // const url = `https://www.google.com/search?tbm=isch&q=${englishWord}`;
        const url = `https://translate.google.com/?sl=en&tl=ja&text=${englishWord}&op=translate&hl=ja`;
        window.open(url, '_blank');
      };    
      

      const word = wordList[index];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={fullScreen}
            PaperProps={{
                sx: {
                    width: '100%',
                    height: '90%',
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
            <DialogActions style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ width: '100%', textAlign: 'center', marginBottom: 5 }}> 

                {isLoading ? (
                    <CircularProgress /> // ローディングインジケーターの表示
                ) : (
                    <Button 
                    onClick={handleExampleSentenceGenerate} 
                    variant="outlined" 
                    disabled={isLoading}
                    style={{ margin: 5, padding: 5, minWidth: 90 }} // ここでボタンのスタイルを調整
                  >
                    例文生成
                </Button>                
                )}
                <Button 
                    onClick={() => handleSearch(word.english)} 
                    variant="outlined" 
                    disabled={isLoading}
                    style={{ margin: 5, padding: 5, minWidth: 90 }} // 同様にスタイル調整
                >
                    Google翻訳
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
