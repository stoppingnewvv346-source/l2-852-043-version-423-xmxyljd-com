(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobile = document.querySelector('[data-mobile-nav]');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-movie-search]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var activeFilter = 'all';

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function cardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' ').toLowerCase();
  }

  function filterCards() {
    if (!cards.length) return;
    var query = normalize(searchInputs.map(function (input) { return input.value; }).find(Boolean) || '');
    cards.forEach(function (card) {
      var hitText = !query || cardText(card).indexOf(query) !== -1;
      var hitFilter = activeFilter === 'all' || normalize(card.getAttribute('data-type')) === activeFilter || normalize(card.getAttribute('data-region')) === activeFilter;
      card.style.display = hitText && hitFilter ? '' : 'none';
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', filterCards);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && !input.value) {
      input.value = q;
    }
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = normalize(button.getAttribute('data-filter-value'));
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      filterCards();
    });
  });

  filterCards();

  var topButton = document.querySelector('[data-back-top]');
  if (topButton) {
    window.addEventListener('scroll', function () {
      topButton.classList.toggle('show', window.scrollY > 520);
    });
    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
