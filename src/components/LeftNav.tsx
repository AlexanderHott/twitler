import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import type { FC, ReactNode } from "react";
import {
  FaHome,
  FaHashtag,
  FaBell,
  FaEnvelope,
  FaBookmark,
  FaUser,
  FaExpand,
} from "react-icons/fa";

const NavItem: FC<{ icon: ReactNode; text: string; href: string }> = ({
  icon,
  text,
  href,
}) => {
  return (
    <Link href={href} className="align-center flex items-center gap-4">
      <div>{icon}</div>
      <span className="text-xl">{text}</span>
    </Link>
  );
};

const LeftNav = () => {
  const session = useSession();

  return (
    <div className="pl-36 pt-4 text-white">
      <div className="sticky top-0 flex flex-col items-center ">
        <div className="mb-8 justify-between text-3xl">Twitler</div>
        <nav className="flex flex-col gap-6 ">
          <NavItem icon={<FaHome size={24} />} href="/" text="Home" />
          <NavItem
            icon={<FaHashtag size={24} />}
            href="explore"
            text="Explore"
          />
          <NavItem
            icon={<FaBell size={24} />}
            href="notifications"
            text="Notifications"
          />
          <NavItem
            icon={<FaEnvelope size={24} />}
            href="messages"
            text="Messages"
          />
          <NavItem
            icon={<FaBookmark size={24} />}
            href="bookmarks"
            text="Bookmarks"
          />
          {session?.data?.user?.name && (
            <NavItem
              icon={<FaUser size={24} />}
              href={session?.data?.user?.name}
              text="Profile"
            />
          )}
          <NavItem icon={<FaExpand size={24} />} href="/" text="More" />
        </nav>
        {session.data && (
          <button
            onClick={() => signOut()}
            className="mt-80 rounded-3xl bg-gray-400 px-4 py-2 text-white hover:bg-gray-700"
          >
            Log Out
          </button>
        )}
      </div>
    </div>
  );
};

export default LeftNav;
