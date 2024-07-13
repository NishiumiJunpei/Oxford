import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import AccessTime from '@mui/icons-material/AccessTime';
import { srTiming } from '@/utils/variables';
import { formatDate, timeAgo } from '@/utils/utils';
import SubTitleTypography from './subTitleTypography';

const SrTimingDialog = ({ srNextTime, word, open, onClose }) => {
  const srCount = word?.userWordListStatus ? word.userWordListStatus.srCount : 0;
  srNextTime = srNextTime ? srNextTime : word?.userWordListStatus?.srNextTime

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

  // console.log('test', word)
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="sr-timing-dialog-title">
      <DialogTitle id="sr-timing-dialog-title">間隔反復</DialogTitle>
      <DialogContent>
        <Box>
          <SubTitleTypography text="開始日時"/>
          <Box>
            <Typography>
              {formatDate(word?.userWordListStatus?.srStartTime)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{mt: 5}}>
          <SubTitleTypography text="反復タイミング"/>

          {srTiming.map((timing, index) => (
            <Box key={index} display="flex" alignItems="center" mb={3}>
              <Box minWidth="20%" textAlign="right" pr={2}>
                <Typography variant="h6">{`${index + 1}. ${formatTiming(timing)}`}</Typography>
              </Box>
              {index < srCount ? (
                <Box>
                    <Typography variant="h6" color="textSecondary">
                        <CheckCircle color="primary" />
                    </Typography>
                </Box>
              ) : index == srCount ? (
                <>
                    <Box display="flex" alignItems="center" >
                        <AccessTime />
                        <Typography variant="subtitle" color={new Date(srNextTime) < new Date() ? "error" : "secondary"} sx={{ml: 2}}>
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
