(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      const next = Number(dot.getAttribute("data-slide") || "0");
      showSlide(next);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  const searchInput = document.getElementById("site-search");
  const chips = Array.from(document.querySelectorAll(".filter-chip"));
  const searchableItems = Array.from(document.querySelectorAll(".movie-card"));
  let activeFilter = "all";

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function itemText(item) {
    return normalize([
      item.getAttribute("data-title"),
      item.getAttribute("data-region"),
      item.getAttribute("data-type"),
      item.getAttribute("data-genre"),
      item.textContent
    ].join(" "));
  }

  function applyFilter() {
    const query = normalize(searchInput ? searchInput.value : "");
    searchableItems.forEach(function (item) {
      const haystack = itemText(item);
      const byQuery = !query || haystack.indexOf(query) !== -1;
      const byChip = activeFilter === "all" || haystack.indexOf(normalize(activeFilter)) !== -1;
      item.classList.toggle("is-hidden", !(byQuery && byChip));
    });
  }

  if (searchInput && searchableItems.length) {
    searchInput.addEventListener("input", applyFilter);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (item) {
        item.classList.remove("active");
      });
      chip.classList.add("active");
      activeFilter = chip.getAttribute("data-filter") || "all";
      applyFilter();
    });
  });
}());
