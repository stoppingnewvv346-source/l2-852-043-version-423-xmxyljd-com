(function () {
    function setupVideoPlayer(videoId, coverId, buttonId, streamUrl) {
        const video = document.getElementById(videoId);
        const cover = document.getElementById(coverId);
        const button = document.getElementById(buttonId);

        if (!video || !streamUrl) {
            return;
        }

        let attached = false;
        let hls = null;

        function attachStream() {
            if (attached) {
                return Promise.resolve();
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                attached = true;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                attached = true;
                return Promise.resolve();
            }

            video.src = streamUrl;
            attached = true;
            return Promise.resolve();
        }

        function hideCover() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        }

        function startPlayback(event) {
            if (event) {
                event.preventDefault();
            }
            hideCover();
            attachStream().then(function () {
                return video.play();
            }).catch(function () {
                if (cover) {
                    cover.classList.remove("is-hidden");
                }
            });
        }

        if (cover) {
            cover.addEventListener("click", startPlayback);
        }

        if (button) {
            button.addEventListener("click", startPlayback);
        }

        video.addEventListener("play", hideCover);
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.setupVideoPlayer = setupVideoPlayer;
})();
