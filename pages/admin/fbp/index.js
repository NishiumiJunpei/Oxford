import fs from 'fs';
import path from 'path';
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Typography, Card, CardContent, Snackbar } from '@mui/material';
import { getS3FileUrl } from '@/utils/aws-s3-utils';

export async function getStaticProps() {
  const storyDir = path.join(process.cwd(), 'data/firstBookProject/storyContents');
  const filenames = fs.readdirSync(storyDir);

  const contentFiles = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.join(storyDir, filename);
      const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (fileContent.content.titleImageFilename) {
        const imageUrl = await getS3FileUrl(fileContent.content.titleImageFilename);
        fileContent.content.titleImageUrl = imageUrl;
      }

      if (fileContent.content.sections) {
        fileContent.content.sections = await Promise.all(
          fileContent.content.sections.map(async (section) => {
            if (section.wordsExplanation) {
              section.wordsExplanation = await Promise.all(
                section.wordsExplanation.map(async (word) => {
                  if (word.wordImageFilename) {
                    const imageUrl = await getS3FileUrl(word.wordImageFilename);
                    word.imageUrl = imageUrl;
                  }
                  return word;
                })
              );
            }
            return section;
          })
        );
      }

      fileContent.content.id = filename.replace('.json', '');

      return { content: fileContent.content };
    })
  );

  return { props: { contentFiles } };
}

export default function StoryTable({ contentFiles: initialContentFiles }) {
  const [contentFiles, setContentFiles] = useState(initialContentFiles);
  const [selectedContent, setSelectedContent] = useState(null);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbarの表示状態を管理

  const handleViewDetails = (content) => {
    setSelectedContent(content);
  };

  const handleGenerateImage = async (type, fileId, sectionIndex, wordIndex, prompt, englishWord = '') => {
    try {
        setMessage('画像生成をリクエストしました');
        setOpenSnackbar(true); // Snackbarを表示

        const response = await fetch('/api/admin/fbp/createImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: type,
          fileId: fileId,
          sectionsIndex: sectionIndex,
          wordsExplanationIndex: wordIndex,
          prompt: prompt,
          englishWord: englishWord,
        }),
      });

      if (response.ok) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);  // 1秒後にページ再読み込み
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
    setOpenSnackbar(false); // Snackbarを非表示にする
  };

  return (
    <Box sx={{ p: 3 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File Number</TableCell>
              <TableCell>Title (Japanese)</TableCell>
              <TableCell>Title Image</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contentFiles.map(({ id, content }) => (
              <TableRow key={id}>
                <TableCell>{id}</TableCell>
                <TableCell>{content.titleJ}</TableCell>
                <TableCell>
                  {content.titleImageUrl ? <img src={content.titleImageUrl} alt={content.titleJ} style={{ maxHeight: 100 }} /> : 'N/A'}
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleViewDetails(content)}>
                    詳細を見る
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    style={{ marginLeft: 8 }}
                    onClick={() => handleGenerateImage('TITLE', content.id, null, null, content.promptForTitleImage)}
                  >
                    タイトル画像生成
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedContent && (
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {selectedContent.titleJ}
              </Typography>
              {selectedContent.titleImageFilename && (
                <Box>
                  <img src={`${selectedContent.titleImageUrl}`} height={300} />
                </Box>
              )}
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                {selectedContent.titleE}
              </Typography>

              {formatStoryText(selectedContent.storyE)}

              {selectedContent.sections.map((section, sectionIndex) => (
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
                                onClick={() => handleGenerateImage('WORD', selectedContent.id, sectionIndex, wordIndex, word.promptForImageGeneration, word.englishWord)}
                              >
                                単語画像再生成
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() => handleGenerateImage('WORD', selectedContent.id, sectionIndex, wordIndex, word.promptForImageGeneration, word.englishWord)}
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

      {/* Snackbar component to show messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={message}
      />
    </Box>
  );
}
