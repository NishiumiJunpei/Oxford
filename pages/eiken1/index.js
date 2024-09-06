import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const BlocksList = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await axios.get('/api/admin/getBlocksByThemeId', {
          params: {
            themeId: 8, // themeIdを指定
            includeWordInfo: false, // WordInfoを含めるかどうかを指定
          },
        });
        setBlocks(response.data.blocks);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, []);

  // ダイアログを開く関数
  const handleOpenDialog = (videoUrl, videoTitle) => {
    setCurrentVideoUrl(videoUrl);
    setCurrentVideoTitle(videoTitle);
    setOpenDialog(true);
  };

  // ダイアログを閉じる関数
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentVideoUrl(null);
    setCurrentVideoTitle('');
  };

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (blocks.length === 0) {
    return <Typography>No blocks found.</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        英検１級 爆速で覚える英単語
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Block Name</TableCell>
              <TableCell align="center">Normal Movie</TableCell>
              <TableCell align="center">Explanation Movie</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blocks.map((block) => (
              <TableRow key={block.id}>
                <TableCell>{block.name}</TableCell>
                {/* Normal Movieの列 */}
                <TableCell align="center">
                  {block.normalMovieUrl ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenDialog(block.normalMovieUrl, 'Normal Movie')}
                    >
                      Normal Movie 視聴
                    </Button>
                  ) : (
                    <Typography>No Normal Movie</Typography>
                  )}
                </TableCell>
                {/* Explanation Movieの列 */}
                <TableCell align="center">
                  {block.explanationMovieUrl ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenDialog(block.explanationMovieUrl, 'Explanation Movie')}
                    >
                      Explanation Movie 視聴
                    </Button>
                  ) : (
                    <Typography>No Explanation Movie</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 動画表示用のダイアログ */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentVideoTitle}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {currentVideoUrl ? (
            <video controls width="100%">
              <source src={currentVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <Typography>Video not available</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default BlocksList;
