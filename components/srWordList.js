import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, CircularProgress, Typography, Box, Button, Divider, Switch, FormControlLabel,
  Grid, Paper, IconButton, 
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Deleteアイコンのインポート
import WordDetailDialog from './wordDetailDialog';
import { timeAgo } from '@/utils/utils'; // timeAgo関数をインポート
import SrTimingDialog  from './srTimingDialog';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { formatDate } from '@/utils/utils';
import GPTCoachButton from './gptCoachButton';

const SrWordList = ({srWordList, setSrWordList, updateWordList}) => {
  const [loading, setLoading] = useState(false);
  const [modalOpenWord, setModalOpenWord] = useState(false);
  const [openSrTimingDialog, setOpenSrTimingDialog] = useState(false);
  const [filteredWordList, setFilteredWordList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [buttonDisabledState, setButtonDisabledState] = useState({}); // ボタンの状態を管理
  const [switchStates, setSwitchStates] = useState({}); // 各反復タイミングごとのスイッチの状態
  const [showAnswerStates, setShowAnswerStates] = useState({}); // 答えと画像表示の状態
  const [srCount, setSrCount] = useState({})
  const [mode, setMode] = useState('EJ')
  const [dialogSrNextTime, setDialogSrNextTime] = useState('');
  const [dialogWord, setDialogWord] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // 削除ダイアログの状態管理
   
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
        Object.entries(newSrWordList[mode]).forEach(([key, words]) => {
          if (key === Object.keys(srWordList[mode])[timeIndex]) {
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
    const allButtonsPressed = Object.entries(srWordList[mode]).every(([srNextTime, words], index) => {
      return index == timeIndex || isButtonDisabled(srNextTime) || buttonDisabledState[index];
    });
  
    if (allButtonsPressed) {
      fetchSrWordList(); // APIを再コール
      setSwitchStates({})
      setShowAnswerStates({})
      setButtonDisabledState({})
    }
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

    if (switchStates[timeIndex]) {
      setShowAnswerStates(prevStates => {
        const newStates = { ...prevStates };
        Object.keys(newStates).forEach(key => {
          if (key.startsWith(`${timeIndex}-`)) {
            newStates[key] = false;
          }
        });
        return newStates;
      });
    }
  
  };

  const handleShowAnswer = (timeIndex, wordId) => {
    setShowAnswerStates(prevStates => ({
      ...prevStates,
      [`${timeIndex}-${wordId}`]: true
    }));
  };
    
  const handleOpenInNewClick = (srNextTime, words) => {
    setDialogSrNextTime(srNextTime); // ダイアログに渡すsrNextTimeを設定
    setDialogWord(words[0]); // ダイアログに渡すwordsを設定
    setOpenSrTimingDialog(true); // SrTimingDialogを開く
  };

  const handleModeChipClick = (mode) =>{
    setMode(mode)
    setSwitchStates({})
    setShowAnswerStates({})
    setButtonDisabledState({})
  }

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.post('/api/word-master/deleteSrWordList', { /* 必要なパラメータをここに追加 */ });
      fetchSrWordList(); // 削除後にリストを更新
    } catch (error) {
      console.error('Error deleting SR word:', error);
    }
  };

  const isExpired = () => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 30); // 30日前の日付を取得
  
    // 全てのモードをループして、どれか一つでも条件を満たすかチェック
    return Object.values(srWordList).some(modeWords => {
      return Object.keys(modeWords).some(srNextTime => {
        return new Date(srNextTime) < currentDate;
      });
    });
  };

  console.log('srWordList', srWordList)

  return (
    <Container>
      {loading ? (
        <CircularProgress />
      ) : Object.keys(srWordList).length > 0 && Object.keys(srWordList[mode]).length > 0 ? (
        <>
          {srCount.overdueTotal > 0 && (
            <Box sx={{mt: 3, mb: 3}}>
              <Typography variant="subtitle1" color="GrayText">期限切れ件数</Typography>
              <Typography variant="h5" color="error">{srCount.overdueTotal}件</Typography>
              {isExpired && (
                <IconButton onClick={() => setDeleteDialogOpen(true)}>
                  <DeleteIcon />
                </IconButton>
              )}

            </Box>
          )}          
          
          {Object.entries(srWordList[mode]).map(([srNextTime, words], timeIndex) => (
            <Box key={timeIndex}>
              <Box key={timeIndex} sx={{ mt: 2,padding: 3, bgcolor: !isButtonDisabled(srNextTime) ? 'secondary.light' : 'default' }}>
                <Typography variant="subtitle2" color="GrayText">
                    反復タイミング
                </Typography>

                <Box sx={{display: 'flex', justifyContent: 'start', alignItems: 'center'}}>
                  <Typography variant="h6" color={new Date(srNextTime) < new Date() ? "error" : "inherit"} >
                    {formatDate(srNextTime)} {timeAgo(srNextTime) && `(${timeAgo(srNextTime)})`}
                  </Typography>
                  <IconButton onClick={() => handleOpenInNewClick(srNextTime, words)}>
                    <OpenInNewIcon/>
                  </IconButton>
                </Box>

                <FormControlLabel
                  control={<Switch checked={switchStates[timeIndex] || false} onChange={() => handleSwitchChange(timeIndex)} />}
                  label="答えを表示"
                />
                <GPTCoachButton words={words}/>

                <Grid container spacing={2} sx={{mt: 2}}>
                  {words.map((word, wordIndex) => (
                    <React.Fragment key={word.id}>
                      {/* 単語の情報を表示 */}
                      <Grid item xs={12} sm={6} style={{ cursor: 'pointer' }} onClick={() => handleListItemClick(words, wordIndex)}>
                        <Box>
                          <Typography color="GrayText" variant='subtitle1' fontWeight={600}>
                            {word.userWordListStatus?.srLanguageDirection === 'EJ' ? word.english : word.userWordListStatus.questionJE}
                          </Typography>
                          <Typography color="GrayText" variant='body1'>
                            {word.userWordListStatus?.srLanguageDirection === 'EJ' ? '' : `(${word.english} / ${word.japanese})`}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                      {switchStates[timeIndex] || showAnswerStates[`${timeIndex}-${word.id}`] ? (
                          word.userWordListStatus?.srLanguageDirection === 'EJ' ? (
                            <Box>
                              <Typography color="GrayText" variant='subtitle1'>{word.japanese}</Typography>
                              <img
                                src={word.imageUrl}
                                alt={word.english}
                                style={{ maxWidth: '150px', maxHeight: 'auto', objectFit: 'contain' }}
                              />
                              <Box>
                                <GPTCoachButton words={[word]} dialogFlag={false} styleType="LINK" />
                              </Box>
                            </Box>
                          ) : (
                            <Typography color="GrayText" variant='subtitle1' fontWeight={600}>
                              {word.userWordListStatus.answerJE}
                            </Typography>
                          )
                        ) : (
                          <Button onClick={() => handleShowAnswer(timeIndex, word.id)}>
                            見る
                          </Button>
                        )}
                      </Grid>
                      {/* Divider を追加 */}
                      {wordIndex < words.length - 1 && (
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                      )}
                    </React.Fragment>
                  ))}
                </Grid>

                <Box sx={{display: 'flex', justifyContent: 'start', mt: 2}}>
                  <Button 
                    onClick={() => handleButtonClick(words.map(word => word.userWordListStatus?.id), 'PROGRESS', timeIndex)} 
                    disabled={buttonDisabledState[timeIndex] || isButtonDisabled(srNextTime)} //前者は一回押したら無効化のため、後者は5分後にならないと押せないようにするため
                    sx={{margin: 1}}
                    variant="outlined"
                    color="secondary"
                  > 
                      反復済み
                  </Button>
                  <Button 
                    onClick={() => handleButtonClick(words.map(word => word.userWordListStatus?.id), 'DELETE', timeIndex)} 
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
        initialTabValue={filteredWordList[0]?.userWordListStatus?.srLanguageDirection == 'JE' ? 1 : 0}
      />

      <SrTimingDialog
        open={openSrTimingDialog}
        onClose={()=>setOpenSrTimingDialog(false)}
        // srNextTime={dialogSrNextTime} // ダイアログにsrNextTimeを渡す
        word={dialogWord} // ダイアログにwordsを渡す
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"間隔反復のデータを削除しますか？"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            この操作は取り消せません。続けますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            キャンセル
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SrWordList;
