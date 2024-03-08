import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Checkbox, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography } from '@mui/material';
import DisplayAutoPlayScene from '@/components/admin/DisplayAutoPlayScene';


export default function Home() {
  const [sceneList, setSceneList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('sceneList');

  useEffect(() => {
    const fetchSceneList = async () => {
      setIsLoading(true);
      try {
        const sceneIds = [1,2,3,4,5]
        const response = await axios.post('/api/admin/getSceneList', { sceneIds });
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
  
      if (!response.ok) {
        // レスポンスがOKでない場合には、エラーを投げる
        throw new Error('Something went wrong with the request.');
      }
  
      // レスポンスデータをJSON形式で取得
      const data = await response.json();
  
      // 成功時の処理をここに記述
      console.log('Successfully created scene data:', data);
    } catch (error) {
      // エラーハンドリングをここに記述
      console.error('Error creating scene data:', error.message);
    }
  };
  
  console.log('test - sceneList', sceneList)
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
            <Button variant="contained" onClick={handleClickButtonAutoPlayStart} sx={{mr: 3}}>オート再生へ</Button>
            <Button variant="contained" onClick={handleClickButtonGenerateData}>データ生成</Button>
          </Box>

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
            </Box>

          )}

          {currentStep === 'autoPlay' && (
            <Box>              
              <DisplayAutoPlayScene sceneList={sceneList} />
            </Box>

          )}



        </>
      )}
    </>
  );
}
