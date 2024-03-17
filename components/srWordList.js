import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, CircularProgress, Typography, Box, Button, Divider , Switch, FormControlLabel, Badge, Grid, Paper,
  Table, TableBody, TableCell, TableRow, Chip, IconButton } from '@mui/material';
import WordDetailDialog from './wordDetailDialog';
import { timeAgo } from '@/utils/utils'; // timeAgo関数をインポート
import SrTimingDialog  from './srTimingDialog';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { formatDate } from '@/utils/utils';

const SrWordList = ({srWordList, setSrWordList, updateWordList}) => {
  const [loading, setLoading] = useState(false);
  const [modalOpenWord, setModalOpenWord] = useState(false);
  const [openSrTimingDialog, setOpenSrTimingDialog] = useState(false);
  const [filteredWordList, setFilteredWordList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [buttonDisabledState, setButtonDisabledState] = useState({}); // ボタンの状態を管理
  const [switchStates, setSwitchStates] = useState({}); // 各反復タイミングごとのスイッチの状態
  const [switchStatesImage, setSwitchStatesImage] = useState({}); 
  const [srCount, setSrCount] = useState({})
  const [mode, setMode] = useState('EJ')
  const [dialogSrNextTime, setDialogSrNextTime] = useState('');
  const [dialogWords, setDialogWords] = useState([]);
   
  
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
      setSwitchStatesImage({})
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
  };

  const handleSwitchChangeImage = (timeIndex) => {
    setSwitchStatesImage(prevStates => ({
      ...prevStates,
      [timeIndex]: !prevStates[timeIndex]
    }));
  };


  const handleOpenInNewClick = (srNextTime, words) => {
    setDialogSrNextTime(srNextTime); // ダイアログに渡すsrNextTimeを設定
    setDialogWords(words); // ダイアログに渡すwordsを設定
    setOpenSrTimingDialog(true); // SrTimingDialogを開く
  };

  const handleModeChipClick = (mode) =>{
    setMode(mode)
    setSwitchStates({})
    setSwitchStatesImage({})
    setButtonDisabledState({})
  }


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

            </Box>
          )}          

          <Box sx={{mt: 3, mb: 3, display: 'flex', gap: 2}}>
            <Badge
              badgeContent={srCount.overdueEJ} // 「理解できる」に関連する期限切れの数
              color="error" // バッジの色
              invisible={srCount.overdueEJ == 0}
            >
              <Chip
                label="理解できる"
                onClick={() => handleModeChipClick('EJ')}
                color={mode === 'EJ' ? 'primary' : 'default'}
                clickable
              />
            </Badge>
            <Badge
              badgeContent={srCount.overdueJE} // 「使える」に関連する期限切れの数
              color="error" // バッジの色
              invisible={srCount.overdueJE == 0}
            >
              <Chip
                label="使える"
                onClick={() => handleModeChipClick('JE')}
                color={mode === 'JE' ? 'primary' : 'default'}
                clickable
              />
            </Badge>
          </Box>

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

                {(switchStates[timeIndex] && words[0].userWordListStatus?.srLanguageDirection === 'EJ') && (
                    <FormControlLabel
                      control={<Switch checked={switchStatesImage[timeIndex] || false} onChange={() => handleSwitchChangeImage(timeIndex)} />}
                      label="画像"
                    />
                )}


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
                        {switchStates[timeIndex] ? (
                          word.userWordListStatus?.srLanguageDirection === 'EJ' ? (
                            <Box>
                              <Typography color="GrayText" variant='subtitle1'>{word.japanese}</Typography>
                              {switchStatesImage[timeIndex] && (
                                <img
                                  src={word.imageUrl}
                                  alt={word.english}
                                  style={{ maxWidth: '150px', maxHeight: 'auto', objectFit: 'contain' }}
                                />
                              )}
                            </Box>
                          ) : (
                            <Typography color="GrayText" variant='subtitle1' fontWeight={600}>
                              {word.userWordListStatus.answerJE}
                            </Typography>
                          )
                        ) : '　'} {/* 全角スペースで高さを保持 */}
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
        initialTabValue={filteredWordList[0]?.userWordListStatus?.srLanguageDirection == 'JE' ? 1 : 0}
      />

      <SrTimingDialog
        open={openSrTimingDialog}
        onClose={()=>setOpenSrTimingDialog(false)}
        srNextTime={dialogSrNextTime} // ダイアログにsrNextTimeを渡す
        words={dialogWords} // ダイアログにwordsを渡す
      />

    </Container>
  );
};

export default SrWordList;
