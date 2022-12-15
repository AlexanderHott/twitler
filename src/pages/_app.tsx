import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import { ReactQueryDevtools } from "@tanstack/react-query-dev-tools";

import { Container } from "../components/Container";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";
import { LoggedOutBanner } from "../components/LoggedOutBanner";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <ReactQueryDevtools>
      <SessionProvider session={session}>
        <Container>
          <main>
            <Component {...pageProps} />
          </main>
        </Container>
        {!session && <LoggedOutBanner />}
      </SessionProvider>
    </ReactQueryDevtools>
  );
};

export default trpc.withTRPC(MyApp);
