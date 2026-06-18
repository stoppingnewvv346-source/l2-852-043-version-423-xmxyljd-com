(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  ready(function () {
    var input = document.getElementById("site-search-input");
    var region = document.getElementById("site-search-region");
    var type = document.getElementById("site-search-type");
    var results = document.getElementById("site-search-results");
    var movies = window.SITE_MOVIES || [];

    if (!input || !results) {
      return;
    }

    input.value = getQuery("q");

    function render() {
      var keyword = normalize(input.value);
      var regionValue = normalize(region ? region.value : "");
      var typeValue = normalize(type ? type.value : "");
      var filtered = movies.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" "));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedRegion = !regionValue || normalize(movie.region) === regionValue;
        var matchedType = !typeValue || normalize(movie.type) === typeValue;
        return matchedKeyword && matchedRegion && matchedType;
      }).slice(0, keyword ? 240 : 72);

      results.innerHTML = filtered.map(function (movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
          "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"poster-shade\"></span></a>" +
          "<div class=\"card-body\"><div class=\"meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
          "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
          "<p>" + escapeHtml(movie.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
      }).join("");
    }

    input.addEventListener("input", render);
    if (region) {
      region.addEventListener("change", render);
    }
    if (type) {
      type.addEventListener("change", render);
    }
    render();
  });
})();
