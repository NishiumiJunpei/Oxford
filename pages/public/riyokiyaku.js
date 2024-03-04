import React from 'react';
import { Box, Typography, Button, Container, Link } from '@mui/material';
import { useRouter } from 'next/router';
import HomePageHeader from '@/components/public/homepageHeader';
import HomePageFooter from '@/components/public/homepageFooter';

export default function TermsOfService() {
  const router = useRouter();

  return (
    <>
      <HomePageHeader />
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" gutterBottom>
            利用規約
          </Typography>
          <Typography paragraph>
            本利用規約（以下、「本規約」といいます。）は、susuEnglish（以下、「当社」といいます。）がこのウェブサイト上で提供するサービス（以下、「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆さま（以下、「ユーザー」といいます。）には、本規約に従って、本サービスをご利用いただきます。
          </Typography>
          <Typography variant="h6" gutterBottom>
            第1条（適用）
          </Typography>
          <Typography paragraph>
            本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
          </Typography>
          <Typography variant="h6" gutterBottom>
            第2条（利用登録）
          </Typography>
          <Typography paragraph>
            登録希望者が当社の定める方法によって利用登録を申請し、当社がこれを承認することにより、利用登録が完了するものとします。
          </Typography>
          <Typography variant="h6" gutterBottom>
            第3条（ユーザーIDおよびパスワードの管理）
          </Typography>
          <Typography paragraph>
            ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
          </Typography>
          <Typography variant="h6" gutterBottom>
            第4条（禁止事項）
          </Typography>
          <Typography paragraph>
            ユーザーは、本サービスの利用にあたり、以下の行為をしてはならないものとします。
            <ul>
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>本サービスの運営を妨害するおそれのある行為</li>
              <li>他のユーザーに迷惑をかける行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ul>
          </Typography>
          <Typography variant="h6" gutterBottom>
            第5条（本サービスの提供の停止等）
          </Typography>
          <Typography paragraph>
            当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部を停止または中断することができるものとします。
            <ul>
              <li>本サービスにかかるコンピューターシステムの保守点検または更新を行う場合</li>
              <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
              <li>その他、当社が本サービスの提供が困難と判断した場合</li>
            </ul>
          </Typography>
          <Typography variant="h6" gutterBottom>
            第6条（著作権）
          </Typography>
          <Typography paragraph>
            当社が本サービス上で提供するコンテンツ（動画、画像、単語一覧、例文、類語などを含むがこれに限られない）に関する著作権その他の知的財産権は、法律で認められている場合を除き、当社またはそのライセンサーに帰属します。ユーザーは、当社の書面による明示的な事前の同意がない限り、これらのコンテンツを複製、配信、展示、実行、変更、翻訳、または作成する二次的著作物を作成することはできません。本サービスを通じてアクセス可能なコンテンツの使用は、個人的な非商業的用途に限定され、これらの行為が当社または著作権所有者の権利を侵害することは禁止されています。
          </Typography>
         
          <Box mt={4}>
            <Button variant="contained" color="primary" onClick={() => router.push('/auth/signin')}>
              ログインページへ
            </Button>
          </Box>
        </Box>
      </Container>
      <HomePageFooter />
    </>
  );
}
