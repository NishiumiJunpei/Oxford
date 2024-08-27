import React from 'react';
import { Box, Typography, Button, Container, Grid, AppBar, Toolbar } from '@mui/material';
import { useRouter } from 'next/router';
import HomePageHeader from '@/components/public/homepageHeader';
import HomePageFooter from '@/components/public/homepageFooter';
import SEOHeader from '@/components/seoHeader';

export default function HomePage() {
  const router = useRouter()

  const handleClickAppButton = () =>{
    router.push('/auth/signin')
  }

  return (
    <>
      <SEOHeader title="SusuEnglish"/>
      <HomePageHeader/>

      <Container sx={{
        maxWidth: '1200px',
        m: 'auto',
        p: '20px',
        backgroundColor: 'white',
      }}>
        <Box sx={{
        backgroundColor: '#fff',
        p: '50px 20px',
        borderRadius: '10px',
        mb: '40px',
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
          <Typography variant="h1" component="h1" gutterBottom>
              語彙力に特化
            </Typography>
            <Typography variant="h1" component="h1" gutterBottom>
              AI英単語強化アプリ
            </Typography>
            <Typography mb={2}>
              GPTを活用した英語学習で、語彙力を飛躍的に向上
            </Typography>
            <Button variant="contained" color="secondary" sx={{mb: 7}} onClick={handleClickAppButton}>
              アプリを使う
            </Button>
          </Grid>
          <Grid item xs={12} md={6} sx={{
            display: 'flex',
            justifyContent: 'center',
          }}>
            <Box component="img" src="/images/hp/app-image.png" alt="Inspiring Image" sx={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '10px',
              maxWidth: { xs: '80%', md: '100%' }, // モバイルでの表示サイズ調整
            }}/>
          </Grid>
        </Grid>
        </Box>

        <Box sx={{display: 'flex', justifyContent: 'center', mt: 10}}>
          <Typography variant="h2" sx={{mb: 5}}>
            英語ができないのは語彙力が低いから
          </Typography>i
        </Box>
        <Box sx={{
          mb: 10,
          pt: 5,
          pb: 5,
          pl: 2,
          pr: 2,
          borderRadius: '10px',
          backgroundImage: 'linear-gradient(0deg, rgba(31, 182, 255, 0.1) 4%, rgba(177, 109, 246, 0.1) 95%)',
        }}>
          <Typography>
            <span style={{ textDecoration: 'underline', textDecorationColor: 'yellow', backgroundColor: 'rgba(255, 255, 0, 0.3)' }}>
              英語（リーディング、リスニング、スピーキング）ができないとき、そもそもその単語を知らない、聞けない、使えない、というケースが非常に多いです。
            </span>
            語彙力は英語力の基礎力であり、リーディング、リスニング、スピーキングすべてに影響します。
            語彙力を向上させることで、英語の基礎力をあげることができ、英文記事の理解、ネイティブのプレゼンの理解、ネイティブとの会話など、さまざまな英語力を効率的に向上させることができます。
          </Typography>
        </Box>
        

        <Box sx={{display: 'flex', justifyContent: 'center', mt: 10, mb: 5}}>
          <Typography variant="h2">
            susuEnglishの特徴
          </Typography>i
        </Box>
        <Grid container justifyContent={'space-around'} alignItems={'stretch'} spacing={2}>
        <Grid item xs={12} md={6} sx={{ mt: 1, mb: 1,  }}>
          <Box sx={{ p: 5, height:'100%', backgroundColor: '#fdeef0', borderRadius: 5 }}>
            <Typography variant="h4">ビジュアルで覚えられる</Typography>
            <Box sx={{ mt: 5 }}>
              <Typography>AI画像を使ってビジュアルも含めて覚えられる。ビジュアルだけでなく、音声、類語、単語を使うシーンなどさまざまな情報があるから、より深く記憶できる</Typography>
            </Box>
            <Box sx={{ mt: 5 }}>
              <img src="/images/hp/learnByVisual.png" alt="App Visual" style={{ width: '80%' }} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 1, mb: 1,  }}>
          <Box sx={{ p: 5, height:'100%', backgroundColor: '#e6f6e9', borderRadius: 5 }}>
            <Typography variant="h4">パーソナライズ例文で覚えられる</Typography>
            <Box sx={{ mt: 5 }}>
              <Typography>AIがあなたの英語レベル、興味・好きなことを考慮して、苦手単語を使った例文を作ります。あなたの好きな分野で使う例文なのでより深く記憶できます。</Typography>
            </Box>
            <Box sx={{ mt: 5 }}>
              <img src="/images/hp/learnByPersonalizedSent.png" alt="Personalized Examples" style={{ width: '80%' }} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 1, mb: 1,  }}>
          <Box sx={{ p: 5, height:'100%', backgroundColor: '#F6FDC3', borderRadius: 5 }}>
            <Typography variant="h4">AI作のストーリーで覚えられる</Typography>
            <Box sx={{ mt: 5 }}>
              <Typography>AIがあなたの苦手な単語を組み合わせて、ストーリーを作ります。ストーリーで覚えるため、より深く記憶できます。</Typography>
            </Box>
            <Box sx={{ mt: 5 }}>
              <img src="/images/hp/learnByAIStory.png" alt="AI Stories" style={{ width: '80%' }} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 1, mb: 1, }}>
          <Box sx={{ p: 5, height:'100%', backgroundColor: '#E3F6FF', borderRadius: 5  }}>
            <Typography variant="h4">忘れやすい単語に集中できる</Typography>
            <Box sx={{ mt: 5 }}>
              <Typography>あなたが苦手な単語に対して、1時間後、6時間後、24時間後など忘れやすいタイミングで復習できるため、より深く記憶できます。</Typography>
            </Box>
            <Box sx={{ mt: 5 }}>
              <img src="/images/hp/learnByRepetition.png" alt="Focused Review" style={{ width: '80%' }} />
            </Box>
          </Box>
        </Grid>
      </Grid>



        <Box sx={{display: 'flex', justifyContent: 'center', mt: 10}}>
          <Typography variant="h2" sx={{mb: 5}}>
            今だけ！β版を無料で体験
          </Typography>
        </Box>

        
        <Box sx={{
          textAlign: 'center',
          p: '40px 20px',
          borderRadius: '10px',
        }}>
          <Typography sx={{mb:2}}>
            現在β版のため、無料公開しています。すべての機能を無料で使うことができます。
          </Typography>
          <Button variant="contained" color="secondary" onClick={handleClickAppButton}>
            今すぐ無料でサインアップ
          </Button>
        </Box>
        
      </Container>
      <HomePageFooter/>
    </>
  );
}
