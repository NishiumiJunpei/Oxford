import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, CircularProgress, List, ListItem, ListItemText, Typography, Box, Button, Divider , Switch, FormControlLabel } from '@mui/material';
import WordDetailDialog from './wordDetailDialog';
import { timeAgo } from '@/utils/utils'; // timeAgo関数をインポート


const SrWordList = ({srWordList, setSrWordList, updateWordList}) => {
  const [loading, setLoading] = useState(false);
  const [modalOpenWord, setModalOpenWord] = useState(false);
  const [filteredWordList, setFilteredWordList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [buttonDisabledState, setButtonDisabledState] = useState({}); // ボタンの状態を管理
  const [switchStates, setSwitchStates] = useState({}); // 各反復タイミングごとのスイッチの状態
  const [srCount, setSrCount] = useState({})
  
  const fetchSrWordList = async () => {
    setLoading(true);
    try {
      const currentTime =  new Date().toISOString()
      const response = await axios.get(`/api/word-master/getSrWordList?currentTime=${currentTime}`);
      setSrWordList(response.data.srWordList);
      setSrCount(response.data.srCount)
    } catch (error) {
      console.error('Error fetching SR word list:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSrWordList();
  }, []);

  const handleListItemClick = (words, index) => {
    setFilteredWordList(words);
    setSelectedIndex(index);
    setModalOpenWord(true);
  };

  const handleButtonClick = async (wordIds, action, timeIndex) => {
    setButtonDisabledState(prevState => ({...prevState, [timeIndex]: true}));

    try {
      await axios.post('/api/word-master/updateSrWords', {
        wordListUserStatusIds: wordIds,
        action,
        currentTime: new Date().toISOString()
      });

      if (action === 'DELETE') {
        const newSrWordList = { ...srWordList };
        Object.entries(newSrWordList).forEach(([key, words]) => {
          if (key === Object.keys(srWordList)[timeIndex]) {
            newSrWordList[key] = words.filter(word => !wordIds.includes(word.userWordListStatus?.id));
          }
        });
        setSrWordList(newSrWordList);
      }  

    } catch (error) {
      console.error('Error updating word list:', error);
    } finally {
      checkAllButtonsPressed(timeIndex);
    }
  };

  const checkAllButtonsPressed = (timeIndex) => {
    const allButtonsPressed = Object.entries(srWordList).every(([srNextTime, words], index) => {
      return index == timeIndex || isButtonDisabled(srNextTime) || buttonDisabledState[index];
    });
  
    if (allButtonsPressed) {
      fetchSrWordList(); // APIを再コール
    }
  };
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}時${date.getMinutes()}分`;
  };

  //5分前になるまではtrue(=ボタン無効化)を返す
  const isButtonDisabled = (srNextTime) => {
    const currentTime = new Date();
    const nextTime = new Date(srNextTime);
    return currentTime < new Date(nextTime.getTime() - 5 * 60000); // 5分前より前ならtrue
  };

  const handleSwitchChange = (timeIndex) => {
    setSwitchStates(prevStates => ({
      ...prevStates,
      [timeIndex]: !prevStates[timeIndex]
    }));
  };

  return (
    <Container>
      {loading ? (
        <CircularProgress />
      ) : Object.keys(srWordList).length > 0 ? (
        <>
          {srCount.overdue > 0 && (
            <Box sx={{mt: 3, mb: 3}}>
              <Typography variant="subtitle1" color="GrayText">期限切れ件数</Typography>
              <Typography variant="h5" color="error">{srCount.overdue}件</Typography>

            </Box>
          )}          
          {Object.entries(srWordList).map(([srNextTime, words], timeIndex) => (
            <Box sx={{maxWidth: 600}}>
              <Box key={timeIndex} sx={{ mt: 2,padding: 3, bgcolor: !isButtonDisabled(srNextTime) ? 'secondary.light' : 'default' }}>
                <Typography variant="subtitle2" color="GrayText">
                  反復タイミング
                </Typography>
                <Typography variant="h6" color={new Date(srNextTime) < new Date() ? "error" : "inherit"}>
                  {formatDate(srNextTime)} {timeAgo(srNextTime) && `(${timeAgo(srNextTime)})`}
                </Typography>

                <FormControlLabel
                  control={<Switch checchecked={switchStates[timeIndex] || false} onChange={() => handleSwitchChange(timeIndex)} />}
                  label="答えを表示"
                />
                <List>
                {words.map((word, wordIndex) => (
                  <ListItem button key={word.id} onClick={() => handleListItemClick(words, wordIndex)}>
                    <ListItemText 
                      primary={word.userWordListStatus?.srLanguageDirection === 'JE' ? word.japanese : word.english} 
                      secondary={switchStates[timeIndex] ? (word.userWordListStatus?.srLanguageDirection === 'JE' ? word.english : word.japanese) : '　'} // 全角スペースで高さを保持
                    />
                  </ListItem>  

                ))}
                </List>
                <Box sx={{display: 'flex', justifyContent: 'start'}}>
                  <Button 
                    onClick={() => handleButtonClick(words.map(word=>word.userWordListStatus?.id), 'PROGRESS', timeIndex)} 
                    disabled={buttonDisabledState[timeIndex] || isButtonDisabled(srNextTime)} //前者は一回押したら無効化のため、後者は5分後にならないと押せないようにするため
                    sx={{margin: 1}}
                    variant="outlined"
                    color="secondary"
                  > 
                      反復済み
                  </Button>
                  <Button 
                    onClick={() => handleButtonClick(words.map(word=>word.userWordListStatus?.id), 'DELETE', timeIndex)} 
                    disabled={buttonDisabledState[timeIndex]}
                    sx={{margin: 1}}
                    color="inherit"
                  >
                      削除
                  </Button>

                </Box>
              </Box>
              <Divider sx={{mt: 5, mb: 5}}/>
            </Box>
          ))}
        </>

      ) : (
        <Typography variant="subtitle1">対象データはありません</Typography>
      )}

      <WordDetailDialog
        open={modalOpenWord}
        onClose={() => setModalOpenWord(false)}
        wordList={filteredWordList}
        initialIndex={selectedIndex}
        updateWordList={updateWordList}
      />
    </Container>
  );
};

export default SrWordList;
