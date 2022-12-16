import { useSession } from "next-auth/react";
import Image from "next/image";
import { type FormEvent, useState } from "react";
import { createTweetSchema } from "../server/schemas/tweet";
import { trpc } from "../utils/trpc";
import {
  FaImage,
  FaFileVideo,
  FaPoll,
  FaSmileBeam,
  FaCalendar,
  FaLocationArrow,
} from "react-icons/fa";

const CreateTweetForm = () => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const session = useSession();

  const utils = trpc.useContext();
  const createTweet = trpc.tweet.create.useMutation({
    onSuccess: () => {
      setText("");
      utils.tweet.timeline.invalidate();
    },
  });

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
    <div className="flex border-b border-[#2F3336]">
      <div className="ml-2">
        <Image
          src={session?.data?.user?.image || ""}
          alt="profile picture"
          height={48}
          width={48}
        />
      </div>
      <form onSubmit={handleSubmit} className="flex w-full flex-col">
        <textarea
          className="w-full resize-none bg-black p-4 text-white shadow outline-none"
          placeholder="What's happening?"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = "inherit";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />

        {error && <div className="text-red-500">{error}</div>}
        <div className="m-4 flex justify-between">
          <div className="flex flex-row items-center gap-4">
            <FaImage className="text-primary hover:text-blue-700" />
            <FaFileVideo className="text-primary hover:text-blue-700" />
            <FaPoll className="text-primary hover:text-blue-700" />
            <FaSmileBeam className="text-primary hover:text-blue-700" />
            <FaCalendar className="text-primary hover:text-blue-700" />
            <FaLocationArrow className="text-primary hover:text-blue-700" />
          </div>
          <button
            type="submit"
            className="rounded-3xl bg-primary px-4 py-2 text-white hover:bg-blue-700"
          >
            Tweet
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTweetForm;
