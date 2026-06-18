(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    document.querySelectorAll('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.play-button');
      var sourceNode = video ? video.querySelector('source') : null;
      var stream = sourceNode ? sourceNode.getAttribute('src') : '';
      var prepared = false;

      function attach() {
        if (!video || prepared || !stream) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }

        prepared = true;
      }

      function play() {
        attach();
        shell.classList.add('is-playing');
        if (video) {
          var request = video.play();
          if (request && typeof request.catch === 'function') {
            request.catch(function () {});
          }
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        video.addEventListener('click', function () {
          if (!prepared) {
            play();
          }
        });
      }
    });
  });
})();
