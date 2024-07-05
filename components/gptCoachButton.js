import React from 'react';
import { Button } from '@mui/material';

const GPTCoachButton = ({ words }) => {

  const handleCopyAndOpenURL = async () => {
    const wordsText = words.map(word => `${word.english}, ${word.japanese}`).join('\n');

    try {
      await navigator.clipboard.writeText(wordsText);
      window.open('https://chatgpt.com/g/g-fcRjeqACa-super-cute-coach', '_blank');
    } catch (err) {
        console.log(err)
    }
  };

  return (
    <Button variant="contained" color="primary" onClick={handleCopyAndOpenURL}>
      GPT Coach
    </Button>
  );
};

export default GPTCoachButton;
