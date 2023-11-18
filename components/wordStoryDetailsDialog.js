import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemText } from '@mui/material';

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
        {/* 各プロパティをリストで表示 */}
        <List>
          <ListItem>
            <ListItemText primary="テーマ" secondary={selectedStory.theme} />
          </ListItem>
          <ListItem>
            <ListItemText primary="ブロック" secondary={selectedStory.block} />
          </ListItem>
          <ListItem>
            <ListItemText primary="ストーリー内容" secondary={selectedStory.storyContent} />
          </ListItem>
          <ListItem>
            <ListItemText primary="長さのカテゴリー" secondary={selectedStory.lengthCategory} />
          </ListItem>
          <ListItem>
            <ListItemText primary="ジャンル" secondary={selectedStory.genre} />
          </ListItem>
          <ListItem>
            <ListItemText primary="登場キャラクター" secondary={selectedStory.characters} />
          </ListItem>
          <ListItem>
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle1">使用された単語</Typography>
              <List>
                {selectedStory.words.map((word, index) => (
                  <ListItem key={index}>
                    <Typography variant="body2">{word}</Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          </ListItem>
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
