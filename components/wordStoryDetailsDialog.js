import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemText, useTheme } from '@mui/material';
import SubTitleTypography from './subTitleTypography';

const WordStoryDetailsDialog = ({ open, onClose, onDelete, selectedStory }) => {
  const theme = useTheme()
  if (!selectedStory) return null;

  const handleDeleteClick = async () => {
    if (window.confirm('本当に削除してもよろしいですか？')) {
      await onDelete(selectedStory.id);
      onClose(); // ダイアログを閉じる
    }
  };

  // ストーリーコンテンツをパースして、必要な部分を太字と青色で表示する
  const renderFormattedStoryContent = (storyContent) => {
    const regex = /\*(.*?)\*/g;
    const parts = [];
    let lastEnd = 0;

    storyContent.replace(regex, (match, p1, offset) => {
      parts.push(storyContent.substring(lastEnd, offset));
      parts.push(<span style={{ fontWeight: 'bold', color: theme.palette.primary.main }}>{p1}</span>);
      lastEnd = offset + match.length;
    });

    parts.push(storyContent.substring(lastEnd));

    return parts;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md'>
      <DialogTitle>{selectedStory.storyTitle}</DialogTitle>
      <DialogContent>
        <SubTitleTypography text={"ストーリー"}/>
        <Typography variant="body1" className="preformatted-text" sx={{mb: 5}}>
          {renderFormattedStoryContent(selectedStory.storyContent)}
        </Typography>

        {selectedStory?.words?.length > 0 && (
          <>
            <SubTitleTypography text={"使用された単語"}/>
            <List>
              {selectedStory?.words?.map((word, index) => (
                <ListItem key={index}>
                  <Typography variant="body1" className="preformatted-text">{word}</Typography>
                </ListItem>
              ))}
            </List>
          </>
        )}

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
