let currentAudio = null; // グローバルオーディオインスタンス

export const playAudio = ({text, lang = 'en', gender = 'male', specifiedVoice}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch('/api/common/synthesize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, lang, gender, specifiedVoice }),
            });

            const data = await response.json();
            if (data.audioContent) {
                const audioBlob = new Blob([new Uint8Array(data.audioContent.data)], { type: 'audio/mp3' });
                const audioUrl = URL.createObjectURL(audioBlob);
                if (currentAudio) {
                    currentAudio.pause(); // 既存のオーディオを停止
                }
                currentAudio = new Audio(audioUrl); // 新しいオーディオインスタンスを作成
                currentAudio.play();

                currentAudio.onended = () => {
                    resolve();
                };
            }
        } catch (error) {
            console.error('Error during audio playback:', error);
            reject(error);
        }
    });
};

export const pauseAudio = () => {
    if (currentAudio) {
        currentAudio.pause();
    }
};

export const stopAudio = () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // オーディオの再生位置を最初に戻す
    }
};


//------------------------------   mp3用  ------------------------------------
let audioRef = null; // audioRefはグローバルで保持

export const playAudioMP3 = (audioUrl, playbackRate = 1.0) => {
    return new Promise((resolve, reject) => {
        if (audioRef) {
            audioRef.pause(); // 再生中の音声を停止
            audioRef.currentTime = 0; // 再生位置をリセット
        }

        audioRef = new Audio(audioUrl); // 新しいオーディオインスタンスを作成
        audioRef.playbackRate = playbackRate; // 再生速度を設定

        audioRef.play()
            .then(() => {
                audioRef.onended = () => {
                    resolve(); // 音声が終了したら次へ
                };
            })
            .catch((error) => {
                reject(error); // 再生エラー時にPromiseを拒否
            });
    });
};

export const pauseAudioMP3 = () => {
    if (audioRef) {
        audioRef.pause(); // 再生中の音声を一時停止
        console.log("音声が一時停止しました。");
    }
};

export const stopAudioMP3 = () => {
    if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0; // 再生位置をリセット
        audioRef = null; // 停止時にはaudioRefをクリア
        console.log("音声が停止しました。");
    }
};

//------------------------------   mp3用  ------------------------------------




const correctSoundPath = "/audio/correct-answer.mp3"
export const playCorrectSound = () => {
    const audio = new Audio(correctSoundPath);
    audio.play();
};



