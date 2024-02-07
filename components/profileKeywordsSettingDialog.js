//ProfileKeywordsSettingDialog.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Box, TextField, Grid, Chip } from '@mui/material';

const ProfileKeywordsSettingDialog = ({ open, onClose }) => {
    const [userInfo, setUserInfo] = useState({ email: '', name: '', birthday: '', profile: '' });
    const [loading, setLoading] = useState(false);
    const [profileKeywords, setProfileKeywords] = useState([]); // プロフィールキーワードの状態
    const [newProfile, setNewProfile] = useState(''); // 新しいキーワードの入力値
    const [interestKeywords, setInterestKeywords] = useState([]); // 興味・好きなことのキーワード
    const [newInterest, setNewInterest] = useState(''); // 新しい興味・好きなことの入力値
    const [IsloadingProfile, setIsLoadingProfile] = useState(false);
    const [IsloadingInterest, setIsLoadingInterest] = useState(false);
  
    // ユーザー情報をAPIから取得
    useEffect(() => {
        const fetchUserInfo = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/user-setting/getUserInfo');
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            // userInfoの更新
            setUserInfo({ email: data.email, name: data.name, birthday: data.birthday, profile: data.profile });
    
            // profileKeywordsとinterestKeywordsの更新
            setProfileKeywords(data.profileKeywords || []);
            setInterestKeywords(data.interestKeywords || []);
    
        } catch (error) {
            console.error('There was an error fetching the user info:', error);
        }
        setLoading(false);
        };
    
        fetchUserInfo();
    }, []);

    
    const updateProfileKeyword = async (keyword, action) => {
        setIsLoadingProfile(true)
        await fetch('/api/user-setting/updateProfileKeyword', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileKeyword: keyword, action: action }),
        });
        if (action === 'UPDATE') {
          setProfileKeywords([...profileKeywords, keyword]);
        } else if (action === 'DELETE') {
          setProfileKeywords(profileKeywords.filter(k => k !== keyword));
        }
        setIsLoadingProfile(false)
      };
    
      // キーワードの追加
      const handleAddKeyword = () => {
        if (newProfile && profileKeywords.length < 10) {
          updateProfileKeyword(newProfile, 'UPDATE');
          setNewProfile('');
        }
      };
    
      // キーワードの削除
      const handleDeleteKeyword = (keyword) => () => {
        updateProfileKeyword(keyword, 'DELETE');
      };
    
      const updateInterestKeyword = async (keyword, action) => {
        setIsLoadingInterest(true)
        await fetch('/api/user-setting/updateInterestKeyword', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interestKeyword: keyword, action: action }),
        });
        if (action === 'UPDATE') {
          setInterestKeywords([...interestKeywords, keyword]);
        } else if (action === 'DELETE') {
          setInterestKeywords(interestKeywords.filter(k => k !== keyword));
        }
        setIsLoadingInterest(false)
      };
    
      // キーワードの追加
      const handleAddInterest = () => {
        if (newInterest && interestKeywords.length < 10) {
          updateInterestKeyword(newInterest, 'UPDATE');
          setNewInterest('');
        }
      };
    
      // キーワードの削除
      const handleDeleteInterest = (keyword) => () => {
        updateInterestKeyword(keyword, 'DELETE');
    };

    const handleClose = () =>{
        onClose()
    }
    
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            // PaperProps={{
            //     sx: {
            //         width: fullScreen ? '100%' : '50%', // モバイルでは100%、それ以外では70%
            //         height: '90%',
            //         maxWidth: '100%',
            //         maxHeight: '100%',
            //         overflow: 'auto'
            //     }
            // }}
        >
            <DialogTitle>
                キーワード設定
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={1} alignItems="center">
                    <Grid item xs>
                    <TextField
                        label="プロフィール"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newProfile}
                        onChange={(e) => setNewProfile(e.target.value)}
                        inputProps={{ maxLength: 15 }}
                        autoComplete='off'
                    />
                    </Grid>
                    <Grid item>
                    <Button variant="outlined" color="primary" onClick={handleAddKeyword} disabled={profileKeywords.length >= 10 || IsloadingProfile}>
                        セット
                    </Button>
                    </Grid>
                </Grid>
                <Typography variant="body2" color="GrayText" sx={{mb: 1}}>例：大学生、営業職、母親 (最大10個まで)</Typography>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profileKeywords.map((keyword, index) => (
                    <Chip
                        key={index}
                        label={keyword}
                        onDelete={handleDeleteKeyword(keyword)}
                        color="primary"
                    />
                    ))}
                </Box>

                <Grid container spacing={1} alignItems="center" sx={{mt: 5}}>
                    <Grid item xs>
                    <TextField
                        label="興味・好きなこと"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        inputProps={{ maxLength: 15 }}
                        autoComplete='off'
                    />
                    </Grid>
                    <Grid item>
                    <Button variant="outlined" color="primary" onClick={handleAddInterest} disabled={interestKeywords.length >= 10 || IsloadingInterest}>
                        セット
                    </Button>
                    </Grid>
                </Grid>
                <Typography variant="body2" color="GrayText" sx={{mb: 1}}>例：旅行、読書、映画鑑賞 (最大10個まで)</Typography>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {interestKeywords.map((keyword, index) => (
                    <Chip
                        key={index}
                        label={keyword}
                        onDelete={handleDeleteInterest(keyword)}
                        color="primary"
                    />
                    ))}
                </Box>





            </DialogContent>
            <DialogActions style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button 
                    onClick={onClose}
                    style={{ margin: 5, padding: 5, minWidth: 90 }}
                >
                    閉じる
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProfileKeywordsSettingDialog;
