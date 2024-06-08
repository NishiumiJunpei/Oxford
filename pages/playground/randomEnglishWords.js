import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, Snackbar, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import axios from 'axios';

const RandomEnglishWords = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchWords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/playground/getRandomEnglishWords');
      setWords(response.data.words);
    } catch (err) {
      setError('Failed to fetch words');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const handleCopy = async () => {
    const wordsText = words.map(word => `${word[0]}, ${word[1]}`).join('\n');
    try {
      await navigator.clipboard.writeText(wordsText);
      setCopySuccess(true);
    } catch (err) {
      setError('Failed to copy');
    }
  };

  const handleRetry = () => {
    fetchWords();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Random English Words
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Button variant="contained" color="primary" onClick={handleCopy}>
              Copy
            </Button>
            <Button variant="contained" color="secondary" onClick={handleRetry}>
              Retry
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>English Word</TableCell>
                  <TableCell>Japanese Meaning</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {words.map((word, index) => (
                  <TableRow key={index}>
                    <TableCell>{word[0]}</TableCell>
                    <TableCell>{word[1]}</TableCell>
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
            />
          )}
          {copySuccess && (
            <Snackbar
              open={copySuccess}
              autoHideDuration={6000}
              onClose={() => setCopySuccess(false)}
              message="Copied to clipboard"
            />
          )}
        </>
      )}
    </Box>
  );
};

export default RandomEnglishWords;
