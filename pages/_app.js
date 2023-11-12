import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useSession, signIn, SessionProvider } from 'next-auth/react';
import { useRouter } from "next/router";
import theme from '../styles/theme';
import Layout from '../components/layout';
import '../styles/globals.css'; // グローバルスタイルシート

const MyApp = ({ Component, pageProps: { session, ...pageProps } }) => {
  const router = useRouter();

  return (
    <SessionProvider session={session}>
      <InnerApp Component={Component} pageProps={pageProps} router={router} />
    </SessionProvider>
  );
};

const InnerApp = ({ Component, pageProps, router }) => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // セッションの状態がロード中の場合は待機
    if (!session && !router.pathname.startsWith('/public/') && !router.pathname.startsWith('/auth/')) {
      signIn(); // セッションがない場合はサインインページにリダイレクト
    }
  }, [session, status, router.pathname]);

  // /public/ または /auth/ パスの場合は Layout を適用しない
  const noLayout = router.pathname.startsWith('/public/') || router.pathname.startsWith('/auth/');

  return (
    <ThemeProvider theme={theme}>
      {noLayout ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </ThemeProvider>
  );
};

export default MyApp;
