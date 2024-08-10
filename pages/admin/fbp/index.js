import fs from 'fs';
import path from 'path';
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Typography, Card, CardContent, Grid } from '@mui/material';

export async function getStaticProps() {
  const storyDir = path.join(process.cwd(), 'data/firstBookProject/storyContents');
  const filenames = fs.readdirSync(storyDir);

  const contentFiles = filenames.map((filename) => {
    const filePath = path.join(storyDir, filename);
    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8')); // JSONファイルを読み込む
    return { id: filename.replace('.json', ''), content: fileContent.content };
  });

  return { props: { contentFiles } };
}

export default function StoryTable({ contentFiles }) {
  const [selectedContent, setSelectedContent] = useState(null);

  const handleViewDetails = (content) => {
    setSelectedContent(content);
  };

  const formatStoryText = (text) => {
    // 改行コードを<br>に変換し、ダブルクオーテーションで囲まれた部分を太字にする
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
                  {content.titleImage ? <img src={content.titleImage} alt={content.titleJ} style={{ maxHeight: 100 }} /> : 'N/A'}
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleViewDetails(content)}>
                    詳細を見る
                  </Button>
                  <Button variant="contained" color="secondary" style={{ marginLeft: 8 }}>
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
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                {selectedContent.titleE}
              </Typography>
              
              {formatStoryText(selectedContent.storyE)}

              {selectedContent.sections.map((section, index) => (
                <Box
                  key={index}
                  sx={{
                    mt: 4,
                    p: 2,
                    backgroundColor: '#f5f5f5', // セクションごとに色を変える
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h6">セクション {index + 1}</Typography>
                  <Typography variant="body1" paragraph>
                    {section.sentencesE}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {section.sentenceJ}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    {section.wordsExplanation.map((word, i) => (
                      <Box key={i} sx={{ mt: 1 }}>
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
                    ))}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
