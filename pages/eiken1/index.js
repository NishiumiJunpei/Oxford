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
  CircularProgress, Link
} from '@mui/material';

const BlocksList = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await axios.get('/api/admin/getBlocksByThemeId', {
          params: {
            themeId: 8,  // themeIdを指定
            includeWordInfo: false // WordInfoを含めるかどうかを指定
          }
        });
        console.log('test2', response)

        setBlocks(response.data.blocks);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const getSignedMovieUrl = async (filename) => {
      try {
        const response = await axios.get('/api/getSignedMovieUrl', {
          params: { filename },
        });
        return response.data.url;
      } catch (error) {
        console.error('Error fetching signed movie URL:', error);
        return null;
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
    <Container>
      <Typography variant="h4" gutterBottom>
        英検１級 爆速で覚える英単語
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Block Name</TableCell>
              <TableCell align="center">単語リスト</TableCell>
              <TableCell align="center">動画</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blocks.map((block) => (
              <TableRow key={block.id}>
                <TableCell>{block.name}</TableCell>
                <TableCell align="center">
                  <Link href={`/wordList?blockId=${block.id}`} variant="body2">
                    View Word List
                  </Link>
                </TableCell>
                <TableCell align="center">
                  {block.normalMovieUrl && (
                    <div>
                      <Typography>Normal Movie</Typography>
                      <video controls width="250">
                        <source src={block.normalMovieUrl} type="video/quicktime" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  {block.reproductionMovieUrl && (
                    <div>
                      <Typography>Reproduction Movie</Typography>
                      <video controls width="250">
                        <source src={block.reproductionMovieUrl} type="video/quicktime" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  {block.explanationMovieUrl && (
                    <div>
                      <Typography>Explanation Movie</Typography>
                      <video controls width="250">
                        <source src={block.explanationMovieUrl} type="video/quicktime" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default BlocksList;
