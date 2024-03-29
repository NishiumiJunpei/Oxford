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


const correctSoundPath = "/audio/correct-answer.mp3"
export const playCorrectSound = () => {
    const audio = new Audio(correctSoundPath);
    audio.play();
  };
