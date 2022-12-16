import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Container } from "../components/Container";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";
import { LoggedOutBanner } from "../components/LoggedOutBanner";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div className="bg-black">
        <Container>
          <main>
            <Component {...pageProps} />
          </main>
        </Container>
        {!session && <LoggedOutBanner />}
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
