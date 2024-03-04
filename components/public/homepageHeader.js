import React from 'react';
import { Box, Typography, Button, Container, Grid, AppBar, Toolbar } from '@mui/material';
import { useRouter } from 'next/router';


export default function HomePageHeader() {
    const router = useRouter()
  
    const handleClickAppButton = () =>{
      router.push('/auth/signin')
    }
  
    return (
        <AppBar position="static" color="primary" elevation={0}>
        <Toolbar sx={{justifyContent: 'space-between'}}>
        <Box sx={{flexGrow: 1}} onClick={()=> router.push('/public/homepage')}>
            <img src="/logo.png" alt="ロゴ" style={{height: 35}} />
        </Box>
        <Button color="inherit" onClick={() => router.push('/path/to/english-learning-content')}>
            英語学習コンテンツ
        </Button>
        <Button color="secondary" variant="contained" onClick={() => router.push('/path/to/english-learning-content')}>
            アプリを使う
        </Button>
        </Toolbar>
        </AppBar> 
    )
}
