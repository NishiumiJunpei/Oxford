import { getCsrfToken, signIn } from "next-auth/react";
import { TextField, Button, Container, Typography, Box, Divider, Link } from '@mui/material';
import NextLink from 'next/link'; // Next.jsのLinkコンポーネントをインポート

export default function SignIn({ csrfToken }) {
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' }); // GoogleサインインのコールバックURLを指定
  }

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
        </Box>

        {/* <Typography component="h1" variant="h5">
          ログイン
        </Typography> */}
        <form method="post" action="/api/auth/callback/credentials" style={{ mt: 1, width: '100%' }}>
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
          >
            ログイン
          </Button>
        </form>

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
