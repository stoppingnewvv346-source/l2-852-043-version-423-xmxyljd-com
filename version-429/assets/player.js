(function () {
  var video = document.querySelector('[data-player]');
  var button = document.querySelector('[data-start-play]');
  if (!video) return;

  var source = video.getAttribute('data-play-url');
  var ready = false;

  function attachSource() {
    if (ready || !source) return;
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function startVideo() {
    attachSource();
    if (button) {
      button.hidden = true;
    }
    var playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', startVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startVideo();
    }
  });

  video.addEventListener('play', function () {
    if (button) {
      button.hidden = true;
    }
  });
})();
