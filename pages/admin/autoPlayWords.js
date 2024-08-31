import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Checkbox, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography } from '@mui/material';
import DisplayAutoPlayWordsBasic from '@/components/admin/DisplayAutoPlayWordsBasic';
import DisplayAutoPlayWordsReproduction from '@/components/admin/DisplayAutoPlayWordsReproduction';
import { ThemeContext } from '@emotion/react';
import DisplayAutoPlayWordsExpScript from '@/components/admin/DisplayAutoPlayWordsExpScript';



export default function Home() {
  const [themes, setThemes] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [blockIds, setBlockIds] = useState([]);
  const [wordList, setWordList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('themeSelection');
  const [selectedTheme, setSelectedTheme] = useState(null);

  useEffect(() => {
    const fetchThemes = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/user-setting/getThemes`);
        setThemes(response.data.themes);
      } catch (error) {
        console.error('Error fetching themes:', error);
      }
      setIsLoading(false);
    };
    fetchThemes();
  }, []);

  const fetchBlocks = async (themeId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/admin/getBlocksByThemeId?themeId=${themeId}`);
      setBlocks(response.data.blocks);
      setCurrentStep('blockSelection');
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
    setIsLoading(false);
  };

  const fetchWordListByBlockIds = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/admin/getWordListByBlockIds', { blockIds });
      setWordList(response.data.wordList);
    } catch (error) {
      console.error('Error fetching word list:', error);
    }
    setIsLoading(false);
  };

  const handleBlockSelect = (blockId) => {
    setBlockIds(prev => prev.includes(blockId) ? prev.filter(id => id !== blockId) : [...prev, blockId]);
  };

  const handleClickButton = (mode) => {
    fetchWordListByBlockIds()
    setCurrentStep(mode)
  }

  const handleClickRowTheme = (theme) =>{
    setSelectedTheme(theme)
    fetchBlocks(theme.id)
  }

  console.log('test', wordList)
  return (
    <>
      <Box>
        <a href="/admin/autoPlayWords">戻る</a>
      </Box>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          {currentStep === 'themeSelection' && (
            <>
            <h3>テーマ選択</h3>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {themes.map((theme) => (
                    <TableRow key={theme.id} hover onClick={() => handleClickRowTheme(theme)}>
                      <TableCell>{theme.id}</TableCell>
                      <TableCell>{theme.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
          )}
          {currentStep === 'blockSelection' && (
          <>
            <h3>ブロック選択</h3>
            <TableContainer component={Paper} sx={{maxHeight: 500, overflowY: 'auto'}}>
              <Table>
                <TableHead>
                  <TableRow button>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>単語数</TableCell>
                    <TableCell>画像なし</TableCell>
                    <TableCell>選択</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {blocks.map((block) => (
                    <TableRow key={block.id} onClick={() => handleBlockSelect(block.id)} sx={{cursor: 'pointer'}}>
                      <TableCell>{block.id}</TableCell>
                      <TableCell>{block.name}</TableCell>
                      <TableCell>{block.wordNum}</TableCell>
                      <TableCell>{block.noImageNum}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={blockIds.includes(block.id)}
                          // onChange={() => handleBlockSelect(block.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button variant="contained" onClick={()=>handleClickButton('wordPlayBasic')}>通常</Button>
            <Button variant="contained" onClick={()=>handleClickButton('wordPlayReproduction')}>リプロダクション</Button>
            <Button variant="contained" onClick={()=>handleClickButton('wordPlayExpScript')}>単語解説</Button>
          </>

          )}
          {currentStep === 'wordPlayBasic' && (
            <Box>
              <Typography variant="h5" gutterBottom>単語再生</Typography>
              
              <DisplayAutoPlayWordsBasic wordList={wordList} selectedTheme={selectedTheme}/>
            </Box>

          )}
          {currentStep === 'wordPlayReproduction' && (
            <Box>
              <Typography variant="h5" gutterBottom>リプロダクション</Typography>
              
              <DisplayAutoPlayWordsReproduction wordList={wordList} />
            </Box>

          )}
          {currentStep === 'wordPlayExpScript' && (
            <Box>
              <Typography variant="h5" gutterBottom>単語解説</Typography>
              
              <DisplayAutoPlayWordsExpScript wordList={wordList} selectedTheme={selectedTheme}/>
            </Box>

          )}

        </>
      )}
    </>
  );
}
