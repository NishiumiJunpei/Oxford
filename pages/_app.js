import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useSession, signIn, SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import theme from '../styles/theme';
import Layout from '../components/layout';
import LayoutAdmin from '../components/layoutAdmin'; // LayoutAdminをインポート
import LayoutNone from '@/components/LayoutNone';
import '../styles/globals.css'; // グローバルスタイルシート

const layoutPaths = [
  { path: '/appHome', layout: Layout },
  { path: '/user-setting', layout: Layout },
  { path: '/word-master', layout: Layout },
  { path: '/admin/fbp/bookDraft', layout: LayoutNone },
  { path: '/admin/fbp/tangocho', layout: LayoutNone },
  { path: '/admin', layout: LayoutAdmin },
  // 他のパスをここに追加可能
];

const noLayoutPaths = ['/public', '/auth', '/404']; // noLayoutのためのパス

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
    if (!session && !noLayoutPaths.some(path => router.pathname.startsWith(path))) {
      signIn(); // セッションがない場合はサインインページにリダイレクト
    }
  }, [session, status, router.pathname]);

  const matchedLayout = layoutPaths.find(({ path }) => router.pathname.startsWith(path));
  const LayoutComponent = matchedLayout ? matchedLayout.layout : null;

  return (
    <ThemeProvider theme={theme}>
      {LayoutComponent ? (
        <LayoutComponent>
          <Component {...pageProps} />
        </LayoutComponent>
      ) : (
        <Component {...pageProps} />
      )}
    </ThemeProvider>
  );
};

export default MyApp;


