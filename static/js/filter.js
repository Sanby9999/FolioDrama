(function () {
  var search = document.getElementById("search");
  var onlyRecommended = document.getElementById("onlyRecommended");
  var chips = document.querySelectorAll(".chip");
  var cards = document.querySelectorAll(".card");
  var emptyState = document.getElementById("emptyState");
  var activeGenre = "all";

  function applyFilters() {
    var q = search.value.trim().toLowerCase();
    var recOnly = onlyRecommended.checked;
    var visibleCount = 0;

    cards.forEach(function (card) {
      var genres = (card.dataset.genre || "")
        .split(",")
        .map(function (g) { return g.trim(); });
      var matchesGenre = activeGenre === "all" || genres.indexOf(activeGenre) !== -1;
      var matchesSearch = !q || (card.dataset.search || "").indexOf(q) !== -1;
      var matchesRec = !recOnly || card.dataset.recommended === "true";
      var show = matchesGenre && matchesSearch && matchesRec;
      card.style.display = show ? "" : "none";
      if (show) visibleCount++;
    });

    if (emptyState) emptyState.style.display = visibleCount === 0 ? "" : "none";
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      activeGenre = chip.dataset.genre;
      applyFilters();
    });
  });

  search.addEventListener("input", applyFilters);
  onlyRecommended.addEventListener("change", applyFilters);

  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    var toggleBackToTop = function () {
      backToTop.classList.toggle("is-visible", window.scrollY > 600);
    };
    window.addEventListener("scroll", toggleBackToTop, { passive: true });
    toggleBackToTop();
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function parseStartSeconds(raw) {
    if (!raw) return 0;
    if (/^\d+$/.test(raw)) return parseInt(raw, 10);
    var match = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
    if (!match) return 0;
    var h = parseInt(match[1] || 0, 10);
    var m = parseInt(match[2] || 0, 10);
    var s = parseInt(match[3] || 0, 10);
    return h * 3600 + m * 60 + s;
  }

  document.querySelectorAll(".ost-play").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var wrapper = btn.closest(".ost-player");
      var videoId = wrapper.dataset.videoId;
      var startSeconds = parseStartSeconds(wrapper.dataset.start);
      var src = "https://www.youtube-nocookie.com/embed/" + videoId + "?autoplay=1";
      if (startSeconds > 0) src += "&start=" + startSeconds;
      var iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.title = "OST 播放器";
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      iframe.setAttribute("allowfullscreen", "");
      iframe.loading = "lazy";
      wrapper.innerHTML = "";
      wrapper.appendChild(iframe);
    });
  });
})();
