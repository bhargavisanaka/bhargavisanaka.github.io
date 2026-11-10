/* Research image slideshow
   Cross-fades between images, loops continuously, pauses on hover,
   and stops automatic movement for visitors who prefer reduced motion. */
(function () {
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".slideshow").forEach(function (show) {
    if (show.getAttribute("data-ready") === "1") return;
    show.setAttribute("data-ready", "1");

    var slides = show.querySelectorAll(".slide");
    var dots = show.querySelectorAll(".slideshow-dot");
    if (slides.length < 2) return;

    var current = 0;
    var timer = null;
    var interval = parseInt(show.getAttribute("data-interval"), 10) || 5000;

    function go(n) {
      slides[current].classList.remove("is-active");
      slides[current].setAttribute("aria-hidden", "true");
      if (dots[current]) dots[current].classList.remove("is-active");

      current = (n + slides.length) % slides.length;

      slides[current].classList.add("is-active");
      slides[current].setAttribute("aria-hidden", "false");
      if (dots[current]) dots[current].classList.add("is-active");
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      if (reduceMotion) return;
      stop();
      timer = setInterval(function () { go(current + 1); }, interval);
    }

    var prev = show.querySelector(".slideshow-prev");
    var next = show.querySelector(".slideshow-next");
    if (prev) prev.addEventListener("click", function () { go(current - 1); start(); });
    if (next) next.addEventListener("click", function () { go(current + 1); start(); });

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { go(i); start(); });
    });

    show.addEventListener("mouseenter", stop);
    show.addEventListener("mouseleave", start);
    show.addEventListener("focusin", stop);
    show.addEventListener("focusout", start);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { stop(); } else { start(); }
    });

    start();
  });
})();
