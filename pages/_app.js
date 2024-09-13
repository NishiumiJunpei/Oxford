import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useSession, signIn, SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import theme from '../styles/theme';
import Layout from '../components/layout';
import LayoutAdmin from '../components/layoutAdmin'; // LayoutAdminをインポート
import LayoutNone from '@/components/LayoutNone';
import '../styles/globals.css'; // グローバルスタイルシート
import Head from 'next/head'; // Headコンポーネントをインポート

const layoutPaths = [
  { path: '/appHome', layout: Layout },
  { path: '/user-setting', layout: Layout },
  { path: '/word-master', layout: Layout },
  { path: '/admin/fbp/bookDraft', layout: LayoutNone },
  { path: '/admin/fbp/tangocho', layout: LayoutNone },
  { path: '/admin', layout: LayoutAdmin },
  // 他のパスをここに追加可能
];

const noLayoutPaths = ['/public', '/auth', '/404', '/eiken1']; // noLayoutのためのパス

const MyApp = ({ Component, pageProps: { session, ...pageProps } }) => {
  const router = useRouter();

  useEffect(() => {
    // Google Analytics の初期化
    const handleRouteChange = (url) => {
      window.gtag('config', 'G-5D3HD7BR3H', {
        page_path: url,
      });
    };

    // ページ移動時にGoogle Analyticsにページビューを送信
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <SessionProvider session={session}>
      <Head>
        {/* Google Analyticsのタグを追加 */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-5D3HD7BR3H"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-5D3HD7BR3H');
            `,
          }}
        />
      </Head>
      <InnerApp Component={Component} pageProps={pageProps} router={router} />
    </SessionProvider>
  );
};

const InnerApp = ({ Component, pageProps, router }) => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return; // セッションの状態がロード中の場合は待機
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
