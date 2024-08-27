import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useRouter } from 'next/router';
import HomePageHeader from '@/components/public/homepageHeader';
import HomePageFooter from '@/components/public/homepageFooter';
import SEOHeader from '@/components/seoHeader';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <>
      <SEOHeader title="プライバシーポリシー"/>
      <HomePageHeader />
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" gutterBottom>
            プライバシーポリシー
          </Typography>
          <Typography variant="h6" gutterBottom>
            1. はじめに
          </Typography>
          <Typography paragraph>
            このプライバシーポリシーは、[AI学習アプリ名]（以下、「当サービス」と言います。）が提供するサービスにおける、ユーザーのプライバシーとデータの保護に関する当社の取り組みを説明します。当サービスを利用することにより、ユーザーは本ポリシーに記載されたデータ処理方法に同意するものとします。
          </Typography>
          <Typography variant="h6" gutterBottom>
            2. 収集する情報
          </Typography>
          <Typography paragraph>
            - 個人情報：ユーザーが当サービスに登録する際に提供する情報（例：氏名、メールアドレス、電話番号など）。
            - 利用データ：当サービスの利用に関連する情報（例：アクセス時間、閲覧したページ、利用した機能など）。
            - デバイス情報：ユーザーが当サービスを利用する際に使用するデバイスに関する情報（例：IPアドレス、ブラウザの種類、オペレーティングシステムなど）。
          </Typography>
          <Typography variant="h6" gutterBottom>
            3. 情報の利用目的
          </Typography>
          <Typography paragraph>
            収集した情報は以下の目的で使用されます：
            - 当サービスの提供、維持、改善、および新サービスの開発。
            - ユーザーサポートの提供。
            - 利用者の行動分析や統計的研究。
            - 法令遵守や、要請に基づく情報の開示。
          </Typography>
          <Typography variant="h6" gutterBottom>
            4. 情報の共有と開示
          </Typography>
          <Typography paragraph>
            - 第三者との共有：当社は、ユーザーの同意を得た場合、または法令に基づく要請がある場合を除き、個人情報を第三者と共有または開示しません。
            - 業務委託先への提供：当社は、サービス提供に必要な範囲で、信頼できる業務委託先に対し、個人情報の取り扱いを委託することがあります。その場合、委託先に対して厳格なデータ保護契約を締結し、個人情報の保護を確保します。
          </Typography>
          <Typography variant="h6" gutterBottom>
            5. ユーザーの権利
          </Typography>
          <Typography paragraph>
            ユーザーは、自己の個人情報に関して以下の権利を有します：
            - アクセス権：自己の個人情報にアクセスし、その内容を確認する権利。
            - 訂正権：不正確または不完全な個人情報の訂正を求める権利。
            - 削除権：特定の条件下で自己の個人情報の削除を求める権利。
            - 処理の制限権：特定の条件下で自己の個人情報の処理を制限する権利。
          </Typography>
          <Typography variant="h6" gutterBottom>
            6. セキュリティ
          </Typography>
          <Typography paragraph>
            当社は、ユーザーの個人情報の安全性を保護するために、適切な物理的、技術的、組織的対策を講じています。
          </Typography>
          <Typography variant="h6" gutterBottom>
            7. プライバシーポリシーの変更
          </Typography>
          <Typography paragraph>
            当社は、必要に応じて本プライバシーポリシーを更新することがあります。変更があった場合、当サービス上で通知し、最新のプライバシーポリシーを公開します。
          </Typography>
          <Typography variant="h6" gutterBottom>
            8. お問い合わせ
          </Typography>
          <Typography paragraph>
            プライバシーポリシーに関するご質問や懸念がある場合は、[お問い合わせ]までご連絡ください。
          </Typography>
          <Box mt={4}>
            <Button variant="contained" color="primary" onClick={() => router.back()}>
              戻る
            </Button>
          </Box>
        </Box>
      </Container>
      <HomePageFooter/>
    </>
  );
}
