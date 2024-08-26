import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, 
  Box, Typography, Grid } from '@mui/material';
import SEOHeader from '@/components/seoHeader';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [wordList, setWordList] = useState([]);
  const [wordDetail, setWordDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWordDetail, setIsLoadingWordDetail] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    setWordDetail(null)
    try {
      const response = await axios.get(`/api/word-master/getWordListByEnglish?english=${searchTerm}`);
      setWordList(response.data.wordList);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching word list:', error);
    }
  };

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

  const createExampleSentence = async (rewirteScope) => {
    setIsLoadingWordDetail(true);
    setWordDetail(null)
    if (wordDetail && wordDetail.id) {
        try {
            const response = await axios.post(`/api/admin/createExampleSentenceForWordListId`, { wordListId: wordDetail.id, rewirteScope });
            setWordDetail(response.data.wordDetail);
            setIsLoadingWordDetail(false);
          } catch (error) {
            console.error('Error creating example sentence:', error);
        }
    }
};

  return (
    <>
      <SEOHeader title="管理画面"/>
      <Box sx={{mb: 5}}>
      <TextField
        label="English"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(); // Enterキーを押したら検索ボタンの処理を実行
          }
        }}
      />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          検索
        </Button>
      </Box>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Box sx={{mb: 5}}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>English</TableCell>
                <TableCell>Japanese</TableCell>
                <TableCell>Theme Name</TableCell>
                <TableCell>Block Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wordList.flatMap((word) =>
                word.blocks.map((item, index) => (
                  <TableRow key={`${word.id}-${index}`} hover onClick={() => getWordDetail(word.id)}>
                    <TableCell>{word.id}</TableCell>
                    <TableCell>{word.english}</TableCell>
                    <TableCell>{word.japanese}</TableCell>
                    <TableCell>{item.block?.theme?.name}</TableCell>
                    <TableCell>{item.block?.id}</TableCell>
                    <TableCell>{item.block?.name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        </Box>
      )}

      {isLoadingWordDetail && (
        <CircularProgress />
      )}


      {wordDetail && (
        // <Box sx={{mb: 5}}>
        //   <p>Id: {wordDetail.id}</p>
        //   <h2>{wordDetail.english}</h2>
        //   <p>{wordDetail.japanese}</p>
        //   <Typography variant="body1">
        //     {wordDetail.exampleSentenceE}
        //   </Typography>
        //   <Typography variant="body1">
        //     {wordDetail.exampleSentenceJ}
        //   </Typography>
        //   <Typography variant="body1">
        //     {wordDetail.synonyms}
        //   </Typography>
        //   {wordDetail.image && <img src={wordDetail.image} alt={wordDetail.english} />}

        //   {wordDetail?.imageUrl && (
        //       <img 
        //           src={wordDetail.imageUrl} 
        //           style={{ marginTop: 20, maxWidth: '100%', maxHeight: '50%', objectFit: 'contain' }} 
        //       />
        //   )}

        //   <Button variant="contained" color="secondary" onClick={createExampleSentence} disabled={isLoadingWordDetail}>
        //       GPT例文生成
        //   </Button>

        // </Box>

        <Grid container sx={{mb: 5}}>
        <Grid item xs={6}>
          <Typography>Id: {wordDetail.id}</Typography>
          <h2>{wordDetail.english}</h2>
          <Typography>意味：{wordDetail.japanese}</Typography>
          <Typography> 例文：{wordDetail.exampleSentenceE}</Typography>
          <Typography> ({wordDetail.exampleSentenceJ})</Typography>
          <Typography> 類語：{wordDetail.synonyms}</Typography>
          {/* {wordDetail.usage} */}
          {wordDetail.usage?.length > 0 && (
            <>
              <Typography> この単語を使うシチュエーション</Typography>
              {wordDetail.usage?.map((element, index)=>(
                <>
                  <Typography sx={{fontWeight: 700}}>{index+1}.{element.situation}</Typography>
                  <Typography>{element.exampleE}</Typography>
                  <Typography>{element.exampleJ}</Typography>
                </>
              ))}
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
            <Box>
              <Button variant="contained" color="primary" onClick={()=>createExampleSentence("IMAGE")} disabled={isLoadingWordDetail} sx={{mr: 2, mt:2}}>
                  画像生成(上書き)
              </Button>
              <Button variant="contained" color="primary" onClick={()=>createExampleSentence("EX_IMAGE")} disabled={isLoadingWordDetail} sx={{mr: 2, mt:2}}>
                  例文・画像生成(上書き)
              </Button>
              <Button variant="contained" color="primary" onClick={()=>createExampleSentence("J_EX_IMAGE")} disabled={isLoadingWordDetail} sx={{mr: 2, mt:2}}>
                  日・例文・画像生成(上書き)
              </Button>
              <Button variant="contained" color="secondary" onClick={()=>createExampleSentence("USAGE")} disabled={isLoadingWordDetail} sx={{mr: 2, mt:2}}>
                  利用シーン生成(上書き)
              </Button>

            </Box>
          </Grid>
        </Grid>    


      )}
    </>
  );
}

