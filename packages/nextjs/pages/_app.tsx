import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import PlausibleProvider from "next-plausible";
import { ThemeProvider, useTheme } from "next-themes";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";
import { WagmiConfig } from "wagmi";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import "~~/styles/globals.css";

const ScaffoldEthApp = ({ Component, pageProps }: AppProps) => {
  const price = useNativeCurrencyPrice();
  const setNativeCurrencyPrice = useGlobalState(state => state.setNativeCurrencyPrice);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (price > 0) {
      setNativeCurrencyPrice(price);
    }
  }, [setNativeCurrencyPrice, price]);

  const wagmiConfig = useGlobalState(state => state.wagmiConfig);
  const appChains = useGlobalState(state => state.appChains);

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={appChains.chains}
        avatar={BlockieAvatar}
        theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
      >
        <div className="flex min-h-screen flex-col">
          <main className="relative flex flex-1 flex-col">
            <Component {...pageProps} />
          </main>
        </div>
        <Toaster />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

const ScaffoldEthAppWithProviders = (props: AppProps) => {
  return (
    <PlausibleProvider domain="abi.ninja">
      <ThemeProvider>
        <NextNProgress />
        <ScaffoldEthApp {...props} />
      </ThemeProvider>
    </PlausibleProvider>
  );
};

export default ScaffoldEthAppWithProviders;
