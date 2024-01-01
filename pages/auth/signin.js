import React, { useEffect, useState } from 'react';
import { getCsrfToken, signIn } from "next-auth/react";
import { TextField, Button, Container, Typography, Box, Divider, Link, CircularProgress } from '@mui/material';
import NextLink from 'next/link'; // Next.jsのLinkコンポーネントをインポート

export default function SignIn({ csrfToken }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault(); // フォームのデフォルトの送信を防ぐ
    setIsLoading(true); // ローディング開始
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/'
      });

      if (result.error) {
        throw new Error(result.error);
      }

      window.location.href = result.url; // リダイレクト
    } catch (error) {
      setErrorMessage('ログインに失敗しました');
    } finally {
      setIsLoading(false); // ローディング終了
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true); // ローディング開始
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      setErrorMessage('Googleサインインに失敗しました。');
    } finally {
      setIsLoading(false); // ローディング終了
    }
  };



  return (
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
          <img src="/icon/powered-by-openai-badge-filled-on-light.svg" alt="OpenAIロゴ" style={{ maxWidth: '200px', height: 'auto', margin: '15px' }} />
        </Box>

        <form method="post" onSubmit={handleSignIn} style={{ mt: 1, width: '100%' }}>
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            ログイン
          </Button>
        </form>
        {isLoading && <CircularProgress />}
        {errorMessage && <Typography color="error">{errorMessage}</Typography>}

        {/* パスワードを忘れた方はこちら */}
        <NextLink href="/auth/forgotPassword" passHref>
          <Link sx={{ mt: 2, textAlign: 'center' }}>パスワードを忘れた方はこちら</Link>
        </NextLink>

        {/* 新規登録 */}
        <NextLink href="/auth/signup/" passHref>
          <Link sx={{ mt: 2, textAlign: 'center' }}>新規登録</Link>
        </NextLink>


        <Divider sx={{ width: '100%', my: 2 }}/>

        {/* Googleサインインボタン */}
        <Button onClick={handleGoogleSignIn} fullWidth sx={{ mt: 1, mb: 2 }}>
          <img src="/icon/google-signin.png" alt="Sign in with Google" style={{maxWidth: '70%'}}/>
        </Button>

      </Box>
    </Container>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
