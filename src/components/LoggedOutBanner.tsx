import { signIn, useSession } from "next-auth/react";
import { Container } from "./Container";

export function LoggedOutBanner() {
  const { data: session } = useSession();

  if (session) {
    return null;
  }
  return (
    <div className="fixed bottom-0 w-full bg-primary p-4">
      <Container classNames="bg-transparent flex justify-between items-center">
        <div>
          <p className="text-2xl text-white">Do not miss out</p>
          <p className="text-white">People on Twitter are the first to know.</p>
        </div>
        <div>
          <button
            className="rounded bg-white px-4 py-2 font-bold text-blue-500 shadow-md"
            onClick={() => signIn("discord")}
          >
            Login
          </button>
        </div>
      </Container>
    </div>
  );
}
