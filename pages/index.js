// pages/index.js

export async function getServerSideProps(context) {
  return {
    redirect: {
      destination: '/appHome',
      permanent: false,
    },
  };
}

const HomePage = () => {
  return null;
};

export default HomePage;
