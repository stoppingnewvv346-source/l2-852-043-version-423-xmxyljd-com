(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        start();
    }

    function textOf(card) {
        return [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-text') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-category') || ''
        ].join(' ').toLowerCase();
    }

    function initFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
        roots.forEach(function (root) {
            var input = root.querySelector('[data-filter-input]');
            var typeButtons = Array.prototype.slice.call(root.querySelectorAll('[data-type-filter]'));
            var categoryButtons = Array.prototype.slice.call(root.querySelectorAll('[data-category-filter]'));
            var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
            var empty = root.querySelector('[data-empty-state]');
            var selectedType = '';
            var selectedCategory = '';

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var matchKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
                    var matchType = !selectedType || (card.getAttribute('data-type') || '').indexOf(selectedType) !== -1;
                    var matchCategory = !selectedCategory || card.getAttribute('data-category') === selectedCategory;
                    var show = matchKeyword && matchType && matchCategory;
                    card.style.display = show ? '' : 'none';
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-active', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }

            typeButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    selectedType = button.getAttribute('data-type-filter') || '';
                    typeButtons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    apply();
                });
            });

            categoryButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    selectedCategory = button.getAttribute('data-category-filter') || '';
                    categoryButtons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    apply();
                });
            });

            if (root.hasAttribute('data-query-root') && input) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get('q');
                if (q) {
                    input.value = q;
                }
            }

            apply();
        });
    }

    window.setupPlayer = function (src, videoId) {
        var video = document.getElementById(videoId);
        if (!video || !src) {
            return;
        }
        var frame = video.closest('.player-frame') || document;
        var button = frame.querySelector('[data-player-button]');
        var started = false;
        var hlsInstance = null;

        function attach() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function play() {
            attach();
            if (button) {
                button.classList.add('is-hidden');
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (!started) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
