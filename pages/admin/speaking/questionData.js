import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { 
  CircularProgress, Typography, Container, Box, Stack, Dialog, DialogTitle, DialogContent, IconButton, Tabs, Tab, List, ListItem, ListItemText
} from '@mui/material';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { markdownToHTML } from '@/utils/utils';

const TopicDataPage = () => {
  const router = useRouter();
  const { category, topic } = router.query;
  const [topicData, setTopicData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0); // タブの状態管理

  useEffect(() => {
    if (category && topic) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await axios.post('/api/admin/speaking/getQuestionData', {
            category,
            topic
          });
          setTopicData(response.data); 
        } catch (error) {
          console.error('Failed to fetch topic data:', error);
        }
        setIsLoading(false);
      };

      fetchData();
    }
  }, [category, topic]);

  // アイコンクリックで質問を選択し、ダイアログを表示
  const handleIconClick = (question) => {
    setSelectedQuestion(question);
    setIsDialogOpen(true);
  };

  // ダイアログを閉じる処理
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedQuestion(null);
  };

  // タブの切り替え処理
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 最初に戻るボタンをクリックしたときの処理
  const handleGoBack = () => {
    router.push('/admin/speaking/topicList');
  };

  return (
    <Container sx={{ mb: 10 }}>
      <Stack direction="row" spacing={2} marginBottom={3}>
        <IconButton variant="contained" color="primary" onClick={handleGoBack}>
          最初に戻る
        </IconButton>
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        topicData && (
          <Box>
            <Typography variant="h4" gutterBottom>
              {category} - {topic}
            </Typography>

            {/* タブ表示 */}
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="language tabs">
              <Tab label="English" />
              <Tab label="日本語" />
            </Tabs>

            {/* 英語タブの質問リスト */}
            {tabValue === 0 && (
              <List>
                {topicData.map((questionData, idx) => (
                  <ListItem key={idx} secondaryAction={
                    <IconButton onClick={() => handleIconClick({ question: questionData.questionE, answer: questionData.answerE })}>
                      <OpenInNewIcon />
                    </IconButton>
                  }>
                    <ListItemText primary={questionData.questionE} />
                  </ListItem>
                ))}
              </List>
            )}

            {/* 日本語タブの質問リスト */}
            {tabValue === 1 && (
              <List>
                {topicData.map((questionData, idx) => (
                  <ListItem key={idx} secondaryAction={
                    <IconButton onClick={() => handleIconClick({ question: questionData.questionJ, answer: questionData.answerJ })}>
                      <OpenInNewIcon />
                    </IconButton>
                  }>
                    <ListItemText primary={questionData.questionJ} />
                  </ListItem>
                ))}
              </List>
            )}

            {/* ダイアログ */}
            <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
              <DialogTitle>Answer Details</DialogTitle>
              {selectedQuestion && (
                <DialogContent>
                  {/* Question セクション */}
                  <Box sx={{ mb: 5 }}>
                    <Typography variant="h6" gutterBottom sx={{ padding: '0.3em', backgroundColor: '#eaf3ff', borderBottom: 'solid 3px #516ab6' }}>
                      Question
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedQuestion.question}
                    </Typography>
                  </Box>

                  {/* Answer セクション */}
                  <Box sx={{ mb: 5 }}>
                    <Typography variant="h6" gutterBottom sx={{ padding: '0.3em', backgroundColor: '#eaf3ff', borderBottom: 'solid 3px #516ab6' }}>
                      Answer
                    </Typography>
                    <div dangerouslySetInnerHTML={{ __html: markdownToHTML(selectedQuestion.answer) }} />
                  </Box>
                </DialogContent>
              )}
            </Dialog>
          </Box>
        )
      )}
    </Container>
  );
};

export default TopicDataPage;
