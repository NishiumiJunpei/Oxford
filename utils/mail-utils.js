// utils/mail-utils.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // 環境変数からSendGridのAPIキーを設定

async function sendPasswordResetEmail(email, url) {
  const message = {
    to: email, // 受信者のアドレス
    from: `support@${process.env.MAIL_ACCOUNT}`, // 送信者のアドレス
    subject: '[susu english]パスワードリセット', // 件名
    text: `パスワードを変更するにはこのリンクをクリックしてください: ${url}`, // テキスト版のメッセージ
    html: `<p>パスワードを変更するにはこのリンクをクリックしてください: <a href="${url}">${url}</a></p>`, // HTML版のメッセージ
  };

  try {
    await sgMail.send(message);
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw error;
  }
}

export default sendPasswordResetEmail;
