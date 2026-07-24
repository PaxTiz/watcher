<template>
  <div
    class="relative mx-auto h-[45vh] min-h-[240px] w-full max-w-[1160px] overflow-hidden rounded-2xl sm:h-[55vh] sm:min-h-[320px] md:h-[70vh] md:min-h-[420px]"
    style="background: rgb(15, 23, 42)"
  >
    <div
      style="
        position: absolute;
        inset: 0px;
        background: repeating-linear-gradient(
          135deg,
          rgb(30, 41, 59) 0px,
          rgb(30, 41, 59) 16px,
          rgb(15, 23, 42) 16px,
          rgb(15, 23, 42) 32px
        );
      "
    ></div>
    <div style="position: absolute; inset: 0px; background: rgba(15, 23, 42, 0.25)"></div>
    <div
      style="
        position: absolute;
        inset: 0px;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <button
        class="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-white/40 bg-white/12 backdrop-blur-sm sm:h-[68px] sm:w-[68px] md:h-[84px] md:w-[84px]"
      >
        <div
          class="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-white sm:border-y-[11px] sm:border-l-[18px] md:border-y-[13px] md:border-l-[20px]"
        ></div>
      </button>
    </div>
  </div>
</template>
