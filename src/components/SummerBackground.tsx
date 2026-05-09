export default function SummerBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100">
      {/* 太阳 */}
      <div className="absolute top-12 right-[15%] w-24 h-24 rounded-full bg-yellow-300 shadow-[0_0_60px_20px_rgba(253,224,71,0.4)]" />

      {/* 云朵 */}
      <div className="absolute top-16 left-[8%] animate-[drift_20s_ease-in-out_infinite]">
        <div className="relative w-32 h-12">
          <div className="absolute w-14 h-14 bg-white/80 rounded-full -top-6 left-2" />
          <div className="absolute w-16 h-10 bg-white/80 rounded-full top-0 left-6" />
          <div className="absolute w-12 h-10 bg-white/80 rounded-full top-2 left-0" />
          <div className="absolute w-10 h-8 bg-white/80 rounded-full top-3 left-14" />
        </div>
      </div>
      <div className="absolute top-24 right-[20%] animate-[drift_25s_ease-in-out_infinite_3s]">
        <div className="relative w-24 h-10">
          <div className="absolute w-10 h-10 bg-white/70 rounded-full -top-4 left-2" />
          <div className="absolute w-12 h-8 bg-white/70 rounded-full top-0 left-4" />
          <div className="absolute w-8 h-7 bg-white/70 rounded-full top-1 left-0" />
        </div>
      </div>
      <div className="absolute top-8 left-[45%] animate-[drift_22s_ease-in-out_infinite_6s]">
        <div className="relative w-20 h-8">
          <div className="absolute w-9 h-9 bg-white/60 rounded-full -top-3 left-1" />
          <div className="absolute w-10 h-7 bg-white/60 rounded-full top-0 left-3" />
        </div>
      </div>

      {/* 远处山丘 */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%]">
        <div className="absolute bottom-0 left-0 right-0 h-full">
          <div className="absolute -bottom-4 left-0 right-0 h-32 bg-[#7bc67e] rounded-t-[100%] opacity-40" />
          <div className="absolute -bottom-6 left-[-5%] right-[-5%] h-36 bg-[#6abf6e] rounded-t-[60%_40%] opacity-30" />
        </div>

        {/* 草地 */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#4aaf4e] to-[#5cbf60]" />

        {/* 树木 */}
        <div className="absolute bottom-12 left-[12%]">
          <div className="w-3 h-12 bg-[#8B5E3C] mx-auto rounded" />
          <div className="relative -top-4">
            <div className="w-0 h-0 border-l-[22px] border-r-[22px] border-b-[40px] border-l-transparent border-r-transparent border-b-[#3a8f3e]" />
            <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-b-[32px] border-l-transparent border-r-transparent border-b-[#4aaf4e] -mt-6 ml-2" />
          </div>
        </div>
        <div className="absolute bottom-10 left-[22%]">
          <div className="w-2.5 h-10 bg-[#8B5E3C] mx-auto rounded" />
          <div className="relative -top-3">
            <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-b-[34px] border-l-transparent border-r-transparent border-b-[#3a8f3e]" />
            <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-b-[26px] border-l-transparent border-r-transparent border-b-[#4aaf4e] -mt-5 ml-1.5" />
          </div>
        </div>
        <div className="absolute bottom-14 right-[18%]">
          <div className="w-3 h-14 bg-[#8B5E3C] mx-auto rounded" />
          <div className="relative -top-5">
            <div className="w-0 h-0 border-l-[24px] border-r-[24px] border-b-[44px] border-l-transparent border-r-transparent border-b-[#3a8f3e]" />
            <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[34px] border-l-transparent border-r-transparent border-b-[#4aaf4e] -mt-7 ml-2" />
          </div>
        </div>
        <div className="absolute bottom-8 right-[35%]">
          <div className="w-2 h-8 bg-[#8B5E3C] mx-auto rounded" />
          <div className="relative -top-2">
            <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-b-[26px] border-l-transparent border-r-transparent border-b-[#3a8f3e]" />
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[18px] border-l-transparent border-r-transparent border-b-[#4aaf4e] -mt-4 ml-1" />
          </div>
        </div>

        {/* 花朵 */}
        <div className="absolute bottom-4 left-[8%] text-2xl animate-[sway_3s_ease-in-out_infinite]">🌸</div>
        <div className="absolute bottom-3 left-[18%] text-xl animate-[sway_3.5s_ease-in-out_infinite_0.5s]">🌼</div>
        <div className="absolute bottom-2 left-[30%] text-2xl animate-[sway_2.8s_ease-in-out_infinite_1s]">🌺</div>
        <div className="absolute bottom-4 right-[25%] text-xl animate-[sway_3.2s_ease-in-out_infinite_0.3s]">🌷</div>
        <div className="absolute bottom-3 right-[12%] text-2xl animate-[sway_3.7s_ease-in-out_infinite_0.8s]">🌻</div>
        <div className="absolute bottom-5 left-[42%] text-lg animate-[sway_2.5s_ease-in-out_infinite_1.5s]">🌼</div>
      </div>

      {/* 蝴蝶 */}
      <div className="absolute top-[40%] left-[20%] text-xl animate-[fly_8s_ease-in-out_infinite]">🦋</div>
      <div className="absolute top-[55%] right-[25%] text-lg animate-[fly_10s_ease-in-out_infinite_2s]">🦋</div>

      {/* 内容卡片 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
