import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Checkbox, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography } from '@mui/material';
import DisplayAutoPlayScene from '@/components/admin/DisplayAutoPlayScene';


export default function Home() {
  const [sceneList, setSceneList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('displaySceneList');

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

  console.log('test', sceneList)
  return (
    <>
      <Box>
        <a href="/admin/autoPlayScene">戻る</a>
      </Box>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>

          {currentStep === 'displaySceneList' && (
            <Box>
              <Typography variant="h5" gutterBottom>英語を使うシーン</Typography>
              
              <DisplayAutoPlayScene sceneList={sceneList} />
            </Box>

          )}



        </>
      )}
    </>
  );
}
