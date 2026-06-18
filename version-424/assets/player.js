import { H as Hls } from "./video-vendor.js";

const playerInstances = new WeakMap();

function canPlayNativeHls(video) {
  return video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
}

function attachSource(video) {
  const source = video.dataset.src;

  if (!source) {
    return null;
  }

  if (playerInstances.has(video)) {
    return playerInstances.get(video);
  }

  let instance = null;

  if (canPlayNativeHls(video)) {
    video.src = source;
    instance = { type: "native" };
  } else if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, function (_event, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
      }
    });

    instance = { type: "hls", hls: hls };
  } else {
    video.src = source;
    instance = { type: "fallback" };
  }

  playerInstances.set(video, instance);
  return instance;
}

function setupPlayer(shell) {
  const video = shell.querySelector(".js-video-player");
  const overlay = shell.querySelector(".js-play-video");

  if (!video) {
    return;
  }

  function start() {
    attachSource(video);

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        video.controls = true;
      });
    }

    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove("is-hidden");
    }
  });
}

document.querySelectorAll("[data-player]").forEach(setupPlayer);
