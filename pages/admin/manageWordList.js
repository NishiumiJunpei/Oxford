import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box } from '@mui/material';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [wordList, setWordList] = useState([]);
  const [wordDetail, setWordDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWordDetail, setIsLoadingWordDetail] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    setWordDetail(null)
    try {
      const response = await axios.get(`/api/word-master/getWordListByEnglish?english=${searchTerm}`);
      setWordList(response.data.wordList);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching word list:', error);
    }
  };

  const getWordDetail = async (id) => {
    setIsLoadingWordDetail(true);
    setWordDetail(null)
    try {
      const response = await axios.get(`/api/word-master/getWordDetail?wordListId=${id}`);
      setWordDetail(response.data.wordDetail);
      setIsLoadingWordDetail(false);
    } catch (error) {
      console.error('Error fetching word detail:', error);
    }
  };

  const createExampleSentence = async () => {
    setIsLoadingWordDetail(true);
    setWordDetail(null)
    if (wordDetail && wordDetail.id) {
        try {
            const response = await axios.post(`/api/word-master/createExampleSentenceForWordListId`, { wordListId: wordDetail.id });
            setWordDetail(response.data.wordDetail);
            setIsLoadingWordDetail(false);
          } catch (error) {
            console.error('Error creating example sentence:', error);
        }
    }
};


  return (
    <>
      <Box sx={{mb: 5}}>
        <TextField
          label="English"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          検索
        </Button>
      </Box>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Box sx={{mb: 5}}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>English</TableCell>
                <TableCell>Japanese</TableCell>
                <TableCell>Theme Name</TableCell>
                <TableCell>Block Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wordList.flatMap((word) =>
                word.blocks.map((item, index) => (
                  <TableRow key={`${word.id}-${index}`} hover onClick={() => getWordDetail(word.id)}>
                    <TableCell>{word.id}</TableCell>
                    <TableCell>{word.english}</TableCell>
                    <TableCell>{word.japanese}</TableCell>
                    <TableCell>{item.block?.theme?.name}</TableCell>
                    <TableCell>{item.block?.name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        </Box>
      )}

      {isLoadingWordDetail && (
        <CircularProgress />
      )}


      {wordDetail && (
        <Box sx={{mb: 5}}>
          <p>Id: {wordDetail.id}</p>
          <h2>{wordDetail.english}</h2>
          <p>{wordDetail.japanese}</p>
          <p> {wordDetail.exampleSentence}</p>
          {wordDetail.image && <img src={wordDetail.image} alt={wordDetail.english} />}

          {wordDetail?.imageUrl && (
              <img 
                  src={wordDetail.imageUrl} 
                  style={{ marginTop: 20, maxWidth: '100%', maxHeight: '50%', objectFit: 'contain' }} 
              />
          )}

          <Button variant="contained" color="secondary" onClick={createExampleSentence} disabled={isLoadingWordDetail}>
              GPT例文生成
          </Button>

        </Box>
      )}
    </>
  );
}
