import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '@mui/material/styles';
import { Typography, Button, TableContainer, Table, TableHead, TableRow, TableCell, 
  TableBody, Paper, Avatar, Box, Chip, LinearProgress, CircularProgress, IconButton, Tabs, Tab, FormControlLabel, Switch, Checkbox } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TimerIcon from '@mui/icons-material/Timer';
import WordExampleSentenceModal from '../../components/wordExampleSentenceModal';
import StoryCreationDialog from '../../components/storyCreationDialog'
import WordStoryDetailsDialog from '../../components/wordStoryDetailsDialog'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SubTitleTypography from '@/components/subTitleTypography';


const WordListPage = () => {
  const router = useRouter();
  const { blockId } = router.query;
  const [wordList, setWordList] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [modalOpenWord, setModalOpenWord] = useState(false);// 例文確認用のモーダル用の状態
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [progress, setProgress] = useState(0);
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
  const theme = useTheme();

  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // データ取得開始前にローディング状態をtrueに設定
      const response = await fetch(`/api/word-master/getWordList?blockId=${blockId}`);
      const data = await response.json();
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

  useEffect(() => {
    if (unknownCount > 0) {
      // unknownCountが0より大きい場合、selectedStatusをUNKNOWNのみに設定
      setSelectedStatus(['UNKNOWN']);
    } else if (progress !== 100) {
      // unknownCountが0かつprogressが100でない場合、selectedStatusをNOT_MEMORIZEDのみに設定
      setSelectedStatus(['NOT_MEMORIZED']);
    }
  }, [unknownCount, progress]);
  

  const handleBack = () => {
    router.push(`/word-master/wordMasterTop`);
  };

  // ステータスフィルタリング関数
  const handleStatusFilter = (status) => {
    const newStatus = selectedStatus.includes(status)
      ? selectedStatus.filter(s => s !== status)
      : [...selectedStatus, status];
    setSelectedStatus(newStatus);
  };

  // フィルタリングされた単語リストを取得
    const filteredWordList = wordList && wordList.filter(word => 
      selectedStatus.length === 0 || selectedStatus.includes(word.status)
    ); // wordListが存在する場合のみfilterを実行

  // テーブルヘッド内のフィルタリングアイコン
  const StatusFilterIcons = () => (
    <Box sx={{ marginBottom: 3 }}>
      <Typography variant="caption">フィルター</Typography>
      <Box
        display="flex"
        flexWrap="wrap"
        alignItems="center"
      >        
        <Box display="flex" alignItems="center" sx={{ marginRight: 7, marginBottom: 1 }}>
          <Typography variant="body1">英→日</Typography>
          <Switch checked={isEnglishToJapanese} onChange={toggleLanguageDirection} />
          <Typography variant="body1">日→英</Typography>
        </Box>
        <FormControlLabel
          control={<Checkbox checked={showAnswer} onChange={toggleShowAnswer} />}
          label="答えを表示"
          sx={{ marginRight: 7, marginBottom: 1 }}
        />
        <Box display="flex" alignItems="center" sx={{ marginRight: 2, marginBottom: 1 }}>
          <Typography variant="body1">ステータス表示</Typography>
          <CheckCircleIcon
            style={{ color: selectedStatus.includes('MEMORIZED') ? 'green' : 'inherit', marginRight: 5 }}
            onClick={() => handleStatusFilter('MEMORIZED')}
          />
          <WarningIcon
            style={{ color: selectedStatus.includes('NOT_MEMORIZED') ? 'orange' : 'inherit', marginRight: 5 }}
            onClick={() => handleStatusFilter('NOT_MEMORIZED')}
          />
          <HelpOutlineIcon
            style={{ color: selectedStatus.includes('UNKNOWN') ? 'gray' : 'inherit' }}
            onClick={() => handleStatusFilter('UNKNOWN')}
          />
        </Box>
      </Box>
    </Box>
  );


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
    
  
  const handleImageSearch = (englishWord) => {
    const url = `https://www.google.com/search?tbm=isch&q=${englishWord}`;
    window.open(url, '_blank');
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
  const toggleLanguageDirection = () => {
    setIsEnglishToJapanese(!isEnglishToJapanese);
  };
  
  const toggleShowAnswer = (event) => {
    setShowAnswer(event.target.checked);
  };

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
          ) : progress === 100 ? (
            <Chip label="マスター" color="primary" icon={<CheckCircleIcon />} />
          ) : (
            <>
              {/* <LinearProgress variant="determinate" value={progress} sx={{ width: '50%' }} /> */}
              <Typography variant="h3" color="primary" sx={{ marginLeft: 2 }}>{`${Math.round(progress)}%`}</Typography>
            </>
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
                <StatusFilterIcons/>        
                <TableContainer component={Paper} sx={{maxHeight: 700, overflowY: 'auto', }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ '@media (max-width: 600px)': { display: 'none' } }}></TableCell>
                        <TableCell>#</TableCell>
                        <TableCell>{isEnglishToJapanese ? "English" : "Japanese"}</TableCell>
                        <TableCell>{isEnglishToJapanese ? "Japanese" : "English"}</TableCell>
                        <TableCell sx={{ '@media (max-width: 600px)': { display: 'none' } }}>例文</TableCell>
                        {/* <TableCell　sx={{ '@media (max-width: 600px)': { display: 'none' } }}>その他</TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredWordList?.map((word, index) => (
                        <TableRow 
                          key={index}
                          sx={{ 
                            backgroundColor: word.status === 'NOT_MEMORIZED' ? theme.palette.primary.light  : 
                                            word.status === 'UNKNOWN' ? '#808080' : 'inherit',
                            cursor: 'pointer', // カーソルをポインターに設定して、クリック可能であることを示します
                            }}
                          onClick={() => handleOpenModalWord(index)} // ここでクリ
                        >
                          <TableCell>
                            {word.status === 'MEMORIZED' && <CheckCircleIcon style={{ color: 'green' }} />}
                            {word.status === 'NOT_MEMORIZED' && <WarningIcon style={{ color: 'orange' }} />}
                            {word.status === 'UNKNOWN' && <HelpOutlineIcon style={{ color: 'gray' }} />}
                          </TableCell>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{isEnglishToJapanese ? word.english : word.japanese}</TableCell>
                          <TableCell>
                            {showAnswer ? isEnglishToJapanese ? word.japanese : word.english : "　　　　　　　　" }
                          </TableCell>
                          <TableCell sx={{ '@media (max-width: 600px)': { display: 'none' } }}>
                            {showAnswer ? 
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


    </Box>
  );
};

export default WordListPage;
