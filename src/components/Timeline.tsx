import Image from "next/image";
import React, { useEffect } from "react";
import { type RouterOutputs, trpc } from "../utils/trpc";
import CreateTweetForm from "./CreateTweetForm";
import dayjs from "dayjs";
import Link from "next/link";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { AiFillHeart } from "react-icons/ai";
import { type QueryClient } from "@tanstack/react-query";

type Tweet = RouterOutputs["tweet"]["timeline"]["tweets"][number];

// adds `.fromNow()` and updateLocale to dayjs
dayjs.extend(relativeTime);
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

const updateCache = ({
  queryClient,
  variables,
  data,
  action,
}: {
  queryClient: QueryClient;
  variables: { id: string; likes: number };
  data: { userId: string };
  action: "like" | "unlike";
}) => {
  queryClient.setQueryData({});
};

const Tweet: React.FC<{
  tweet: Tweet;
}> = ({ tweet }) => {
  const likeMutation = trpc.tweet.like.useMutation().mutateAsync;
  const unlikeMutation = trpc.tweet.unlike.useMutation().mutateAsync;
  const hasLiked = tweet.likes.length > 0; // we only select our own likes from the db
  return (
    <div className="mb-4 border-b-2 border-gray-500">
      <div className="flex p-2">
        {tweet.author.image && (
          <Image
            src={tweet.author.image}
            alt={`${tweet.author.name} profile picture`}
            width={48}
            height={48}
            className="rounded-full"
          />
        )}

        <div className="ml-2">
          <div className="flex items-center">
            <p className="font-bold">
              <Link href={`/${tweet.author.name}`}>{tweet.author.name}</Link>
            </p>
            <p className="pl-1 text-xs text-gray-500">
              - {dayjs(tweet.createdAt).fromNow()}
            </p>
          </div>

          <div>{tweet.text}</div>
        </div>
      </div>
      <div className="mt-4 flex items-center p-2">
        <AiFillHeart
          color={hasLiked ? "red" : "black"}
          size="1.5rem"
          onClick={async () => {
            if (hasLiked) {
              await unlikeMutation({ tweetId: tweet.id });
            } else {
              await likeMutation({ tweetId: tweet.id });
            }
          }}
        />
        <span className="text-sm text-gray-500"> {10}</span>
      </div>
    </div>
  );
};

const Timeline = () => {
  // infinite scrolling
  const scrollPosition = useScrollPosition();
  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.tweet.timeline.useInfiniteQuery(
      { limit: 10 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  // auto load new tweets when the user gets to 90% of the page
  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [scrollPosition, fetchNextPage, hasNextPage, isFetching]);

  const tweets = data?.pages.flatMap((page) => page.tweets);
  return (
    <div>
      <CreateTweetForm />
      <ul className="border-l-2 border-r-2 border-t-2 border-gray-500">
        {tweets?.map((tweet) => (
          <Tweet tweet={tweet} key={tweet.id} />
        ))}
      </ul>
      {!hasNextPage && <p>No more items to load</p>}
    </div>
  );
};

export default Timeline;
