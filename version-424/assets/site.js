(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalise(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(index + 1);
      }, 5500);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        var input = form.querySelector("input[name='q']");
        var target = form.getAttribute("data-search-target") || form.getAttribute("action") || "search.html";
        var query = input ? input.value.trim() : "";
        var glue = target.indexOf("?") === -1 ? "?" : "&";

        window.location.href = target + glue + "q=" + encodeURIComponent(query);
      });
    });
  }

  function setupStaticFilters() {
    var panels = document.querySelectorAll("[data-filter-panel]");

    panels.forEach(function (panel) {
      var section = panel.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".searchable-card"));
      var count = section.querySelector("[data-filter-count]");
      var input = panel.querySelector("[data-filter-input]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var region = panel.querySelector("[data-filter-region]");

      function apply() {
        var query = normalise(input && input.value);
        var typeValue = normalise(type && type.value);
        var yearValue = normalise(year && year.value);
        var regionValue = normalise(region && region.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalise([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.textContent
          ].join(" "));
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesType = !typeValue || normalise(card.getAttribute("data-type")).indexOf(typeValue) !== -1;
          var matchesYear = !yearValue || normalise(card.getAttribute("data-year")) === yearValue;
          var matchesRegion = !regionValue || normalise(card.getAttribute("data-region")) === regionValue;
          var show = matchesQuery && matchesType && matchesYear && matchesRegion;

          card.classList.toggle("is-hidden-by-filter", !show);

          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = "共 " + visible + " 部影片";
        }
      }

      [input, type, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "  <a class=\"movie-poster\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">",
      "    <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" />",
      "    <span class=\"score-badge\">" + escapeHtml(movie.score) + "</span>",
      "    <span class=\"play-mark\" aria-hidden=\"true\">▶</span>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <a class=\"movie-title\" href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a>",
      "    <p class=\"movie-line\">" + escapeHtml(movie.oneLine || "") + "</p>",
      "    <div class=\"movie-meta\">",
      "      <span>" + escapeHtml(movie.type) + "</span>",
      "      <span>" + escapeHtml(movie.year) + "</span>",
      "      <span>" + escapeHtml(movie.region) + "</span>",
      "    </div>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");

    if (!page || !window.MOVIES) {
      return;
    }

    var input = page.querySelector("[data-search-input]");
    var type = page.querySelector("[data-search-type]");
    var year = page.querySelector("[data-search-year]");
    var region = page.querySelector("[data-search-region]");
    var results = page.querySelector("[data-search-results]");
    var count = page.querySelector("[data-search-count]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input) {
      input.value = initialQuery;
    }

    function apply() {
      var query = normalise(input && input.value);
      var typeValue = normalise(type && type.value);
      var yearValue = normalise(year && year.value);
      var regionValue = normalise(region && region.value);

      var filtered = window.MOVIES.filter(function (movie) {
        var haystack = normalise([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.oneLine,
          (movie.tags || []).join(" ")
        ].join(" "));

        return (!query || haystack.indexOf(query) !== -1)
          && (!typeValue || normalise(movie.type) === typeValue)
          && (!yearValue || normalise(movie.year) === yearValue)
          && (!regionValue || normalise(movie.region) === regionValue);
      });

      var limited = filtered.slice(0, 120);

      if (results) {
        results.innerHTML = limited.map(movieCard).join("\n");
      }

      if (count) {
        count.textContent = "找到 " + filtered.length + " 部影片" + (filtered.length > limited.length ? "，当前显示前 " + limited.length + " 部" : "");
      }
    }

    [input, type, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function setupDetailScroll() {
    var button = document.querySelector("[data-scroll-player]");
    var player = document.querySelector("[data-player]");

    if (!button || !player) {
      return;
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      player.scrollIntoView({ behavior: "smooth", block: "center" });
      var playButton = player.querySelector(".js-play-video");

      if (playButton) {
        window.setTimeout(function () {
          playButton.click();
        }, 350);
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupSearchForms();
    setupStaticFilters();
    setupSearchPage();
    setupDetailScroll();
  });
})();
