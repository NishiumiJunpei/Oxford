// pages/404.js
import * as React from 'react';
import Link from 'next/link';
import { Container, Typography, Button } from '@mui/material';

export default function Custom404() {
  return (
    <Container sx={{
      textAlign: 'center',
      paddingTop: '100px',
      paddingBottom: '100px',
    }}>
      <Typography variant="h4" component="h1" sx={{ marginBottom: '24px' }}>
        お探しのページが見つかりませんでした
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: '32px' }}>
        ご不便をおかけして申し訳ありません。お探しのページは削除されたか、URLが変更された可能性があります。
      </Typography>
      <Link href="/public/homepage" passHref>
        <Button variant="contained" color="primary" sx={{ marginRight: '12px' }}>
          ホームページへ戻る
        </Button>
      </Link>
      <Link href="/" passHref>
        <Button variant="contained" color="primary">
          アプリトップ
        </Button>
      </Link>
    </Container>
  );
}
