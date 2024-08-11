import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Typography, Card, CardContent, Snackbar } from '@mui/material';

export default function StoryTable() {
  const [storyList, setStoryList] = useState([]);
  const [selectedStoryItem, setSelectedStoryItem] = useState(null);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // コンポーネントがマウントされたときにAPIからデータを取得する
  useEffect(() => {
    const fetchStoryList = async () => {
      try {
        const response = await fetch('/api/admin/fbp/getStoryList');
        if (response.ok) {
          const data = await response.json();
          setStoryList(data);
        } else {
          console.error('Failed to fetch story list');
        }
      } catch (error) {
        console.error('Error fetching story list:', error);
      }
    };

    fetchStoryList();
  }, []);

  const handleViewDetails = (storyItem) => {
    setSelectedStoryItem(storyItem);
  };

  const handleGenerateImage = async (type, contentId, sectionIndex, wordIndex, prompt, englishWord = '') => {
    try {
      setMessage('画像生成をリクエストしました');
      setOpenSnackbar(true);

      const response = await fetch('/api/admin/fbp/createImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: type,
          contentId: contentId, 
          sectionIndex: sectionIndex,
          wordsExplanationIndex: wordIndex,
          prompt: prompt,
          englishWord: englishWord,
        }),
      });

      if (response.ok) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error('Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  const formatStoryText = (text) => {
    return text.split('\n').map((line, index) => (
      <Typography key={index} variant="body1" paragraph>
        {line.split(/("[^"]+")/g).map((part, idx) =>
          part.startsWith('"') && part.endsWith('"') ? (
            <strong key={idx}>{part}</strong>
          ) : (
            part
          )
        )}
      </Typography>
    ));
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  console.log('test', storyList)
  return (
    <Box sx={{ p: 3 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Content ID</TableCell>
              <TableCell>Title (Japanese)</TableCell>
              <TableCell>Title Image</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {storyList.map(({ contentId, content }) => (
              <TableRow key={contentId}>
                <TableCell>{contentId}</TableCell>
                <TableCell>{content.titleJ}</TableCell>
                <TableCell>
                  {content.titleImageUrl ? <img src={content.titleImageUrl} alt={content.titleJ} style={{ maxHeight: 100 }} /> : 'N/A'}
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleViewDetails({ contentId, content })}>
                    詳細を見る
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    style={{ marginLeft: 8 }}
                    onClick={() => handleGenerateImage('TITLE', contentId, null, null, content.promptForTitleImage)}
                  >
                    タイトル画像生成
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedStoryItem && (
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {selectedStoryItem.content.titleJ}
              </Typography>
              {selectedStoryItem.content.titleImageFilename && (
                <Box>
                  <img src={`${selectedStoryItem.content.titleImageUrl}`} height={300} />
                </Box>
              )}
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                {selectedStoryItem.content.titleE}
              </Typography>

              {formatStoryText(selectedStoryItem.content.storyE)}

              {selectedStoryItem.content.sections.map((section, sectionIndex) => (
                <Box
                  key={sectionIndex}
                  sx={{
                    mt: 4,
                    p: 2,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6">セクション {sectionIndex + 1}</Typography>
                  <Typography variant="body1" paragraph>
                    {section.sentencesE}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {section.sentenceJ}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    {section.wordsExplanation.map((word, wordIndex) => (
                      <Box key={wordIndex} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'start', mt: 5 }}>
                        <Box sx={{ flex: 0.7 }}>
                          <Typography variant="h6" color="primary" gutterBottom>
                            {word.englishWord}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            日本語: {word.japanese}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            意味: {word.meaningInThisStory}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            使用法: {word.usage}
                          </Typography>
                        </Box>
                        <Box sx={{ ml: 2 }}>
                          {word.imageUrl ? (
                            <>
                              <img src={word.imageUrl} alt={word.englishWord} style={{ maxHeight: 300 }} />
                              <Button
                                variant="contained"
                                color="secondary"
                                sx={{ mt: 1 }}
                                onClick={() => handleGenerateImage('WORD', selectedStoryItem.contentId, sectionIndex, wordIndex, word.promptForImageGeneration, word.englishWord)}
                              >
                                単語画像再生成
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() => handleGenerateImage('WORD', selectedStoryItem.contentId, sectionIndex, wordIndex, word.promptForImageGeneration, word.englishWord)}
                            >
                              単語画像生成
                            </Button>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={message}
      />
    </Box>
  );
}
