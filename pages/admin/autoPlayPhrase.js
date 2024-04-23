import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from "next/router";
import { Box, Checkbox, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography } from '@mui/material';
import DisplayAutoPlayPhrase from '@/components/admin/DisplayAutoPlayPhrase';
import SpeakerSelector from '@/components/admin/speakerSelector';


export default function Home() {
  const router = useRouter();
  const [phraseList, setPhraseList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('phraseList');
  const [openingScript, setOpeningScript] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);


  useEffect(() => {
    const fetchphraseList = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post('/api/admin/getPhraseList');
        const updatedCategories = response.data.categoryList.map(cate => ({
          ...cate,
          createFlag: 1 // ここでcreateFlagを1に設定
        }));
        setCategoryList(updatedCategories);
        setPhraseList(response.data.phraseList);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchphraseList()
  }, []);

  const handleClickButtonAutoPlayStart = () =>{
    setCurrentStep('autoPlay')
  }

  const handleClickButtonGenerateData = async () => {
    setShowSuccessMessage(true); 
    try {
      // APIエンドポイントにPOSTリクエストを送信
      const response = await fetch('/api/admin/createPhraseData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',        
        },
        body: JSON.stringify({
          categoryList: categoryList, 
          phraseList: phraseList, 
        }),
    });
      setShowSuccessMessage(false); 
      router.reload()
      // router.push('/admin/autoPlayScene')
  
    } catch (error) {
      // エラーハンドリングをここに記述
      console.error('Error creating scene data:', error.message);
    }
  };

  const handleOpeningScriptChange = (script) => {
    setOpeningScript(script);
  };

  const handleSpeakerSelect = (speaker) => {
    setSelectedSpeaker(speaker);
  };

  
  return (
    <>
      <Box>
        <a href="/admin/autoPlayPhrase">戻る / 再読み込み</a>
      </Box>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
         <Box sx={{mt: 3, mb: 3}}>
            <Button variant="contained" onClick={handleClickButtonGenerateData} disabled={showSuccessMessage}>データ生成</Button>            
         </Box>
          {showSuccessMessage && (
            <Box>
              <Typography color="success.main">データ生成をリクエストしました。</Typography>
            </Box>
          )}


          {currentStep === 'phraseList' && (
            <Box>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category1</TableCell>
                      <TableCell>Category2</TableCell>
                      <TableCell>engLevel</TableCell>
                      <TableCell>作成対象</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryList.map((cate, index) => (
                      <TableRow
                        key={index}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {cate.category1}
                        </TableCell>
                        <TableCell>{cate.category2}</TableCell>
                        <TableCell>{cate.engLevel}</TableCell>
                        <TableCell>
                          <Checkbox
                            checked={cate.createFlag === 1}
                            onChange={(event) => {
                              const updatedCategories = categoryList.map((item, idx) => 
                                idx === index ? { ...item, createFlag: event.target.checked ? 1 : 0 } : item
                              );
                              setCategoryList(updatedCategories);
                            }}
                          />
                        </TableCell> {/* 各行にチェックボックスを追加 */}

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>


              <SpeakerSelector onOpeningScriptChange={handleOpeningScriptChange} onSpeakerSelect={handleSpeakerSelect} />
              <Box sx={{mt: 2}}>
                <Button variant="contained" onClick={handleClickButtonAutoPlayStart} sx={{mr: 3}}>オート再生</Button>
              </Box>

              {phraseList.length > 0 && (
                <>
                <Typography variant="h6" sx={{mt: 5}}>フレーズデータ　（{phraseList.length}件）</Typography>
                <TableContainer component={Paper} sx={{mb: 10}}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category1</TableCell>
                      <TableCell>Category2</TableCell>
                      <TableCell>sentenceE</TableCell>
                      <TableCell>sentenceJ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {phraseList.map((phrase, index) => (
                      <TableRow
                        key={index}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {phrase.category1}
                        </TableCell>
                        <TableCell>{phrase.category2}</TableCell>
                        <TableCell>{phrase.sentenceE}</TableCell>
                        <TableCell>{phrase.sentenceJ}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>                
              </>

              )}




            </Box>

          )}

          {currentStep === 'autoPlay' && (
            <Box>              
              <DisplayAutoPlayPhrase 
                phraseList={phraseList} 
                categoryList={categoryList}
                openingScript={openingScript}
                selectedSpeaker={selectedSpeaker}
              />
            </Box>

          )}



        </>
      )}
    </>
  );
}
