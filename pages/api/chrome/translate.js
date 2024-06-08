// Import Next.js API handler
export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
      // CORSのプリフライトリクエストに対応
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      res.status(204).end();
      return;
    }
  
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
    if (req.method === 'POST') {
      const { selectedWords } = req.body;
  
      // 翻訳APIのロジック
      const response = {
        success: true,
        japanese: '例の翻訳',
        phrases: [
          { phraseJap: "XXXX", phraseExplanation: "YYY" },
          { phraseJap: "XXXX", phraseExplanation: "YYY" },
          { phraseJap: "XXXX", phraseExplanation: "YYY" }
        ]
      };
  
      res.status(200).json(response);
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  