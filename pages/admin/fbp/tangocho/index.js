import React, { useState, useEffect } from 'react';
import { Box, Typography, Snackbar } from '@mui/material';
import axios from 'axios';

export default function WordDisplay() {
  const [wordList, setWordList] = useState([]);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // コンポーネントがマウントされたときにAPIからデータを取得する
  useEffect(() => {
    const fetchWordList = async () => {
      try {
        const blockIds = [839, 840]; // 指定するblockIds
        const response = await axios.post('/api/admin/getWordListByBlockIds', { blockIds });
        setWordList(response.data.wordList);
      } catch (error) {
        console.error('Error fetching word list:', error);
        setMessage('データの取得に失敗しました');
        setOpenSnackbar(true);
      }
    };

    fetchWordList();
  }, []);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box
      sx={{
        p: 3,
        '@media print': {
          '@page': {
            size: 'B5',
            margin: '20mm', // 上下の余白
          },
          '@page:left': {
            marginLeft: '20mm',  // 内側余白 (左ページ)
            marginRight: '15mm', // 外側余白 (左ページ)
          },
          '@page:right': {
            marginLeft: '15mm',  // 外側余白 (右ページ)
            marginRight: '20mm', // 内側余白 (右ページ)
          },
        },
        display: 'flex',
        flexDirection: 'column', // 縦に並べるためにflexDirectionをcolumnに設定
        gap: 4, // 各要素間のスペースを設定
      }}
    >
      {wordList.map((word, index) => (
        <Box
          key={index}
          sx={{
            backgroundColor: '#F8EDED',
            padding: 3,
            border: 'solid',
            borderWidth: 0.5,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            marginBottom: 4, // 各要素間の下部に余白を追加
          }}
        >
          {/* 英単語 */}
          <Typography variant="h5" sx={{ color: '#B43F3F', mt: 2, mb: 2 }}>
            {word.english}
          </Typography>

          {/* 日本語訳 */}
          <Typography variant="h6" sx={{ color: '#173B45', mb: 3 }}>
            {word.japanese}
          </Typography>

          {/* 例文 */}
          <Typography variant="body1" sx={{ color: '#173B45', mb: 2 }}>
            {word.exampleSentenceE}
          </Typography>
          <Typography variant="body2" sx={{ color: '#173B45', mb: 3 }}>
            {word.exampleSentenceJ}
          </Typography>

          {/* 画像 */}
          {word.imageUrl ? (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={word.imageUrl}
                alt={word.english}
                style={{
                  maxWidth: '100%',
                  maxHeight: '150px',
                  objectFit: 'contain',
                  borderRadius: '10px',
                }}
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">画像準備中</Typography>
            </Box>
          )}
        </Box>
      ))}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={message}
      />
    </Box>
  );
}
