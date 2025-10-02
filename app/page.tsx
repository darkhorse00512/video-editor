import Navbar from "@/components/shared/navbar";
import VersionChangeLog from "@/components/shared/version-change-log";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="bg-gradient-to-tr from-gray-900 via-gray-900 to-blue-900/30 relative overflow-hidden min-h-screen">
        <div className="w-full h-full absolute flex flex-row justify-between left-0 lg:h-full lg:max-w-7xl lg:px-0 mx-auto px-0 right-0">
          <div className="w-1/3 lg:w-full h-full border-white/5 border-x "></div>
          <div className="hidden lg:block w-full h-full border-white/5 border-x"></div>
          <div className="w-1/3 lg:w-full h-full border-white/5 border-x"></div>
          <div className="hidden lg:block w-full h-full border-white/5 border-x"></div>
          <div className="w-1/3 lg:w-full h-full border-white/5 border-x"></div>
          <div className="hidden lg:block w-full h-full border-white/5 border-x"></div>
        </div>
        <div className="grid min-h-screen pl-8 pr-8 pb-20 gap-16 sm:p-12 font-[family-name:var(--font-geist-sans)]">
          <VersionChangeLog />
        </div>
      </div>
    </div>
  );
}
