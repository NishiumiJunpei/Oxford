import React from 'react';
import { Box, Typography, Button, Container, Grid, AppBar, Toolbar } from '@mui/material';
import { useRouter } from 'next/router';


export default function HomePageFooter() {
    const router = useRouter()
  
    const handleClickAppButton = () =>{
      router.push('/auth/signin')
    }
  
    return (
        <>
            <Box sx={{
            fontSize: '0.8em',
            textAlign: 'center',
            p: '20px',
            backgroundColor: '#F6F6F6',
            borderRadius: '10px',
            mt: 10,
            }}>
            <Typography>
                © 2024 susuEnglish
            </Typography>
            <Typography>
                <a href="/public/homepage" sx={{color: '#61dafb', textDecoration: 'none'}}>HP</a> 　|　 
                <a href="/public/privacyPolicy" sx={{color: '#61dafb', textDecoration: 'none'}}>プライバシーポリシー</a> 　|　
                <a href="/public/riyokiyaku" sx={{color: '#61dafb', textDecoration: 'none'}}>利用規約</a> 　|　
                <a href="/public/inquiry" sx={{color: '#61dafb', textDecoration: 'none'}}>お問い合わせ</a>
            </Typography>
            </Box>

        </>
    )
}
