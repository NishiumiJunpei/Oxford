import { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert, CircularProgress } from '@mui/material';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setMessage('');

    setIsLoading(true); // ローディング開始
    try{
        const response = await fetch('/api/auth/sendPasswordResetEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (data.error) {
            setError(true);
            setMessage(data.message);
        } else {
            setMessage('パスワード再設定のメールを送信しました。');
        }        
        setIsLoading(false); 

    } catch (error) {
        setError('サーバーエラーが発生しました。');
        setIsLoading(false); // ローディング終了
      }
  
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="subtitle1">登録したメールアドレスを入力してください</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="メールアドレス"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            パスワード再発行
          </Button>
          {isLoading && <CircularProgress />}
          {message && <Alert severity={error ? 'error' : 'success'}>{message}</Alert>}
        </Box>
      </Box>
    </Container>
  );
}
