import Queue from 'queue';


// -------------- openai APIの画像処理用の１分間に画像処理リクエストを5回までに制限 -----------------

const requestQueue = new Queue({ concurrency: 1, timeout: 60000, autostart: true });
let lastRequestTime = 0;

export function enqueueRequest(callback) {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      if (timeSinceLastRequest < 12000) { // OpenAIのレートリミットに合わせて調整
        await delay(12000 - timeSinceLastRequest);
      }
      lastRequestTime = Date.now();
      try {
        const result = await callback();
        console.log(`Task completed. Remaining tasks in the queue: ${requestQueue.length}`);
        resolve(result);
      } catch (error) {
        console.log(`Task failed. Remaining tasks in the queue: ${requestQueue.length}`);
        reject(error);
      }
    });
  });
}

