import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper, Avatar, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GPTHelpModal from '../../components/gptHelpModal'; // GPTHelpModalのインポート
import WordExampleSentenceModal from '../../components/wordExampleSentenceModal';

const WordListPage = () => {
  const router = useRouter();
  const { theme, block } = router.query;
  const [wordList, setWordList] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [modalOpen, setModalOpen] = useState(false); // gptHelp用のモーダル用の状態
  const [modalOpenWord, setModalOpenWord] = useState(null);// 例文確認用のモーダル用の状態
  const [selectedWord, setSelectedWord] = useState({}); // 選択された単語の情報を保存するステート

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/word-master/getWordList?theme=${theme}&block=${block}`);
      const data = await response.json();
      setWordList(data);
    };

    if (theme && block) {
      fetchData();
    }
  }, [theme, block]);

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
  const filteredWordList = wordList.filter(word => selectedStatus.length === 0 || selectedStatus.includes(word.status));

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
  
  return (
    <div>
      <Box display="flex" flexDirection="column" alignItems="start" mb={2}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          戻る
        </Button>
        <Box display="flex" alignItems="center" mt={1} width="100%">
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="div">
                {theme}
            </Typography>
            <Avatar sx={{ bgcolor: 'secondary.main', ml: 2, mr: 1 }}>{block}</Avatar>
          </Box>
          <Button variant="contained" onClick={() => router.push(`/word-master/learnWordsCriteriaInput?block=${block}&theme=${theme}`)}>
              理解度チェック
          </Button>
        </Box>
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
                  <Button variant="outlined" onClick={() => handleOpenModal(word)}>GPTヘルプ</Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => handleImageSearch(word.english)}
                    style={{ marginLeft: '10px' }}
                  >
                    画像検索
                  </Button>
                  
                </TableCell>


              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
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

    </div>
  );
};

export default WordListPage;
