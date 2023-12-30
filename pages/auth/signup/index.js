// pages/auth/signup.js
import { useState } from 'react';

export default function Signup() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ここでNextAuthのEmailプロバイダを使用して認証URLを送信
    // 実際にはNextAuth APIを叩く処理が必要
  };

  return (
    <div>
      <h1>Signup</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input type="submit" value="Send Verification Email" />
      </form>
    </div>
  );
}
