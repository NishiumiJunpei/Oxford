import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Container, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Button, Dialog,
  DialogContent, DialogTitle, IconButton, Avatar
} from '@mui/material';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/router';
import { useTheme } from '@emotion/react';
import SEOHeader from '@/components/seoHeader';

const BlocksList = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');
  const router = useRouter();
  const theme = useTheme()

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await axios.get('/api/admin/getBlocksByThemeId', {
          params: {
            themeId: 8, // themeIdを指定
            includeWordInfo: false, // WordInfoを含めるかどうかを指定
            summarizeByCategory: true, // カテゴリごとにまとめるかどうかを指定
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
    <>
      <SEOHeader title="爆速で覚える英検１級単語"/>
      <Container>
        <Box sx={{ mt: 10, mb: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            爆速で覚える! 英検１級英単語
          </Typography>
        </Box>

        {/* Categoryごとにテーブルを表示 */}
        {blocks.map((category) => (
          <Box key={category.categoryName} sx={{mt:7}}>
            <Typography variant="h5" gutterBottom style={{background: theme.palette.primary.light, padding: 10, color: theme.palette.primary.dark}}>
              {category.categoryName}
            </Typography>
            <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{width: '40px'}}>ブロック#</TableCell>
                    <TableCell style={{width: '40px'}} align="left">単語一覧</TableCell>
                    <TableCell style={{width: '40px'}} align="left">読み上げ動画</TableCell>
                    <TableCell style={{width: '40px'}} align="left">解説動画</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {category.blocks.map((block) => (
                    <TableRow key={block.id}>
                      <TableCell style={{width: '40px'}}>
                        <Avatar sx={{ bgcolor: 'primary.main', color: '#fff', ml: 1, mr: 1 }}>
                          {block?.name}
                        </Avatar>
                      </TableCell>


                      <TableCell align="left">
                        <Button
                          variant="default"
                          color="primary"
                          onClick={() => router.push(`/eiken1/wordList?blockId=${block.id}`)}
                        >
                          <OpenInBrowserIcon/>
                        </Button>
                      </TableCell>
                      <TableCell style={{width: '40px'}} align="left">
                        {block.normalMovieUrl ? (
                          <Button
                            variant="default"
                            color="primary"
                            onClick={() => handleOpenDialog(block.normalMovieUrl, 'Normal Movie')}
                          >
                            <OndemandVideoIcon/>
                          </Button>
                        ) : (
                          <Typography></Typography>
                        )}
                      </TableCell>
                      <TableCell style={{width: '40px'}} align="left">
                        {block.explanationMovieUrl ? (
                          <Button
                            variant="default"
                            color="primary"
                            onClick={() => handleOpenDialog(block.explanationMovieUrl, 'Explanation Movie')}
                          >
                            <OndemandVideoIcon/>
                            </Button>
                        ) : (
                          <Typography></Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}

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
    </>

  );
};

export default BlocksList;
