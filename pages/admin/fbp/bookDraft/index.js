import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Snackbar, Divider } from '@mui/material';

export default function StoryTable() {
  const [storyList, setStoryList] = useState([]);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // コンポーネントがマウントされたときにAPIからデータを取得する
  useEffect(() => {
    const fetchStoryList = async () => {
      try {
        const category = '宇宙小説'; // ここでcategoryの値を指定する
        const response = await fetch(`/api/admin/fbp/getStoryList?category=${category}`);
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

  return (
    <Box sx={{ p: 3 }}>
      {storyList.map(({ contentId, content }) => (
        <Card key={contentId} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {content.titleE}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              {content.titleJ}
            </Typography>
            {content.titleImageFilename && (
              <Box sx={{mt:1, mb:2}}>
                <img
                  src={`${content.titleImageUrl}`}
                  height={300}
                  style={{ borderRadius: '15px', width: '100%', objectFit: 'cover' }}
                  alt={content.titleJ}
                />
              </Box>
            )}

            {formatStoryText(content.storyE)}

            {content.sections.map((section, sectionIndex) => (
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
                    <Box key={wordIndex} >
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'start', mt: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" color="primary" gutterBottom style={{ fontSize: '1.5rem' }}>
                            {word.englishWord}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            {word.japanese}
                          </Typography>
                          <Typography variant="body2" style={{ marginTop: 20 }}>
                              <span style={{ backgroundColor: '#D3D3D3', padding: '4px' }}>解説</span>
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {word.meaningInThisStory}
                          </Typography>
                          <Typography variant="body2" style={{ marginTop: 20, }}>
                              <span style={{ backgroundColor: '#D3D3D3', padding: '4px' }}>利用シーン</span>
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {word.usage}
                          </Typography>
                        </Box>
                        <Box sx={{ ml: 2, mt:2 }}>
                          {word.imageUrl && (
                            <img
                              src={word.imageUrl}
                              alt={word.englishWord}
                              style={{ maxHeight: 200, borderRadius: '10px', objectFit: 'cover' }}
                            />
                          )}
                        </Box>
                      </Box>                    
                      <Divider sx={{mt: 2, mb: 2}} />
                    </Box>

                  ))}
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      ))}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={message}
      />
    </Box>
  );
}
