// BlocksList.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Container, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Button, Avatar
} from '@mui/material';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import { useRouter } from 'next/router';
import { useTheme } from '@emotion/react';
import SEOHeader from '@/components/seoHeader';
import VideoDialogButton from '@/components/videoDialogButton';

const BlocksList = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await axios.get('/api/admin/getBlocksByThemeId', {
          params: {
            themeId: 8,
            includeWordInfo: false,
            summarizeByCategory: true,
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
      <SEOHeader title="爆速で覚える英検１級単語" />
      <Container>
        <Box sx={{ mt: 10, mb: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            爆速で覚える! 英検１級英単語
          </Typography>
        </Box>

        {blocks.map((category) => (
          <Box key={category.categoryName} sx={{ mt: 7 }}>
            <Typography
              variant="h5"
              gutterBottom
              style={{
                background: theme.palette.primary.light,
                padding: 10,
                color: theme.palette.primary.dark,
              }}
            >
              {category.categoryName}
            </Typography>
            <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '40px' }}>ブロック#</TableCell>
                    <TableCell style={{ width: '40px' }} align="left">
                      単語一覧
                    </TableCell>
                    <TableCell style={{ width: '40px' }} align="left">
                      読み上げ動画
                    </TableCell>
                    <TableCell style={{ width: '40px' }} align="left">
                      解説動画
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {category.blocks.map((block) => (
                    <TableRow key={block.id}>
                      <TableCell style={{ width: '40px' }}>
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
                          <OpenInBrowserIcon />
                        </Button>
                      </TableCell>
                      <TableCell style={{ width: '40px' }} align="left">
                        {block.normalMovieUrl ? (
                          <VideoDialogButton
                            videoUrl={block.normalMovieUrl}
                            videoTitle="読み上げ動画"
                          />
                        ) : (
                          <Typography></Typography>
                        )}
                      </TableCell>
                      <TableCell style={{ width: '40px' }} align="left">
                        {block.explanationMovieUrl ? (
                          <VideoDialogButton
                            videoUrl={block.explanationMovieUrl}
                            videoTitle="解説動画"
                            messageType={1}
                          />
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
      </Container>
    </>
  );
};

export default BlocksList;
