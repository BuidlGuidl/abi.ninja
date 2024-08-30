import React from "react";
import Head from "next/head";
import { Address } from "viem";

type MetaHeaderProps = {
  address?: Address | null;
  network?: number | null;
  title?: string;
  description?: string;
  image?: string;
  twitterCard?: string;
  children?: React.ReactNode;
};

// Images must have an absolute path to work properly on Twitter.
// We try to get it dynamically from Vercel, but we default to relative path.
const baseUrl = process.env.VERCEL_URL ? "https://abi.ninja" : `http://localhost:${process.env.PORT || 3000}`;

export const MetaHeader = ({
  address,
  network,
  title = "ABI Ninja",
  description = "Interact with smart contracts on any EVM chain",
  image = "thumbnail.png",
  twitterCard = "summary_large_image",
  children,
}: MetaHeaderProps) => {
  const imageUrl = address
    ? `${baseUrl}/api/og/?contractAddress=${address}&network=${network}`
    : `${baseUrl}/thumbnail.png`;

  return (
    <Head>
      {title && (
        <>
          <title>{title}</title>
          <meta property="og:title" content={title} />
          <meta name="twitter:title" content={title} />
        </>
      )}
      {description && (
        <>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
          <meta name="twitter:description" content={description} />
        </>
      )}
      {image && (
        <>
          <meta property="og:image" content={imageUrl} />
          <meta name="twitter:image" content={imageUrl} />
        </>
      )}
      {twitterCard && <meta name="twitter:card" content={twitterCard} />}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
      {children}
    </Head>
  );
};
