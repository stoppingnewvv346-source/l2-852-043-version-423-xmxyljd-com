(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".player-wrap")).forEach(function (wrap) {
      var video = wrap.querySelector("video");
      var button = wrap.querySelector("[data-play-button]");
      var url = wrap.getAttribute("data-video");
      var loaded = false;
      var hls = null;

      function playVideo() {
        if (!video || !url) {
          return;
        }
        if (button) {
          button.classList.add("is-hidden");
        }
        if (!loaded) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            loaded = true;
            video.play().catch(function () {});
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
            loaded = true;
          } else {
            video.src = url;
            loaded = true;
            video.play().catch(function () {});
          }
        } else {
          video.play().catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!loaded) {
            playVideo();
          }
        });
      }
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  });
})();
