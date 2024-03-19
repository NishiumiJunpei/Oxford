import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chip, Stack, CircularProgress, Typography, Divider, Container } from '@mui/material';

const App = () => {
  const [engLevels, setEngLevels] = useState({});
  const [selectedEngLevel, setSelectedEngLevel] = useState('');
  const [selectedCategory1, setSelectedCategory1] = useState('');
  const [selectedCategory2, setSelectedCategory2] = useState('');
  const [phraseList, setPhraseList] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // ローディング状態を管理

  useEffect(() => {
    const fetchEngLevels = async () => {
      setIsLoading(true); // ローディング開始
      try {
        const response = await axios.get('/api/admin/getEngLevelsForPhraseData');
        setEngLevels(response.data.engLevels);
      } catch (error) {
        console.error('Failed to fetch engLevels:', error);
      }
      setIsLoading(false); // ローディング終了
    };

    fetchEngLevels();
  }, []);

  const handleSelectEngLevel = (level) => {
    setSelectedEngLevel(level);
    setSelectedCategory1(''); // Reset
    setSelectedCategory2(''); // Reset
  };

  const handleSelectCategory1 = (category1) => {
    setSelectedCategory1(category1);
    setSelectedCategory2(''); // Reset
  };

  const handleSelectCategory2 = async (category2) => {
    setIsLoading(true); // ローディング開始
    setSelectedCategory2(category2);
    try {
      const response = await axios.get('/api/admin/getPhraseListByEngLevels', {
        params: { engLevel: selectedEngLevel, category1: selectedCategory1, category2 }
      });
      setPhraseList(response.data.phraseList);
    } catch (error) {
      console.error('Failed to fetch sentences:', error);
    }
    setIsLoading(false); // ローディング終了
  };

  return (
    <Container>
      <Stack direction="row" spacing={1} marginBottom={2}>
        {Object.keys(engLevels).map(level => (
          <Chip key={level} label={level} onClick={() => handleSelectEngLevel(level)} color={selectedEngLevel === level ? 'primary' : 'default'} />
        ))}
      </Stack>
      {selectedEngLevel && (
        <Stack direction="row" spacing={1} marginBottom={2}>
          {Object.keys(engLevels[selectedEngLevel]).map(category1 => (
            <Chip key={category1} label={category1} onClick={() => handleSelectCategory1(category1)} color={selectedCategory1 === category1 ? 'primary' : 'default'} />
          ))}
        </Stack>
      )}
      {selectedCategory1 && (
        <Stack direction="row" spacing={1} marginBottom={2}>
          {engLevels[selectedEngLevel][selectedCategory1].map(category2 => (
            <Chip key={category2} label={category2} onClick={() => handleSelectCategory2(category2)} color={selectedCategory2 === category2 ? 'primary' : 'default'} />
          ))}
        </Stack>
      )}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </div>
      ) : (
        selectedCategory2 && phraseList.map((sentence, index) => (
          <React.Fragment key={index}>
            <Typography variant="body1" gutterBottom>{sentence.sentenceE}</Typography>
            <Typography variant="body2" gutterBottom>{sentence.sentenceJ}</Typography>
            {index < phraseList.length - 1 && <Divider style={{ margin: '8px 0' }} />}
          </React.Fragment>
        ))
      )}
    </Container>
  );
};

export default App;
