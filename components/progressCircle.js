import React from 'react';
import { CircularProgress, Typography, Box } from '@mui/material';

const ProgressCircle = ({ value }) => {
  return (
    <Box position="relative" display="inline-flex">
      {/* 灰色の円グラフ（全体） */}
      <CircularProgress variant="determinate" value={100} size={100} style={{ color: 'lightgray' }} />
      
      {/* 色付きの円グラフ（進捗部分） */}
      <CircularProgress variant="determinate" value={value} size={100} style={{ position: 'absolute', left: 0 }} />

      {/* 進捗パーセンテージの表示 */}
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="caption" component="div" color="textSecondary">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProgressCircle;
