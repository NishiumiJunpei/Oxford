import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, Snackbar, Alert, Typography, Divider } from '@mui/material';

export default function Home() {
  const [themes, setThemes] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [wordList, setWordList] = useState([]);
  const [wordDetail, setWordDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [isLoadingWordList, setIsLoadingWordList] = useState(false);
  const [isLoadingWordDetail, setIsLoadingWordDetail] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbarの表示状態
  const [showWordListWithDetail, setShowWordListWithDetail] = useState(false)

  useEffect(() => {
    const fetchThemes = async () => {
      setIsLoadingTheme(true);
      try {
        const response = await axios.get(`/api/user-setting/getThemes`);
        setThemes(response.data.themes);
      } catch (error) {
        console.error('Error fetching theme:', error);
      }
      setIsLoadingTheme(false);
    };
  
    fetchThemes();
  }, []);
  
  const getWordDetail = async (id) => {
    setIsLoadingWordDetail(true);
    setWordDetail(null)
    try {
      const response = await axios.get(`/api/word-master/getWordDetail?wordListId=${id}`);
      setWordDetail(response.data.wordDetail);
      setIsLoadingWordDetail(false);
    } catch (error) {
      console.error('Error fetching word detail:', error);
    }
  };

  const createExampleSentence = async () => {
    setIsLoadingWordDetail(true);
    setWordDetail(null)
    if (wordDetail && wordDetail.id) {
        try {
            const response = await axios.post(`/api/admin/createExampleSentenceForWordListId`, { wordListId: wordDetail.id });
            setWordDetail(response.data.wordDetail);
            setIsLoadingWordDetail(false);
          } catch (error) {
            console.error('Error creating example sentence:', error);
        }
    }
  };

  const createExampleSentenceBatch = async (blockId) => {
    if (blockId) {
        try {
            const response = await axios.get(`/api/admin/createExampleImageForWordList?blockId=${blockId}`);
            setSnackbarOpen(true);
          } catch (error) {
            console.error('Error creating example sentence:', error);
        }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // blocksのデータ取得
  const fetchBlocks = async (themeId) => {
    setIsLoadingBlocks(true);
    try {
      const response = await axios.get(`/api/admin/getBlocksByThemeId?themeId=${themeId}&includeWordInfo=true`);
      setBlocks(response.data.blocks);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
    setIsLoadingBlocks(false);
  };

  const fetchWordList = async (blockId) => {
    setIsLoadingWordList(true);
    setShowWordListWithDetail(false)

    try {
      const response = await axios.get(`/api/admin/getWordListByBlockId?blockId=${blockId}`);
      setWordList(response.data.wordList);
    } catch (error) {
      console.error('Error fetching word list:', error);
    }
    setIsLoadingWordList(false);
  };

  const handleClickWordListByBlock = async (blockId) =>{
    await fetchWordList(blockId)
    setShowWordListWithDetail(true)

  }



  // themesの表示
  const displayThemes = () => (
    <>
    <h3>テーマ</h3>
    <TableContainer component={Paper} sx={{mb: 5}}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {themes.map((theme) => {
            if(theme.activeStatus != 'ACTIVE') return null
            return(
            <TableRow key={theme.id} hover onClick={() => fetchBlocks(theme.id)}>
              <TableCell>{theme.id}</TableCell>
              <TableCell>{theme.name}</TableCell>
            </TableRow>
          )})}
        </TableBody>
      </Table>
    </TableContainer>
    </>
  );

  // blocksの表示
  const displayBlocks = () => (
    <>
    <h3>ブロック</h3>
    <TableContainer component={Paper} sx={{mb: 5, maxHeight: 700, overflow: 'auto'}}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>単語数</TableCell>
            <TableCell>画像なし</TableCell>
            <TableCell>単語リスト</TableCell>
            <TableCell>例文生成</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {blocks.map((block) => (
            <TableRow key={block.id} hover onClick={() => fetchWordList(block.id)}>
              <TableCell>{block.id}</TableCell>
              <TableCell>{block.name}</TableCell>
              <TableCell>{block.wordNum}</TableCell>
              <TableCell>{block.noImageNum}</TableCell>
              <TableCell>
                <Button onClick={()=>handleClickWordListByBlock(block.id)}>
                  単語一覧(詳細付き)表示
                </Button>
              </TableCell>
              <TableCell>
                <Button onClick={()=>createExampleSentenceBatch(block.id)}>
                  一括例文生成
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    {/* Snackbarの表示 */}
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
        例文生成をリクエストしました
      </Alert>
    </Snackbar>

    </>

  );

  const displayWordListWithDetail = () =>(
      <>
        {wordList.map((wordDetail, index) => (
          <>
          <Grid container sx={{mb: 5}} key={index}>
            <Grid item xs={6}>
              <Typography>Id: {wordDetail.id}</Typography>
              <h2>{wordDetail.english}</h2>
              <Typography>意味：{wordDetail.japanese}</Typography>
              <Typography> 例文：{wordDetail.exampleSentenceE}</Typography>
              <Typography> ({wordDetail.exampleSentenceJ})</Typography>
              <Typography> 類語：{wordDetail.synonyms}</Typography>
              {/* {wordDetail.usage} */}
              {wordDetail.usage && (
                <>
                  <Typography> この単語を使うシチュエーション</Typography>
                  {wordDetail.usage.map((element, index)=>(
                    <>
                      <Typography sx={{fontWeight: 700}}>{index+1}.{element.situation}</Typography>
                      <Typography>{element.exampleE}</Typography>
                      <Typography>{element.exampleJ}</Typography>
                    </>
                  ))}

                </>
              )}
              {wordDetail.explanationScript && wordDetail.explanationAudioUrl && (
                <>
                  {/* ボタンを押して音声を再生する処理 */}
                  <audio id="audioPlayer" src={wordDetail.explanationAudioUrl} />

                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      const audioElement = document.getElementById('audioPlayer');
                      if (audioElement) {
                        audioElement.play(); // 音声ファイルの再生処理
                      }
                    }}
                    sx={{ mt: 2 }}
                  >
                    スクリプト再生
                  </Button>

                  <Typography sx={{ mt: 2 }}>
                    {wordDetail.explanationScript} {/* スクリプトは最初から表示 */}
                  </Typography>
                </>
              )}
              
            </Grid>
            <Grid item xs={6}>
                {wordDetail?.imageUrl && (
                    <img 
                        src={wordDetail.imageUrl} 
                        style={{ marginTop: 20, maxWidth: '70%', maxHeight: '70%', objectFit: 'contain' }} 
                    />
                )}
                {/* <Box>
                  <Button variant="contained" color="secondary" onClick={createExampleSentence} disabled={isLoadingWordDetail}>
                      GPT例文生成
                  </Button>
                </Box> */}
              </Grid>
          </Grid>    
          <Divider/>
          </>      
        ))}
      
      </>
  )

  return (
    <>

      {isLoadingTheme ? <CircularProgress /> : displayThemes()}
      {isLoadingBlocks ? <CircularProgress /> : blocks.length > 0 && displayBlocks()}

      {isLoadingWordList ? (
        <CircularProgress />
      ) : (
        <Box sx={{mb: 5}}>

          {showWordListWithDetail ? displayWordListWithDetail() : (
            <TableContainer component={Paper}  sx={{mb: 5, maxHeight: 600, overflow: 'auto'}}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>English</TableCell>
                    <TableCell>Japanese</TableCell>
                    <TableCell>Image</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {wordList.map((word, index) =>
                      <TableRow key={`${word.id}-${index}`} hover onClick={() => getWordDetail(word.id)}>
                        <TableCell>{word.id}</TableCell>
                        <TableCell>{word.english}</TableCell>
                        <TableCell>{word.japanese}</TableCell>
                        <TableCell>
                          {(word.imageFilename
                              ? `　`
                              : <Typography color="error">なし</Typography>)}                     
                        </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

          )}
        </Box>
      )}

      {isLoadingWordDetail && (
        <CircularProgress />
      )}


      {wordDetail && (
        <Box sx={{mb: 5}}>
          <p>Id: {wordDetail.id}</p>
          <h2>{wordDetail.english}</h2>
          <p>{wordDetail.japanese}</p>
          <p> {wordDetail.exampleSentenceE}</p>
          <p> {wordDetail.exampleSentenceJ}</p>
          <p> {wordDetail.synonyms}</p>
          {wordDetail.image && <img src={wordDetail.image} alt={wordDetail.english} />}

          {wordDetail?.imageUrl && (
              <img 
                  src={wordDetail.imageUrl} 
                  style={{ marginTop: 20, maxWidth: '30%', maxHeight: '50%', objectFit: 'contain' }} 
              />
          )}
          <Box>
            <Button variant="contained" color="secondary" onClick={createExampleSentence} disabled={isLoadingWordDetail}>
                GPT例文生成
            </Button>

          </Box>

        </Box>
      )}
    </>
  );
}
