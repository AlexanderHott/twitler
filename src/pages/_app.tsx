import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Container } from "../components/Container";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";
import { LoggedOutBanner as SignInBanner } from "../components/SignInBanner";
import LeftNav from "../components/LeftNav";
import RightNav from "../components/RightNav";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-black">
        <div className="flex justify-center">
          <LeftNav />
          <Container>
            <main>
              <Component {...pageProps} />
            </main>
          </Container>
          <RightNav />
        </div>
        {!session && <SignInBanner />}
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
