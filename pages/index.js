import SEOHeader from '@/components/seoHeader';

export async function getServerSideProps(context) {
  return {
    redirect: {
      destination: '/eiken1',
      permanent: false,
    },
  };
}

const HomePage = () => {
  return (
    <>
      <SEOHeader title="susuEnglishホームページ" description="SusuEnglishはこれまでの英単語学習を根本的に変えるツールです。英単語を楽しく快適に学習するために、ビジュアルやAI解説音声などを用いた体験を提供します。" />
    </>
  );
};

export default HomePage;
