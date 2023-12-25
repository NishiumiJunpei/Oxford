import React from 'react';
import { Typography } from '@mui/material';

const SubTitleTypography = ({text}) => {
  return (
    <Typography variant='subtitle1' color="GrayText" component="p" className="subtitle_line" sx={{marginBottom: 2, marginTop: 1}}>
        {text}
    </Typography>

  );
};

export default SubTitleTypography;
