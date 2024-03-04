// pages/api/inquiry.js
import { sendInquiryEmail } from '@/utils/mail-utils';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await sendInquiryEmail(req.body); // フォームデータをメール送信関数に渡す
      res.status(200).json({ message: 'Inquiry sent successfully' });
    } catch (error) {
      console.error('Error sending inquiry:', error);
      res.status(500).json({ error: 'Failed to send inquiry' });
    }
  } else {
    // POST以外のメソッドに対して405 Method Not Allowedを返す
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
