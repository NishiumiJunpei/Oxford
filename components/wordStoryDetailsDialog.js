import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import SubTitleTypography from './subTitleTypography';

const WordStoryDetailsDialog = ({ open, onClose, onDelete, selectedStory }) => {
  if (!selectedStory) return null;

  const handleDeleteClick = async () => {
    if (window.confirm('本当に削除してもよろしいですか？')) {
      await onDelete(selectedStory.id);
      onClose(); // ダイアログを閉じる
    }
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth='md'>
      <DialogTitle>{selectedStory.storyTitle}</DialogTitle>
      <DialogContent>
        <SubTitleTypography text={"ストーリー"}/>
        <Typography variant="body1" className="preformatted-text" sx={{mb: 5}}>{selectedStory.storyContent}</Typography>


        <SubTitleTypography text={"使用された単語"}/>
        <List>
          {selectedStory.words.map((word, index) => (
            <ListItem key={index}>
              <Typography variant="body1" className="preformatted-text">{word}</Typography>
            </ListItem>
          ))}
        </List>

        {/* 画像のURLがある場合は画像を表示 */}
        {selectedStory.imageUrl && (
          <div style={{ textAlign: 'center' }}>
            <img src={selectedStory.imageUrl} alt="Story Image" style={{ maxWidth: '100%', maxHeight: '300px' }} />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
        <Button onClick={handleDeleteClick} disabled={!selectedStory.id}>削除</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WordStoryDetailsDialog;
