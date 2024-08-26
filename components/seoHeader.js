// components/SEOHeader.js
import Head from 'next/head';

export default function SEOHeader({ title, description, url, image }) {
  const baseTitle = "SusuEnglish";
  const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
  const metaDescription = description || "Welcome to SusuEnglish, the best place for English Learning using GPT";
  const metaUrl = url || process.env.NEXT_PUBLIC_DOMAIN_URL;
  const metaImage = image || `${process.env.NEXT_PUBLIC_DOMAIN_URL}/logo-mark.png`;
  
  return (
    <Head>
      {/* ページタイトル */}
      <title>{fullTitle}</title>
      
      {/* メタディスクリプション */}
      <meta name="description" content={metaDescription} />

      {/* Open Graph (OG) メタタグ */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:type" content="website" />

      {/* Twitter カードメタタグ */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={metaUrl} />
    </Head>
  );
}
