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
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SubTitleTypography from '@/components/subTitleTypography';
import GPTCoachButton from '@/components/gptCoachButton';
import { Visibility, VisibilityOff, Error, StarBorder, Star } from '@mui/icons-material';
import axios from 'axios';


const FilterDialog = ({ open, onClose, filterSettings, setFilterSettings }) => {
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFilterSettings((prev) => ({
      ...prev,
      filterOption: {
        ...prev.filterOption,
        [name]: checked,
      },
    }));
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>フィルタ設定</DialogTitle>
      <DialogContent>
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={filterSettings.filterOption.showNOT_MEMORIZED || false}
                onChange={handleCheckboxChange}
                name="showNOT_MEMORIZED"
              />
            }
            label={<Error color="error" />}
          />
        </Box>
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={filterSettings.filterOption.showMEMORIZED || false}
                onChange={handleCheckboxChange}
                name="showMEMORIZED"
              />
            }
            label={<StarBorder color="warning" />}
          />
        </Box>
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={filterSettings.filterOption.showMEMORIZED2 || false}
                onChange={handleCheckboxChange}
                name="showMEMORIZED2"
              />
            }
            label={<Star color="success" />}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

const WordIconButton = ({ word, languageDirection, updateWordList }) => {
  const id  = word.id;
  const status = word.memorizeStatusEJ

  const getIcon = (status) => {
    switch (status) {
      case 'MEMORIZED':
        return <StarBorder color="warning" />;
      case 'MEMORIZED2':
        return <Star color="success" />;
      case 'NOT_MEMORIZED':
      default:
        return <Error color="error" />;
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'MEMORIZED':
        return 'MEMORIZED2';
      case 'MEMORIZED2':
        return 'NOT_MEMORIZED';
      case 'NOT_MEMORIZED':
      default:
        return 'MEMORIZED';
    }
  };

  const handleIconClick = async (event) => {
    event.stopPropagation(); // Prevent click event from bubbling up
    const newStatus = getNextStatus(status);
    try {
      await axios.post('/api/word-master/updateUserWordStatus', {
        wordId: id,
        status: newStatus,
        languageDirection: languageDirection,
      });
      const updatedWord = { ...word, memorizeStatusEJ: newStatus };
      updateWordList(updatedWord);
    } catch (err) {
      console.error('Failed to update word status', err);
    }
  };

  return (
    <IconButton onClick={handleIconClick}>
      {getIcon(status)}
    </IconButton>
  );
};



const WordListPage = () => {
  const router = useRouter();
  const { blockId } = router.query;
  const [wordList, setWordList] = useState([]);
  const [modalOpenWord, setModalOpenWord] = useState(false);// 例文確認用のモーダル用の状態
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [block, setBlock] = useState(null);
  const [blocks, setBlocks] = useState(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterSettings, setFilterSettings] = useState({
    displayMode: 'EtoJ',
    showAnswer: true,
    filterOption: {
      showNOT_MEMORIZED: true,
      showMEMORIZED: true,
      showMEMORIZED2: true,
    },
  });
  const theme = useTheme();
  const [languageDirection, setLanguageDirection] = useState(router.query.languageDirection || 'EJ');
  const [tabForWordDetailDialog, setTabForWordDetailDialog] = useState(0);
  const [openSrIntroDialog, setOpenSrIntroDialog] = useState(false);
  const [progressDetail, setProgressDetail] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showJapanese, setShowJapanese] = useState(true); // 日本語の表示状態を管理するフック

  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // データ取得開始前にローディング状態をtrueに設定
      const response = await fetch(`/api/word-master/getWordList?blockId=${blockId}`);
      const data = await response.json();
      if (data && data.wordList) { // dataとdata.wordListが存在する場合のみセット
        setWordList(data.wordList);
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

  const handleOpenModalWord = (event, index) => {
    if (event.target.nodeName === 'TD') {
      setSelectedIndex(index);
      setModalOpenWord(true);
    }
  };

  const updateWordList = (newWordData) => {
    const updatedWordList = wordList.map(wordItem => 
      wordItem.id === newWordData.id ? newWordData : wordItem
    );
    setWordList(updatedWordList);
  };
    

  const handleRemoveFilter = () => {
    setFilterSettings({
      displayMode: 'EtoJ',
      showAnswer: true,
      filterOption: {
        showNOT_MEMORIZED: true,
        showMEMORIZED: true,
        showMEMORIZED2: true,
      },
    });
  };

  const toggleJapaneseVisibility = () => {
    setShowJapanese(!showJapanese);
  };

  

  // フィルタリングされた単語リストを取得
  const filteredWordList = wordList.filter((word) => {
    const { showNOT_MEMORIZED, showMEMORIZED, showMEMORIZED2 } = filterSettings.filterOption;
  
    if (showNOT_MEMORIZED && word.memorizeStatusEJ === 'NOT_MEMORIZED') {
      return true;
    }
    if (showMEMORIZED && word.memorizeStatusEJ === 'MEMORIZED') {
      return true;
    }
    if (showMEMORIZED2 && word.memorizeStatusEJ === 'MEMORIZED2') {
      return true;
    }
    return false;
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

        <Box sx={{mt: 5}}>
          <>
            <Box sx={{display: 'flex', justifyContent: 'start', alignItems: 'center'}}>
              <IconButton onClick={() => setFilterDialogOpen(true)}>
                <FilterListIcon />
              </IconButton>
              {/* <Button variant='text' color='inherit' onClick={handleRemoveFilter}>
                フィルター解除
              </Button> */}
              <GPTCoachButton words={filteredWordList} />

            </Box>
            <TableContainer component={Paper} sx={{width: filterSettings.displayMode != 'ExJtoExE' ? '100%' : 'auto'}}>
              <Table 
                sx={{ 
                  minWidth: 650, 
                  [theme.breakpoints.down('sm')]: {minWidth: 'unset' } 
                }} 
                >
                <TableHead>
                  <TableRow>
                    <TableCell>　</TableCell>
                    <TableCell>英語</TableCell>
                    <TableCell>
                      意味
                      <IconButton onClick={toggleJapaneseVisibility} style={{ marginLeft: 8 }}>
                      {showJapanese ? <Visibility /> : <VisibilityOff />}
                    </IconButton>

                    </TableCell>
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
                        onClick={(event) => handleOpenModalWord(event, index)}
                      >
                      <TableCell>
                        <WordIconButton word={word} languageDirection={languageDirection} updateWordList={updateWordList}/>
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <Typography variant="body2">{word.english}</Typography>
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}style={{ color: showJapanese ? 'inherit' : 'transparent' }}>
                        <Typography variant="body2">{word.japanese}</Typography>
                        {word.imageUrl && showJapanese ? ( 
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
