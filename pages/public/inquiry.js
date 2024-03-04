import React, { useState } from 'react';
import { Box, Typography, Button, Container, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import HomePageHeader from '@/components/public/homepageHeader';
import HomePageFooter from '@/components/public/homepageFooter';

export default function InquiryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  // フォームデータの変更をハンドル
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // 問い合わせ送信処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/public/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('問い合わせの送信に失敗しました。');
      }
      // 成功した場合の処理（例: フォームをクリアする、成功メッセージを表示する等）
      alert('問い合わせが送信されました。');
      setFormData({ name: '', email: '', message: '' }); // フォームをクリア
    } catch (error) {
      console.error('問い合わせの送信に失敗しました。', error);
    }
  };

  return (
    <>
      <HomePageHeader />
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" gutterBottom>
            問い合わせフォーム
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="名前"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="メールアドレス"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              type="email"
            />
            <TextField
              fullWidth
              label="メッセージ"
              name="message"
              value={formData.message}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
            />
            <Box mt={2}>
              <Button type="submit" variant="contained" color="primary">
                送信
              </Button>
            </Box>
          </form>
        </Box>
      </Container>
      <HomePageFooter />
    </>
  );
}
