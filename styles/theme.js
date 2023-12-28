import { createTheme } from '@mui/material/styles';


const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#046b1e',
    },
    secondary: {
      main: '#ff196c',
    },
    background: {
      // default: '#d3f3c7',
      default: '#a33',
    },
    text: {
      primary: 'rgba(67,67,67,0.87)',
    },
  },
  // palette: {
  //   primary: {
  //     light: '#63a4fff',
  //     main: '#1976d2',
  //     dark: '#004ba0',
  //     contrastText: '#fff',
  //   },
  //   secondary: {
  //     light: '#ff4081',
  //     main: '#f50057',
  //     dark: '#c51162',
  //     contrastText: '#fff',
  //   },
    // 他のカラー設定も追加できます
  // },

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
