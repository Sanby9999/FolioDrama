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
})();
