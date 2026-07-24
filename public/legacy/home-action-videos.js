(function () {
  var manuallyPausedVideos =
    window.__AJB_MANUALLY_PAUSED_HOME_VIDEOS__ ||
    (window.__AJB_MANUALLY_PAUSED_HOME_VIDEOS__ = {});

  function esc(text) {
    var element = document.createElement("div");
    element.textContent = text == null ? "" : String(text);
    return element.innerHTML;
  }

  function productThumb(product) {
    if (product && product.image) {
      return (
        '<img src="' +
        esc(product.image) +
        '" alt="" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block">'
      );
    }
    return '<i class="fa-solid fa-box"></i>';
  }

  function productRow(product, lead) {
    return (
      '<div class="video-product-row' +
      (lead ? " video-product-row--lead" : "") +
      '">' +
      '<a class="video-product-link" href="' +
      esc(product.href || "/all-selection-page") +
      '">' +
      '<div class="video-product-thumb">' +
      productThumb(product) +
      "</div>" +
      '<div class="video-product-text">' +
      '<div class="vt">' +
      esc(product.name || "Produit") +
      "</div>" +
      '<div class="vp">' +
      esc(product.price || "") +
      "</div>" +
      "</div>" +
      "</a>" +
      (lead
        ? '<button type="button" class="video-chev-btn video-chev-close" aria-label="Retour à la vidéo"><i class="fa-solid fa-chevron-down chev"></i></button>'
        : "") +
      "</div>"
    );
  }

  function muteIcon(isMuted) {
    return isMuted
      ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="4 9 9 9 14 4 14 20 9 15 4 15 4 9"></polygon><line x1="17" y1="9" x2="22" y2="14"></line><line x1="22" y1="9" x2="17" y2="14"></line></svg>'
      : '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="4 9 9 9 14 4 14 20 9 15 4 15 4 9"></polygon><path d="M16 9a4 4 0 0 1 0 6"></path><path d="M19 7a7 7 0 0 1 0 10"></path></svg>';
  }

  function syncMuteButton(mute, video) {
    if (!mute || !video) return;
    var isMuted = Boolean(video.muted);
    mute.innerHTML = muteIcon(isMuted);
    mute.setAttribute("aria-label", isMuted ? "Activer le son" : "Couper le son");
    mute.classList.toggle("is-muted", isMuted);
    mute.classList.toggle("is-open", !isMuted);
  }

  function videoCard(item, index) {
    var products = Array.isArray(item.products) ? item.products : [];
    var lead = products[0] || null;
    var videoKey = String(item.id || index);
    var autoplayAttribute = manuallyPausedVideos[videoKey] ? "" : " autoplay";
    var metaThumb = lead ? productThumb(lead) : '<i class="fa-solid fa-play"></i>';
    var rows = products
      .map(function (product, productIndex) {
        return productRow(product, productIndex === 0);
      })
      .join("");

    return (
      '<div class="video-card" data-video-id="' +
      esc(videoKey) +
      '">' +
      '<div class="video-main">' +
      '<div class="video-thumb" style="background:#0b1020;overflow:hidden;position:relative">' +
      '<video src="' +
      esc(item.videoUrl) +
      '" muted playsinline loop' +
      autoplayAttribute +
      ' preload="auto" style="width:100%;height:100%;object-fit:cover;display:block;cursor:pointer"></video>' +
      '<button type="button" class="home-video-play" aria-label="Lire la vidéo" style="position:absolute;inset:0;border:0;background:transparent;color:#fff;font-size:46px;z-index:1"><i class="fa-solid fa-circle-play play-ic"></i></button>' +
      '<button type="button" class="mute-ic is-muted" aria-label="Activer le son" style="position:absolute;top:10px;left:10px;z-index:3">' +
      muteIcon(true) +
      "</button>" +
      "</div>" +
      '<div class="video-meta">' +
      '<div class="video-meta-thumb">' +
      metaThumb +
      "</div>" +
      '<div class="video-meta-text">' +
      '<div class="vt">' +
      esc(lead ? lead.name : "Jouets en action") +
      "</div>" +
      '<div class="vp">' +
      esc(lead ? lead.price : "") +
      "</div>" +
      "</div>" +
      (products.length
        ? '<button type="button" class="video-chev-btn video-chev-open" aria-expanded="false" aria-label="Afficher les produits de cette vidéo"><i class="fa-solid fa-chevron-down chev"></i></button>'
        : "") +
      "</div>" +
      "</div>" +
      '<div class="video-products">' +
      rows +
      "</div>" +
      "</div>"
    );
  }

  function bindCards(track) {
    var observers = [];

    track.querySelectorAll(".video-card").forEach(function (card) {
      var video = card.querySelector("video");
      var play = card.querySelector(".home-video-play");
      var mute = card.querySelector(".mute-ic");
      var open = card.querySelector(".video-chev-open");
      var close = card.querySelector(".video-chev-close");
      var videoKey = String(card.dataset.videoId || "");
      var userPaused = Boolean(manuallyPausedVideos[videoKey]);

      if (!video) return;

      video.muted = true;
      video.defaultMuted = true;
      video.loop = !userPaused;
      video.autoplay = !userPaused;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      syncMuteButton(mute, video);
      video.addEventListener("volumechange", function () {
        syncMuteButton(mute, video);
      });

      function showPlayButton() {
        if (!play) return;
        play.style.opacity = "1";
        play.style.pointerEvents = "auto";
        play.setAttribute("aria-label", "Lire la vidéo");
      }

      function hidePlayButton() {
        if (!play) return;
        play.style.opacity = "0";
        play.style.pointerEvents = "none";
      }

      function tryAutoplay() {
        if (userPaused) return;
        // Never change mute here — only mute-ic may toggle audio.
        video.loop = true;
        video.autoplay = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      function pauseByUser() {
        userPaused = true;
        manuallyPausedVideos[videoKey] = true;
        video.autoplay = false;
        video.loop = false;
        video.pause();
        showPlayButton();
      }

      function resumeByUser() {
        userPaused = false;
        delete manuallyPausedVideos[videoKey];
        video.autoplay = true;
        // Preserve current mute state; do not force muted/unmuted.
        video.loop = true;
        if (
          video.ended ||
          (Number.isFinite(video.duration) &&
            video.duration > 0 &&
            video.currentTime >= video.duration - 0.05)
        ) {
          video.currentTime = 0;
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      function onUserToggle(event) {
        // Ignore clicks that originated on the mute control.
        if (event.target && event.target.closest && event.target.closest(".mute-ic")) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (video.paused || userPaused) {
          resumeByUser();
        } else {
          pauseByUser();
        }
      }

      if (play) {
        play.addEventListener("click", onUserToggle);
      }
      video.addEventListener("click", onUserToggle);

      video.addEventListener("play", function () {
        if (!userPaused) hidePlayButton();
        syncMuteButton(mute, video);
      });
      video.addEventListener("pause", function () {
        if (userPaused) showPlayButton();
      });

      function isVisibleNow() {
        var rect = card.getBoundingClientRect();
        return (
          rect.bottom > 0 &&
          rect.top < window.innerHeight &&
          rect.right > 0 &&
          rect.left < window.innerWidth
        );
      }

      // Native autoplay starts immediately when possible. These retries cover
      // browsers that reject play() until enough media data has arrived.
      if (!userPaused) {
        requestAnimationFrame(function () {
          if (isVisibleNow()) tryAutoplay();
        });
        video.addEventListener("loadeddata", function () {
          if (isVisibleNow()) tryAutoplay();
        });
        video.addEventListener("canplay", function () {
          if (isVisibleNow()) tryAutoplay();
        });
      }

      // Visibility autoplay — ignored forever after a manual pause.
      if (typeof IntersectionObserver === "function") {
        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (userPaused) return;
              if (entry.isIntersecting && entry.intersectionRatio > 0.05) {
                tryAutoplay();
              } else if (!video.paused) {
                video.pause();
                // Not a user pause — keep ready to autoplay again when visible.
                hidePlayButton();
              }
            });
          },
          { threshold: [0, 0.05, 0.35, 0.6, 1] },
        );
        observer.observe(card);
        observers.push(observer);
      } else {
        tryAutoplay();
      }

      if (userPaused) showPlayButton();
      else hidePlayButton();

      if (mute) {
        mute.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          video.muted = !video.muted;
          syncMuteButton(mute, video);
        });
      }

      if (open) {
        open.addEventListener("click", function () {
          card.classList.add("is-expanded");
          open.setAttribute("aria-expanded", "true");
          if (window.selectVideoCard) window.selectVideoCard(card);
        });
      }
      if (close) {
        close.addEventListener("click", function () {
          card.classList.remove("is-expanded");
          if (open) open.setAttribute("aria-expanded", "false");
        });
      }
    });

    track.__ajbVideoObservers = observers;
  }

  function render(items) {
    var track = document.getElementById("videoTrack");
    if (!track) return;

    if (Array.isArray(track.__ajbVideoObservers)) {
      track.__ajbVideoObservers.forEach(function (observer) {
        try {
          observer.disconnect();
        } catch (e) {}
      });
      track.__ajbVideoObservers = [];
    }

    if (!Array.isArray(items) || !items.length) {
      track.innerHTML =
        '<p style="padding:28px 16px;color:#64748b;text-align:center;width:100%">Aucune vidéo disponible pour le moment.</p>';
      return;
    }

    track.innerHTML = items.map(videoCard).join("");
    bindCards(track);

    delete track.dataset.videoSélectionnerWired;
    if (window.ProductCarousel && typeof window.ProductCarousel.init === "function") {
      window.ProductCarousel.init();
    }
    track.dispatchEvent(new Event("scroll"));
    document.dispatchEvent(
      new CustomEvent("ajb:home-videos-loaded", { detail: { videos: items } }),
    );
  }

  var track = document.getElementById("videoTrack");
  if (track) track.innerHTML = "";

  if (window.__AJB_TOYS_ACTION_PROMISE__) {
    window.__AJB_TOYS_ACTION_PROMISE__.then(render).catch(function (error) {
      console.warn("Homepage action videos load failed", error);
      render([]);
    });
  } else {
    render([]);
  }
})();
