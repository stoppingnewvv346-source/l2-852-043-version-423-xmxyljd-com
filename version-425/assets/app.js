document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroCarousel();
    initFilters();
    initPlayer();
});

function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-menu-panel]');

    if (!button || !panel) {
        return;
    }

    button.addEventListener('click', function () {
        panel.classList.toggle('is-open');
    });
}

function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
        return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
            showSlide(nextIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(index + 1);
        }, 5600);
    }
}

function initFilters() {
    var input = document.querySelector('[data-search-input]');
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    var grid = document.querySelector('[data-filter-grid]');
    var count = document.querySelector('[data-result-count]');

    if (!grid) {
        return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
        var query = normalize(input ? input.value : '');
        var activeFilters = {};

        selects.forEach(function (select) {
            var key = select.getAttribute('data-filter-select');
            var value = normalize(select.value);
            if (key && value) {
                activeFilters[key] = value;
            }
        });

        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-category'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' '));

            var matchesQuery = !query || haystack.indexOf(query) !== -1;
            var matchesFilters = Object.keys(activeFilters).every(function (key) {
                return normalize(card.getAttribute('data-' + key)).indexOf(activeFilters[key]) !== -1;
            });

            var shouldShow = matchesQuery && matchesFilters;
            card.classList.toggle('is-hidden', !shouldShow);
            if (shouldShow) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
        }
    }

    if (input) {
        input.addEventListener('input', applyFilter);
    }

    selects.forEach(function (select) {
        select.addEventListener('change', applyFilter);
    });

    applyFilter();
}

function initPlayer() {
    var video = document.getElementById('movie-player');
    var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-player-trigger]'));

    if (!video || triggers.length === 0) {
        return;
    }

    var source = video.getAttribute('data-src');
    var hlsInstance = null;
    var initialized = false;

    function hideOverlay() {
        var overlay = document.querySelector('.player-overlay');
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    function playVideo() {
        if (!source) {
            return;
        }

        hideOverlay();

        if (!initialized) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            initialized = true;
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                video.controls = true;
            });
        }
    }

    triggers.forEach(function (trigger) {
        trigger.addEventListener('click', playVideo);
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
