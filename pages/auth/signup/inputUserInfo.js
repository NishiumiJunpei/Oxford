import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Alert, CircularProgress, Grid, Card, CardMedia, CardContent,  } from '@mui/material';
import SubTitleTypography from '@/components/subTitleTypography';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('')  
  const [passwordError, setPasswordError] = useState('')  
  const [isLoading, setIsLoading] = useState(false); 
  const [isLoadingCreation, setIsLoadingCreation] = useState(false); 
  const [selectedThemeId, setSelectedThemeId] = useState(null);
  const [themes, setThemes] = useState([]);
  const [email, setEmail] = useState();

  useEffect(() => {
    const fetchThemes = async () =>{
        setIsLoading(true)
        const response = await axios.get('/api/user-setting/getThemes')
        if (response){
            setThemes(response.data.themes)   
            setIsLoading(false)
        }
    }

    // トークンの有効性をチェック
    if (token) {
      axios.get(`/api/auth/validateToken?token=${token}`)
        .then(response => {
          setEmail(response.data.email)
        })
        .catch(error => {
          router.push('/auth/signup'); // 無効なトークンの場合にリダイレクト
      });
      fetchThemes()
    }
  }, [token]);

  // useEffect(() => {
  //   if (password != '' || confirmPassword != ''){
  //     const isValid = password.length >= 8 && password.length <= 20 && /^[a-zA-Z0-9]+$/.test(password) && password === confirmPassword;
  //     setPasswordError(isValid ? '' : 'パスワードは半角英数字8～20文字で、確認用パスワードと一致している必要があります。');  
  //   }
  // }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = password.length >= 8 && password.length <= 20 && /^[a-zA-Z0-9]+$/.test(password) && password === confirmPassword;
    setPasswordError(isValid ? '' : 'パスワードは半角英数字8～20文字で、確認用パスワードと一致している必要があります。');  

    if (!isValid) {
      return;
    }

    setIsLoadingCreation(true); // ローディング開始
    try{
      if (email && password && selectedThemeId ){
        const response = await fetch('/api/auth/createUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email, password, selectedThemeId }),
        });
  
        const data = await response.json();
        if (data.error) {
          setError(data.message);
          setIsLoadingCreation(false); 
        } else {
          const result = await signIn('credentials', { email, password, redirect: false });
          if (result?.ok) router.push('/')
        }    
      }
    } catch (error) {
      setError('サーバーエラーが発生しました。');
    }
    setIsLoading(false); 
  };

  const handleCardSelect = (id) => {
      setSelectedThemeId(id);
  };

  return (
    <Container component="main" maxWidth="md" >
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
        <Typography component="h1" variant="h5" sx={{mb: 5}}>新規登録</Typography>

        <SubTitleTypography text="パスワード"/>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="パスワード (半角英数字8～20文字)"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="パスワードの確認"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Box>
      </Box>

      <Box sx={{mt: 7}}> 
        <SubTitleTypography text="チャレンジするテーマ"/>
        {isLoading && <CircularProgress />}

        <Grid container spacing={2} justifyContent="center">
          {themes.map(theme => (
            <Grid item xs={6} sm={6} md={4} key={theme.id}>
              <Card 
                raised 
                onClick={() => theme.activeStatus !== 'PREPARING' && handleCardSelect(theme.id)} 
                style={{ 
                  border: selectedThemeId === theme.id ? '2px solid blue' : '',
                  opacity: theme.activeStatus === 'PREPARING' ? 0.5 : 1,
                  pointerEvents: theme.activeStatus === 'PREPARING' ? 'none' : 'auto',
                  cursor: theme.activeStatus !== 'PREPARING' ? 'pointer' : 'default', // カーソルのスタイルを変更
                  transition: 'transform 0.3s ease', // トランジション効果を追加
                }}
                sx={{
                  '&:hover': {
                    transform: theme.activeStatus !== 'PREPARING' ? 'scale(1.05)' : 'none', // ホバー時のスケール変更
                    boxShadow: theme.activeStatus !== 'PREPARING' ? 3 : 'none', // ホバー時の影の強調
                  }
                }}
        
              >
                <div style={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    image={`/images/${theme.imageFilename}`}
                    alt={theme.name}
                    style={{ height: '200px', objectFit: 'contain' }}
                  />
                  {theme.activeStatus === 'PREPARING' && (
                    <Typography style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'white',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      padding: '5px'
                    }}>
                      準備中
                    </Typography>
                  )}
                </div>
                <CardContent>
                  <Typography gutterBottom variant="subtitle1" component="div">
                    {theme.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box sx={{ marginTop: 2 }}>
        <Button
          type="button"
          fullWidth
          variant="contained"
          color="primary"
          disabled={!selectedThemeId || isLoadingCreation} // 選択されたテーマがなければ無効
          onClick={handleSubmit}
          sx={{mb: 2, }}
        >
          登録
        </Button>
        {isLoadingCreation && <CircularProgress />}

        {passwordError && <Alert severity="error">{passwordError}</Alert>}
      </Box>


    </Container>

  );
}
