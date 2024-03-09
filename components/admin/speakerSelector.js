import React, { useState, useEffect } from 'react';
import { TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Grid, Typography, Box } from '@mui/material';

import { speakerInfo } from '@/utils/variables';

const SpeakerSelector = ({ onOpeningScriptChange, onSpeakerSelect }) => {
  const [openingScript, setOpeningScript] = useState('');
  const hosts = Object.entries(speakerInfo).flatMap(([gender, speakers]) =>
    speakers.filter(speaker => speaker.host).map(speaker => ({ ...speaker, gender }))
  );

  // デフォルトで最初のホストを選択
  const [selectedSpeaker, setSelectedSpeaker] = useState(hosts.length > 0 ? hosts[0].voice.name : '');

  useEffect(() => {
    // コンポーネントがマウントされた後に、初期選択を親コンポーネントに通知
    if (hosts.length > 0) {
      onSpeakerSelect(hosts[0]);
    }
  }, []); // 空の依存配列で初期マウント時のみ実行

  const handleOpeningScriptChange = (event) => {
    const value = event.target.value;
    setOpeningScript(value);
    onOpeningScriptChange(value);
  };

  const handleSpeakerChange = (event) => {
    const value = event.target.value;
    const selectedHost = hosts.find(host => host.voice.name === value);
    setSelectedSpeaker(value);
    onSpeakerSelect(selectedHost);
  };

  return (
    <Box sx={{mt: 5}}>
      <FormControl component="fieldset">
        <FormLabel component="legend">ホストスピーカー</FormLabel>
        <RadioGroup name="host-selection" value={selectedSpeaker} onChange={handleSpeakerChange}>
          {hosts.map((host, index) => (
            <FormControlLabel
              key={index}
              value={host.voice.name} 
              control={<Radio />}
              label={<Grid container alignItems="center">
                        <Grid item>
                          <img src={host.imageUrl} alt={host.voice.name} style={{ width: 50, height: 50, marginRight: 10 }} />
                        </Grid>
                        <Grid item>
                          {host.voice.name} ({host.gender})
                        </Grid>
                      </Grid>}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <FormLabel component="legend" sx={{mt: 2}}>オープニングスクリプト</FormLabel>
      <TextField
        label="Opening Script"
        multiline
        rows={4}
        variant="outlined"
        value={openingScript}
        onChange={handleOpeningScriptChange}
        fullWidth
      />
    </Box>
  );
};

export default SpeakerSelector;
