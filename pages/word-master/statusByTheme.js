import React, { useState, useEffect } from 'react';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

function StatusByTheme() {
  const [stats, setStats] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // APIエンドポイントにPOSTリクエストを送信
      const response = await fetch('/api/getWordListByTheme', {
        method: 'POST',
      });

      // レスポンスをチェックしてエラーハンドリング
      if (!response.ok) {
        console.error('Failed to fetch:', response.statusText);
        return;
      }

      // レスポンスをJSONとして解析
      const data = await response.json();

      // データをステートにセット
      setStats(data);
    }

    fetchData();
  }, []);

  const handleOpenDialog = (block) => {
    setSelectedBlock(block);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  console.log(stats)

  return (
    <Container>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Category</TableCell>
            <TableCell>Block</TableCell>
            <TableCell>Total Words</TableCell>
            <TableCell>Memorized Words</TableCell>
            <TableCell>Memorization Rate</TableCell>
            <TableCell>Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stats.map((stat, index) => (
            <TableRow key={index}>
              <TableCell>{stat.category}</TableCell>
              <TableCell>{stat.block}</TableCell>
              <TableCell>{stat.totalWords}</TableCell>
              <TableCell>{stat.memorizedWords}</TableCell>
              <TableCell>{stat.memorizationRate}%</TableCell>
              <TableCell>
                <Button variant="outlined" onClick={() => handleOpenDialog(stat.block)}>
                  詳細を見る
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Block {selectedBlock} Details</DialogTitle>
        <DialogContent>
          {/* ブロックの詳細を表示 */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default StatusByTheme;
