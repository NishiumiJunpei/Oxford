import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { 
  CircularProgress, Typography, Container, Box, Stack, Divider, Dialog, DialogTitle, DialogContent, DialogActions, IconButton 
} from '@mui/material';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';  // 「open window」アイコン
import { markdownToHTML } from '@/utils/utils';  // utils.jsからインポート

const TopicDataPage = () => {
  const router = useRouter();
  const { category, topic } = router.query; // URLパラメータからcategoryとtopicを取得
  const [topicData, setTopicData] = useState(null); // 取得したデータを保持する
  const [isLoading, setIsLoading] = useState(false); // ローディング状態を管理
  const [selectedQuestion, setSelectedQuestion] = useState(null); // 選択された質問データ
  const [isDialogOpen, setIsDialogOpen] = useState(false); // ダイアログの状態を管理

  // APIからデータを取得
  useEffect(() => {
    if (category && topic) {
      const fetchData = async () => {
        setIsLoading(true); // ローディング開始
        try {
          const response = await axios.post('/api/admin/speaking/getQuestionData', {
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

  // 最初に戻るボタンをクリックしたときの処理
  const handleGoBack = () => {
    router.push('/admin/speaking/topicList');
  };

  return (
    <Container sx={{ mb: 10 }}>
      {/* 最初に戻るボタン */}
      <Stack direction="row" spacing={2} marginBottom={3}>
        <IconButton variant="contained" color="primary" onClick={handleGoBack}>
          最初に戻る
        </IconButton>
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

            {/* 各 questionCategory ごとに質問を表示 */}
            {Object.entries(topicData).map(([questionCategory, questions], index) => (
              <Box key={index} mb={4}>
                <Typography variant="h6" gutterBottom>
                  {questionCategory}
                </Typography>
                <Stack spacing={2}>
                  {Array.isArray(questions) && questions.map((questionData, idx) => (
                    <Box key={idx} display="flex" alignItems="center">
                      <Typography variant="body1">
                        {questionData.question}
                      </Typography>
                      {/* アイコンを追加 */}
                      <IconButton onClick={() => handleIconClick(questionData)}>
                        <OpenInNewIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}

            {/* ダイアログ */}
            <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
              <DialogTitle>Answer Details</DialogTitle>
              {selectedQuestion && (
                <DialogContent>
                  {/* Question */}
                  <Box sx={{mb: 5}}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        padding: '0.3em', 
                        color: '#010101',
                        backgroundColor: '#eaf3ff', 
                        borderBottom: 'solid 3px #516ab6',
                      }}
                    >
                      Question
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedQuestion.question}
                    </Typography>
                  </Box>

                  {/* Simple Answer */}
                  <Box sx={{mb: 5}}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        padding: '0.3em', 
                        color: '#010101',
                        backgroundColor: '#eaf3ff', 
                        borderBottom: 'solid 3px #516ab6',
                      }}
                    >
                      Simple Answer
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedQuestion.simpleAnswer}
                    </Typography>
                  </Box>

                  {/* Detailed Answer */}
                  <Box sx={{mb: 5}}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        padding: '0.3em', 
                        color: '#010101',
                        backgroundColor: '#eaf3ff', 
                        borderBottom: 'solid 3px #516ab6',
                      }}
                    >
                      Detailed Answer
                    </Typography>
                    {/* Markdown形式のdetailedAnswerを適用 */}
                    <div
                      dangerouslySetInnerHTML={{ __html: markdownToHTML(selectedQuestion.detailedAnswer) }}
                    />
                  </Box>

                </DialogContent>
              )}
              <DialogActions>
                <IconButton onClick={handleCloseDialog} color="primary">
                  Close
                </IconButton>
              </DialogActions>
            </Dialog>
          </Box>
        )
      )}
    </Container>
  );
};

export default TopicDataPage;
