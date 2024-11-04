import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Stack, CircularProgress, Typography, Divider, Container, Box, IconButton, List, ListItem, Dialog, DialogTitle, DialogContent, Tabs, Tab } from '@mui/material';
import { Book as BookIcon, QuestionAnswer as QuestionIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { markdownToHTML } from '@/utils/utils'; // markdown変換ユーティリティをインポート

const TopicListPage = () => {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [isCreating, setIsCreating] = useState(false); 
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [tabValue, setTabValue] = useState(0); // ダイアログのタブ

  const router = useRouter();

  const fetchTopics = async () => {
    setIsLoading(true); 
    try {
      const response = await axios.post('/api/admin/speaking/getTopicList');
      setTopics(response.data); 
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
    setIsLoading(false); 
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleCreateTopicData = async () => {
    setIsCreating(true); 
    try {
      await axios.post('/api/admin/speaking/createQuestionData');
      fetchTopics();
    } catch (error) {
      console.error('Failed to create topic data:', error);
    }
    setIsCreating(false); 
  };

  const handleTopicClick = (category, topic) => {
    router.push({
      pathname: '/admin/speaking/questionData',
      query: { category, topic }
    });
  };

  const handleDialogOpen = (topicData) => {
    setSelectedTopic(topicData);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedTopic(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container sx={{ mb: 10 }}>
      <Stack direction="row" spacing={2} marginBottom={3}>
        <Button variant="contained" color="primary" onClick={handleCreateTopicData} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'トピックデータ作成'}
        </Button>
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        topics.map((categoryData, index) => (
          <Box key={index} marginBottom={5}>
            <Typography variant="h6" gutterBottom>
              {categoryData.category}
            </Typography>
            <List>
              {categoryData.topicList.map((topicData, idx) => (
                <ListItem
                  key={idx}
                  secondaryAction={
                    <>
                      <IconButton edge="end" aria-label="view knowledge base" onClick={() => handleDialogOpen(topicData)}>
                        <BookIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="view questions" onClick={() => handleTopicClick(categoryData.category, topicData.topicName)}>
                        <QuestionIcon />
                      </IconButton>
                    </>
                  }
                >
                  <Typography>{topicData.topicName}</Typography>
                </ListItem>
              ))}
            </List>
            {index < topics.length - 1 && <Divider style={{ margin: '32px 0' }} />}
          </Box>
        ))
      )}

      {/* ダイアログ */}
      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="md">
        <DialogTitle>{selectedTopic ? selectedTopic.topicName : 'Knowledge Base'}</DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Knowledge Base Tabs">
            <Tab label="ナレッジ(E)" />
            <Tab label="ナレッジ(J)" />
            <Tab label="ブログ" />
          </Tabs>
          <Box mt={2}>
            {tabValue === 0 && selectedTopic && (
              <div
                dangerouslySetInnerHTML={{ __html: markdownToHTML(selectedTopic.knowledgeBaseE) }}
              />
            )}
            {tabValue === 1 && selectedTopic && (
              <div
                dangerouslySetInnerHTML={{ __html: markdownToHTML(selectedTopic.knowledgeBaseJ) }}
              />
            )}
            {tabValue === 2 && selectedTopic && (
              <div
                dangerouslySetInnerHTML={{ __html: markdownToHTML(selectedTopic.interestingBlog) }}
              />
            )}

          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default TopicListPage;
