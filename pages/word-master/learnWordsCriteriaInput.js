import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Radio, RadioGroup, Button, Box } from '@mui/material';

const LearnWordsCriteriaInput = () => {
  const router = useRouter();
  const { blockId } = router.query;
  const [wordStatus, setWordStatus] = useState({
    memorized: false,
    notMemorized: false,
    unknown: true,
  });
  const [wordCount, setWordCount] = useState('20');
  const [lastCheck, setLastCheck] = useState('all');

  const handleWordStatusChange = (event) => {
    setWordStatus({ ...wordStatus, [event.target.name]: event.target.checked });
  };

  const handleSubmit = () => {
    const queryParams = new URLSearchParams({
      blockId,
      wordStatus: JSON.stringify(wordStatus),
      wordCount,
      lastCheck
    }).toString();

    router.push(`/word-master/learnWordsCheck?${queryParams}`);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto', my: 2 }}>
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">対象単語</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={wordStatus.memorized} onChange={handleWordStatusChange} name="memorized" />}
            label="覚えた単語"
          />
          <FormControlLabel
            control={<Checkbox checked={wordStatus.notMemorized} onChange={handleWordStatusChange} name="notMemorized" />}
            label="覚えていない単語"
          />
          <FormControlLabel
            control={<Checkbox checked={wordStatus.unknown} onChange={handleWordStatusChange} name="unknown" />}
            label="未知の単語"
          />
        </FormGroup>
      </FormControl>
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">単語数</FormLabel>
        <RadioGroup value={wordCount} onChange={(e) => setWordCount(e.target.value)}>
          <FormControlLabel value="10" control={<Radio />} label="10" />
          <FormControlLabel value="20" control={<Radio />} label="20" />
          <FormControlLabel value="30" control={<Radio />} label="30" />
          <FormControlLabel value="40" control={<Radio />} label="40" />
          <FormControlLabel value="50" control={<Radio />} label="50" />
        </RadioGroup>
      </FormControl>
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">最終チェック日</FormLabel>
        <RadioGroup value={lastCheck} onChange={(e) => setLastCheck(e.target.value)}>
          <FormControlLabel value="1month" control={<Radio />} label="1ヶ月前" />
          <FormControlLabel value="1week" control={<Radio />} label="1週間前" />
          <FormControlLabel value="yesterday" control={<Radio />} label="きのう以前" />
          <FormControlLabel value="all" control={<Radio />} label="ALL" />
        </RadioGroup>
      </FormControl>
      <Box sx={{ textAlign: 'center' }}>
        <Button variant="contained" onClick={handleSubmit}>
          スタート
        </Button>
      </Box>
    </Box>
  );
};

export default LearnWordsCriteriaInput;

