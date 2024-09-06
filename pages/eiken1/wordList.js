import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { Typography, Button, TableContainer, Table, TableHead, TableRow, TableCell, 
  TableBody, Paper, Avatar, Box, CircularProgress, IconButton, FormLabel,
  Tabs, Tab, FormControlLabel, Checkbox,Snackbar,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormGroup, FormControl, RadioGroup, Radio, Link, 
  Container} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';
import WordDetailDialog from '../../components/wordDetailDialog2';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SubTitleTypography from '@/components/subTitleTypography';
import GPTCoachButton from '@/components/gptCoachButton';
import { Visibility, VisibilityOff, Error, StarBorder, Star, CheckBox } from '@mui/icons-material';
import SEOHeader from '@/components/seoHeader';
import AudioPlayerModalButton from '@/components/audioPlayerModalButton';
import { useMediaQuery } from '@mui/material';


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

  const handleSelectErrorOnly = () => {
    setFilterSettings((prev) => ({
      ...prev,
      filterOption: {
        showNOT_MEMORIZED: true,
        showMEMORIZED: false,
        showMEMORIZED2: false,
      },
    }));
  };

  const handleRadioChange = (event) => {
    setFilterSettings((prev) => ({
      ...prev,
      updateStatus: event.target.value,
    }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}       
      PaperProps={{
      style: {
        minWidth: '320px'
      }
    }}
>
      <DialogTitle>フィルタ設定</DialogTitle>
      <DialogContent>
        <Box>
          <FormLabel>ステータス</FormLabel>
          <Box sx={{mt: 2, mb: 2}}>
            <Button onClick={handleSelectErrorOnly} sx={{padding: 0}}> <Error color="error" />だけ選択</Button>
          </Box>
        </Box>
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
        <Box sx={{mt: 5}}>
          <FormLabel>ステータス更新日</FormLabel>
          <RadioGroup value={filterSettings.updateStatus || ''} onChange={handleRadioChange}>
            <FormControlLabel value="all" control={<Radio />} label="全て" />
            <FormControlLabel value="1day" control={<Radio />} label="1日以内" />
            <FormControlLabel value="3days" control={<Radio />} label="3日以内" />
            <FormControlLabel value="7days" control={<Radio />} label="7日以内" />
          </RadioGroup>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button onClick={onClose}>閉じる</Button>
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
    updateStatus: 'all', 
  });
  const theme = useTheme();
  const [languageDirection, setLanguageDirection] = useState(router.query.languageDirection || 'EJ');
  const [tabForWordDetailDialog, setTabForWordDetailDialog] = useState(0);
  const [showJapanese, setShowJapanese] = useState(true); // 日本語の表示状態を管理するフック
  const [visibleRows, setVisibleRows] = useState({}); // 各行の見るボタンと日本語表示状態を管理するフック
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md')); // 'md'は960px以上

  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // データ取得開始前にローディング状態をtrueに設定
      const response = await fetch(`/api/admin/getWordList?blockId=${blockId}`);
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


  useEffect(() => {
    const savedFilterSettings = localStorage.getItem('filterSettings');
    if (savedFilterSettings) {
      setFilterSettings(JSON.parse(savedFilterSettings));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('filterSettings', JSON.stringify(filterSettings));
  }, [filterSettings]);
  

  const handleBack = () => {
    router.push(`/eiken1`);
  };


  const handleBlockMoveClick = (increment) => {
    const newDisplayOrder = block.displayOrder + increment;
    const newBlock = blocks.find(b => b.displayOrder === newDisplayOrder);
    if (newBlock) {
      router.push(`/eiken1/wordList?blockId=${newBlock.id}`);
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
    if (showJapanese) {
      const newVisibleRows = wordList.reduce((acc, word) => {
        acc[word.id] = { showJapanese: false, showButton: true };
        return acc;
      }, {});
      setVisibleRows(newVisibleRows);
    }
    setShowJapanese(!showJapanese);
  };

  const handleViewClick = (wordId) => {
    setVisibleRows((prev) => ({
      ...prev,
      [wordId]: { showJapanese: true, showButton: false },
    }));
  };

    

  // フィルタリングされた単語リストを取得
  const filteredWordList = wordList.filter((word) => {
    return word
  });

  
  console.log('wordList', wordList)
  return (
    <Container>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </div>
      ) : (
          <>
            <Box sx={{mt: 2}}>
              <Box display="flex" alignItems="center" onClick={handleBack} sx={{cursor: 'pointer'}}>
                <Typography sx={{mb: 1, mr: 2}}>
                    戻る
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" justifyContent="flex-start">
                <IconButton
                  onClick={() => handleBlockMoveClick(-1)}
                >
                  <ArrowBackIosIcon />
                </IconButton>
                <Avatar sx={{ bgcolor: 'primary.main', color: '#fff', ml: 1, mr: 1 }}>
                  {block?.name}
                </Avatar>
                <IconButton
                  onClick={() => handleBlockMoveClick(1)}
                  >
                  <ArrowForwardIosIcon />
                </IconButton>
              </Box>
            </Box>

        <Box sx={{mt: 2}}>
          <>
            <Box sx={{display: 'flex', justifyContent: 'start', alignItems: 'center'}}>
              {/* <IconButton onClick={() => setFilterDialogOpen(true)} sx={{mr: 3}}>
                <FilterListIcon />
              </IconButton> */}
              {/* <Button variant='text' color='inherit' onClick={handleRemoveFilter}>
                フィルター解除
              </Button> */}
              {/* <Box sx={{mr: 3}}>
                <GPTCoachButton words={filteredWordList} />
              </Box> */}
              {/* <Box sx={{mr: 3}}>
                <AudioPlayerModalButton words={filteredWordList} />
              </Box> */}


            </Box>
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
              <Table >
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell style={{ width: '10px' }} >No</TableCell>
                    <TableCell style={{ width: '100px' }}>
                      英語
                    </TableCell>
                    <TableCell style={{ width: '100px' }}>
                      意味
                      <IconButton onClick={toggleJapaneseVisibility} style={{ marginLeft: 8 }}>
                        {showJapanese ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </TableCell>
                    {isLargeScreen && (
                      <TableCell style={{ width: '400px' }}>
                        例文
                      </TableCell>
                    )}

                  </TableRow>
                </TableHead>


                <TableBody>
                  {filteredWordList?.map((word, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        backgroundColor: index % 2 === 0 ? theme.palette.primary.light : 'white', // 偶数行に薄灰色の背景を適用
                        cursor: 'pointer', 
                        verticalAlign: 'top'
                      }}
                      onClick={(event) => handleOpenModalWord(event, index)}
                    >
                      <TableCell style={{ width: '10px' }} >{index+1}</TableCell>
                      <TableCell sx={{ verticalAlign: 'top', width: '100px' }}>
                        <Typography variant="body2">{word.english}</Typography>
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top', width: '100px' }}>
                        {showJapanese || visibleRows[word.id]?.showJapanese ? (
                          <>
                            <Typography variant="body2">{word.japanese}</Typography>
                            {word.imageUrl && (
                              <img 
                                src={word.imageUrl} 
                                alt={word.english} 
                                style={{ maxWidth: '200px', maxHeight: 'auto', objectFit: 'contain', display: 'block', marginTop: '8px' }} 
                              />
                            )}
                            {/* <GPTCoachButton words={[word]} styleType="LINK" /> */}
                          </>
                        ) : (
                          <>
                            {visibleRows[word.id]?.showButton && (
                              <Button 
                                onClick={() => handleViewClick(word.id)}
                                sx={{
                                  fontSize: theme.typography.body2.fontSize,
                                  margin: 0,
                                  padding: 0,
                                  textTransform: 'none' // ボタンテキストの大文字変換を防止
                                }}
                              >
                              見る
                            </Button>

                            )}
                            <div style={{ width: '200px', height: '200px', backgroundColor: 'transparent', marginTop: '8px' }}></div>
                          </>
                        )}
                      </TableCell>
                      {isLargeScreen && (
                        <TableCell style={{ width: '400px' }}>
                          <Box>
                            {word.exampleSentenceE}
                          </Box>
                          <Box>
                            {word.exampleSentenceJ}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            </TableContainer>

          </>

        </Box>

        </>
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


    </Container>
  );
};

export default WordListPage;
