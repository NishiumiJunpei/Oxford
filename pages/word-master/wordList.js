import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '@mui/material/styles';
import { Typography, Button, TableContainer, Table, TableHead, TableRow, TableCell, 
  TableBody, Paper, Avatar, Box, Grid, CircularProgress, IconButton, 
  Tabs, Tab, FormControlLabel, Switch, Checkbox, Card, CardContent, CardHeader,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormGroup, FormControl, RadioGroup, Radio, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';
import WordDetailDialog from '../../components/wordDetailDialog';
import StoryCreationDialog from '../../components/storyCreationDialog'
import WordStoryDetailsDialog from '../../components/wordStoryDetailsDialog'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SubTitleTypography from '@/components/subTitleTypography';
import ImageIcon from '@mui/icons-material/Image';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HotelIcon from '@mui/icons-material/Hotel';
import NavigateNextIcon from '@mui/icons-material/NavigateNext' 
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const FilterDialog = ({ open, onClose, filterSettings, setFilterSettings }) => {
  const handleRadioChange = (event) => {
    setFilterSettings(prev => ({
      ...prev,
      displayMode: event.target.value
    }));
  };

  const handleRadioFilterChange = (event) => {
    setFilterSettings(prev => ({
      ...prev,
      filterOption: event.target.value
    }));
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFilterSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };


  return (
    <Dialog open={open} onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          width: '100%', // モバイルデバイス用の全幅
          maxWidth: 'none', // maxWidthを無効化
          '@media (min-width: 600px)': { // 600px以上のデバイスに適用されるスタイル
            maxWidth: '50%', // デスクトップでの最大幅
          },
        },
      }}

      >
      <DialogTitle>フィルタ設定</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Box>
              <SubTitleTypography text="表示モード"/>
              <FormControl component="fieldset">
                <RadioGroup
                  aria-label="display-mode"
                  name="display-mode"
                  value={filterSettings.displayMode}
                  onChange={handleRadioChange}
                >
                  <FormControlLabel value="EtoJ" control={<Radio />} label="英⇨日" />
                  <FormControlLabel value="JtoE" control={<Radio />} label="日⇨英" />
                  <FormControlLabel value="ImageToE" control={<Radio />} label="画像⇨英" />
                  <FormControlLabel value="VoiceToE" control={<Radio />} label="音声(単語)⇨英" />
                  <FormControlLabel value="VoiceExToE" control={<Radio />} label="音声(例文)⇨英" />
                  <FormControlLabel value="ExJtoExE" control={<Radio />} label="例文(日)⇨例文(例)" />
                </RadioGroup>
              </FormControl>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <SubTitleTypography text="答え"/>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterSettings.showAnswer}
                    onChange={handleCheckboxChange}
                    name="showAnswer"
                  />
                }
                label="表示する"
              />

            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <SubTitleTypography text="絞り込み"/>
              <FormControl component="fieldset">
                <RadioGroup
                  aria-label="filter"
                  name="filter"
                  value={filterSettings.filterOption}
                  onChange={handleRadioFilterChange}
                >
                  <Typography>英⇨日</Typography>
                  <FormControlLabel 
                    value="showEJOnlyNOT_MEMORIZED" 
                    control={<Radio />} 
                    label={
                      <>
                        <StarBorderIcon style={{ color: '#D3D3D3' }}/>
                        <StarBorderIcon style={{ color: '#D3D3D3' }}/> 
                        のみ表示
                      </>
                    } 
                  />
                  <FormControlLabel 
                    value="showEJOnlyMEMORIZED" 
                    control={<Radio />} 
                    label={
                      <>
                        <StarIcon style={{ color: 'gold' }}/>
                        <StarBorderIcon style={{ color: '#D3D3D3' }}/> 
                        のみ表示
                      </>
                    } 
                  />
                  <FormControlLabel 
                    value="showEJOnlyMEMORIZED2" 
                    control={<Radio />} 
                    label={
                      <>
                        <StarIcon style={{ color: 'gold' }}/>
                        <StarIcon style={{ color: 'gold' }}/>
                        のみ表示
                      </>
                    } 
                  />

                  <Typography>日⇨英</Typography>
                  <FormControlLabel 
                    value="showJEOnlyNOT_MEMORIZED" 
                    control={<Radio />} 
                    label={
                      <>
                      <StarBorderIcon style={{ color: '#D3D3D3' }}/>
                      <StarBorderIcon style={{ color: '#D3D3D3' }}/> 
                      のみ表示
                      </>
                    } 
                  />
                  <FormControlLabel 
                    value="showJEOnlyMEMORIZED" 
                    control={<Radio />} 
                    label={
                      <>
                      <StarIcon style={{ color: 'gold' }}/>
                      <StarBorderIcon style={{ color: '#D3D3D3' }}/> 
                      のみ表示
                      </>
                    } 
                  />
                  <FormControlLabel 
                    value="showJEOnlyMEMORIZED2" 
                    control={<Radio />} 
                    label={
                      <>
                      <StarIcon style={{ color: 'gold' }}/>
                      <StarIcon style={{ color: 'gold' }}/>
                      のみ表示
                      </>
                    } 
                  />
                </RadioGroup>
              </FormControl>

            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{justifyContent: 'center'}}>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

const SrIntroDialog = ({ open, onClose, blockId }) => {
  const router = useRouter();

  const handleCheckUnderstanding = () => {
    router.push(`/word-master/learnWordsCriteriaInput?blockId=${blockId}`);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>間隔反復</DialogTitle>
      <DialogContent>
        <DialogContentText>
          理解度チェックをして、間違えた単語に対して間隔反復が行えます。
        </DialogContentText>
        <DialogContentText>
          ※間隔反復は、10分後、1時間後、5時間後、翌日、など間隔をあけて復習して効率的に記憶する方法です
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button color="primary" onClick={handleCheckUnderstanding}>
          理解度チェック
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const WordListPage = () => {
  const router = useRouter();
  const { blockId } = router.query;
  const [wordList, setWordList] = useState([]);
  const [modalOpenWord, setModalOpenWord] = useState(false);// 例文確認用のモーダル用の状態
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [progress, setProgress] = useState(null);
  const [wordStoryList, setWordStoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openStoryCreationDialog, setOpenStoryCreationDialog] = useState(false);
  const [openWordStoryDetailsDialog, setOpenWordStoryDetailsDialog] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [block, setBlock] = useState(null);
  const [blocks, setBlocks] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterSettings, setFilterSettings] = useState({
    displayMode: 'EtoJ',
    showAnswer: true,
    filterOption: 'showEJOnlyNOT_MEMORIZED',
  });
  const theme = useTheme();
  const wordSectionRef = useRef(null);
  const [languageDirection, setLanguageDirection] = useState(router.query.languageDirection || 'EJ');
  const [tabForWordDetailDialog, setTabForWordDetailDialog] = useState(0);
  const [openSrIntroDialog, setOpenSrIntroDialog] = useState(false);

  
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // データ取得開始前にローディング状態をtrueに設定
      const response = await fetch(`/api/word-master/getWordList?blockId=${blockId}`);
      const data = await response.json();
      if (data && data.wordList) { // dataとdata.wordListが存在する場合のみセット
        setWordList(data.wordList);
        setProgress(data.progress);
        setWordStoryList(data.wordStoryList);
        setBlock(data.block);
        setBlocks(data.blocks);

      }
      setIsLoading(false); // データ取得後にローディング状態をfalseに設定
    };

    if (blockId) {
      fetchData();
    }
  }, [blockId]);

  useEffect(() => {
    // URLが変わったときに状態を更新
    if (router.query.languageDirection !== languageDirection) {
      setLanguageDirection(router.query.languageDirection || 'EJ');
    }
  }, [router.query.languageDirection]);

  useEffect(()=>{
    setFilterSettings({
      ...filterSettings, 
      displayMode: languageDirection == 'EJ' ? 'EtoJ' : 'JtoE'
    })

  }, [languageDirection])


  const handleBack = () => {
    router.push(`/word-master/wordMasterTop`);
  };


  const handleBlockMoveClick = (increment) => {
    const newDisplayOrder = block.displayOrder + increment;
    const newBlock = blocks.find(b => b.displayOrder === newDisplayOrder);
    if (newBlock) {
      router.push(`/word-master/wordList?blockId=${newBlock.id}`);
    }
  }

  const handleOpenModalWord = (index) => {
    setSelectedIndex(index);
    setModalOpenWord(true);
  };

  const updateWordList = (newWordData) => {
    const updatedWordList = wordList.map(wordItem => 
      wordItem.id === newWordData.id ? newWordData : wordItem
    );
    setWordList(updatedWordList);
  };
    

  const handleOpenStoryCreationDialog = () => {
    setOpenStoryCreationDialog(true);
  };

  const handleSaveStoryCreationDialog = (newStory) => {
    // 新しいストーリーをwordStoryListに追加
    setWordStoryList(prevList => [...prevList, newStory]);
  };


  const handleCloseStoryCreationDialog = () => {
    setOpenStoryCreationDialog(false);
  };


  const handleCloseStoryDetailsDialog = () => {
    setOpenWordStoryDetailsDialog(false);
  };

  const handleOpenWordStoryDetailsDialog = (story) => {
    setSelectedStory(story);
    setOpenWordStoryDetailsDialog(true);
  };

  const onDeleteWordStory = async (id) => {
    try {
      const response = await fetch('/api/word-master/deleteWordStoryByGPT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
  
      if (response.ok) {
        setWordStoryList(prevList => prevList.filter(story => story.id !== id));
      } else {
        throw new Error('API Error');
      }
    } catch (error) {
      console.error('Failed to delete story:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const scrollToWordSection = () => {
    wordSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClickLearnByVisual = () =>{
    scrollToWordSection() 
    setSelectedTab(0)
    if (languageDirection == 'EJ'){
      const clearNOT_MEMORIZED = wordList.every(word => word.memorizeStatusEJ !== 'NOT_MEMORIZED');
      setFilterSettings({
        ...filterSettings, 
        filterOption: clearNOT_MEMORIZED ? 'showEJOnlyMEMORIZED' : 'showEJOnlyNOT_MEMORIZED'
      })

    }else if (languageDirection == 'JE'){
      const clearNOT_MEMORIZED = wordList.every(word => word.memorizeStatusJE !== 'NOT_MEMORIZED');
      setFilterSettings({
        ...filterSettings, 
        filterOption: clearNOT_MEMORIZED ? 'showJEOnlyMEMORIZED' : 'showJEOnlyNOT_MEMORIZED'
      })

    }
    handleOpenModalWord(0)
  }
  
  const handleClickRedSheet = () =>{
    scrollToWordSection() 
    setSelectedTab(0)
    if (languageDirection == 'EJ'){
      const clearNOT_MEMORIZED = wordList.every(word => word.memorizeStatusEJ !== 'NOT_MEMORIZED');
      setFilterSettings({
        ...filterSettings, 
        filterOption: clearNOT_MEMORIZED ? 'showEJOnlyMEMORIZED' : 'showEJOnlyNOT_MEMORIZED',
        showAnswer: false
      })

    }else if (languageDirection == 'JE'){
      const clearNOT_MEMORIZED = wordList.every(word => word.memorizeStatusJE !== 'NOT_MEMORIZED');
      setFilterSettings({
        ...filterSettings, 
        filterOption: clearNOT_MEMORIZED ? 'showJEOnlyMEMORIZED' : 'showJEOnlyNOT_MEMORIZED',
        showAnswer: false

      })

    }
  }

  const handleClickSR = () =>{
    setOpenSrIntroDialog(true)
  }

  const handleAILearningLink = (index)=>{
    if (index == 0){
      scrollToWordSection() 
      setSelectedTab(1)  
    }else if (index == 1 || index == 2){
      scrollToWordSection() 
      setSelectedTab(0)
      if (languageDirection == 'EJ'){
        const clearNOT_MEMORIZED = wordList.every(word => word.memorizeStatusEJ !== 'NOT_MEMORIZED');
        setFilterSettings({
          ...filterSettings, 
          filterOption: clearNOT_MEMORIZED ? 'showEJOnlyMEMORIZED' : 'showEJOnlyNOT_MEMORIZED'
        })
  
      }else if (languageDirection == 'JE'){
        const clearNOT_MEMORIZED = wordList.every(word => word.memorizeStatusJE !== 'NOT_MEMORIZED');
        setFilterSettings({
          ...filterSettings, 
          filterOption: clearNOT_MEMORIZED ? 'showJEOnlyMEMORIZED' : 'showJEOnlyNOT_MEMORIZED'
        })
  
      }
      handleOpenModalWord(0)
  
      setTabForWordDetailDialog(index)

    }
  }

  const playAudio = async (text) => {
    try {
      const response = await fetch('/api/common/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text }),
      });
  
      const data = await response.json();
      if (data.audioContent) {
        const audioBlob = new Blob([new Uint8Array(data.audioContent.data)], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Error during audio playback:', error);
    }
  };      



  // フィルタリングされた単語リストを取得
  const filteredWordList = wordList.filter(word => {
    return (filterSettings.filterOption === 'showEJOnlyNOT_MEMORIZED' ? word.memorizeStatusEJ === 'NOT_MEMORIZED' :
         filterSettings.filterOption === 'showEJOnlyMEMORIZED' ? word.memorizeStatusEJ === 'MEMORIZED' :
         filterSettings.filterOption === 'showEJOnlyMEMORIZED2' ? word.memorizeStatusEJ === 'MEMORIZED2' :
         filterSettings.filterOption === 'showJEOnlyNOT_MEMORIZED' ? word.memorizeStatusJE === 'NOT_MEMORIZED' :
         filterSettings.filterOption === 'showJEOnlyMEMORIZED' ? word.memorizeStatusJE === 'MEMORIZED' :
         filterSettings.filterOption === 'showJEOnlyMEMORIZED2' ? word.memorizeStatusJE === 'MEMORIZED2' : true);
  });
  
  return (
    <Box maxWidth="lg">
      <Box display="flex" flexDirection="column" alignItems="start" mb={2}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          戻る
        </Button>

        {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </div>
        ) : (
          <>
            <Box display="flex" width="100%" sx={{flexDirection: { xs: 'column', sm: 'row' }, marginBottom: 2}}>
              <Box display="flex" alignItems="center">
                <Typography variant="h4"sx={{mb: 1, mr: 2}}>
                    {block?.theme.name}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" justifyContent="flex-start">
                <IconButton
                  onClick={() => handleBlockMoveClick(-1)}
                >
                  <ArrowBackIosIcon />
                </IconButton>
                <Avatar sx={{ bgcolor: 'secondary.main', color: '#fff', ml: 1, mr: 1 }}>
                  {block?.name}
                </Avatar>
                <IconButton
                  onClick={() => handleBlockMoveClick(1)}
                  >
                  <ArrowForwardIosIcon />
                </IconButton>
              </Box>
            </Box>


        {progress && (
          <Box sx={{mt: 10}}>
            <SubTitleTypography text="ステータス" />
            <Box display="flex" flexDirection={{ sm: 'column', md: 'row' }} sx={{ gap: theme.spacing(2), alignItems: 'stretch' }}>
              <Card 
                sx={{ marginBottom: 2, flex: '1 0 50%', border: languageDirection === 'EJ' ? `2px solid ${theme.palette.primary.main}` : 'none', cursor: 'pointer'}}
                onClick={()=>setLanguageDirection('EJ')}
                >
                <CardHeader 
                  title={
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1">英⇨日</Typography>
                      <Tooltip title="理解度チェックですべての単語に１度正解すると100％、24時間あけて2回連続で成果すると200％になります。200%を目指しましょう。">
                        <IconButton size="small" sx={{ marginLeft: 1 }}>
                          <HelpOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  } 
                  titleTypographyProps={{ variant: 'subtitle1' }} 
                />

                <CardContent>
                  <Typography 
                    variant="h3" 
                    color={Math.round(progress?.EJ) < 100 ? 'textPrimary' : 'primary'} // 条件による色の変更
                  >
                    {`${Math.round(progress?.EJ)}%`}
                  </Typography>
                </CardContent>
              </Card>
              <Card 
                sx={{ marginBottom: 2, flex: '1 0 50%', border: languageDirection === 'JE' ? `2px solid ${theme.palette.primary.main}` : 'none', cursor: 'pointer'}}
                onClick={()=>setLanguageDirection('JE')}
                >
                <CardHeader 
                  title={
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1">日⇨英</Typography>
                      <Tooltip title="理解度チェックですべての単語に１度正解すると100％、24時間あけて2回連続で成果すると200％になります。200%を目指しましょう。">
                        <IconButton size="small" sx={{ marginLeft: 1 }}>
                          <HelpOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  } 
                  titleTypographyProps={{ variant: 'subtitle1' }} 
                />
                <CardContent>
                  <Typography 
                    variant="h3" 
                    color={Math.round(progress?.JE) < 100 ? 'textPrimary' : 'primary'} // 条件による色の変更
                  >
                    {`${Math.round(progress?.JE)}%`}
                  </Typography>
                </CardContent>
              </Card>
            </Box>          
          </Box>
        )}

        <Box sx={{mt: 10}}>
          <SubTitleTypography text="学習する"/>
          <Box display="flex" flexDirection={{ sm: 'column', md: 'row' }} sx={{ gap: theme.spacing(2), alignItems: 'stretch' }}>
            <Card sx={{ marginBottom: 2, flex: '1 0 50%'}}>
              <CardHeader title={<Typography variant="subtitle1">キホン学習</Typography>} />
              <CardContent>
                <div onClick={handleClickLearnByVisual} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: theme.spacing(2) }}>
                  <ImageIcon style={{ marginRight: theme.spacing(1) }} />
                  <Typography style={{ textDecoration: 'underline', color: theme.palette.secondary.main }}>ビジュアルで覚える</Typography>
                  <NavigateNextIcon color="secondary"/>
                </div>
                <div onClick={handleClickRedSheet} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: theme.spacing(2) }}>
                  <PsychologyAltIcon style={{ marginRight: theme.spacing(1) }} />
                  <Typography style={{ textDecoration: 'underline', color: theme.palette.secondary.main }}>赤シート風に隠して覚える</Typography>
                  <NavigateNextIcon color="secondary"/>
                </div>
                <div onClick={handleClickSR} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: theme.spacing(2) }}>
                  <HotelIcon style={{ marginRight: theme.spacing(1) }} />
                  <Typography style={{ textDecoration: 'underline', color: theme.palette.secondary.main }}>間隔反復で覚える</Typography>
                  <NavigateNextIcon color="secondary"/>
                </div>
              </CardContent>
            </Card>

            <Card sx={{ marginBottom: 2, flex: '1 0 50%' }}>
              <CardHeader title={<Typography variant="subtitle1">AI学習</Typography>} />
              <CardContent>
                <div onClick={()=>handleAILearningLink(0)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: theme.spacing(2) }}>
                  <AutoStoriesIcon style={{ marginRight: theme.spacing(1) }} />
                  <Typography style={{ textDecoration: 'underline', color: theme.palette.secondary.main }}>AI作ストーリー</Typography>
                  <NavigateNextIcon color="secondary"/>
                </div>
                <div onClick={()=>handleAILearningLink(1)} style={{ display: 'flex', alignItems: 'center',  cursor: 'pointer', marginBottom: theme.spacing(2) }}>
                  <SmartToyIcon style={{ marginRight: theme.spacing(1) }} />
                  <Typography style={{ textDecoration: 'underline', color: theme.palette.secondary.main }}>パーソナライズ例文</Typography>
                  <NavigateNextIcon color="secondary"/>
                </div>
                <div onClick={()=>handleAILearningLink(2)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: theme.spacing(2) }}>
                  <PsychologyIcon style={{ marginRight: theme.spacing(1) }} />
                  <Typography style={{ textDecoration: 'underline', color: theme.palette.secondary.main }}>AIレビュー</Typography>
                  <NavigateNextIcon color="secondary"/>
                </div>
              </CardContent>
            </Card>
          </Box>

          <Button variant="contained" color="secondary" onClick={() => router.push(`/word-master/learnWordsCriteriaInput?blockId=${blockId}`)} sx={{marginBottom: 3}}>
              理解度チェック
          </Button>
        </Box>

        <Box ref={wordSectionRef} style={{minHeight: '100vh'}} sx={{mt: 5}}>
          <SubTitleTypography text="英単語" />
          <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 3}}>
            <Tabs value={selectedTab} onChange={handleTabChange} aria-label="word list tabs">
              <Tab label="単語リスト" />
              <Tab label="単語ストーリー" />
            </Tabs>
          </Box>

          {selectedTab === 0 && (
            <>
              <IconButton onClick={() => setFilterDialogOpen(true)}>
                <FilterListIcon />
              </IconButton>
              <TableContainer component={Paper} sx={{width: filterSettings.displayMode != 'ExJtoExE' ? '100%' : 'auto', maxHeight: 700, overflowY: 'auto', overflowX: 'auto'}}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>
                        {filterSettings.displayMode === 'EtoJ' ? "英語" : 
                        filterSettings.displayMode === 'JtoE' ? "日本語" : 
                        filterSettings.displayMode === 'ImageToE' ? "イメージ" :
                        filterSettings.displayMode === 'VoiceToE' ? "音声(単語)" :
                        filterSettings.displayMode === 'VoiceExToE' ? "音声(例文)" : "例文(英)"}
                        </TableCell>
                        <TableCell
                            sx={{
                              [theme.breakpoints.down('sm')]: {
                                display: filterSettings.displayMode === 'ExJtoExE' ? 'none' : 'table-cell',
                              },
                            }}
                            >
                          {filterSettings.displayMode === 'EtoJ' ? "日本語" : 
                            filterSettings.displayMode === 'JtoE' ? "英語" : 
                            filterSettings.displayMode === 'ImageToE' ? "英語" :
                            filterSettings.displayMode === 'VoiceToE' ? "英語" :
                            filterSettings.displayMode === 'VoiceExToE' ? "英語" : "例文(日)"}
                        </TableCell>
                      <TableCell>英→日</TableCell>
                      <TableCell>日→英</TableCell>
                      {/* <TableCell sx={{ '@media (max-width: 600px)': { display: 'none' } }}>例文</TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredWordList?.map((word, index) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          backgroundColor: (word.memorizeStatusEJ === 'NOT_MEMORIZED' && word.memorizeStatusJE === 'NOT_MEMORIZED') && theme.palette.secondary.light,
                          cursor: 'pointer', 
                          }}
                        onClick={() => handleOpenModalWord(index)}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>

                          {filterSettings.displayMode === 'EtoJ' ? (
                              <Typography variant="body2">{word.english}</Typography>
                          ) : filterSettings.displayMode === 'JtoE' ? (
                              <Typography variant="body2">{word.japanese}</Typography>
                          ) : filterSettings.displayMode === 'ImageToE' ? (
                              word.imageUrl ? (
                                  <img 
                                      src={word.imageUrl} 
                                      alt={word.english} 
                                      style={{ maxWidth: '150px', maxHeight: 'auto', objectFit: 'contain' }} 
                                  />
                              ) : (
                                  <Typography variant="body2">画像がありません</Typography>
                              )
                          ) : filterSettings.displayMode === 'VoiceToE' ? (
                            <IconButton onClick={(event) => {
                                event.stopPropagation();
                                playAudio(word.english);
                            }}>
                                <VolumeUpIcon />
                            </IconButton>
                          ) : filterSettings.displayMode === 'VoiceExToE' ? (
                            <IconButton onClick={(event) => {
                              event.stopPropagation();
                              playAudio(word.exampleSentenceE);
                            }}>
                              <VolumeUpIcon />
                            </IconButton>
                          ) : filterSettings.displayMode === 'ExJtoExE' ? (
                            <Typography variant="body2">{word.exampleSentenceJ}</Typography>
                            ) : null }

                        </TableCell>
                        <TableCell
                            sx={{
                              [theme.breakpoints.down('sm')]: {
                                display: filterSettings.displayMode === 'ExJtoExE' ? 'none' : 'table-cell',
                              },
                            }}
                            >
                          <Typography
                            sx={{
                              backgroundColor: filterSettings.showAnswer ? 'transparent' : 'lightcoral',
                              color: filterSettings.showAnswer ? 'inherit' : 'lightcoral',
                              '@media (hover: hover)': {
                                '&:hover': {
                                  backgroundColor: 'transparent', // マウスオーバー時の背景色
                                },
                              },
                            }}
                          >
                          {filterSettings.displayMode === 'EtoJ' ? word.japanese : 
                          filterSettings.displayMode === 'JtoE' ? word.english : 
                          filterSettings.displayMode === 'ImageToE' ? word.english : 
                          filterSettings.displayMode === 'VoiceToE' ? word.english : 
                          filterSettings.displayMode === 'VoiceExToE' ? word.english : 
                          filterSettings.displayMode === 'ExJtoExE' ? word.exampleSentenceE : null
                          }

                          </Typography>
                        </TableCell>
                        <TableCell>
                          {word.memorizeStatusEJ === 'NOT_MEMORIZED' && (
                            <>
                              <StarBorderIcon style={{ color: '#D3D3D3' }}/>
                              <StarBorderIcon style={{ color: '#D3D3D3' }}/>
                            </>
                          )}
                          {word.memorizeStatusEJ === 'MEMORIZED' && (
                            <>
                              <StarIcon style={{ color: 'gold' }} />
                              <StarBorderIcon style={{ color: '#D3D3D3' }}/>
                            </>
                          )}
                          {word.memorizeStatusEJ === 'MEMORIZED2' && (
                            <>
                              <StarIcon style={{ color: 'gold' }} />
                              <StarIcon style={{ color: 'gold' }} />
                            </>
                          )}
                        </TableCell>
                        <TableCell>
                          {word.memorizeStatusJE === 'NOT_MEMORIZED' && (
                            <>
                              <StarBorderIcon style={{ color: '#D3D3D3' }}/>
                              <StarBorderIcon style={{ color: '#D3D3D3' }}/>
                            </>
                          )}
                          {word.memorizeStatusJE === 'MEMORIZED' && (
                            <>
                              <StarIcon style={{ color: 'gold' }} />
                              <StarBorderIcon style={{ color: '#D3D3D3' }}/>
                            </>
                          )}
                          {word.memorizeStatusJE === 'MEMORIZED2' && (
                            <>
                              <StarIcon style={{ color: 'gold' }} />
                              <StarIcon style={{ color: 'gold' }} />
                            </>
                          )}
                        </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

            </>
          )}

          {selectedTab === 1 && (
            <>
              <Box sx={{ margin: 3 }}>
                <Button variant="contained" onClick={handleOpenStoryCreationDialog}>
                  ストーリーを作る
                </Button>
              </Box>

              {wordStoryList.length>0 &&(
                <TableContainer component={Paper} sx={{maxHeight: 700, overflowY: 'auto', }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>No</TableCell>
                        <TableCell>ブロック</TableCell>
                        <TableCell>ストーリー</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {wordStoryList.map((item, index) => (
                        <TableRow key={index} 
                          onClick={() => handleOpenWordStoryDetailsDialog(item)}
                          sx={{
                            cursor: 'pointer', // カーソルをポインターに設定して、クリック可能であることを示します
                          }}
                          >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Avatar sx={{ width: 24, height: 24, marginRight: 2, fontSize:'0.75rem', bgcolor: 'secondary.main', color: '#fff' }}>{item.block.name}</Avatar>
                          </TableCell>
                          <TableCell>
                            {`${item.storyContent.substring(0, 30)}...`}
                            {/* {item.storyContent.length > 30 && (
                              <Button onClick={() => handleOpenWordStoryDetailsDialog(item)}>もっと見る</Button>
                            )} */}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

              )}

            </>
          )}
        </Box>

        </>
      )}
      </Box>
      <WordDetailDialog
        open={modalOpenWord}
        onClose={() => setModalOpenWord(false)}
        wordList={filteredWordList}
        initialIndex={selectedIndex}
        updateWordList={updateWordList}
        initialTabValue={tabForWordDetailDialog || 0}
      />

      <StoryCreationDialog 
        open={openStoryCreationDialog} 
        onClose={handleCloseStoryCreationDialog} 
        onSave={handleSaveStoryCreationDialog} 
        block={block}
      />
      <WordStoryDetailsDialog
        open={openWordStoryDetailsDialog}
        onClose={handleCloseStoryDetailsDialog}
        selectedStory={selectedStory}
        onDelete={onDeleteWordStory}
      />
      <FilterDialog
        open={filterDialogOpen}
        onClose={()=>setFilterDialogOpen(false)}
        filterSettings={filterSettings}
        setFilterSettings={setFilterSettings}
      />
     <SrIntroDialog
        open={openSrIntroDialog}
        onClose={()=>setOpenSrIntroDialog(false)}
        blockId={blockId}
      />

    </Box>
  );
};

export default WordListPage;
