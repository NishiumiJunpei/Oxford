import { createTheme } from '@mui/material/styles';


const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#26a96a',
      light: '#C8E6C9',
      dark: 'rgb(26,116,107)',
      contrastText: '#fff',
    },
    secondary: {
      main: '#ff196c',
      light: '#ffe5ec',
      dark: 'rgb(178, 17, 75)',
      contrastText: '#fff',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#fff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#fff',
    },
    background: {
      default: '#d3f3c7',
    },
    text: {
      primary: 'rgba(67,67,67,0.87)',
    }, 
    link: {
      main: '#0000EE'
    }
  },
  typography: {
    fontFamily: [
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 500,
      letterSpacing: '-0.00833em',
    },
    // 他のタイポグラフィ設定
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  // 他のグローバル設定を追加することができます
});

export default theme;
