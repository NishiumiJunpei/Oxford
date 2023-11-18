import React from 'react';
import { Box, TextField, FormControlLabel, Checkbox, Button, InputLabel, Select, MenuItem } from '@mui/material';

const StartUI = ({ quizOptions, setQuizOptions, handleStart }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="最大項目数"
        type="number"
        value={quizOptions.maxItems}
        onChange={(e) => setQuizOptions({ ...quizOptions, maxItems: parseInt(e.target.value, 10) })}
        fullWidth
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={quizOptions.includeMemorized}
            onChange={(e) => setQuizOptions({ ...quizOptions, includeMemorized: e.target.checked })}
          />
        }
        label="暗記した項目を含む"
      />
      <InputLabel id="last-checked-label">最後のチェック</InputLabel>
      <Select
        labelId="last-checked-label"
        value={quizOptions.lastChecked}
        label="最後のチェック"
        onChange={(e) => setQuizOptions({ ...quizOptions, lastChecked: e.target.value })}
        fullWidth
      >
        <MenuItem value="all">すべて</MenuItem>
        <MenuItem value="day">1日前〜</MenuItem>
        <MenuItem value="week">1週間前〜</MenuItem>
        <MenuItem value="month">1ヶ月前〜</MenuItem>
      </Select>
      <Button variant="contained" color="primary" onClick={handleStart}>
        スタート
      </Button>
    </Box>
  );
};

export default StartUI;
