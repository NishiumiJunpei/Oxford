import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from "next/router";
import { Box, Checkbox, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography } from '@mui/material';
import DisplayAutoPlayScene from '@/components/admin/DisplayAutoPlayScene';
import SpeakerSelector from '@/components/admin/speakerSelector';


export default function Home() {
  const router = useRouter();
  const [sceneList, setSceneList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('sceneList');
  const [openingScript, setOpeningScript] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);


  useEffect(() => {
    const fetchSceneList = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post('/api/admin/getSceneList');
        setSceneList(response.data.sceneList);
      } catch (error) {
        console.error('Error fetching scene list:', error);
      }
      setIsLoading(false);
    };

    fetchSceneList()
  }, []);

  const handleClickButtonAutoPlayStart = () =>{
    setCurrentStep('autoPlay')
  }

  const handleClickButtonGenerateData = async () => {
    setShowSuccessMessage(true); 
    try {
      // APIエンドポイントにPOSTリクエストを送信
      const response = await fetch('/api/admin/createSceneData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 必要に応じて他のヘッダーを追加
        },
        body: JSON.stringify({
          // リクエストボディに必要なデータをJSON形式で指定
          // 例: { key: "value" }
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
        <a href="/admin/autoPlayScene">戻る / 再読み込み</a>
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


          {currentStep === 'sceneList' && (
            <Box>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Sentences</TableCell>
                      <TableCell>Phrase to Learn</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sceneList.map((scene) => (
                      <TableRow
                        key={scene.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {scene.id}
                        </TableCell>
                        <TableCell>{scene.title}</TableCell>
                        <TableCell>{scene.sentences ? 'あり' : 'なし'}</TableCell>
                        <TableCell>{scene.phraseToLearn ? 'あり' : 'なし'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <SpeakerSelector onOpeningScriptChange={handleOpeningScriptChange} onSpeakerSelect={handleSpeakerSelect} />
              <Box sx={{mt: 2}}>
                <Button variant="contained" onClick={handleClickButtonAutoPlayStart} sx={{mr: 3}}>オート再生</Button>
              </Box>

            </Box>

          )}

          {currentStep === 'autoPlay' && (
            <Box>              
              <DisplayAutoPlayScene 
                sceneList={sceneList} 
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
