import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogActions, DialogContent, DialogTitle, 
  Button, Chip, FormControl, InputLabel, Select, MenuItem, 
  Box, Typography, CircularProgress, Divider , Avatar, useTheme
} from '@mui/material';

const StoryCreationDialog = ({ open, onClose, onSave, block }) => {
    const theme = useTheme()
    const [length, setLength] = useState('');
    const [genre, setGenre] = useState('');
    const [characters, setCharacters] = useState('');
    const [loading, setLoading] = useState(false);
    const [storyData, setStoryData] = useState(null);
    const [streamStoryData, setStreamStoryData] = useState('');
    const [profileKeywords, setProfileKeywords] = useState([]);
    const [interestKeywords, setInterestKeywords] = useState([]);

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

      // ユーザー情報をAPIから取得
      useEffect(() => {
        const fetchUserInfo = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/user-setting/getUserInfo');
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
            const data = await response.json();
              
            // profileKeywordsとinterestKeywordsの更新
            setProfileKeywords(data.profileKeywords || []);
            setInterestKeywords(data.interestKeywords || []);
    
        } catch (error) {
            console.error('There was an error fetching the user info:', error);
        }
        setLoading(false);
        };
    
        fetchUserInfo();
    }, []);
  
  
    
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

    // ストーリーコンテンツをパースして、必要な部分を太字と青色で表示する
    const renderFormattedStoryContent = (storyContent) => {
      const regex = /\*(.*?)\*/g;
      const parts = [];
      let lastEnd = 0;

      storyContent?.replace(regex, (match, p1, offset) => {
        parts.push(storyContent.substring(lastEnd, offset));
        parts.push(<span style={{ fontWeight: 'bold', color: theme.palette.primary.main }}>{p1}</span>);
        lastEnd = offset + match.length;
      });

      parts.push(storyContent.substring(lastEnd));

      return parts;
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
              <Typography variant="subtitle1" gutterBottom>ジャンル</Typography>
              {['日常会話', 'ビジネス', ...profileKeywords, ...interestKeywords].map((genreEle) => (
                  <Chip
                      key={genreEle}
                      label={genreEle}
                      onClick={() => handleGenreChange(genreEle)}
                      // 選択されたジャンルと一致する場合に色を変える
                      color={genre === genreEle ? 'primary' : 'default'}
                      sx={{ marginRight: 1 }}
                  />
              ))}
            </Box>


            {/* <Box sx={{ marginBottom: 2 }}>
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
            </Box> */}
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
                <Typography variant="body1" className="preformatted-text" sx={{mb: 5}}>
                  {renderFormattedStoryContent(streamStoryData)}
                </Typography>


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