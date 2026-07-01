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
  setupStaggerGroup(".works-list", ".work-item", 80);

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

  /* ---------- 3b. 考え方セクションの星空＋流れ星 ---------- */
  var starsBox = document.getElementById("beliefsStars");
  if (starsBox && !prefersReduced) {
    var SIZES = ["star-sm", "star-sm", "star-sm", "star-md", "star-md", "star-lg"];
    var STAR_COUNT = 90;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < STAR_COUNT; i++) {
      var s = document.createElement("span");
      s.className = "star " + SIZES[Math.floor(Math.random() * SIZES.length)];
      s.style.left = (Math.random() * 100).toFixed(2) + "%";
      s.style.top = (Math.random() * 100).toFixed(2) + "%";
      s.style.setProperty("--dur", (2.5 + Math.random() * 4).toFixed(2) + "s");
      s.style.setProperty("--delay", (Math.random() * 5).toFixed(2) + "s");
      s.style.setProperty("--min", (0.05 + Math.random() * 0.2).toFixed(2));
      s.style.setProperty("--max", (0.6 + Math.random() * 0.4).toFixed(2));
      frag.appendChild(s);
    }
    starsBox.appendChild(frag);

    /* 流れ星：数十秒に1本、ランダム位置から */
    var shootBox = document.getElementById("beliefsShooting");
    if (shootBox) {
      var spawnShootingStar = function () {
        var star = document.createElement("span");
        star.className = "shooting-star";
        star.style.left = (Math.random() * 60).toFixed(1) + "%";
        star.style.top = (Math.random() * 35).toFixed(1) + "%";
        shootBox.appendChild(star);
        setTimeout(function () { star.remove(); }, 1300);
      };
      var scheduleShoot = function () {
        var wait = 9000 + Math.random() * 16000;
        setTimeout(function () {
          spawnShootingStar();
          scheduleShoot();
        }, wait);
      };
      scheduleShoot();
    }
  }

  /* ---------- 3c. 各「考え方」カード内の星（文字に重ならない外周のみ） ---------- */
  var beliefCards = document.querySelectorAll(".belief-stars");
  if (beliefCards.length && !prefersReduced) {
    var CARD_SIZES = ["star-sm", "star-sm", "star-sm", "star-md", "star-md", "star-lg"];
    beliefCards.forEach(function (box) {
      var cf = document.createDocumentFragment();
      var placed = 0;
      var attempts = 0;
      while (placed < 26 && attempts < 400) {
        attempts++;
        var x = Math.random() * 100;
        var y = Math.random() * 100;
        // 中央の文字エリア（横8〜92%・縦14〜86%）は避ける
        var inText = x > 8 && x < 92 && y > 14 && y < 86;
        if (inText) continue;
        var st = document.createElement("span");
        st.className = "star " + CARD_SIZES[Math.floor(Math.random() * CARD_SIZES.length)];
        st.style.left = x.toFixed(2) + "%";
        st.style.top = y.toFixed(2) + "%";
        st.style.setProperty("--dur", (2.5 + Math.random() * 4).toFixed(2) + "s");
        st.style.setProperty("--delay", (Math.random() * 5).toFixed(2) + "s");
        st.style.setProperty("--min", (0.05 + Math.random() * 0.2).toFixed(2));
        st.style.setProperty("--max", (0.6 + Math.random() * 0.4).toFixed(2));
        cf.appendChild(st);
        placed++;
      }
      box.appendChild(cf);
    });
  }

  /* ---------- 3d. 「Top ↑」でページ最上部へなめらかにスクロール ---------- */
  var toTopLink = document.querySelector(".to-top");
  if (toTopLink) {
    toTopLink.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: prefersReduced ? "auto" : "smooth"
      });
    });
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

  /* ---------- 5. 制作物の「意図・工夫・制作時間」モーダル ---------- */
  var activeModal = null;
  var lastOpener = null;

  function openModal(modal, opener) {
    if (!modal) return;
    lastOpener = opener || null;
    modal.hidden = false;
    // hidden解除直後にトランジションを効かせる
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { modal.classList.add("is-open"); });
    });
    document.body.style.overflow = "hidden";
    activeModal = modal;
    var dialog = modal.querySelector(".work-modal-dialog");
    if (dialog) dialog.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    var onEnd = function () {
      modal.hidden = true;
      modal.removeEventListener("transitionend", onEnd);
    };
    if (prefersReduced) {
      modal.hidden = true;
    } else {
      modal.addEventListener("transitionend", onEnd);
    }
    if (activeModal === modal) activeModal = null;
    if (lastOpener) { lastOpener.focus(); lastOpener = null; }
  }

  document.querySelectorAll("[data-modal-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal(document.getElementById(btn.getAttribute("data-modal-open")), btn);
    });
  });

  document.querySelectorAll(".work-modal").forEach(function (modal) {
    modal.querySelectorAll("[data-modal-close]").forEach(function (el) {
      el.addEventListener("click", function () { closeModal(modal); });
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && activeModal) closeModal(activeModal);
  });
})();
