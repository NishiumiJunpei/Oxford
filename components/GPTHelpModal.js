// GPTヘルプモーダルコンポーネント（別ファイルで作成）
import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, CircularProgress, useMediaQuery, useTheme } from '@mui/material';

const GPTHelpModal = ({ open, onClose, onSave, onGenerate, englishWord, japaneseWord }) => {
      const theme = useTheme();
      const fullScreen = useMediaQuery(theme.breakpoints.down('md')); // モバイル端末など小さい画面用
      const [exampleSentence, setExampleSentence] = useState('');
      const [isLoading, setIsLoading] = useState(false); // ローディング状態の管理

    const handleGenerate = async () => {
        setIsLoading(true); // ローディング開始
        try {
          const response = await fetch('/api/word-master/genExampleSentenceByGPT');
          const data = await response.json();
          setExampleSentence(data.exampleSentence);
          setIsLoading(false); // ローディング終了
        } catch (error) {
          console.error('Error generating example sentence:', error);
          setIsLoading(false); // ローディング終了
        }
      };
        
      useEffect(() => {
        if (open) {
          setExampleSentence(''); // モーダルが開かれるたびに例文をリセット
          setIsLoading(false); // モーダルが開かれるたびにリセット
        }
      }, [open]);
    
    return (
    <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen} // モバイル端末などの小さい画面で全画面表示
        PaperProps={{
          sx: {
            width: '80%', // 幅を80%に設定
            height: '80%', // 高さを80%に設定
            maxWidth: '100%', // 最大幅を100%に設定
            maxHeight: '100%', // 最大高さを100%に設定
            overflow: 'auto' // コンテンツがオーバーフローした場合はスクロール可能
          }
        }}
      >
        <DialogTitle>GPTヘルプ</DialogTitle>
      <DialogContent>
          <Typography variant="h6">{englishWord}</Typography>
        <Typography variant="subtitle1">{japaneseWord}</Typography>
        {isLoading ? (
          <CircularProgress /> // ローディングインジケーターの表示
        ) : (
          <Button variant="contained" onClick={handleGenerate} disabled={isLoading || exampleSentence}>
            例文生成
          </Button>
        )}
        {exampleSentence && (
          <Typography style={{ marginTop: 20 }}>{exampleSentence}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={onSave} disabled={!exampleSentence}>保存</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GPTHelpModal;
