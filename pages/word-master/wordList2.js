import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '@mui/material/styles';
import { Typography, Button, TableContainer, Table, TableHead, TableRow, TableCell, 
  TableBody, Paper, Avatar, Box, Grid, CircularProgress, IconButton, List, ListItem, ListItemText,
  Tabs, Tab, FormControlLabel, Switch, Checkbox, Card, CardContent, CardHeader,Snackbar,
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
          アセスメントをして、間違えた単語に対して間隔反復が行えます。
        </DialogContentText>
        <DialogContentText>
          ※間隔反復は、10分後、1時間後、5時間後、翌日、など間隔をあけて復習して効率的に記憶する方法です
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button color="primary" onClick={handleCheckUnderstanding}>
          アセスメント
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
    filterOption: '',
  });
  const theme = useTheme();
  const wordSectionRef = useRef(null);
  const [languageDirection, setLanguageDirection] = useState(router.query.languageDirection || 'EJ');
  const [tabForWordDetailDialog, setTabForWordDetailDialog] = useState(0);
  const [openSrIntroDialog, setOpenSrIntroDialog] = useState(false);
  const [progressDetail, setProgressDetail] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // データ取得開始前にローディング状態をtrueに設定
      const response = await fetch(`/api/word-master/getWordList?blockId=${blockId}`);
      const data = await response.json();
      if (data && data.wordList) { // dataとdata.wordListが存在する場合のみセット
        setWordList(data.wordList);
        setProgress(data.progress);
        setProgressDetail(data.progressDetail);
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
      router.push(`/word-master/wordList2?blockId=${newBlock.id}`);
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

  const setFilterBasedOnStatus = ()=>{
    if (languageDirection == 'EJ'){
      const clearNOT_MEMORIZED = wordList.every(word => word.memorizeStatusEJ !== 'NOT_MEMORIZED');
      const allMemorized2 = wordList.every(word => word.memorizeStatusEJ == 'MEMORIZED2');
      setFilterSettings({
        ...filterSettings, 
        filterOption: allMemorized2 ? '' :
                      clearNOT_MEMORIZED ? 'showEJOnlyMEMORIZED' : 'showEJOnlyNOT_MEMORIZED'
      })

    }else if (languageDirection == 'JE'){
      const clearNOT_MEMORIZED = wordList.every(word => word.memorizeStatusJE !== 'NOT_MEMORIZED');
      const allMemorized2 = wordList.every(word => word.memorizeStatusJE == 'MEMORIZED2');
      setFilterSettings({
        ...filterSettings, 
        filterOption: allMemorized2 ? '' :
                      clearNOT_MEMORIZED ? 'showJEOnlyMEMORIZED' : 'showJEOnlyNOT_MEMORIZED'
      })

    }
  }

  const handleClickLearnByVisual = () =>{
    scrollToWordSection() 
    setSelectedTab(0)
    setFilterBasedOnStatus()
    handleOpenModalWord(0)
  }
  
  const handleClickRedSheet = () =>{
    scrollToWordSection() 
    setSelectedTab(0)
    setFilterBasedOnStatus()
    setFilterSettings({...filterSettings, showAnswer: false})

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
      setFilterBasedOnStatus()

      handleOpenModalWord(0)
  
      setTabForWordDetailDialog(index)

    }
  }

  const handleRemoveFilter = () =>{
    setFilterSettings({
      displayMode: 'EtoJ',
      showAnswer: true,
      filterOption: '',
    })
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


  const handleWordsCopy = async () => {
    const wordsText = filteredWordList.map(word => `${word.english}, ${word.japanese}`).join('\n');
    try {
      await navigator.clipboard.writeText(wordsText);
      setCopySuccess(true);
    } catch (err) {
      setError('Failed to copy');
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
            <Box display="flex" width="100%" sx={{flexDirection: { xs: 'column', sm: 'row' }}}>
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

        <Box ref={wordSectionRef} style={{minHeight: '100vh'}} sx={{mt: 5}}>
          <>
            <Box sx={{display: 'flex', justifyContent: 'start', alignItems: 'center'}}>
              {/* <IconButton onClick={() => setFilterDialogOpen(true)}>
                <FilterListIcon />
              </IconButton> */}
              {/* <Button variant='text' color='inherit' onClick={handleRemoveFilter}>
                フィルター解除
              </Button> */}
              <Button variant='text' color='inherit' onClick={handleWordsCopy} sx={{ml: 3}}>
                単語コピー
              </Button>

            </Box>
            <TableContainer component={Paper} sx={{width: filterSettings.displayMode != 'ExJtoExE' ? '100%' : 'auto', maxHeight: 850, overflowY: 'auto', overflowX: 'auto'}}>
              <Table 
                sx={{ 
                  minWidth: 650, 
                  [theme.breakpoints.down('sm')]: {minWidth: 'unset' } 
                }} 
                >
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>英語</TableCell>
                    <TableCell>意味</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>                  
                  {filteredWordList?.map((word, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        backgroundColor: (word.memorizeStatusEJ === 'NOT_MEMORIZED' && word.memorizeStatusJE === 'NOT_MEMORIZED') && theme.palette.secondary.light,
                        cursor: 'pointer', 
                        verticalAlign: 'top' // これで行の上寄せを実現
                        }}
                      onClick={() => handleOpenModalWord(index)}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <Typography variant="body2">{word.english}</Typography>
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <Typography variant="body2">{word.japanese}</Typography>
                        {word.imageUrl ? ( 
                          <img 
                              src={word.imageUrl} 
                              alt={word.english} 
                              style={{ maxWidth: '200px', maxHeight: 'auto', objectFit: 'contain', display: 'block', marginTop: '8px' }} 
                          />
                        ) : (
                          <div style={{ width: '200px', height: '200px', backgroundColor: 'transparent', marginTop: '8px' }}></div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>


              </Table>
            </TableContainer>

          </>

        </Box>

        </>
      )}
      </Box>
      {error && (
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          message={error}
        />
      )}
      {copySuccess && (
        <Snackbar
          open={copySuccess}
          autoHideDuration={6000}
          onClose={() => setCopySuccess(false)}
          message="Copied to clipboard"
        />
      )}


      <WordDetailDialog
        open={modalOpenWord}
        onClose={() => setModalOpenWord(false)}
        wordList={filteredWordList}
        initialIndex={selectedIndex}
        updateWordList={updateWordList}
        initialTabValue={tabForWordDetailDialog || 0}
      />

      <FilterDialog
        open={filterDialogOpen}
        onClose={()=>setFilterDialogOpen(false)}
        filterSettings={filterSettings}
        setFilterSettings={setFilterSettings}
      />

    </Box>
  );
};

export default WordListPage;
