import React, { useState, useEffect } from 'react';
import { Avatar, CircularProgress, List, ListItem, ListItemAvatar, ListItemText, Container, Switch, FormControlLabel, Pagination, Typography, Box } from '@mui/material';
import axios from 'axios';
import WordDetailDialog from './wordDetailDialog';

const ITEMS_PER_PAGE = 8; // 1ページあたりのアイテム数

const WeakWordList = ({wordList, setWordList, updateWordList}) => {
  // const [wordList, setWordList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWordIndex, setSelectedWordIndex] = useState(-1);
  const [modalOpen, setModalOpen] = useState(false);
  const [showJapanese, setShowJapanese] = useState(true); // 日本語表示の状態
  const [currentPage, setCurrentPage] = useState(1); // 現在のページ番号
  const [currentWords, setCurrentWords] = useState(false);

  // ページネーションに必要な計算
  const pageCount = Math.ceil(wordList.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  
  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/word-master/getWeakWordList'); // APIのエンドポイントを指定
        setWordList(response.data.weakWordList);
      } catch (error) {
        console.error('Error fetching word list:', error);
      }
      setLoading(false);
    };

    if (wordList.length == 0) fetchWords();

  }, []);

  useEffect(()=>{
    const cw = wordList.slice(startIndex, endIndex);
    setCurrentWords(cw)
  
  }, [wordList, startIndex, endIndex])

  const handleWordClick = (index) => {
    setSelectedWordIndex(index);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const toggleJapanese = () => {
    setShowJapanese(!showJapanese);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Container>

      {loading ? (
        <CircularProgress />
      ) : currentWords.length > 0 ? (
        <>
          <FormControlLabel
              control={<Switch checked={showJapanese} onChange={toggleJapanese} />}
              label="日本語を表示"
          />

          <List> 
              {currentWords.map((word, index) => (
                <ListItem button key={word.id} onClick={() => handleWordClick(index)}>
                {/* <ListItemAvatar>
                  <Avatar sx={{ width: 24, height: 24, marginRight: 2, fontSize: '0.75rem', bgcolor: 'secondary.main', color: '#fff' }}>
                    {word.blocks[0].block.name}
                  </Avatar>
                </ListItemAvatar> */}
                <ListItemText 
                  primary={word.english} 
                  secondary={showJapanese ? word.japanese : '　'} // 透明な文字で高さを保持
                />
              </ListItem>
            ))}
          </List>
          {/* ページネーションコントロール */}
          <Pagination
            count={pageCount}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            sx={{ marginTop: 2 }}
          />

        </>
      ) : (
      <>
        <Box sx={{mt: 5}}>
          <Typography variant="subtitile1">苦手単語はありません</Typography>
        </Box>
      </>
      )}      

      <WordDetailDialog
        open={modalOpen}
        onClose={handleCloseModal}
        wordList={currentWords}
        initialIndex={selectedWordIndex}
        updateWordList={updateWordList}
      />
    </Container>
  );
};

export default WeakWordList;
