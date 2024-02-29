import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogActions, DialogContent, DialogTitle, 
  Button, Chip, FormControl, InputLabel, Select, MenuItem, 
  Box, Typography, CircularProgress, Divider , Avatar
} from '@mui/material';

const StoryCreationDialog = ({ open, onClose, onSave, block }) => {
    
    const [length, setLength] = useState('');
    const [genre, setGenre] = useState('');
    const [characters, setCharacters] = useState('');
    const [loading, setLoading] = useState(false);
    const [storyData, setStoryData] = useState(null);
    const [streamStoryData, setStreamStoryData] = useState('');

    useEffect(() => {
      if (open) {
        setLength('');
        setGenre('');
        setCharacters('');
        setLoading(false);
        setStoryData(null);
        setStreamStoryData('')
      }
    }, [open]);
    
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
          blockId: block.id,
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

          setLoading(false)
          if (response.body) {
            const reader = response.body.getReader();
            let receivedLength = 0; // 受信したデータの長さ
            let chunks = []; // 受信したチャンクを保存する配列
            let collectionData = ''
  
            while(true) {
              const {done, value} = await reader.read();
      
              if (done) {
                break;
              }
      
              chunks.push(value);
              receivedLength += value.length;
      
              // テキストとしてデータをデコード
              let decoder = new TextDecoder("utf-8");
              const chunkText = decoder.decode(value, {stream: true});
              collectionData += chunkText
              setStreamStoryData((prevData) => [...prevData, chunkText]);
            }
  
            // 親コンポーネントの保存処理を呼び出す
            const savedStory = {
              block, 
              length, 
              genre, 
              characters, 
              storyContent: collectionData,
              // words: responseData.words.map(word => `${word.english} (${word.japanese})`),
              imageUrl: ''
            }
            onSave(savedStory);  
          }
  
        } catch (error) {
          console.error('Failed to create story:', error);
        } finally {
          setLoading(false)
        }
    };

    const isSubmitDisabled = !length || !genre
    
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>

        <DialogTitle> 
          <Box display="flex" alignItems="center">
            <img src="/icon/openai-logomark.svg" style={{width: '20px', marginRight: '2'}}  />          
            ストーリー作成
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* <Box sx={{ marginBottom: 2 }}>
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
                {blockList.map((item, index) => (
                  <MenuItem key={index} value={item.block}>{item.block} ({item.progress || 0}%)</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box> */}

            <Typography variant="body1" gutterBottom>GPTがあなたが覚えていない単語を組み合わせて、条件にあったストーリーを作ります。</Typography>
            <Typography variant="body2" gutterBottom>注）GPTが条件に従ってくれないケースもあります。</Typography>
            <Box sx={{ mb: 2, mt: 5 }}>
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
              <Typography variant="subtitle1" gutterBottom>シーン</Typography>
              {['日常会話','ビジネス'].map((option) => (
                <Chip
                  key={option}
                  label={option}
                  onClick={() => handleGenreChange(option)}
                  color={genre === option ? 'primary' : 'default'}
                  sx={{ marginRight: 1 }}
                />
              ))}
            </Box>
            {/* <Box sx={{ marginBottom: 2 }}>
              <Typography variant="subtitle1" gutterBottom>登場人物</Typography>
              {['指定なし', '大統領',,'美人','優しいお兄さん', '宇宙人', 'おばけ', 'うんち君'].map((option) => (
                <Chip
                  key={option}
                  label={option}
                  onClick={() => handleCharactersChange(option)}
                  color={characters === option ? 'primary' : 'default'}
                  sx={{ marginRight: 1 }}
                />
              ))}
            </Box> */}
            <Divider sx={{ my: 2 }} />

            {/* ローディングアイコン */}
            {loading && <CircularProgress />}

            {/* API結果の表示 */}
            {streamStoryData && (
            <Box>
                <Typography variant="subtitle1">ストーリー</Typography>
                <Typography className="preformatted-text">{streamStoryData}</Typography>
                {/* <Typography variant="subtitle1" sx={{marginTop: 5}}>単語：</Typography>
                <ul>
                {storyData.words.map((word, index) => (
                    <li key={index}>{word.english} ({word.japanese})</li>
                ))}
                </ul> */}
            </Box>
            )}

            
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSubmit} 
              color="primary" 
              disabled={isSubmitDisabled || loading || storyData}
            >
              作成
            </Button>
            

            <Button onClick={onClose} disabled={loading}>閉じる</Button>
          </DialogActions>
        </Dialog>
      );
    };
    
  
  export default StoryCreationDialog