import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Chip, Stack, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { shuffleArray } from '@/utils/utils';

const themesForGPT = [
  '指定なし',
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
  const [open, setOpen] = useState(false);
  const [maxWords, setMaxWords] = useState('10');
  const [mode, setMode] = useState('英単語解説');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [isRandom, setIsRandom] = useState(false); // ランダムチェックボックスの状態

  useEffect(() => {
    setSelectedTheme(getRandomTheme());
  }, []);

  const getRandomTheme = () => {
    const randomIndex = Math.floor(Math.random() * themesForGPT.length);
    return themesForGPT[randomIndex];
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChipClick = (chip, type) => {
    if (type === 'words') {
      setMaxWords(chip);
    } else if (type === 'mode') {
      setMode(chip);
    } else if (type === 'theme') {
      setSelectedTheme(chip);
    }
  };

  const handleAction = async () => {
    const themeText = selectedTheme != '指定なし' ? `テーマ：${selectedTheme}\n` : '';

    let fullThemeText = themeText;
    if (mode.includes('ストーリー生成')) {
      fullThemeText = `テーマ：${selectedTheme}\n### 物語生成（${mode.includes('英語') ? '英語中心' : '日本語中心'}）###\n`;
    }

    let processedWords = [...words];
    if (isRandom) {
      processedWords = shuffleArray(processedWords);
    }
    const limitedWords = maxWords === '指定なし' ? processedWords : processedWords.slice(0, Number(maxWords));
    const wordsText = limitedWords.map((word, index) => `${index + 1}. ${word.english}, ${word.japanese}`).join('\n');
    const fullText = fullThemeText + wordsText;

    try {
      await navigator.clipboard.writeText(fullText);
      window.open('https://chatgpt.com/g/g-fcRjeqACa-super-cute-coach', '_blank');
    } catch (err) {
      console.log(err);
    }

    handleClose();
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        GPT Coach
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>GPT Coach</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" color="textSecondary">モード</Typography>
          <Stack direction="row" spacing={2} mt={1}>
            <Chip label="英単語解説" onClick={() => handleChipClick('英単語解説', 'mode')} color={mode === '英単語解説' ? 'primary' : 'default'} />
            <Chip label="ストーリー生成（英語）" onClick={() => handleChipClick('ストーリー生成（英語）', 'mode')} color={mode === 'ストーリー生成（英語）' ? 'primary' : 'default'} />
            <Chip label="ストーリー生成（日本語）" onClick={() => handleChipClick('ストーリー生成（日本語）', 'mode')} color={mode === 'ストーリー生成（日本語）' ? 'primary' : 'default'} />
          </Stack>

          <Typography variant="subtitle2" color="textSecondary">テーマ</Typography>
          <Stack direction="row" spacing={1} mb={2} mt={1}>
            {themesForGPT.map(theme => (
              <Chip
                key={theme}
                label={theme}
                onClick={() => handleChipClick(theme, 'theme')}
                color={selectedTheme === theme ? 'primary' : 'default'}
              />
            ))}
          </Stack>

          <Typography variant="subtitle2" color="textSecondary">最大単語数</Typography>
          <Stack direction="row" spacing={2} mb={2} mt={1}>
            <Chip label="10" onClick={() => handleChipClick('10', 'words')} color={maxWords === '10' ? 'primary' : 'default'} />
            <Chip label="20" onClick={() => handleChipClick('20', 'words')} color={maxWords === '20' ? 'primary' : 'default'} />
            <Chip label="指定なし" onClick={() => handleChipClick('指定なし', 'words')} color={maxWords === '指定なし' ? 'primary' : 'default'} />
          </Stack>

          <Typography variant="subtitle2" color="textSecondary">単語ランダム</Typography>
          <FormControlLabel
            control={<Checkbox checked={isRandom} onChange={() => setIsRandom(!isRandom)} />}
            label="ランダムにする"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} style={{ color: 'grey' }}>キャンセル</Button>
          <Button onClick={handleAction} color="primary">コーチを呼び出す</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GPTCoachButton;
