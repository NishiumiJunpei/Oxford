//wordExampleSentenceModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, useMediaQuery, useTheme,CircularProgress, Box,  Divider, Tooltip, IconButton } from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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


    useEffect(() =>{
        // キーボードイベントのハンドラを追加
        const handleKeyPress = (event) => {
            if (event.key === 'ArrowLeft') {
                handlePrev();
            } else if (event.key === 'ArrowRight') {
                handleNext();
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
            <DialogTitle>{word?.english}</DialogTitle>
            <DialogContent>
                <Typography variant="subtitle1" style={{ marginTop: 20 }}>{word?.japanese}</Typography>
                <Typography className="preformatted-text" style={{ marginTop: 20 }}>
                    {word?.exampleSentence}
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
