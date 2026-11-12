/* Research slideshow
   - Image slides change every few seconds.
   - Video slides play all their videos from the start and move on
     once every video has finished.
   - Loops continuously, pauses on hover, and respects reduced-motion settings. */
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
    var hovering = false;
    var pendingAdvance = false;
    var interval = parseInt(show.getAttribute("data-interval"), 10) || 5000;

    show.querySelectorAll("video").forEach(function (v) {
      v.muted = true;
      if (reduceMotion) v.setAttribute("controls", "");
    });

    function videosOf(slide) {
      return slide.querySelectorAll("video");
    }

    function clearTimer() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    function stopVideos(slide) {
      videosOf(slide).forEach(function (v) {
        v.onended = null;
        v.pause();
      });
    }

    function go(n) {
      stopVideos(slides[current]);
      slides[current].classList.remove("is-active");
      slides[current].setAttribute("aria-hidden", "true");
      if (dots[current]) dots[current].classList.remove("is-active");

      current = (n + slides.length) % slides.length;

      slides[current].classList.add("is-active");
      slides[current].setAttribute("aria-hidden", "false");
      if (dots[current]) dots[current].classList.add("is-active");
      pendingAdvance = false;
    }

    function next() {
      go(current + 1);
      schedule();
    }

    function finishedVideos() {
      if (hovering) {
        pendingAdvance = true;
      } else {
        next();
      }
    }

    function schedule() {
      clearTimer();
      var vids = videosOf(slides[current]);

      if (vids.length) {
        if (reduceMotion) return;
        var remaining = vids.length;
        vids.forEach(function (v) {
          v.onended = function () {
            remaining -= 1;
            if (remaining <= 0) finishedVideos();
          };
          try { v.currentTime = 0; } catch (e) {}
          var p = v.play();
          if (p && p.catch) {
            p.catch(function () {
              /* Autoplay blocked: show the slide for a while, then move on */
              clearTimer();
              timer = setTimeout(next, interval * 2);
            });
          }
        });
        /* Safety net in case a video never reports that it finished */
        timer = setTimeout(next, 120000);
        return;
      }

      if (reduceMotion || hovering) return;
      timer = setTimeout(next, interval);
    }

    function isVideoSlide() {
      return videosOf(slides[current]).length > 0;
    }

    var prev = show.querySelector(".slideshow-prev");
    var nextBtn = show.querySelector(".slideshow-next");
    if (prev) prev.addEventListener("click", function () { go(current - 1); schedule(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { next(); });

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { go(i); schedule(); });
    });

    function pause() {
      hovering = true;
      if (!isVideoSlide()) clearTimer();
    }

    function resume() {
      hovering = false;
      if (pendingAdvance) {
        next();
      } else if (!isVideoSlide()) {
        schedule();
      }
    }

    show.addEventListener("mouseenter", pause);
    show.addEventListener("mouseleave", resume);
    show.addEventListener("focusin", pause);
    show.addEventListener("focusout", resume);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        clearTimer();
        stopVideos(slides[current]);
      } else {
        schedule();
      }
    });

    schedule();
  });
})();
