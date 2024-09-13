// components/VideoDialogButton.js

import React, { useState } from 'react';
import {
  Button, Dialog, DialogContent, DialogTitle,
  IconButton, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';

const VideoDialogButton = ({
  videoUrl,
  videoTitle,
  buttonIcon,
  buttonText,
  buttonProps,
  messageType
}) => {
  const [open, setOpen] = useState(false);

  // ダイアログを開く関数
  const handleOpen = () => {
    setOpen(true);
  };

  // ダイアログを閉じる関数
  const handleClose = () => {
    setOpen(false);
  };

  // デフォルトのボタンアイコンを設定
  const defaultButtonIcon = buttonIcon || <OndemandVideoIcon />;

  // メッセージの設定
  let message = '';
  if (messageType === 1) {
    message = 'この動画はAI音声を使用しているため、一部の発音が正確でない場合があります。';
  }

  return (
    <>
      <Button onClick={handleOpen} {...buttonProps}>
        {defaultButtonIcon}
        {buttonText}
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {videoTitle}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {videoUrl ? (
            <>
              <video controls width="100%">
                <source src={videoUrl} type="video/mp4" />
                お使いのブラウザは動画タグをサポートしていません。
              </video>
              {message && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  {message}
                </Typography>
              )}
            </>
          ) : (
            <Typography>動画が利用できません</Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoDialogButton;
