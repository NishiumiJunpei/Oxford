// GPTヘルプモーダルコンポーネント（別ファイルで作成）
import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, CircularProgress, useMediaQuery, useTheme } from '@mui/material';

const GPTHelpModal = ({ open, onClose, onSave, onGenerate, english, japanese, wordListByThemeId }) => {
      const theme = useTheme();
      const fullScreen = useMediaQuery(theme.breakpoints.down('md')); // モバイル端末など小さい画面用
      const [exampleSentence, setExampleSentence] = useState('');
      const [imageUrl, setImageUrl] = useState(null);
      const [isLoading, setIsLoading] = useState(false); // ローディング状態の管理

    const handleGenerate = async () => {
        setIsLoading(true); // ローディング開始
        try {
          const response = await fetch('/api/word-master/createExampleSentenceByGPT', {
            method: 'POST', // HTTP メソッドを POST に設定
            headers: {
              'Content-Type': 'application/json', // コンテントタイプを JSON に設定
            },
            body: JSON.stringify({ wordListByThemeId, english, japanese }) // ボディに english と japanese を JSON 形式で含める
          });
        const data = await response.json();
        setExampleSentence(data.exampleSentence);
        setImageUrl(data.imageUrl);
        onSave(data.exampleSentence, data.imageUrl); // 親コンポーネントの保存処理を呼び出す
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
    

      const handleSave = async () => {
        setIsLoading(true);
        try {
          await fetch('/api/word-master/saveExampleSentence', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ wordListByThemeId, exampleSentence })
          });
          onSave(exampleSentence, imageUrl); // 親コンポーネントの保存処理を呼び出す
          setIsLoading(false);
        } catch (error) {
          console.error('Error saving example sentence:', error);
          setIsLoading(false);
        }
      };
    

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
          <Typography variant="h6">{english}</Typography>
        <Typography variant="subtitle1">{japanese}</Typography>
        {isLoading ? (
          <CircularProgress /> // ローディングインジケーターの表示
        ) : (
          <Button variant="contained" onClick={handleGenerate} disabled={isLoading || exampleSentence}>
            例文生成
          </Button>
        )}
      {exampleSentence && (
        <>
          <Typography className="preformatted-text" style={{ marginTop: 20 }}>
            {exampleSentence}
          </Typography>
          {imageUrl && (
            <img src={imageUrl} alt="例文の画像" style={{ marginTop: 20, maxWidth: '100%', maxHeight: '50%', objectFit: 'contain' }}  />
          )}
        </>
      )}

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
        {/* <Button onClick={handleSave} disabled={!exampleSentence}>保存</Button> */}
      </DialogActions>
    </Dialog>
  );
};

export default GPTHelpModal;
