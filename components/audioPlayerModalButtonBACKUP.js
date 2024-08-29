import React, { useState, useRef } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography } from '@mui/material';
import { PlayArrow, Pause, Stop, SkipNext, SkipPrevious } from '@mui/icons-material'; // アイコン追加
import { playAudioMP3, stopAudioMP3, pauseAudioMP3 } from '../utils/audioPlayer';

const AudioPlayerModalButton = ({ words }) => {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(null);
  const isStopped = useRef(false); // 再生停止の状態を記録するためのフラグ

  const totalWords = words.length;

  const handleOpen = () => {
    setOpen(true);
    setCurrentWord(words[0]); // 最初の単語をセット
  };

  const handleClose = () => {
    setOpen(false);
    handleStop(); // 閉じるときに音声を停止
  };


  const handlePlay = async () => {
    if (isPaused) {
      try {
        setIsPlaying(true); // 再生状態に更新
        setIsPaused(false); // 一時停止を解除
        await playAudioMP3(currentWord.explanationAudioUrl); // 現在の単語のURLで再生
      } catch (error) {
        console.error('Error resuming audio:', error);
      }
      return;
    }
  
    setIsPlaying(true);
    isStopped.current = false; // 再生を続行
  
    const playWordAudio = async (index) => {
      if (isStopped.current || index >= words.length) {
        setIsPlaying(false); 
        setCurrentIndex(0); // すべて再生終了後にインデックスをリセット
        return;
      }
  
      const word = words[index];
      setCurrentWord(word);
      setCurrentIndex(index);
  
      try {
        await playAudioMP3(word.explanationAudioUrl);

        // 2秒の待機時間を追加
        await new Promise(resolve => setTimeout(resolve, 2000));

        playWordAudio(index + 1); // 次の単語の再生
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      }
    };
  
    await playWordAudio(currentIndex); // 初回の再生を開始
  };

  const handlePause = () => {
    pauseAudioMP3();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    stopAudioMP3();
    setIsPaused(false);
    setIsPlaying(false);
    isStopped.current = true; // 再生停止をフラグ
  };
  
  const handleNext = async () => {
    if (currentIndex < totalWords - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentWord(words[nextIndex]);
      
      stopAudioMP3(); // 現在のMP3を停止
  
      if (isPlaying) {
        try {
          await playAudioMP3(words[nextIndex].explanationAudioUrl); // 次のMP3を再生
        } catch (error) {
          console.error('Error playing next audio:', error);
        }
      }
    }
  };
  
  const handlePrev = async () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentWord(words[prevIndex]);
      
      stopAudioMP3(); // 現在のMP3を停止
  
      if (isPlaying) {
        try {
          await playAudioMP3(words[prevIndex].explanationAudioUrl); // 前のMP3を再生
        } catch (error) {
          console.error('Error playing previous audio:', error);
        }
      }
    }
  };


  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        音声解説
      </Button>

      <Dialog open={open} onClose={handleClose} disableEscapeKeyDown={isPlaying}>
        <DialogTitle>音声解説</DialogTitle>
        <DialogContent>
          {currentWord && currentWord.english && (
            <>
              <Typography>再生中: {currentIndex + 1} / {totalWords}</Typography>
              <Typography variant="h5" gutterBottom>{currentWord.english}</Typography>
              <Typography variant="subtitle1" gutterBottom>{currentWord.japanese}</Typography>

              <div style={{ width: '300px', height: '300px', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid lightgray' }}>
                {currentWord.imageUrl ? (
                  <img
                    src={currentWord.imageUrl}
                    alt={currentWord.english}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span>画像なし</span>
                )}
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <IconButton onClick={handlePrev} disabled={currentIndex === 0} color="primary">
            <SkipPrevious />
          </IconButton>
          <IconButton onClick={handlePlay} disabled={isPlaying && !isPaused} color="primary">
            <PlayArrow />
          </IconButton>
          <IconButton onClick={handlePause} disabled={!isPlaying} color="secondary">
            <Pause />
          </IconButton>
          <IconButton onClick={handleNext} disabled={currentIndex >= totalWords - 1} color="primary">
            <SkipNext />
          </IconButton>
          <IconButton onClick={handleStop} disabled={!isPlaying && !isPaused} color="error">
            <Stop />
          </IconButton>

          <Button onClick={handleClose} disabled={isPlaying}>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AudioPlayerModalButton;
