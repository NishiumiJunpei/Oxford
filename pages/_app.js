// pages/_app.js
import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import theme from '../styles/theme';
import Layout from '../components/layout';
import '../styles/globals.css'; // グローバルスタイルシート

function Auth({ children }) {
  // if `{ required: true }` is supplied, `status` can only be "loading" or "authenticated"
  const { status } = useSession({ required: true })

  if (status === "loading") {
    return <div>Loading...</div>
  }

  return children
}


const MyApp = ({Component, pageProps: { session, ...pageProps },})  => {
  // const router = useRouter();

  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
          <Layout>
              <Component {...pageProps} />
          </Layout>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default MyApp;


// // pages/_app.js
// import React from 'react';
// import { ThemeProvider } from '@mui/material/styles';
// import theme from '../styles/theme';
// import Layout from '../components/layout';
// import '../styles/globals.css'; // グローバルスタイルシート

// const MyApp = ({ Component, pageProps }) => {
//   return (
//     <ThemeProvider theme={theme}>
//     <Layout>
//       <Component {...pageProps} />
//     </Layout>
//     </ThemeProvider>
//   );
// };

// export default MyApp;
