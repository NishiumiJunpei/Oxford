import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Chip, Button, Box, Typography, FormControlLabel, Checkbox } from '@mui/material';

const LearnWordsCriteriaInput = () => {
  const router = useRouter();
  const { blockId } = router.query;
  const [languageDirection, setLanguageDirection] = useState('EJ'); // 'EJ' は英→日、'JE' は日→英
  const [wordCount, setWordCount] = useState('ALL'); // '10', '30', 'ALL'
  const [includeMemorized, setIncludeMemorized] = useState(false); // 新しいステート
  
  const handleSubmit = () => {
    const queryParams = new URLSearchParams({
      blockId,
      wordCount: wordCount === 'ALL' ? 50 : wordCount, // ALLの場合はパラメータを送らない
      languageDirection,
      includeMemorized: includeMemorized ? 1 : 0 // includeMemorizedを追加
    }).toString();
  
    router.push(`/word-master/learnWordsCheck?${queryParams}`);
  };
  
  return (
    <Box sx={{ width: '100%', maxWidth: 500}}>
      <Typography variant="h5" sx={{mb: 5}}>理解度チェック</Typography>
      
      <Typography variant="subtitle1" color="GrayText" sx={{mb: 2}}>モード</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, marginBottom: 5 }}>
        <Chip label="英→日" color={languageDirection === 'EJ' ? 'primary' : 'default'} onClick={() => setLanguageDirection('EJ')} />
        <Chip label="日→英" color={languageDirection === 'JE' ? 'primary' : 'default'} onClick={() => setLanguageDirection('JE')} />
      </Box>

      <Typography variant="subtitle1" color="GrayText" sx={{mb: 2}}>単語数</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, marginBottom: 5 }}>
        <Chip label="10" color={wordCount === '10' ? 'primary' : 'default'} onClick={() => setWordCount('10')} />
        <Chip label="30" color={wordCount === '30' ? 'primary' : 'default'} onClick={() => setWordCount('30')} />
        <Chip label="ALL" color={wordCount === 'ALL' ? 'primary' : 'default'} onClick={() => setWordCount('ALL')} />
      </Box>

      <Typography variant="subtitle1" color="GrayText" sx={{mb: 2}}>覚えている単語</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, marginBottom: 5 }}>
        <FormControlLabel
          control={<Checkbox checked={includeMemorized} onChange={(e) => setIncludeMemorized(e.target.checked)} />}
          label="含める"
        />
      </Box>


      <Box sx={{ textAlign: 'left' }}>
        <Button variant="outlined" onClick={handleSubmit}>
          スタート
        </Button>
      </Box>  
    </Box>

  );
};

export default LearnWordsCriteriaInput;

