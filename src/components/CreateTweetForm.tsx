import { type FormEvent, useState } from "react";
import { createTweetSchema } from "../server/schemas/tweet";
import { trpc } from "../utils/trpc";

const CreateTweetForm = () => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const createTweet = trpc.tweet.create.useMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await createTweetSchema.safeParseAsync({ text });
    if (!result.success) {
      setError(result.error.errors[0]?.message || "");
      return;
    }

    console.log("create tweet", text);

    return createTweet.mutateAsync({ text });
  };

  return (
    <>
      {error && <div className="text-red-500">{error}</div>}
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col border-2 p-4"
      >
        <textarea
          className="w-full p-4 shadow"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="rounded bg-primary px-4 py-2 text-white"
          >
            Tweet
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateTweetForm;
