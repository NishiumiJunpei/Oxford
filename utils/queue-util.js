import Queue from 'queue';

const requestQueue = new Queue({ concurrency: 1, timeout: 60000, autostart: true });
let lastRequestTime = 0;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

        resolve(result);
      } catch (error) {
        console.log(`Task failed. Remaining tasks in the queue: ${requestQueue.length}`);
        resolve('')
//        reject(error)
      }
    });
  });
}

