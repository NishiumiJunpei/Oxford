import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, Snackbar, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, Error, StarBorder, Star } from '@mui/icons-material';
import axios from 'axios';

const RandomEnglishWords = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showJapanese, setShowJapanese] = useState(true); // 日本語の表示状態を管理するフック
  const [filter, setFilter] = useState({ '0': true, '1': true, '2': true }); // フィルタリングの状態を管理するフック

  const fetchWords = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const filterQuery = Object.entries(filters).map(([key, value]) => `${key}=${value}`).join('&');
      const response = await axios.get(`/api/playground/getRandomMyEnglishWords?${filterQuery}`);
      setWords(response.data.words);
      // await handleCopy(response.data.words);  // データ取得後に自動でコピー
    } catch (err) {
      setError('Failed to fetch words');
    }
    setLoading(false);
  };

  const updateUnderstanding = async (word) => {
    // word[0]のrowIndexと一致する要素を探し、その要素番号をindex変数に入れる
    const index = words.findIndex(w => w[0] === word[0]);
    
    // 一致する要素が見つかった場合のみ処理を続ける
    if (index !== -1) {
      const updatedWords = [...words];
      let newLevel = (parseInt(updatedWords[index][5]) + 1) % 3; // 理解度は5番目の要素
      const rowIndex = updatedWords[index][0]; // 行インデックスは0番目の要素
  
      updatedWords[index][5] = newLevel.toString();
      setWords(updatedWords);
  
      try {
        await axios.post('/api/playground/updateMyEnglishWord', {
          rowIndex: rowIndex,
          newLevel: newLevel.toString()
        });
      } catch (err) {
        setError('Failed to update understanding level');
      }
    } else {
      setError('Word not found');
    }
  };
  
  useEffect(() => {
    fetchWords(filter);
  }, []);

  const handleCopy = async (wordsToCopy) => {
    if (!Array.isArray(wordsToCopy)) {
      wordsToCopy = words;
    }
    const filteredWords = getFilteredWords(wordsToCopy);
    const wordsText = filteredWords.map(word => `${word[1]}, ${word[2]}`).join('\n');
    try {
      await navigator.clipboard.writeText(wordsText);
      setCopySuccess(true);
    } catch (err) {
      setError('Failed to copy');
    }
  };

  const handleRetry = () => {
    fetchWords(filter);
  };

  const toggleJapaneseVisibility = () => {
    setShowJapanese(!showJapanese);
  };

  const toggleFilter = (level) => {
    setFilter({ ...filter, [level]: !filter[level] });
  };

  const getIcon = (level) => {
    switch (level) {
      case '0':
        return <Error color="error" />;
      case '1':
        return <StarBorder color="warning" />;
      case '2':
        return <Star color="success" />;
      default:
        return <Error color="error" />;
    }
  };

  const getFilteredWords = (wordsToFilter = words) => {
    return wordsToFilter.filter(word => filter[word[5]]);
  };

  const getIconStyle = (level) => ({
    opacity: filter[level] ? 1 : 0.3,
    cursor: 'pointer',
  });

  return (
    <Box sx={{ p: { xs: 1, sm: 4 }, width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        My 単語帳
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Box>
              <Button variant="contained" color="secondary" onClick={handleRetry}>
                Reload
              </Button>
              <IconButton onClick={() => toggleFilter('0')} style={getIconStyle('0')}>
                <Error color="error" />
              </IconButton>
              <IconButton onClick={() => toggleFilter('1')} style={getIconStyle('1')}>
                <StarBorder color="warning" />
              </IconButton>
              <IconButton onClick={() => toggleFilter('2')} style={getIconStyle('2')}>
                <Star color="success" />
              </IconButton>
            </Box>
            <Button variant="contained" color="primary" onClick={() => handleCopy(words)}>
              Copy
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ maxHeight: '80vh', tableLayout: 'fixed' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                <TableCell style={{ paddingTop: 2, paddingBottom: 2 }}></TableCell>
                <TableCell style={{ paddingTop: 2, paddingBottom: 2 }}>英語</TableCell>
                <TableCell style={{ paddingTop: 2, paddingBottom: 2 }}>
                    日本語
                    <IconButton onClick={toggleJapaneseVisibility} style={{ marginLeft: 8 }}>
                      {showJapanese ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredWords().map((word, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <IconButton onClick={() => updateUnderstanding(word)}>
                        {getIcon(word[5])}
                      </IconButton>
                    </TableCell>
                    <TableCell>{word[1]}</TableCell>
                    <TableCell style={{ color: showJapanese ? 'inherit' : 'white' }}>{word[2]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {error && (
            <Snackbar
              open={Boolean(error)}
              autoHideDuration={6000}
              onClose={() => setError(null)}
              message={error}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
          )}
          {copySuccess && (
            <Snackbar
              open={copySuccess}
              autoHideDuration={3000}
              onClose={() => setCopySuccess(false)}
              message="Copied to clipboard"
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default RandomEnglishWords;
