import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Chip, Button, Box, Typography, FormControlLabel, Checkbox, CircularProgress, Avatar, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ProfileKeywordsSettingDialog from '@/components/profileKeywordsSettingDialog';

const LearnWordsCriteriaInput = () => {
  const router = useRouter();
  const { blockId } = router.query;
  const [languageDirection, setLanguageDirection] = useState(router.query.languageDirection || 'EJ'); // 'EJ' は英→日、'JE' は日→英
  const [wordCount, setWordCount] = useState(router.query.languageDirection == 'JE' ? '5' : '50'); // '10', '30', '50'
  const [includeMemorized, setIncludeMemorized] = useState(false); 
  const [themeAllWordsFlag, setThemeAllWordsFlag] = useState(false); 
  const [block, setBlock] = useState(null);
  const [isLoading, setIsLoading] = useState(false)
  const [noKeyword, setNoKeyword] = useState(false)
  const [openProfileKeywordsSettingDialog, setOpenProfileKeywordsSettingDialog] = useState(false)  


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // データ取得開始前にローディング状態をtrueに設定
      const response = await fetch(`/api/word-master/getBlock?blockId=${blockId}`);
      const data = await response.json();
      if (data) { // dataとdata.wordListが存在する場合のみセット
        setBlock(data.block);
      }
      setIsLoading(false); // データ取得後にローディング状態をfalseに設定
    };

    if (blockId) {
      fetchData();
    }
  }, [blockId]);

  

  useEffect(() => {
    const fetchUserData = async () =>{
      setIsLoading(true); // データ取得開始前にローディング状態をtrueに設定
      const response = await fetch(`/api/user-setting/getUserInfo`);
      const data = await response.json();
      if (data) {
        const {interestKeywords, profileKeywords} = data
        if (interestKeywords && profileKeywords){
          setNoKeyword(false)
        }else{
          setNoKeyword(true)
        }
      }
      setIsLoading(false); // データ取得後にローディング状態をfalseに設定
    }
    fetchUserData()

  }, [openProfileKeywordsSettingDialog, setOpenProfileKeywordsSettingDialog]);

  
  const handleSubmit = () => {
    const queryParams = new URLSearchParams({
      blockId,
      wordCount,
      languageDirection,
      includeMemorized: includeMemorized ? 1 : 0, // includeMemorizedを追加
      themeAllWordsFlag: themeAllWordsFlag ? 1 : 0,
      themeId: block.theme.id,
    }).toString();
  
    if (languageDirection == 'EJ') {
      router.push(`/word-master/learnWordsCheckEJ?${queryParams}`);      
    }else{
      router.push(`/word-master/learnWordsCheckJE?${queryParams}`);      
    }
  };
 
  const handleBack = () =>{
    router.back()
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 500}}>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
        戻る
      </Button>
      {isLoading && (
      <Box display="flex" justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
        <CircularProgress />
      </Box>
      )}

      <Box display="flex" width="100%" sx={{flexDirection: { xs: 'column', sm: 'row' }}}>
        <Box display="flex" alignItems="center">
          <Typography variant="h4"sx={{mb: 1, mr: 2}}>
              {block?.theme.name}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="flex-start">
          <Avatar sx={{ bgcolor: 'secondary.main', color: '#fff', ml: 1, mr: 1 }}>
            {block?.name}
          </Avatar>
        </Box>
      </Box>



      <Typography variant="h6" sx={{mb: 5, mt: 2}} color='primary'>アセスメント</Typography>
      
      <Typography variant="subtitle1" color="GrayText" sx={{mb: 2}}>モード</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, marginBottom: 5 }}>
        <Chip label="英→日" color={languageDirection === 'EJ' ? 'primary' : 'default'} onClick={() => setLanguageDirection('EJ')} />
        <Chip label="日→英" color={languageDirection === 'JE' ? 'primary' : 'default'} onClick={() => setLanguageDirection('JE')} />
      </Box>
      {languageDirection == 'JE' && (
        <Box sx={{mb: 2}}>
          <Link sx={{cursor: 'pointer'}} onClick={()=>setOpenProfileKeywordsSettingDialog(true)}>
            プロフィール・興味のキーワード設定
          </Link>
        </Box>
      )}


      <Typography variant="subtitle1" color="GrayText" sx={{mb: 2}}>単語数</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, marginBottom: 5 }}>
        <Chip label="5" color={wordCount === '5' ? 'primary' : 'default'} onClick={() => setWordCount('5')} />
        <Chip label="10" color={wordCount === '10' ? 'primary' : 'default'} onClick={() => setWordCount('10')} />
        <Chip label="30" color={wordCount === '30' ? 'primary' : 'default'} onClick={() => setWordCount('30')} />
        <Chip label="50" color={wordCount === '50' ? 'primary' : 'default'} onClick={() => setWordCount('50')} />
      </Box>

      <Typography variant="subtitle1" color="GrayText" sx={{mb: 2}}>対象単語</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, marginBottom: 1 }}>
        <FormControlLabel
          control={<Checkbox checked={includeMemorized} onChange={(e) => setIncludeMemorized(e.target.checked)} />}
          label="覚えている単語も含める"
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, marginBottom: 5 }}>
        <FormControlLabel
          control={<Checkbox checked={themeAllWordsFlag} onChange={(e) => setThemeAllWordsFlag(e.target.checked)} />}
          label={`「${block?.theme.name}」の全体`}
        />
      </Box>

      <Box sx={{ textAlign: 'left' }}>
        <Button variant="outlined" onClick={handleSubmit} disabled={languageDirection == 'JE' && noKeyword}>
          スタート
        </Button>
      </Box>
      {languageDirection == 'JE' && noKeyword && (
      <Typography color="error">
        プロフィール・興味のキーワードを設定してください。
      </Typography>
      )}

      <ProfileKeywordsSettingDialog
        open={openProfileKeywordsSettingDialog}
        onClose={()=>setOpenProfileKeywordsSettingDialog(false)}
      />

    </Box>

  );
};

export default LearnWordsCriteriaInput;

