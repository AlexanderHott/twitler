import Image from "next/image";
import React, { useEffect } from "react";
import { type RouterOutputs, trpc, type RouterInputs } from "../utils/trpc";
import CreateTweetForm from "./CreateTweetForm";
import dayjs from "dayjs";
import Link from "next/link";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import {
  AiFillHeart,
  AiOutlineRetweet,
  AiOutlineComment,
  AiOutlineShareAlt,
  AiOutlineDollar,
} from "react-icons/ai";
import {
  type InfiniteData,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";

type Tweet = RouterOutputs["tweet"]["timeline"]["tweets"][number];

const FETCH_LIMIT = 10;

dayjs.extend(relativeTime); // adds `.fromNow()` and updateLocale to dayjs
dayjs.extend(updateLocale);

// https://day.js.org/docs/en/customization/relative-time
dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy",
  },
});

/**  Returns the current scroll position as a percentage of the scrollable area.
 */
const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = React.useState(0);

  // TODO: debounce
  const handleScroll = () => {
    // calculate percent scrolled
    const position =
      (window.pageYOffset /
        (document.documentElement.scrollHeight -
          document.documentElement.clientHeight)) *
      100;
    setScrollPosition(position);
  };

  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollPosition;
};

/** Updates trpc's queryClient cache with new data.
 *
 * We need to match the query key exactly, so there are a lot of extra arguments.
 * @param queryClient trpc's queryClient
 * @param variables variables for the mutation
 * @param data the data to add if the user likes a tweet
 * @param input the input for the query
 * @param action the action that was performed
 */
const updateCache = ({
  queryClient,
  variables,
  data,
  input,
  action,
}: {
  queryClient: QueryClient;
  variables: { tweetId: string };
  data: { userId: string };
  input: RouterInputs["tweet"]["timeline"];
  action: "like" | "unlike";
}) => {
  queryClient.setQueryData(
    [["tweet", "timeline"], { input, type: "infinite" }],
    (oldData) => {
      const newData = oldData as InfiniteData<
        RouterOutputs["tweet"]["timeline"]
      >;
      const value = action === "like" ? 1 : -1;
      // TODO: optimistic updates
      const newTweets = newData.pages.map((page) => {
        return {
          tweets: page.tweets.map((tweet) => {
            if (tweet.id === variables.tweetId) {
              return {
                ...tweet,
                likes: action === "like" ? [{ id: data.userId }] : [],
                _count: { likes: tweet._count.likes + value },
              };
            }
            return tweet;
          }),
        };
      });
      return { ...newData, pages: newTweets };
    }
  );
};

const Tweet: React.FC<{
  tweet: Tweet;
  queryClient: QueryClient;
  input: RouterInputs["tweet"]["timeline"];
}> = ({ tweet, queryClient, input }) => {
  const likeMutation = trpc.tweet.like.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ queryClient, data, variables, input, action: "like" });
    },
  }).mutateAsync;
  const unlikeMutation = trpc.tweet.unlike.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ queryClient, data, variables, input, action: "unlike" });
    },
  }).mutateAsync;
  const hasLiked = tweet.likes.length > 0; // we only select our own likes from the db

  return (
    <div className="mb-4 flex flex-col border-b border-[#2F3336]">
      <div className="flex p-2">
        <div className="min-w-max">
          {tweet.author.image && (
            <Image
              src={tweet.author.image}
              alt={`${tweet.author.name} profile picture`}
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
        </div>
        <div className="ml-2 flex min-w-0 flex-col overflow-ellipsis">
          <div className="flex items-center ">
            <p className="font-bold text-white">
              <Link href={`/${tweet.author.name}`}>{tweet.author.name}</Link>
            </p>
            <p className="pl-1 text-xs text-gray-500">
              · {dayjs(tweet.createdAt).fromNow()}
            </p>
          </div>
          <div>
            <p className=" break-words  text-white">{tweet.text}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-evenly p-2">
        <div className="flex flex-row items-center gap-1">
          <AiFillHeart
            color={hasLiked ? "red" : "gray"}
            size="1.5rem"
            onClick={async () => {
              if (hasLiked) {
                await unlikeMutation({ tweetId: tweet.id });
              } else {
                await likeMutation({ tweetId: tweet.id });
              }
            }}
            className="cursor-pointer "
          />
          <span className="text-sm text-gray-500">{tweet._count.likes}</span>
        </div>

        <AiOutlineRetweet size="1.5rem" color="gray" />
        <AiOutlineComment size="1.5rem" color="gray" />
        <AiOutlineShareAlt size="1.5rem" color="gray" />
        <AiOutlineDollar size="1.5rem" color="gray" />
      </div>
    </div>
  );
};

const Timeline: NextPage<{
  where?: RouterInputs["tweet"]["timeline"]["where"];
  hideCreateForm?: boolean;
  title: string;
}> = ({ where = {}, hideCreateForm, title }) => {
  const session = useSession();
  // infinite scrolling
  const scrollPosition = useScrollPosition();
  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.tweet.timeline.useInfiniteQuery(
      { limit: FETCH_LIMIT, where },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  // auto load new tweets when the user gets to 90% of the page
  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [scrollPosition, fetchNextPage, hasNextPage, isFetching]);

  const queryClient = useQueryClient();

  const tweets = data?.pages.flatMap((page) => page.tweets);
  return (
    <div>
      <h1 className="ml-2 mb-4 text-2xl font-bold text-white">{title}</h1>
      {session.status === "authenticated" && !hideCreateForm && (
        <CreateTweetForm />
      )}
      <ul>
        {tweets?.map((tweet) => (
          <Tweet
            tweet={tweet}
            key={tweet.id}
            queryClient={queryClient}
            input={{ limit: FETCH_LIMIT, where }}
          />
        ))}
      </ul>
      {!hasNextPage && (
        <p className="pb-2 text-center text-gray-500 ">
          No more items to load. <b>Go outside</b>
        </p>
      )}
    </div>
  );
};

export default Timeline;
