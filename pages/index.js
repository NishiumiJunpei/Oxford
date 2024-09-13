// pages/index.js

export async function getServerSideProps(context) {
  return {
    redirect: {
      destination: '/eiken1',
      permanent: false,
    },
  };
}

const HomePage = () => {
  return null;
};

export default HomePage;
