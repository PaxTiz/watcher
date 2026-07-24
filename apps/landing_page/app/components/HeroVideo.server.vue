<template>
  <div
    style="
      position: relative;
      width: 100%;
      max-width: 1160px;
      margin-inline: auto;
      height: 70vh;
      min-height: 420px;
      border-radius: 24px;
      overflow: hidden;
      background: rgb(15, 23, 42);
    "
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
        style="
          width: 84px;
          height: 84px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.12);
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        "
      >
        <div
          style="
            width: 0px;
            height: 0px;
            border-top: 13px solid transparent;
            border-bottom: 13px solid transparent;
            border-left: 20px solid rgb(255, 255, 255);
            margin-left: 4px;
          "
        ></div>
      </button>
    </div>
  </div>
</template>
