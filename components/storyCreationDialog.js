import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogActions, DialogContent, DialogTitle, 
  Button, Chip, FormControl, InputLabel, Select, MenuItem, 
  Box, Typography, CircularProgress, Divider 
} from '@mui/material';

const StoryCreationDialog = ({ open, onClose, onSave, blockList, showAllinBlockList, theme }) => {
    
    const [selectedBlock, setSelectedBlock] = useState('all');
    const [length, setLength] = useState('');
    const [genre, setGenre] = useState('');
    const [characters, setCharacters] = useState('');
    const [loading, setLoading] = useState(false);
    const [storyData, setStoryData] = useState(null);

    useEffect(() => {
      if (open) {
        setSelectedBlock('all');
        setLength('');
        setGenre('');
        setCharacters('');
        setLoading(false);
        setStoryData(null);
      }
    }, [open]);
    
    const handleBlockChange = (event) => {
        setSelectedBlock(event.target.value);
    };

    const handleLengthChange = (selectedLength) => {
        setLength(selectedLength);
    };

    const handleGenreChange = (selectedGenre) => {
        setGenre(selectedGenre);
    };

    const handleCharactersChange = (selectedFormat) => {
        setCharacters(selectedFormat);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setStoryData(null)
        const storyRequestData = {
        theme,
        block: selectedBlock === 'all' ? 999 : selectedBlock,
        length,
        genre,
        characters,
        };

        try {
        const response = await fetch('/api/word-master/createWordStoryByGPT', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(storyRequestData),
        });

        if (!response.ok) {
            throw new Error('API call failed');
        }

        const responseData = await response.json();
        setStoryData(responseData);
        setLoading(false);
        } catch (error) {
        console.error('Failed to create story:', error);
        setLoading(false);
        }
    };

    const handleSave = async () => {
        // ここで保存処理を行います
        try {
          const saveResponse = await fetch('/api/word-master/saveWordStoryByGPT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    theme, 
                    block: selectedBlock === 'all' ? 999 : selectedBlock, 
                    length, 
                    genre, 
                    characters, 
                    storyData
                }),
            });

            if (!saveResponse.ok) {
                throw new Error('Save API call failed');
            }

            // 親コンポーネントの保存処理を呼び出す
            const savedStory = {
                theme,
                block: selectedBlock === 'all' ? 999 : selectedBlock, 
                length, 
                genre, 
                characters, 
                storyContent: storyData.story,
                words: storyData.words.map(word => `${word.english} (${word.japanese})`),
                imageUrl: ''
              }
            onSave(savedStory);
            onClose();
        } catch (error) {
            console.error('Failed to save story:', error);
        }
    };


    const isSubmitDisabled = !length || !genre || !characters;
    
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>ストーリー作成</DialogTitle>
        <DialogContent>
          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="subtitle1" gutterBottom>対象ブロック</Typography>
            <FormControl fullWidth>
              <InputLabel id="block-select-label">ブロック選択</InputLabel>
              <Select
                labelId="block-select-label"
                id="block-select"
                value={selectedBlock}
                label="ブロック選択"
                onChange={handleBlockChange}
              >
                {showAllinBlockList && (
                  <MenuItem value={'all'}>All</MenuItem>
                )}
                {blockList.map((item, index) => (
                  <MenuItem key={index} value={item.block}>{item.block} ({item.progress || 0}%)</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
  
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="subtitle1" gutterBottom>ストーリーの長さ</Typography>
              {['Short', 'Medium', 'Long'].map((option) => (
                <Chip
                  key={option}
                  label={option}
                  onClick={() => handleLengthChange(option)}
                  color={length === option ? 'primary' : 'default'}
                  sx={{ marginRight: 1 }}
                />
              ))}
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="subtitle1" gutterBottom>ジャンル</Typography>
              {['フィクション', 'ビジネス', 'コメディ', 'ミステリー'].map((option) => (
                <Chip
                  key={option}
                  label={option}
                  onClick={() => handleGenreChange(option)}
                  color={genre === option ? 'primary' : 'default'}
                  sx={{ marginRight: 1 }}
                />
              ))}
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="subtitle1" gutterBottom>登場人物</Typography>
              {['指定なし', '先生', '宇宙人', 'おばけ', 'うんち'].map((option) => (
                <Chip
                  key={option}
                  label={option}
                  onClick={() => handleCharactersChange(option)}
                  color={characters === option ? 'primary' : 'default'}
                  sx={{ marginRight: 1 }}
                />
              ))}
            </Box>
            <Divider sx={{ my: 2 }} />

            {/* ローディングアイコン */}
            {loading && <CircularProgress />}

            {/* API結果の表示 */}
            {storyData && (
            <Box>
                <Typography variant="subtitle1">ストーリー</Typography>
                <Typography>{storyData.story}</Typography>
                <Typography variant="subtitle1" sx={{marginTop: 5}}>単語：</Typography>
                <ul>
                {storyData.words.map((word, index) => (
                    <li key={index}>{word.english} ({word.japanese})</li>
                ))}
                </ul>
            </Box>
            )}

            
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>キャンセル</Button>
            <Button onClick={handleSubmit} color="primary" disabled={isSubmitDisabled || loading}>作成</Button>
            <Button onClick={handleSave} color="primary" disabled={!storyData || loading}>保存</Button>
          </DialogActions>
        </Dialog>
      );
    };
    
  
  export default StoryCreationDialog