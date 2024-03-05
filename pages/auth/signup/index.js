import { getCsrfToken, signIn } from "next-auth/react";
import { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert, CircularProgress, Divider } from '@mui/material';
import HomePageFooter from "@/components/public/homepageFooter";

export default function Signup({ csrfToken }) {
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
        const response = await fetch('/api/auth/sendSignupEmail', {
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

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' }); // GoogleサインインのコールバックURLを指定
  }

  return (
    <>
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ padding: 0, marginTop: 5, marginBottom: 5, textAlign: 'center' }}>
          <img src="/logo.png" alt="ロゴ" style={{ maxWidth: '250px', height: 'auto' }} />
        </Box>

        <Typography variant="subtitle1">
          登録するメールアドレスを入力してください
        </Typography>
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
            登録
          </Button>
          {isLoading && <CircularProgress />}
          {message && <Alert severity={error ? 'error' : 'success'}>{message}</Alert>}
        </Box>


        <Divider sx={{ width: '100%', my: 2 }}/>

        {/* Googleサインインボタン */}
        <Button onClick={handleGoogleSignIn} fullWidth sx={{ mt: 1, mb: 2 }}>
          <img src="/icon/google-signin.png" alt="Sign in with Google" style={{maxWidth: '70%'}}/>
        </Button>

      </Box>
    </Container>
    <HomePageFooter/>
    </>

  );
}

export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
