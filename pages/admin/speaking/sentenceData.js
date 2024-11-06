import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Container, Typography, Box, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Switch, CircularProgress, IconButton, Link
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TopicDataPage = () => {
  const router = useRouter();
  const { category, topic } = router.query;
  const [sentenceData, setSentenceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [visibleSentences, setVisibleSentences] = useState({}); // Track visibility for each row

  // Fetch data based on category and topic
  useEffect(() => {
    if (category && topic) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await axios.post('/api/admin/speaking/getSentenceData', {
            category,
            topic
          });
          setSentenceData(response.data);
        } catch (error) {
          console.error('Failed to fetch sentence data:', error);
        }
        setIsLoading(false);
      };
      fetchData();
    }
  }, [category, topic]);

  // Toggle English sentence display for all rows
  const handleToggleEnglish = () => {
    setShowEnglish((prev) => !prev);
    setVisibleSentences({}); // Reset individual row visibility when toggling showEnglish
  };

  // Toggle individual sentence visibility
  const handleViewClick = (index) => {
    setVisibleSentences((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Go back to topic list
  const handleGoBack = () => {
    router.push('/admin/speaking/topicList');
  };

  return (
    <Container sx={{ mb: 10 }}>
      <Stack direction="row" spacing={2} marginBottom={3}>
        <IconButton onClick={handleGoBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">{category} - {topic}</Typography>
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* Toggle switch for English display */}
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <Typography>英語表示</Typography>
            <Switch checked={showEnglish} onChange={handleToggleEnglish} />
          </Stack>

          {/* Sentence Data Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>日本語と英語</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sentenceData.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{data.no}</TableCell>
                    <TableCell>
                      {/* Japanese Sentence */}
                      <Typography>{data.sentenceJ}</Typography>
                      
                      {/* English Sentence */}
                      {showEnglish || visibleSentences[index] ? (
                        <Typography
                          sx={{ mt: 1, color: 'text.primary' }}
                        >
                          {data.sentenceE}
                        </Typography>
                      ) : (
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => handleViewClick(index)}
                          sx={{ mt: 1, color: '#0000ff' }}
                        >
                          見る
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
};

export default TopicDataPage;
