import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Alert, CircularProgress } from '@mui/material';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { token } = router.query;
  const [isFormValid, setIsFormValid] = useState(false); // フォームのバリデーション状態
  const [isLoading, setIsLoading] = useState(false); 

  useEffect(() => {
    // トークンの有効性をチェック
    if (token) {
      axios.get(`/api/auth/validatePasswordResetToken?token=${token}`)
        .then(response => {
          // トークンが有効な場合の処理
        })
        .catch(error => {
          setError('無効なトークンです。');
        });
    }
  }, [token]);

  useEffect(() => {
    // パスワードのバリデーションを実行し、フォームの有効性を更新
    setIsFormValid(password.length >= 8 && password.length <= 20 && /^[a-zA-Z0-9]+$/.test(password) && password === confirmPassword);
  }, [password, confirmPassword]);

  useEffect(() => {
    if (success) {
      // パスワードリセットが成功したら、数秒後にホームページにリダイレクトする
      setTimeout(() => {
        router.push('/');
      }, 3000); // ここでは3秒後にリダイレクト
    }
  }, [success, router]);  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      return;
    }

    setIsLoading(true); // ローディング開始
    try{
      // API呼び出し (userIdを追加する必要があります)
      const response = await fetch('/api/auth/resetPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.message);
        setIsLoading(false); 
      } else {
        setSuccess(true);
        setIsLoading(false); 
      }

    } catch (error) {
      setError('サーバーエラーが発生しました。');
      setIsLoading(false); 
    }



  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">パスワード設定</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="新しいパスワード (半角英数字8～20文字)"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="パスワードの確認"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={!isFormValid || isLoading}
          >
            更新
          </Button>
          {isLoading && <CircularProgress />}
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">パスワードが更新されました。</Alert>}
        </Box>
      </Box>
    </Container>

  );
}
