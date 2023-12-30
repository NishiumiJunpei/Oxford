import React, { useState, useEffect } from 'react';
import { Avatar, CircularProgress, List, ListItem, ListItemAvatar, ListItemText, Container, Switch, FormControlLabel, Pagination } from '@mui/material';
import axios from 'axios';
import WordExampleSentenceModal from './wordExampleSentenceModal';

const ITEMS_PER_PAGE = 8; // 1ページあたりのアイテム数

const WeakWordList = ({wordList, setWordList}) => {
  // const [wordList, setWordList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWordIndex, setSelectedWordIndex] = useState(-1);
  const [modalOpen, setModalOpen] = useState(false);
  const [showJapanese, setShowJapanese] = useState(true); // 日本語表示の状態
  const [currentPage, setCurrentPage] = useState(1); // 現在のページ番号

  // ページネーションに必要な計算
  const pageCount = Math.ceil(wordList.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentWords = wordList.slice(startIndex, endIndex);
  

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

  const updateWordList = (newWordData) => {
    const updatedWordList = wordList.map(wordItem => 
      wordItem.id === newWordData.id ? newWordData : wordItem
    );
    setWordList(updatedWordList);
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
                <ListItemAvatar>
                  <Avatar sx={{ width: 24, height: 24, marginRight: 2, fontSize: '0.75rem', bgcolor: 'secondary.main' }}>
                    {word.blocks[0].block.name}
                  </Avatar>
                </ListItemAvatar>
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
      ) : (<></>)}      

      <WordExampleSentenceModal
        open={modalOpen}
        onClose={handleCloseModal}
        wordList={wordList}
        initialIndex={selectedWordIndex}
        updateWordList={updateWordList}
      />
    </Container>
  );
};

export default WeakWordList;
