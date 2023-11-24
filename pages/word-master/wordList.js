import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Typography, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Avatar, Box, Chip, LinearProgress, CircularProgress, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TimerIcon from '@mui/icons-material/Timer';
import GPTHelpModal from '../../components/gptHelpModal'; // GPTHelpModalのインポート
import WordExampleSentenceModal from '../../components/wordExampleSentenceModal';
import StoryCreationDialog from '../../components/storyCreationDialog'
import WordStoryDetailsDialog from '../../components/wordStoryDetailsDialog'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Link from 'next/link';


const WordListPage = () => {
  const router = useRouter();
  const { theme, block } = router.query;
  const [wordList, setWordList] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [modalOpen, setModalOpen] = useState(false); // gptHelp用のモーダル用の状態
  const [modalOpenWord, setModalOpenWord] = useState(null);// 例文確認用のモーダル用の状態
  const [selectedWord, setSelectedWord] = useState({}); // 選択された単語の情報を保存するステート
  const [progress, setProgress] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [wordStoryList, setWordStoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openStoryCreationDialog, setOpenStoryCreationDialog] = useState(false);
  const [openWordStoryDetailsDialog, setOpenWordStoryDetailsDialog] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // データ取得開始前にローディング状態をtrueに設定
      const response = await fetch(`/api/word-master/getWordList?theme=${theme}&block=${block}`);
      const data = await response.json();
      if (data && data.wordList) { // dataとdata.wordListが存在する場合のみセット
        setWordList(data.wordList);
        setProgress(data.progress);
        setUnknownCount(data.unknownCount);
        setWordStoryList(data.wordStoryList);
      }
      setIsLoading(false); // データ取得後にローディング状態をfalseに設定
    };

    if (theme && block) {
      fetchData();
    }
  }, [theme, block]);

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
    router.push(`/word-master/progressByBlockTheme?theme=${theme}`);
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
    <Box>
      <CheckCircleIcon
        style={{ color: selectedStatus.includes('MEMORIZED') ? 'green' : 'inherit' }}
        onClick={() => handleStatusFilter('MEMORIZED')}
      />
      <WarningIcon
        style={{ color: selectedStatus.includes('NOT_MEMORIZED') ? 'orange' : 'inherit' }}
        onClick={() => handleStatusFilter('NOT_MEMORIZED')}
      />
      <HelpOutlineIcon
        style={{ color: selectedStatus.includes('UNKNOWN') ? 'gray' : 'inherit' }}
        onClick={() => handleStatusFilter('UNKNOWN')}
      />
    </Box>
  );

  // モーダル関連の関数
  const handleOpenModal = (word) => {
    setSelectedWord(word); // 選択された単語をステートに設定
    setModalOpen(true);
  };
  const handleCloseModal = () => setModalOpen(false);
  const handleSaveModal = (savedExampleSentence) => {
    setWordList(wordList.map(word => {
      if (word.english === selectedWord.english) {
        return { ...word, exampleSentence: savedExampleSentence };
      }
      return word;
    }));
    handleCloseModal();
  };

  const handleOpenModalWord = (word) => {
    setSelectedWord(word);
    setModalOpenWord(true);
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
    setWordStoryList(prevList => [...prevList, newStory]);
    setOpenStoryCreationDialog(false);
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

  // console.log('wordList', wordList)
  

  const daysAgo = (date) => {
    const now = new Date();
    const pastDate = new Date(date);
    const differenceInTime = now.getTime() - pastDate.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
  
    return differenceInDays;
  }
  

  return (
    <div>
      <Box display="flex" flexDirection="column" alignItems="start" mb={2}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          戻る
        </Button>


        <Box display="flex" alignItems="center" mt={1} width="100%">
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="div" sx={{mr: 5}}>
                {theme}
            </Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Link href={`/word-master/wordList?theme=${theme}&block=${parseInt(block, 10) - 1}`} passHref>
                <IconButton component="a" disabled={block === '1'}>
                  <ArrowBackIosIcon />
                </IconButton>
              </Link>
              <Avatar sx={{ bgcolor: 'secondary.main', ml: 1, mr: 1 }}>{block}</Avatar>
              <Link href={`/word-master/wordList?theme=${theme}&block=${parseInt(block, 10) + 1}`} passHref>
                <IconButton component="a">
                  <ArrowForwardIosIcon />
                </IconButton>
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>

      {isLoading ? (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
      ) : (
        <>

        <Box width="100%" bgcolor="lightblue" p={1} marginTop={5} marginBottom={5}>
          <Typography variant="h6" component="div">
            ステータス
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => router.push(`/word-master/learnWordsCriteriaInput?block=${block}&theme=${theme}`)} sx={{marginBottom: 3}}>
              理解度チェック
        </Button>

        <Box display="flex" alignItems="center">
          {unknownCount > 0 ? (
            <Chip variant="outlined" label="測定中" color="default" icon={<TimerIcon />} />
          ) : progress === 100 ? (
            <Chip label="マスター" color="success" icon={<CheckCircleIcon />} />
          ) : (
            <>
              <LinearProgress variant="determinate" value={progress} sx={{ width: '50%' }} />
              <Typography variant="body2" color="textSecondary" sx={{ marginLeft: 2 }}>{`${Math.round(progress)}%`}</Typography>
            </>
          )}
        </Box>


        <Box width="100%" bgcolor="lightblue" p={1} marginTop={10} marginBottom={5}>
          <Typography variant="h6" component="div">
            単語リスト
          </Typography>
        </Box>

        <StatusFilterIcons /> {/* ステータスフィルタリングアイコンを表示 */}

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>English</TableCell>
                <TableCell>Japanese</TableCell>
                <TableCell>ステータス</TableCell>
                <TableCell>例文</TableCell>
                <TableCell>アクション</TableCell>
                <TableCell>その他</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWordList?.map((word, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    backgroundColor: word.status === 'NOT_MEMORIZED' ? '#ffccbc' : 
                                    word.status === 'UNKNOWN' ? '#f5f5f5' : 'inherit'
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{word.english}</TableCell>
                  <TableCell>{word.japanese}</TableCell>
                  <TableCell>
                    {word.status === 'MEMORIZED' && <CheckCircleIcon style={{ color: 'green' }} />}
                    {word.status === 'NOT_MEMORIZED' && <WarningIcon style={{ color: 'orange' }} />}
                    {word.status === 'UNKNOWN' && <HelpOutlineIcon style={{ color: 'gray' }} />}
                  </TableCell>
                  <TableCell>
                    {word.exampleSentence?.length > 30
                      ? `${word.exampleSentence?.substring(0, 30)}...`
                      : word.exampleSentence}
                    {word.exampleSentence?.length > 30 && (
                      <Button onClick={() => handleOpenModalWord(word)}>もっと見る</Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      onClick={() => handleOpenModal(word)}
                      style={{ margin: '5px' }}
                    >
                      GPTヘルプ
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => handleImageSearch(word.english)}
                      style={{ margin: '5px' }}
                    >
                      画像検索
                    </Button>
                    
                  </TableCell>
                  <TableCell>
                    <Typography>
                        {word.userWordListStatus.lastMemorizedTimeAgo }
                    </Typography>
                    <Typography>
                      {word.userWordListStatus.numMemorized}, {word.userWordListStatus.numNotMemorized}
                    </Typography>
                  </TableCell>


                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Box width="100%" bgcolor="lightblue" p={1} marginTop={10} marginBottom={5}>
          <Typography variant="h6" component="div">
            GPTストーリー
          </Typography>
        </Box>

        <Box sx={{ margin: 3 }}>
          <Button variant="contained" onClick={handleOpenStoryCreationDialog}>
            ストーリーを作る
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                {/* <TableCell>テーマ</TableCell> */}
                <TableCell>ブロック</TableCell>
                <TableCell>ストーリー</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wordStoryList.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  {/* <TableCell>{item.theme}</TableCell> */}
                  <TableCell>
                    <Avatar sx={{ width: 24, height: 24, marginRight: 2, fontSize:'0.75rem', bgcolor: 'secondary.main' }}>{item.block}</Avatar>
                  </TableCell>
                  <TableCell>
                    {item.storyContent.substring(0, 30)}
                    {item.storyContent.length > 30 && (
                      <Button onClick={() => handleOpenWordStoryDetailsDialog(item)}>もっと見る</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>


        </>
      )}
      <GPTHelpModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveModal}
        // onGenerate={...} // 例文生成のロジックをここに実装
        english={selectedWord.english} // 英単語をモーダルに渡す
        japanese={selectedWord.japanese} // 日本語をモーダルに渡す
        wordListByThemeId={selectedWord.id} // wordListByThemeIdをモーダルに渡す

      />
      <WordExampleSentenceModal
        open={modalOpenWord}
        onClose={() => setModalOpenWord(false)}
        word={selectedWord}
      />

      <StoryCreationDialog 
        open={openStoryCreationDialog} 
        onClose={handleCloseStoryCreationDialog} 
        onSave={handleSaveStoryCreationDialog} 
        blockList={[{block, progress}]} 
        showAllinBlockList={false}
        theme={theme} 
      />
      <WordStoryDetailsDialog
        open={openWordStoryDetailsDialog}
        onClose={handleCloseStoryDetailsDialog}
        selectedStory={selectedStory}
        onDelete={onDeleteWordStory}
      />


    </div>
  );
};

export default WordListPage;
