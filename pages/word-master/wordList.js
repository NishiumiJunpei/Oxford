import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { Typography, Button, TableContainer, Table, TableHead, TableRow, TableCell, 
  TableBody, Paper, Avatar, Box, CircularProgress, IconButton, FormLabel,
  Tabs, Tab, FormControlLabel, Checkbox,Snackbar,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormGroup, FormControl, RadioGroup, Radio, Link } from '@mui/material';
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
import SrTimingDialog from '@/components/srTimingDialog';
import SEOHeader from '@/components/seoHeader';
import AudioPlayerModalButton from '@/components/audioPlayerModalButton';
import VideoDialogButton from '@/components/videoDialogButton';


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
      const updatedWord = { 
        ...word, memorizeStatusEJ: newStatus, 
        lastMemorizedDateEJ: {
          timeText: 'いま',
          within1Day: true,
          within3Days: true,
          within7Days: true,
        }

       };
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

const SrSetDialog = ({ open, onClose, filteredWordList, setFilterDialogOpen }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSetSrWords = async () => {
    setLoading(true);
    try {
      const srStartTime = new Date().toISOString();
      const wordListIds = filteredWordList.map(word => word.id);

      const response = await axios.post('/api/word-master/setSrWords', {
        wordListIds,
        srStartTime,
        srLanguageDirection: 'EJ',
      });

      if (response.status === 200) {
        setMessage('セットしました。');
        setLoading(false);
      }
    } catch (error) {
      console.log('error', error);
      setMessage('セットに失敗しました。');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setLoading(false);
    onClose();
  };

  return (
    <>
      <SEOHeader title="英単語リスト"/>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>間隔反復セット</DialogTitle>
        <DialogContent>
          <DialogContentText>
            現在表示されている{filteredWordList.length}件の単語を間隔反復にセットしますか？
          </DialogContentText>
          {/* {filteredWordList.length > 20 && (
            <>
              <DialogContentText color="error">
                件数が多すぎるため絞り込みをおすすめします。
              </DialogContentText>
              <Button onClick={() => setFilterDialogOpen(true)} variant="contained" color="primary">
                フィルタ
              </Button>
            </>
          )} */}

          {message && (
            <Box sx={{mt: 5}}>
              <Typography variant="body1">
                {message}
                <Link href={`/word-master/wordMasterTop?tab=1`} passHref>
                  (間隔反復ページはこちら)
                </Link>
              </Typography>
            </Box>
          )}


        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            閉じる
          </Button>
          <Button onClick={handleSetSrWords} color="primary" variant="contained" disabled={loading || message}>
            間隔反復をセット
          </Button>
        </DialogActions>
      </Dialog>

    </>
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
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showJapanese, setShowJapanese] = useState(true); // 日本語の表示状態を管理するフック
  const [visibleRows, setVisibleRows] = useState({}); // 各行の見るボタンと日本語表示状態を管理するフック
  const [srDialogOpen, setSrDialogOpen] = useState(false);
  const [openSrTimingDialog, setOpenSrTimingDialog] = useState(false);
  const [srWord, setSrWord] = useState();

  
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
    router.push(`/word-master/wordMasterTop`);
  };


  const handleBlockMoveClick = (increment) => {
    const newDisplayOrder = block.displayOrder + increment;
    const newBlock = blocks.find(b => b.displayOrder === newDisplayOrder);
    if (newBlock) {
      router.push(`/word-master/wordList?blockId=${newBlock.id}`);
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

  const handleSrDialogOpen = () => {
    setSrDialogOpen(true);
  };
  
  const handleSrDialogClose = () => {
    setSrDialogOpen(false);
  };

  const handleOpenSrTimingDialog = (word) => {
    setSrWord(word); // ダイアログに渡すwordsを設定
    setOpenSrTimingDialog(true); // SrTimingDialogを開く
  };
    

  // フィルタリングされた単語リストを取得
  const filteredWordList = wordList.filter((word) => {
    const { showNOT_MEMORIZED, showMEMORIZED, showMEMORIZED2 } = filterSettings.filterOption;
    const { updateStatus } = filterSettings;
  
    let statusFilter = false;
    if (showNOT_MEMORIZED && word.memorizeStatusEJ === 'NOT_MEMORIZED') {
      statusFilter = true;
    }
    if (showMEMORIZED && word.memorizeStatusEJ === 'MEMORIZED') {
      statusFilter = true;
    }
    if (showMEMORIZED2 && word.memorizeStatusEJ === 'MEMORIZED2') {
      statusFilter = true;
    }
  
    if (!statusFilter) {
      return false;
    }
  
    switch (updateStatus) {
      case '1day':
        return word.lastMemorizedDateEJ?.within1Day;
      case '3days':
        return word.lastMemorizedDateEJ?.within3Days;
      case '7days':
        return word.lastMemorizedDateEJ?.within7Days;
      default:
        return true;
    }
  });

  
  return (
    <Box maxWidth="lg">
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </div>
      ) : (
          <>
            <Box >
              <Box display="flex" alignItems="center" onClick={handleBack} sx={{cursor: 'pointer'}}>
                <Typography variant="h5"sx={{mb: 1, mr: 2}}>
                    {block?.theme.name} - {block?.categoryName}
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
            <Box sx={{display: 'flex', justifyContent: 'start', alignItems: 'center', mb: 3}}>
              {block?.normalMovieUrl && (
                <Box sx={{mr: 3}}>
                  <VideoDialogButton
                    videoUrl={block.normalMovieUrl}
                    videoTitle="キソ動画"
                    buttonText="キソ動画"
                  />
                </Box>
              )}
              {block?.explanationMovieUrl && (
                <Box sx={{mr: 3}}>
                  <VideoDialogButton
                    videoUrl={block.explanationMovieUrl}
                    videoTitle="解説動画"
                    buttonText="解説動画"
                    messageType={1}
                  />
                </Box>
              )}
               
              <Button 
                onClick={() => router.push(`/word-master/learnWordsCriteriaInput?blockId=${blockId}&languageDirection=${languageDirection}`)} sx={{mr: 3}}>
                  アセスメント
              </Button>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'start', alignItems: 'center'}}>
              <IconButton onClick={() => setFilterDialogOpen(true)} sx={{mr: 3}}>
                <FilterListIcon />
              </IconButton>
              {/* <Button variant='text' color='inherit' onClick={handleRemoveFilter}>
                フィルター解除
              </Button> */}
              {/* <Box sx={{mr: 3}}>
                <GPTCoachButton words={filteredWordList} />
              </Box> */}
              <Box sx={{mr: 3}}>
                <AudioPlayerModalButton words={filteredWordList} />
              </Box>
              <Button variant="contained" color="primary" onClick={handleSrDialogOpen} sx={{mr: 3}}> 
                間隔反復セット
              </Button>

            </Box>

            <TableContainer component={Paper} sx={{ marginTop: 5 }}>
              <Table sx={{ maxWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '10px' }} >　</TableCell>
                    <TableCell >英語</TableCell>
                    <TableCell >
                      意味
                      <IconButton onClick={toggleJapaneseVisibility} style={{ marginLeft: 8 }}>
                        {showJapanese ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </TableCell>
                    <TableCell>ステータス更新日</TableCell>
                    <TableCell>間隔反復</TableCell>
                  </TableRow>
                </TableHead>

                {/* <TableBody>                  
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
                </TableBody> */}

                <TableBody>
                  {filteredWordList?.map((word, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        backgroundColor: (word.memorizeStatusEJ === 'NOT_MEMORIZED' && word.memorizeStatusJE === 'NOT_MEMORIZED') && theme.palette.secondary.light,
                        cursor: 'pointer', 
                        verticalAlign: 'top'
                      }}
                      onClick={(event) => handleOpenModalWord(event, index)}
                    >
                      <TableCell  style={{ width: '10px' }} >
                        <WordIconButton word={word} languageDirection={languageDirection} updateWordList={updateWordList} />
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <Typography variant="body2">{word.english}</Typography>
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}>
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
                            <GPTCoachButton words={[word]} styleType="LINK" />
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
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <Typography variant="body2">{word.lastMemorizedDateEJ.timeText}</Typography>
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        {word.userWordListStatus?.srStatus == 'ACTIVE' && (
                          <IconButton onClick={() => handleOpenSrTimingDialog(word)}>
                            <CheckBox/>
                          </IconButton>
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

      {/* {error && (
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
 */}

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
      <SrSetDialog
        open={srDialogOpen}
        onClose={handleSrDialogClose}
        filteredWordList={filteredWordList}
        setFilterDialogOpen={setFilterDialogOpen}
      />
      <SrTimingDialog
        open={openSrTimingDialog}
        onClose={()=>setOpenSrTimingDialog(false)}
        word={srWord} // ダイアログにwordsを渡す
      />


    </Box>
  );
};

export default WordListPage;
