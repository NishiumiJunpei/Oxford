import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Chip, Stack, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { shuffleArray } from '@/utils/utils';

const themesForGPT = [
  '指定なし',
  'スポーツ',
  '料理',
  '旅行',
  'テクノロジー',
  '健康とフィットネス',
  '趣味',
  '歴史',
  'ギャグ',
];

const GPTCoachButton = ({ words, dialogFlag = true, styleType = 'BUTTON' }) => {
  const [open, setOpen] = useState(false);
  const [maxWords, setMaxWords] = useState('10');
  const [mode, setMode] = useState('英単語解説');
  const [selectedTheme, setSelectedTheme] = useState('指定なし');
  const [isRandom, setIsRandom] = useState(false); // ランダムチェックボックスの状態
  const windowRef = useRef(null); // ウィンドウの参照を保存するためのuseRef
  const theme = useTheme();


  useEffect(() => {
    setSelectedTheme('指定なし');
  }, []);

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
    const themeText = selectedTheme !== '指定なし' ? `テーマ：${selectedTheme}\n` : '';
  
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
    let fullText = fullThemeText + wordsText;
  
    if (!dialogFlag) {
      fullText = `CONVERSATION CODE: CZX9\n${words[0].english}`;
    } else {
      let conversationCode = '';
      if (mode === '英単語解説') {
        conversationCode = 'JYDO';
      } else if (mode === 'ストーリー生成（英語）') {
        conversationCode = 'MR74';
      } else if (mode === 'ストーリー生成（日本語）') {
        conversationCode = 'OK4K';
      } else if (mode === '問題生成') {
        conversationCode = 'IGUB';
      }
  
      fullText = `CONVERSATION CODE: ${conversationCode}\n` + fullText;
    }
  
    try {
      await navigator.clipboard.writeText(fullText);
  
      if (windowRef.current && !windowRef.current.closed) {
        console.log('test window');
        windowRef.current.focus(); // ウィンドウが既に開いている場合はフォーカスを移動
      } else {
        const appUrl = 'yourapp://open';
        const fallbackUrl = 'https://chatgpt.com/g/g-q2TmYaWUE-english-coach-susuenglish';
  
        // アプリを開くためのiframeを作成
        const iframe = document.createElement('iframe');
        iframe.style.border = 'none';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.onload = function () {
          clearTimeout(timeout);
          window.location = fallbackUrl;
        };
  
        // タイムアウトを設定して、アプリが開かれない場合にHTTPサイトに遷移
        const timeout = setTimeout(() => {
          window.location = fallbackUrl;
        }, 1000);
  
        document.body.appendChild(iframe);
        iframe.src = appUrl;
  
        // 新しいウィンドウを開く処理をコメントアウト
        // windowRef.current = window.open(fallbackUrl, 'newWindowForCHATGPT');
      }
    } catch (err) {
      console.log(err);
    }
  
    handleClose();
  };

  return (
    <>
      <Button
        variant={styleType === 'BUTTON' ? 'contained' : 'text'}
        color="primary"
        onClick={dialogFlag ? handleOpen : handleAction}
        sx={styleType === 'LINK' ? {
          fontSize: theme.typography.body2.fontSize,
          margin: 0,
          padding: 0,
          textTransform: 'none', // ボタンテキストの大文字変換を防止
          color: theme.palette.link.main,
        } : {}}
      >
        GPT Coach
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>GPT Coach</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" color="textSecondary">モード</Typography>
          <Stack direction="row" mt={1} sx={{ flexWrap: 'wrap' }}>
            <Chip sx={{mb:1, mr:1}} label="英単語解説" onClick={() => handleChipClick('英単語解説', 'mode')} color={mode === '英単語解説' ? 'primary' : 'default'} />
            <Chip sx={{mb:1, mr:1}} label="ストーリー生成（英語）" onClick={() => handleChipClick('ストーリー生成（英語）', 'mode')} color={mode === 'ストーリー生成（英語）' ? 'primary' : 'default'} />
            <Chip sx={{mb:1, mr:1}} label="ストーリー生成（日本語）" onClick={() => handleChipClick('ストーリー生成（日本語）', 'mode')} color={mode === 'ストーリー生成（日本語）' ? 'primary' : 'default'} />
            <Chip sx={{mb:1, mr:1}} label="問題生成" onClick={() => handleChipClick('問題生成', 'mode')} color={mode === '問題生成' ? 'primary' : 'default'} />
          </Stack>

          <Typography variant="subtitle2" color="textSecondary">テーマ</Typography>
          <Stack direction="row" mb={2} mt={1} sx={{ flexWrap: 'wrap' }}>
            {themesForGPT.map(theme => (
              <Chip
                key={theme}
                label={theme}
                onClick={() => handleChipClick(theme, 'theme')}
                color={selectedTheme === theme ? 'primary' : 'default'}
                sx={{mb:1, mr:1}}
              />
            ))}
          </Stack>

          <Typography variant="subtitle2" color="textSecondary">最大単語数</Typography>
          <Stack direction="row" spacing={2} mb={2} mt={1} sx={{ flexWrap: 'wrap' }}>
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
