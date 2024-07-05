import React from 'react';
import { Button } from '@mui/material';

const themesForGPT = [
  'スポーツ',
  '料理',
  '音楽',
  '映画',
  '旅行',
  'テクノロジー',
  '健康とフィットネス',
  '読書',
  '趣味',
  '教育'
];

const GPTCoachButton = ({ words }) => {
  const getRandomTheme = () => {
    const randomIndex = Math.floor(Math.random() * themesForGPT.length);
    return themesForGPT[randomIndex];
  };

  const handleCopyAndOpenURL = async () => {
    const randomTheme = getRandomTheme();
    const themeText = `テーマ：${randomTheme}\n`;
    const wordsText = words.map(word => `${word.english}, ${word.japanese}`).join('\n');
    const fullText = themeText + wordsText;

    try {
      await navigator.clipboard.writeText(fullText);
      window.open('https://chatgpt.com/g/g-fcRjeqACa-super-cute-coach', '_blank');
    } catch (err) {
        console.log(err);
    }
  };

  return (
    <Button variant="contained" color="primary" onClick={handleCopyAndOpenURL}>
      GPT Coach
    </Button>
  );
};

export default GPTCoachButton;
