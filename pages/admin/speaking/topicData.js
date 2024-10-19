import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Button, CircularProgress, Typography, Container, Box, Stack, Divider } from '@mui/material';
import { markdownToHTML } from '@/utils/utils';  // utils.jsからインポート

const TopicDataPage = () => {
  const router = useRouter();
  const { category, topic } = router.query; // URLパラメータからcategoryとtopicを取得
  const [topicData, setTopicData] = useState(null); // 取得したデータを保持する
  const [isLoading, setIsLoading] = useState(false); // ローディング状態を管理

  // APIからデータを取得
  useEffect(() => {
    if (category && topic) {
      const fetchData = async () => {
        setIsLoading(true); // ローディング開始
        try {
          const response = await axios.post('/api/admin/speaking/getTopicData', {
            category,
            topic
          });
          setTopicData(response.data); // APIから取得したデータを設定
        } catch (error) {
          console.error('Failed to fetch topic data:', error);
        }
        setIsLoading(false); // ローディング終了
      };

      fetchData();
    }
  }, [category, topic]);

  // 最初に戻るボタンをクリックしたときの処理
  const handleGoBack = () => {
    router.push('/admin/speaking/topicList');
  };

  return (
    <Container sx={{ mb: 10 }}>
      {/* 最初に戻るボタン */}
      <Stack direction="row" spacing={2} marginBottom={3}>
        <Button variant="contained" color="primary" onClick={handleGoBack}>
          最初に戻る
        </Button>
      </Stack>

      {/* ローディング中の表示 */}
      {isLoading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        // データ表示
        topicData && (
          <Box>
            <Typography variant="h4" gutterBottom>
              {category} - {topic}
            </Typography>

            <Typography variant="h5" gutterBottom>
              知識体系:
            </Typography>
            <div dangerouslySetInnerHTML={{ __html: markdownToHTML(topicData.knowledgeBase) }} />

            <Divider sx={{mt:5, mb:5}}/>
            <Typography variant="h5" gutterBottom>
              プレゼン:
            </Typography>
            <div dangerouslySetInnerHTML={{ __html: markdownToHTML(topicData.presentation) }} />

            <Divider sx={{mt:5, mb:5}}/>
            <Typography variant="h5" gutterBottom>
              会話:
            </Typography>
            <div dangerouslySetInnerHTML={{ __html: markdownToHTML(topicData.conversation) }} />
          </Box>
        )
      )}
    </Container>
  );
};

export default TopicDataPage;
