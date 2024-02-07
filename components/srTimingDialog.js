import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import Check from '@mui/icons-material/Check';
import AccessTime from '@mui/icons-material/AccessTime';
import { srTiming } from '@/utils/variables';
import { formatDate, timeAgo } from '@/utils/utils';

const SrTimingDialog = ({ srNextTime, words, open, onClose }) => {
  const { srCount } = words.length > 0 && words[0].userWordListStatus ? words[0].userWordListStatus : { srCount: 0 };

  const formatTiming = (minutes) => {
    if (typeof minutes !== 'number' || isNaN(minutes) || minutes < 0) {
      console.error('Invalid input: minutes must be a non-negative number');
      return '不明';
    }
    if (minutes < 60) {
      return `${minutes}分後`;
    } else if (minutes < 60 * 24) {
      return `${Math.round(minutes / 60)}時間後`;
    } else {
      return `${Math.round(minutes / (60 * 24))}日後`;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="sr-timing-dialog-title">
      <DialogTitle id="sr-timing-dialog-title">反復タイミング</DialogTitle>
      <DialogContent>
        <Box>
          {srTiming.map((timing, index) => (
            <Box key={index} display="flex" alignItems="center" mb={3}>
              <Box minWidth="20%" textAlign="right" pr={2}>
                <Typography variant="h6">{`${index + 1}. ${formatTiming(timing)}`}</Typography>
              </Box>
              {index < srCount ? (
                <Box>
                    <Typography variant="h6" color="textSecondary">
                        <Check color="primary" />
                    </Typography>
                </Box>
              ) : index == srCount ? (
                <>
                    <Box display="flex" alignItems="center" >
                        <AccessTime />
                        {/* <Typography variant="h6" sx={{ml: 2}}>
                            {`${formatDate(srNextTime)}`}
                        </Typography> */}
                        <Typography variant="h6" color={new Date(srNextTime) < new Date() ? "error" : "inherit"} sx={{ml: 2}}>
                            {formatDate(srNextTime)} {timeAgo(srNextTime) && `(${timeAgo(srNextTime)})`}
                        </Typography>
                    </Box>
                </>
              ) : (
                <>
                </>
              )}
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SrTimingDialog;
