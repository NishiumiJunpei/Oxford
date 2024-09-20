import React, { useState, useRef } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { PlayArrow, Stop, SkipNext, SkipPrevious } from '@mui/icons-material'; 
import { playAudioMP3, stopAudioMP3 } from '../utils/audioPlayer';

const AudioPlayerModalButton = ({ words }) => {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const isStopped = useRef(false); 

  const totalWords = words.length;

  const handleOpen = () => {
    setOpen(true);
    setCurrentWord(words[0]); 
  };

  const handleClose = () => {
    handleStop(); 
    setOpen(false);
  };

  const handlePlay = async () => {
    setIsPlaying(true);
    isStopped.current = false;

    // 通常の再生処理
    const playWordAudio = async (index) => {
      if (isStopped.current || index >= words.length) {
        setIsPlaying(false);
        setCurrentIndex(0);
        return;
      }

      const word = words[index];
      setCurrentWord(word);
      setCurrentIndex(index);

      try {
        await playAudioMP3(word.explanationAudioUrl, playbackRate);
        await new Promise(resolve => setTimeout(resolve, 2000));
        playWordAudio(index + 1);
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      }
    };

    await playWordAudio(currentIndex);
  };

  const handleStop = () => {
    stopAudioMP3();
    setIsPlaying(false);
    isStopped.current = true; 
  };

  const handleNext = async () => {
    if (currentIndex < totalWords - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentWord(words[nextIndex]);
      if (isPlaying) {
        try {
          await playAudioMP3(words[nextIndex].explanationAudioUrl, playbackRate); 
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
      handleStop(); 
      if (isPlaying) {
        try {
          await playAudioMP3(words[prevIndex].explanationAudioUrl, playbackRate); 
        } catch (error) {
          console.error('Error playing previous audio:', error);
        }
      }
    }
  };

  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
  };
  

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        音声解説
      </Button>

      <Dialog open={open} onClose={handleClose} disableEscapeKeyDown={isPlaying}>
        <DialogTitle>
          音声解説
        </DialogTitle>
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
            <IconButton onClick={handlePlay} disabled={isPlaying} color="primary">
              <PlayArrow />
            </IconButton>
            <IconButton onClick={handleStop} disabled={!isPlaying} color="error">
              <Stop />
            </IconButton>
            <>
              <IconButton onClick={handlePrev} disabled={currentIndex === 0} color="primary">
                <SkipPrevious />
              </IconButton>
              <IconButton onClick={handleNext} disabled={currentIndex >= totalWords - 1} color="primary">
                <SkipNext />
              </IconButton>
            </>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="speed-select-label">再生速度</InputLabel>
              <Select
                labelId="speed-select-label"
                id="speed-select"
                value={playbackRate}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                label="再生速度"
              >
                <MenuItem value={1.0}>1.0x</MenuItem>
                <MenuItem value={1.25}>1.25x</MenuItem>
                <MenuItem value={1.5}>1.5x</MenuItem>
                <MenuItem value={2.0}>2.0x</MenuItem>
              </Select>
            </FormControl>

            <Button onClick={handleClose}>
              閉じる
            </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AudioPlayerModalButton;
