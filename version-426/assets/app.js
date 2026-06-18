(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');

    if (menuButton && nav) {
      menuButton.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
    }

    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var previous = hero.querySelector('[data-prev]');
      var next = hero.querySelector('[data-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (previous) {
        previous.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-go')) || 0);
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = panel.querySelector('.filter-input');
      var selects = Array.prototype.slice.call(panel.querySelectorAll('.filter-select'));
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.filter-card'));

      function matches(card) {
        var text = (card.getAttribute('data-title') || '').toLowerCase();
        var query = input ? input.value.trim().toLowerCase() : '';

        if (query && text.indexOf(query) === -1) {
          return false;
        }

        return selects.every(function (select) {
          var value = select.value;
          var key = select.getAttribute('data-filter');

          if (!value || !key) {
            return true;
          }

          return (card.getAttribute('data-' + key) || '').indexOf(value) !== -1;
        });
      }

      function apply() {
        cards.forEach(function (card) {
          card.classList.toggle('is-hidden', !matches(card));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
    });
  });
})();
