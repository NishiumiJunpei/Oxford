import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  AppBar, Toolbar, Button, ListItem, LinearProgress, Box, Typography, Avatar, IconButton, Switch,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Tabs, Tab, CircularProgress, Tooltip,
  Card, CardHeader, CardContent, Link, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // アコーディオンのアイコン
import SrWordList from '@/components/srWordList';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { useTheme } from '@mui/material/styles';
import SEOHeader from '@/components/seoHeader';
import { Error, StarBorder, Star } from '@mui/icons-material';

const WordMasterTop = () => {
  const router = useRouter();
  const theme = useTheme();
  const [blocks, setBlocks] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [srWordList, setSrWordList] = useState({});
  const [srWordCount, setSrWordCount] = useState(0);
  const [expandedPanels, setExpandedPanels] = useState({}); // 各categoryのアコーディオン展開状態

  const { themeId } = router.query;

  const fetchData = async (themeToFetch) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/word-master/getBlocksWithStatusByThemeId?themeId=${themeToFetch}`);
      setBlocks(response.data.blocks);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching words:', error);
    }
  };

  useEffect(() => {
    fetchData(themeId);
  }, []);

  useEffect(() => {
    const tabFromUrl = parseInt(router.query.tab, 10);
    if (!isNaN(tabFromUrl)) {
      setTabValue(tabFromUrl);
    }

    if (themeId) {
      fetchData(themeId);
    }
  }, [router.query, themeId]);

  useEffect(() => {
    const fetchSrWordsToReview = async () => {
      try {
        const currentTime = new Date().toISOString();
        const response = await axios.get(`/api/word-master/checkSrWordsToReview?currentTime=${currentTime}`);
        setSrWordCount(response.data.count);
      } catch (error) {
        console.error('Error fetching SrWordsToReview:', error);
      }
    };

    fetchSrWordsToReview();
  }, [tabValue, srWordList]);

  // アコーディオンの展開状態を切り替える関数
  const handleAccordionToggle = (categoryName, blockId) => {
    const key = `${categoryName}-${blockId}`; // localStorageに保存するキー
    const isExpanded = !expandedPanels[key]; // 現在の状態を反転
    setExpandedPanels((prev) => ({ ...prev, [key]: isExpanded }));
    localStorage.setItem(key, JSON.stringify(isExpanded)); // 状態をlocalStorageに保存
  };

  // 初期状態をlocalStorageから取得
  useEffect(() => {
    if (blocks.length > 0) {
      const newExpandedPanels = {};
      blocks.forEach((category) => {
        const key = `${category.categoryName}-${category.blocks[0].block.id}`; // 各カテゴリの初期キー
        const storedValue = localStorage.getItem(key);
        if (storedValue !== null) {
          newExpandedPanels[key] = JSON.parse(storedValue); // localStorageの値を使用
        }
      });
      setExpandedPanels(newExpandedPanels);
    }
  }, [blocks]);

  const handleBlockClick = (blockId, languageDirection) => {
    router.push(`/word-master/wordList?blockId=${blockId}&languageDirection=${languageDirection || 'EJ'}`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    router.push(`/word-master/wordMasterTop?tab=${newValue}`, undefined, { shallow: true });
  };

  return (
    <>
      <SEOHeader title="英単語ブロック一覧" />
      <Box maxWidth="lg">
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="学習進捗" />
              <Tab
                label="間隔反復"
                icon={srWordCount > 0 ? (<PriorityHighIcon sx={{ color: theme.palette.error.main }} />) : (<></>)}
                iconPosition="end"
              />
            </Tabs>

            {tabValue === 0 && (
              <>
                {blocks.map((category) => {
                  const key = `${category.categoryName}-${category.blocks[0].block.id}`; // アコーディオンのキー
                  const isExpanded = expandedPanels[key] || false; // 展開状態

                  return (
                    <Accordion
                      key={category.categoryName}
                      expanded={isExpanded}
                      onChange={() => handleAccordionToggle(category.categoryName, category.blocks[0].block.id)}
                      elevation={0}  // 影を削除
                      sx={{ boxShadow: 'none' }}  // 枠線と影を削除
                    
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box
                          sx={{
                            background: theme.palette.primary.light,
                            padding: 2, // ここでpadding調整
                            color: theme.palette.primary.dark,
                            width: '100%', // 横幅を100%に広げる
                          }}
                        >
                          <Typography variant="h6">
                            {category.categoryName}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer component={Paper} sx={{ marginTop: 5 }}>
                          <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                              <TableRow>
                                <TableCell align="left" style={{ fontWeight: 'bold', width: '10px' }}>ブロック</TableCell>
                                <TableCell align="left" style={{ fontWeight: 'bold', width: '10px' }}><Error color="error" /></TableCell>
                                <TableCell align="left" style={{ fontWeight: 'bold', width: '10px' }}><StarBorder color="warning" /></TableCell>
                                <TableCell align="left" style={{ fontWeight: 'bold', width: '10px' }}><Star color="success" /></TableCell>
                                <TableCell align="left" style={{ fontWeight: 'bold' }}>最後に勉強した日</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {category.blocks.map((item, index) => (
                                <TableRow
                                  key={index}
                                  sx={{ cursor: 'pointer', backgroundColor: item.lastMemorizedDateEJ?.within1day ? '#f5f5f5' : 'inherit' }}
                                  onClick={() => handleBlockClick(item.block.id, 'EJ')}
                                >
                                  <TableCell component="th" scope="row" align="left">
                                    <ListItem>
                                      <Avatar sx={{ width: 24, height: 24, marginRight: 2, fontSize: '0.75rem', bgcolor: 'secondary.main', color: '#fff' }}>
                                        {item.block.name}
                                      </Avatar>
                                    </ListItem>
                                  </TableCell>
                                  <TableCell component="th" scope="row" align="left">
                                    <Typography variant="subtitle1">{item.progress.NOT_STARTED}</Typography>
                                  </TableCell>
                                  <TableCell component="th" scope="row" align="left">
                                    <Typography variant="subtitle1">{item.progress.MEMORIZED}</Typography>
                                  </TableCell>
                                  <TableCell component="th" scope="row" align="left">
                                    <Typography variant="subtitle1">{item.progress.MEMORIZED2}</Typography>
                                  </TableCell>
                                  <TableCell component="th" scope="row" align="left" sx={{ color: item.lastMemorizedDateEJ?.within1day ? 'primary.main' : 'inherit' }}>
                                    <Typography variant="subtitle1">{item.lastMemorizedDateEJ?.datetimeText}</Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </>
            )}

            {tabValue === 1 && (
              <SrWordList srWordList={srWordList} setSrWordList={setSrWordList} />
            )}
          </>
        )}
      </Box>
    </>
  );
};

export default WordMasterTop;
