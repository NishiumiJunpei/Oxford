import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button,useMediaQuery, useTheme } from '@mui/material';

const WordExampleSentenceModal = ({ open, onClose, word }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md')); // モバイル端末など小さい画面用

    // モバイル端末などの画面サイズに応じた対応が必要な場合はここで useMediaQuery を使用
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
      <DialogTitle>{word?.english}</DialogTitle>
      <DialogContent>
        {/* ここにコンテンツを配置 */}
        {/* <Typography variant="h6">{word?.english}</Typography> */}
        <Typography variant="subtitle1" style={{ marginTop: 20 }}>{word?.japanese}</Typography>
        <Typography className="preformatted-text" style={{ marginTop: 20 }}>
                {word?.exampleSentence}
        </Typography>


        {/* 画像を表示する場合はここに追加 */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WordExampleSentenceModal;
