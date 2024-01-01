import React from 'react';
import { CircularProgress, Typography, Box, useTheme } from '@mui/material';

const ProgressCircle = ({ value }) => {
  const theme = useTheme();
  const isOverMax = value > 100;
  const primaryColor = isOverMax ? theme.palette.primary.dark : theme.palette.primary.main;
  const baseColor = isOverMax ? theme.palette.primary.main : 'lightgray';

  return (
    <Box position="relative" display="inline-flex">
      {/* ベースとなる円グラフ */}
      <CircularProgress
        variant="determinate"
        value={100}
        size={100}
        style={{ color: baseColor }}
      />
      
      {/* 進捗を示す円グラフ */}
      <CircularProgress
        variant="determinate"
        value={isOverMax ? value-100 : value}
        size={100}
        style={{ color: primaryColor, position: 'absolute', left: 0 }}
      />

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
        <Typography 
          variant="caption" 
          component="div" 
          style={{
            fontWeight: isOverMax ? 'bold' : 'normal',
            color: isOverMax ? theme.palette.primary.dark : 'textSecondary'
          }}
        >
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProgressCircle;
