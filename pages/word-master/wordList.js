import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper, Avatar, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import GPTHelpModal from '../../components/GPTHelpModal'; // GPTHelpModalのインポート

const WordListPage = () => {
  const router = useRouter();
  const { theme, block } = router.query;
  const [wordList, setWordList] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [modalOpen, setModalOpen] = useState(false); // モーダル用の状態
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
  const handleSaveModal = () => {
    // 保存処理
    handleCloseModal();
  };


  return (
    <div>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h4" component="div" sx={{ flexGrow: 1, mr: 2 }}>
            {theme}
        </Typography>
        <Avatar sx={{ bgcolor: 'secondary.main', mr: 1 }}>{block}</Avatar>
        <Button variant="contained" onClick={() => router.push(`/word-master/learnWordsCriteriaInput?block=${block}&theme=${theme}`)}>
            理解度チェック
        </Button>
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
                <TableCell>{word.exampleSentence}</TableCell>
                <TableCell>
                <Button onClick={() => handleOpenModal(word)}>GPTヘルプ</Button>
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
        englishWord={selectedWord.english} // 英単語をモーダルに渡す
        japaneseWord={selectedWord.japanese} // 日本語をモーダルに渡す

      />

    </div>
  );
};

export default WordListPage;
