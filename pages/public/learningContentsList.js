import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { useRouter } from 'next/router';
import HomePageHeader from '@/components/public/homepageHeader';
import HomePageFooter from '@/components/public/homepageFooter';

export default function HomePage() {
  const router = useRouter()

  const handleClickAppButton = () =>{
    router.push('/auth/signin')
  }

  return (
    <>
      <HomePageHeader/>
      <Container maxWidth="lg">
        <Box
          display="flex" // Flexboxを使う
          justifyContent="center" // 中央寄せ（水平方向）
          alignItems="center" // 中央寄せ（垂直方向）
          minHeight="80vh" // コンテンツの高さが少ない場合でも、画面のほとんどを占めるようにする
        >
          <Typography variant="h4">
            準備中
          </Typography>
        </Box>
      </Container>
      <HomePageFooter/>
    </>
  );
}
