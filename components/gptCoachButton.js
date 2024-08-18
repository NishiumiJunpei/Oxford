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

// 複数単語
const modeOptions = [
  { label: '英単語解説', code: 'JYDO' },
  { label: 'ストーリー生成（英語）', code: 'MR74' },
  { label: 'ストーリー生成（日本語）', code: 'OK4K' },
  { label: '問題生成', code: 'IGUB' },
];

// 単一単語
const secondaryModeOptions = [
  { label: '英単語説明生成', code: 'YA8X' },
  { label: '解説スクリプト生成', code: 'N6FV' },
  { label: '会話生成', code: 'T8RW' },
  { label: '物語生成', code: 'B3ML' },
  { label: '問題生成(意味)', code: 'Z9QP' },
  { label: '問題生成(シーン)', code: 'H4JK' },
];

const GPTCoachButton = ({ words, dialogFlag = true, styleType = 'BUTTON' }) => {
  const [open, setOpen] = useState(false);
  const [dialogIndex, setDialogIndex] = useState(0); // 表示するダイアログのインデックス
  const [maxWords, setMaxWords] = useState('10');
  const [mode, setMode] = useState('英単語解説');
  const [selectedTheme, setSelectedTheme] = useState('指定なし');
  const [isRandom, setIsRandom] = useState(false); // ランダムチェックボックスの状態
  const windowRef = useRef(null); // ウィンドウの参照を保存するためのuseRef
  const theme = useTheme();

  useEffect(() => {
    setSelectedTheme('指定なし');
  
    // 単語数に応じて表示するダイアログとモードを決定
    if (words.length === 1) {
      setDialogIndex(1); // 2つ目のダイアログを表示
      setMode(secondaryModeOptions[0].label); // secondaryModeOptionsの1つ目のモードをデフォルトで選択
    } else {
      setDialogIndex(0); // 1つ目のダイアログを表示
      setMode(modeOptions[0].label); // modeOptionsの1つ目のモードをデフォルトで選択
    }
  }, [words]);
  
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
    const wordsText = limitedWords.map((word, index) => `${word.english}`).join('\n');
    let fullText = fullThemeText + wordsText;
  
    if (!dialogFlag) {
      fullText = `CONVERSATION CODE: YA8X\n${words[0].english}`;
    } else {
      // 選択されたモードに対応する4文字コードを取得
      const selectedMode = modeOptions.find(option => option.label === mode) || secondaryModeOptions.find(option => option.label === mode);
      const conversationCode = selectedMode ? selectedMode.code : '';
  
      fullText = `CONVERSATION CODE: ${conversationCode}\n` + fullText;
    }
  
    try {
      await navigator.clipboard.writeText(fullText);
    
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    
      if (windowRef.current && !windowRef.current.closed) {
        windowRef.current.focus(); // ウィンドウが既に開いている場合はフォーカスを移動
      } else {
        const fallbackUrl = 'https://chatgpt.com/g/g-q2TmYaWUE-english-coach-susuenglish';
    
        if (isMobile) {
          //スマホ・タブレットの場合はこっち
          window.location.href = fallbackUrl; 
        } else {
          //PCはこっち
          windowRef.current = window.open(fallbackUrl, 'newWindowForCHATGPT');
        }
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
      
      {/* 1つ目のダイアログ */}
      {dialogIndex === 0 && (
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>GPT Coach</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle2" color="textSecondary">モード</Typography>
            <Stack direction="row" mt={1} sx={{ flexWrap: 'wrap' }}>
              {/* モード選択を配列を使って生成 */}
              {modeOptions.map(option => (
                <Chip
                  key={option.label}
                  sx={{ mb: 1, mr: 1 }}
                  label={option.label}
                  onClick={() => handleChipClick(option.label, 'mode')}
                  color={mode === option.label ? 'primary' : 'default'}
                />
              ))}
            </Stack>

            <Typography variant="subtitle2" color="textSecondary">テーマ</Typography>
            <Stack direction="row" mb={2} mt={1} sx={{ flexWrap: 'wrap' }}>
              {themesForGPT.map(theme => (
                <Chip
                  key={theme}
                  label={theme}
                  onClick={() => handleChipClick(theme, 'theme')}
                  color={selectedTheme === theme ? 'primary' : 'default'}
                  sx={{ mb: 1, mr: 1 }}
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
      )}

      {/* 2つ目のダイアログ */}
      {dialogIndex === 1 && (
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>GPT Coach</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle2" color="textSecondary">モード</Typography>
            <Stack direction="row" mt={1} sx={{ flexWrap: 'wrap' }}>
              {/* 2つ目のダイアログ用モード選択を配列を使って生成 */}
              {secondaryModeOptions.map(option => (
                <Chip
                  key={option.label}
                  sx={{ mb: 1, mr: 1 }}
                  label={option.label}
                  onClick={() => handleChipClick(option.label, 'mode')}
                  color={mode === option.label ? 'primary' : 'default'}
                />
              ))}
            </Stack>

            <Typography variant="subtitle2" color="textSecondary">テーマ</Typography>
            <Stack direction="row" mb={2} mt={1} sx={{ flexWrap: 'wrap' }}>
              {themesForGPT.map(theme => (
                <Chip
                  key={theme}
                  label={theme}
                  onClick={() => handleChipClick(theme, 'theme')}
                  color={selectedTheme === theme ? 'primary' : 'default'}
                  sx={{ mb: 1, mr: 1 }}
                />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} style={{ color: 'grey' }}>キャンセル</Button>
            <Button onClick={handleAction} color="primary">コーチを呼び出す</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default GPTCoachButton;
