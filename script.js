/* ============================================================
   自己紹介サイト・テンプレート（v4）
   素のJavaScriptのみ（ライブラリ不要）
   - スクロール出現（fade + blur解除、見出しはCSS側でマスクリビール）
   - ヒーローのロードシーケンス／グループ要素のスタガー出現
   - モバイルメニュー
   - お問い合わせ：mailto 起動
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* ---------- 1. スクロールで出現 ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- 1b. ヒーローのロードシーケンス（kicker→行→リード→ボタン） ---------- */
  var heroEl = document.querySelector(".hero");
  if (heroEl) {
    if (prefersReduced) {
      heroEl.classList.add("is-loaded");
    } else {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          heroEl.classList.add("is-loaded");
        });
      });
    }
  }

  /* ---------- 1c. グループ要素のスタガー出現（考え方・好きなもの・スキル） ---------- */
  function setupStaggerGroup(containerSelector, childSelector, stepMs) {
    document.querySelectorAll(containerSelector).forEach(function (container) {
      var children = container.querySelectorAll(childSelector);
      children.forEach(function (child, i) {
        child.style.setProperty("--d", i * stepMs + "ms");
      });

      if (prefersReduced || !("IntersectionObserver" in window)) {
        container.classList.add("is-visible");
        return;
      }

      var obs = new IntersectionObserver(
        function (entries, o) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              o.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      obs.observe(container);
    });
  }

  setupStaggerGroup(".about-cards", ".about-card", 70);
  setupStaggerGroup(".beliefs-list", ".belief", 90);
  setupStaggerGroup(".likes-list", ".likes-item", 70);

  /* ---------- 1d. スクロールプログレスバー ---------- */
  var progressBar = document.getElementById("scrollProgress");
  if (progressBar) {
    var updateProgress = function () {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - doc.clientHeight;
      var ratio = scrollable > 0 ? doc.scrollTop / scrollable : 0;
      progressBar.style.transform = "scaleX(" + ratio + ")";
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  /* ---------- 1e. 背景テキストは帯が画面上端を通過したら固定表示 ---------- */
  var bgText = document.getElementById("bgText");
  var marquee = document.querySelector(".marquee");
  if (bgText && marquee) {
    var bgTicking = false;
    var updateBgText = function () {
      var bottom = marquee.getBoundingClientRect().bottom;
      bgText.classList.toggle("is-shown", bottom <= 0);
      bgTicking = false;
    };
    window.addEventListener("scroll", function () {
      if (!bgTicking) {
        bgTicking = true;
        requestAnimationFrame(updateBgText);
      }
    }, { passive: true });
    window.addEventListener("resize", updateBgText);
    updateBgText();
  }

  /* ---------- 2. モバイルメニュー ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 3. リッチアニメーション群（A:パララックス / B:マグネティック / C:チルト / D:マーキー連動） ---------- */
  var canHover = window.matchMedia ? window.matchMedia("(hover: hover)").matches : true;

  if (!prefersReduced) {
    /* --- A: スクロールパララックス（巨大背景番号） --- */
    var parallaxEls = document.querySelectorAll(".section-num");
    var scrollTicking = false;

    function applyParallax() {
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var offset = (center - vh / 2) / vh;
        el.style.transform = "translateY(" + (offset * 42).toFixed(1) + "px)";
      });
      scrollTicking = false;
    }

    window.addEventListener("scroll", function () {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(applyParallax);
      }
    }, { passive: true });
    window.addEventListener("resize", applyParallax);
    applyParallax();

    /* --- B: マグネティック要素（CTAボタン・回転バッジ） --- */
    function magnetize(el, strength) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var mx = (e.clientX - (r.left + r.width / 2)) * strength;
        var my = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.transform = "translate(" + mx.toFixed(1) + "px," + my.toFixed(1) + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    }
    if (canHover) {
      document.querySelectorAll(".hero-actions .btn").forEach(function (b) { magnetize(b, 0.3); });
      var badge = document.querySelector(".spin-badge");
      if (badge) magnetize(badge, 0.28);
    }

    /* --- C: プロフィール写真の3Dチルト --- */
    var photo = document.querySelector(".about-photo");
    if (photo && canHover) {
      photo.addEventListener("mousemove", function (e) {
        var r = photo.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        photo.style.transform =
          "perspective(900px) rotateY(" + (px * 8).toFixed(2) + "deg) rotateX(" + (-py * 8).toFixed(2) + "deg)";
      });
      photo.addEventListener("mouseleave", function () {
        photo.style.transform = "";
      });
    }
  }

  /* ---------- 4. 現在地に応じてナビをハイライト ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var navAnchors = document.querySelectorAll(".nav-links a[href^='#']");
  if (sections.length && navAnchors.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navAnchors.forEach(function (a) {
              a.classList.toggle("active", a.getAttribute("href") === "#" + id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }
})();
