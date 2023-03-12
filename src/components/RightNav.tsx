const RightNav = () => {
  return (
    <div>
      <div className="sticky top-0 flex flex-col gap-4 pr-36 pt-4 text-white">
        <input
          placeholder="Search Twitler"
          className="rounded-3xl border border-[#2F3336]  bg-[#202327] p-2 text-white outline-1"
        />
        <div className=" flex flex-col gap-4 rounded-xl bg-[#202327] p-8">
          <h2 className="pb-4 text-xl font-bold">What&apos;s happening</h2>
          <div>
            <h3 className="text-xs text-gray-500">Sports · LIVE</h3>
            <span className="font-bold">2022 FIFA World Cup</span>
          </div>
          <div>
            <h3 className="text-xs text-gray-500">Trending in United States</h3>
            <span className="font-bold">2022 International Bingus Day</span>
          </div>
          <div>
            <h3 className="text-xs text-gray-500">
              Music streaming service · Trending
            </h3>
            <span className="font-bold">Spotify</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightNav;
