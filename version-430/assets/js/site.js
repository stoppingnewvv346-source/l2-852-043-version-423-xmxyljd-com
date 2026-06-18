(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    var input = document.querySelector("[data-filter-input]");
    var yearSelect = document.querySelector("[data-filter-select='year']");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list] .movie-card"));

    function applyFilter() {
      var keyword = normalize(input ? input.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || normalize(card.getAttribute("data-year")) === year;
        card.classList.toggle("is-hidden", !(matchedKeyword && matchedYear));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }
  });
})();
