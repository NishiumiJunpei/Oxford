import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Stack, CircularProgress, Typography, Divider, Container, Box, Chip } from '@mui/material';
import { useRouter } from 'next/router';

const TopicListPage = () => {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loading状態
  const [isCreating, setIsCreating] = useState(false); // トピック作成中の状態
  const router = useRouter();

  // APIからトピックデータを取得する関数
  const fetchTopics = async () => {
    setIsLoading(true); // ローディング開始
    try {
      const response = await axios.post('/api/admin/speaking/getTopicList');
      setTopics(response.data); // APIから取得したデータを設定
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
    setIsLoading(false); // ローディング終了
  };

  // 初回ロード時にトピックデータを取得
  useEffect(() => {
    fetchTopics();
  }, []);

  // トピックデータ作成ボタンが押されたときの処理
  const handleCreateTopicData = async () => {
    setIsCreating(true); // 作成中状態に変更
    try {
      await axios.post('/api/admin/speaking/createTopicData');
      // 作成完了後にトピックリストを再取得
      fetchTopics();
    } catch (error) {
      console.error('Failed to create topic data:', error);
    }
    setIsCreating(false); // 作成終了
  };

  // トピックボタンが押されたときの処理 (パラメータを渡して遷移)
  const handleTopicClick = (category, topic) => {
    router.push({
      pathname: '/admin/speaking/topicData',
      query: { category, topic }
    });
  };

  return (
    <Container sx={{ mb: 10 }}>
      {/* トピックデータ作成ボタン */}
      <Stack direction="row" spacing={2} marginBottom={3}>
        <Button variant="contained" color="primary" onClick={handleCreateTopicData} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'トピックデータ作成'}
        </Button>
      </Stack>

      {/* ローディング中の表示 */}
      {isLoading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        // トピックデータ表示
        topics.map((categoryData, index) => (
          <Box key={index} marginBottom={5}>
            <Typography variant="h6" gutterBottom>
              {categoryData.category}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
              {categoryData.topicList.map((topicData, idx) => (
                <Chip
                  key={idx}
                  label={topicData.topicName}
                  onClick={() => handleTopicClick(categoryData.category, topicData.topicName)}
                  sx={{ mb: 1 }}
                  color="primary"
                />
              ))}
            </Stack>
            {index < topics.length - 1 && <Divider style={{ margin: '32px 0' }} />}
          </Box>
        ))
      )}
    </Container>
  );
};

export default TopicListPage;
