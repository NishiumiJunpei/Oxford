import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '@mui/material/styles';
import { Typography, Button, TableContainer, Table, TableHead, TableRow, TableCell, 
  TableBody, Paper, Avatar, Box, Chip, CircularProgress, IconButton, 
  Tabs, Tab, FormControlLabel, Switch, Checkbox, Card, CardContent, CardHeader,
  Dialog, DialogTitle, DialogContent, DialogActions, FormGroup, FormControl, RadioGroup, Radio } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TimerIcon from '@mui/icons-material/Timer';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';
import WordExampleSentenceModal from '../../components/wordExampleSentenceModal';
import StoryCreationDialog from '../../components/storyCreationDialog'
import WordStoryDetailsDialog from '../../components/wordStoryDetailsDialog'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SubTitleTypography from '@/components/subTitleTypography';


const FilterDialog = ({ open, onClose, filterSettings, setFilterSettings }) => {
  const handleRadioChange = (event) => {
    setFilterSettings(prev => ({
      ...prev,
      isEnglishToJapanese: event.target.value === 'EtoJ'
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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>フィルタ設定</DialogTitle>
      <DialogContent>
        <Box>
          <SubTitleTypography text="表示モード"/>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="display-mode"
              name="display-mode"
              value={filterSettings.isEnglishToJapanese ? 'EtoJ' : 'JtoE'}
              onChange={handleRadioChange}
            >
              <FormControlLabel value="EtoJ" control={<Radio />} label="英⇨日" />
              <FormControlLabel value="JtoE" control={<Radio />} label="日⇨英" />
            </RadioGroup>
          </FormControl>
        </Box>

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

        <Box>
          <SubTitleTypography text="絞り込み"/>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterSettings.showEJOnlyNOT_MEMORIZED}
                  onChange={handleCheckboxChange}
                  name="showEJOnlyNOT_MEMORIZED"
                />
              }
              label={
                <>
                  英⇨日
                  <StarBorderIcon style={{ color: '#D3D3D3' }}/>
                  <StarBorderIcon style={{ color: '#D3D3D3' }}/> 
                  のみ表示
                </>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterSettings.showJEOnlyNOT_MEMORIZED}
                  onChange={handleCheckboxChange}
                  name="showJEOnlyNOT_MEMORIZED"
                />
              }
              label={
                <>
                 日⇨英 
                 <StarBorderIcon style={{ color: '#D3D3D3' }}/>
                  <StarBorderIcon style={{ color: '#D3D3D3' }}/> 
                  のみ表示
                </>
              }
            />
          </FormGroup>
        </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};



const WordListPage = () => {
  const router = useRouter();
  const { blockId } = router.query;
  const [wordList, setWordList] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [modalOpenWord, setModalOpenWord] = useState(false);// 例文確認用のモーダル用の状態
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [progress, setProgress] = useState(null);
  const [unknownCount, setUnknownCount] = useState(0);
  const [wordStoryList, setWordStoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openStoryCreationDialog, setOpenStoryCreationDialog] = useState(false);
  const [openWordStoryDetailsDialog, setOpenWordStoryDetailsDialog] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [block, setBlock] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isEnglishToJapanese, setIsEnglishToJapanese] = useState(true);
  const [showAnswer, setShowAnswer] = useState(true);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterSettings, setFilterSettings] = useState({
    isEnglishToJapanese: true,
    showAnswer: true,
    showEJOnlyNOT_MEMORIZED: false,
    showJEOnlyNOT_MEMORIZED: false,
  });
  const theme = useTheme();

  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // データ取得開始前にローディング状態をtrueに設定
      const response = await fetch(`/api/word-master/getWordList?blockId=${blockId}`);
      const data = await response.json();
      console.log('test', data)
      if (data && data.wordList) { // dataとdata.wordListが存在する場合のみセット
        setWordList(data.wordList);
        setProgress(data.progress);
        setUnknownCount(data.unknownCount);
        setWordStoryList(data.wordStoryList);
        setBlock(data.block);

      }
      setIsLoading(false); // データ取得後にローディング状態をfalseに設定
    };

    if (blockId) {
      fetchData();
    }
  }, [blockId]);


  const handleBack = () => {
    router.push(`/word-master/wordMasterTop`);
  };



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
    console.log('test', newStory)
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

  const handleOpenFilterDialog = () => {
    setFilterDialogOpen(true);
  };

  const handleCloseFilterDialog = () => {
    setFilterDialogOpen(false);
  };


  // フィルタリングされた単語リストを取得
  const filteredWordList = wordList.filter(word => {
    const statusFilter = selectedStatus.length === 0 || selectedStatus.includes(word.status);
    const ejFilter = filterSettings.showEJOnlyNOT_MEMORIZED ? word.memorizeStatusEJ === 'NOT_MEMORIZED' : true;
    const jeFilter = filterSettings.showJEOnlyNOT_MEMORIZED ? word.memorizeStatusJE === 'NOT_MEMORIZED' : true;
    return statusFilter && ejFilter && jeFilter;
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

        <Box display="flex" alignItems="center" mt={1} width="100%" sx={{marginBottom: 5}}>
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="div" sx={{mr: 5}}>
                {block?.theme.name}
            </Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <IconButton
                onClick={() => router.push(`/word-master/wordList?&blockId=${parseInt(blockId, 10) - 1}`)}
                disabled={blockId === '1'}
              >
                <ArrowBackIosIcon />
              </IconButton>
              <Avatar sx={{ bgcolor: 'secondary.main', color: '#fff', ml: 1, mr: 1 }}>{block?.name}</Avatar>
              <IconButton
                onClick={() => router.push(`/word-master/wordList?&blockId=${parseInt(blockId, 10) + 1}`)}
              >
                <ArrowForwardIosIcon />
              </IconButton>

            </Box>
          </Box>
        </Box>
        

        <SubTitleTypography text="ステータス" />
        <Box display="flex" alignItems="center" sx={{mb: 2}}>
          {unknownCount > 0 ? (
            <Chip variant="outlined" label="測定中" color="default" icon={<TimerIcon />} />
          ) :  (
            <Box display="flex" justifyContent="space-between" sx={{ width: '100%' }}>
              <Card sx={{ flex: 1, minWidth: 150, mr: 1 }}> {/* minWidth を追加 */}
                <CardHeader 
                  title={<Typography variant="subtitle1">英⇨日</Typography>} 
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
              <Card sx={{ flex: 1, minWidth: 150, mr: 1 }}> {/* minWidth を追加 */}
                <CardHeader 
                  title={<Typography variant="subtitle1">日⇨英</Typography>} 
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
      
          )}
        </Box>
        <Button variant="contained" onClick={() => router.push(`/word-master/learnWordsCriteriaInput?blockId=${blockId}`)} sx={{marginBottom: 3}}>
              理解度チェック
        </Button>


        {unknownCount == 0 &&(
          <>
            <SubTitleTypography text="スタディ" />
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
                <TableContainer component={Paper} sx={{maxHeight: 700, overflowY: 'auto', }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>{filterSettings.isEnglishToJapanese ? "English" : "Japanese"}</TableCell>
                        <TableCell>{filterSettings.isEnglishToJapanese ? "Japanese" : "English"}</TableCell>
                        <TableCell sx={{ '@media (max-width: 600px)': { display: 'none' } }}>英→日</TableCell>
                        <TableCell sx={{ '@media (max-width: 600px)': { display: 'none' } }}>日→英</TableCell>
                        <TableCell sx={{ '@media (max-width: 600px)': { display: 'none' } }}>例文</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredWordList?.map((word, index) => (
                        <TableRow 
                          key={index}
                          sx={{ 
                            backgroundColor: (word.memorizeStatusEJ === 'NOT_MEMORIZED' && word.memorizeStatusJE === 'NOT_MEMORIZED') && theme.palette.secondary.light,
                            cursor: 'pointer', // カーソルをポインターに設定して、クリック可能であることを示します
                            }}
                          onClick={() => handleOpenModalWord(index)} // ここでクリ
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{filterSettings.isEnglishToJapanese ? word.english : word.japanese}</TableCell>
                          <TableCell>
                            {filterSettings.showAnswer ? filterSettings.isEnglishToJapanese ? word.japanese : word.english : "　　　　　　　　" }
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


                          <TableCell sx={{ '@media (max-width: 600px)': { display: 'none' } }}>
                            {filterSettings.showAnswer ? 
                              (word.exampleSentence?.length > 30
                              ? `${word.exampleSentence?.substring(0, 30)}...`
                              : word.exampleSentence)
                              : "　　　　　　　　　　　　　　　"
                            }
                          </TableCell>
                          {/* <TableCell sx={{ '@media (max-width: 600px)': { display: 'none' } }}>
                            <Typography>
                                {word.userWordListStatus.lastMemorizedTimeAgo }
                            </Typography>
                            <Typography>
                              {word.userWordListStatus.numMemorized}, {word.userWordListStatus.numNotMemorized}
                            </Typography>
                          </TableCell> */}


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
                  <TableContainer component={Paper}>
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
                              {item.storyContent.substring(0, 30)}
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

          </>          
        )}

        </>
      )}
      </Box>
      <WordExampleSentenceModal
        open={modalOpenWord}
        onClose={() => setModalOpenWord(false)}
        wordList={filteredWordList}
        initialIndex={selectedIndex}
        updateWordList={updateWordList}
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
        onClose={handleCloseFilterDialog}
        filterSettings={filterSettings}
        setFilterSettings={setFilterSettings}
      />
      
    </Box>
  );
};

export default WordListPage;
