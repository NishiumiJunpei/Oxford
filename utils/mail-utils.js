// utils/mail-utils.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // 環境変数からSendGridのAPIキーを設定

export async function sendPasswordResetEmail(email, url) {
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

export async function sendSignUpConfirmationEmail(email, url) {
  const message = {
    to: email, // 受信者のアドレス
    from: `support@${process.env.MAIL_ACCOUNT}`, // 送信者のアドレス
    subject: '[susu english] ユーザ登録', // 件名
    text: `ユーザ登録するにはこのリンクをクリックしてください: ${url}`, // テキスト版のメッセージ
    html: `<p>ユーザ登録するにはこのリンクをクリックしてください: <a href="${url}">${url}</a></p>`, // HTML版のメッセージ
  };

  try {
    await sgMail.send(message);
    console.log('signup email sent successfully');
  } catch (error) {
    console.error('Error sending signup email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw error;
  }
}

export async function sendInquiryEmail(formData) {
  const message = {
    to: 'nishiumi@gmail.com', // 実際にはあなたのメールアドレスに置き換えてください
    from: `support@${process.env.MAIL_ACCOUNT}`, // 送信者のアドレス
    subject: '[susuEnglish]問い合わせ内容', // 件名
    text: `名前: ${formData.name}\nメールアドレス: ${formData.email}\nメッセージ: ${formData.message}`, // テキスト版のメッセージ
    html: `
      <p><b>名前:</b> ${formData.name}</p>
      <p><b>メールアドレス:</b> ${formData.email}</p>
      <p><b>メッセージ:</b> ${formData.message}</p>
    `, // HTML版のメッセージ
  };

  try {
    await sgMail.send(message);
    console.log('Inquiry email sent successfully');
  } catch (error) {
    console.error('Error sending inquiry email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw error;
  }
}

