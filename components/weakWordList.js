import React, { useState, useEffect } from 'react';
import { Avatar, CircularProgress, List, ListItem, ListItemAvatar, ListItemText, Container, Switch, FormControlLabel } from '@mui/material';
import axios from 'axios';
import WordExampleSentenceModal from './wordExampleSentenceModal';

const WordList = () => {
  const [wordList, setWordList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWordIndex, setSelectedWordIndex] = useState(-1);
  const [modalOpen, setModalOpen] = useState(false);
  const [showJapanese, setShowJapanese] = useState(true); // 日本語表示の状態

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

    fetchWords();
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

  return (
    <Container>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
        <FormControlLabel
            control={<Switch checked={showJapanese} onChange={toggleJapanese} />}
            label="日本語を表示"
        />

        <List>
          {wordList.map((word, index) => (
            <ListItem button key={word.id} onClick={() => handleWordClick(index)}>
            <ListItemAvatar>
              <Avatar sx={{ width: 24, height: 24, marginRight: 2, fontSize: '0.75rem', bgcolor: 'secondary.main' }}>
                {word.block}
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={word.english} 
              secondary={showJapanese ? word.japanese : '　'} // 透明な文字で高さを保持
            />
          </ListItem>
        ))}
        </List>
        </>
      )}

      <WordExampleSentenceModal
        open={modalOpen}
        onClose={handleCloseModal}
        wordList={wordList}
        initialIndex={selectedWordIndex}
      />
    </Container>
  );
};

export default WordList;
