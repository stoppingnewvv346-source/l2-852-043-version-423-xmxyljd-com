(function () {
  var input = document.querySelector('[data-search-page-input]');
  var status = document.querySelector('[data-search-status]');
  var results = document.querySelector('[data-search-results]');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  if (!input || !status || !results) {
    return;
  }

  input.value = query;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-overlay">立即观看</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '    <div class="movie-meta">' + escapeHtml(movie.year + ' / ' + movie.region + ' / ' + movie.type + ' / ' + movie.genre) + '</div>',
      '    <p>' + escapeHtml(movie.summary) + '</p>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function search(value) {
    var normalized = value.trim().toLowerCase();

    if (!normalized) {
      status.textContent = '输入关键词即可查找影片。';
      results.innerHTML = '';
      return;
    }

    var matches = (window.searchMovies || []).filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.tags,
        movie.summary
      ].join(' ').toLowerCase();
      return haystack.indexOf(normalized) !== -1;
    }).slice(0, 120);

    status.textContent = matches.length ? '搜索结果' : '未找到匹配影片';
    results.innerHTML = matches.map(renderCard).join('');
  }

  input.addEventListener('input', function () {
    search(input.value);
  });

  search(query);
})();
