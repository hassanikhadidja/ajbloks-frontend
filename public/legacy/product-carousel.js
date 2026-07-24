(function () {
  function isLaptopContent() {
    if (window.isLaptopContentWidth) return window.isLaptopContentWidth();
    var w = window.innerWidth;
    return (w >= 800 && w <= 1200) || w >= 1400;
  }

  var CAROUSELS = [
    { trackId: 'productTrack', prevId: 'productCarouselPrev', nextId: 'productCarouselNext', cardW: 310, gap: 14, visible: 4 },
    { trackId: 'bookTrack', prevId: 'bookCarouselPrev', nextId: 'bookCarouselNext', cardW: 310, gap: 14, visible: 4 },
    { trackId: 'relatedTrack', prevId: 'relatedCarouselPrev', nextId: 'relatedCarouselNext', cardW: 310, gap: 14, visible: 4 },
    { trackId: 'categoryTrack', prevId: 'categoryCarouselPrev', nextId: 'categoryCarouselNext', cardW: 200, gap: 14, visible: 6 },
    { trackId: 'brandTrack', prevId: 'bretCarouselPrev', nextId: 'bretCarouselNext', cardW: 200, gap: 14, visible: 6 },
    { trackId: 'marqueTrack', prevId: 'marqueCarouselPrev', nextId: 'marqueCarouselNext', cardW: 200, gap: 14, visible: 6 },
    { trackId: 'featuredTrack', prevId: 'booksFeaturedPrev', nextId: 'booksFeaturedNext', cardW: 303, gap: 14, visible: 3, scrollBy: 1 },
    { trackId: 'categoryTrack', prevId: 'booksCategoryPrev', nextId: 'booksCategoryNext', cardW: 200, gap: 14, visible: 6 },
    { trackId: 'storyAgeTrack', prevId: 'storyAgePrev', nextId: 'storyAgeNext', cardW: 200, gap: 14, visible: 6 },
    { trackId: 'storyCategoryTrack', prevId: 'storyCategoryPrev', nextId: 'storyCategoryNext', cardW: 200, gap: 14, visible: 6 },
    { trackId: 'storyCharacterTrack', prevId: 'storyCharacterPrev', nextId: 'storyCharacterNext', cardW: 200, gap: 14, visible: 6 },
    { trackId: 'videoTrack', prevId: 'videoCarouselPrev', nextId: 'videoCarouselNext', cardW: 300, gap: 14, scrollBy: 1 }
  ];

  function updateArrows(track, prev, next) {
    if (!isLaptopContent()) return;
    var max = track.scrollWidth - track.clientWidth;
    if (max <= 1) {
      prev.disabled = true;
      next.disabled = true;
      return;
    }
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= max - 1;
  }

  function wirePagedCarousel(config) {
    var track = config.track || document.getElementById(config.trackId);
    var prev = config.prev || document.getElementById(config.prevId);
    var next = config.next || document.getElementById(config.nextId);
    if (!track || !prev || !next || track.dataset.pagedWired === '1') return;

    var cardW = config.cardW || 310;
    var gap = config.gap || 14;
    var visible = config.visible || 4;
    var stepCount = config.scrollBy != null ? config.scrollBy : visible;
    var step = (cardW + gap) * stepCount;

    function scrollByPage(dir) {
      if (!isLaptopContent()) return;
      track.scrollBy({ left: dir * step, behavior: 'smooth' });
    }

    prev.addEventListener('click', function () {
      scrollByPage(-1);
    });
    next.addEventListener('click', function () {
      scrollByPage(1);
    });

    track.addEventListener('scroll', function () {
      updateArrows(track, prev, next);
    });

    window.addEventListener('resize', function () {
      updateArrows(track, prev, next);
    });

    track.dataset.pagedWired = '1';
    updateArrows(track, prev, next);
  }

  function wirePagedRow(row) {
    if (row.dataset.pagedRowWired === '1') return;
    var track = row.querySelector('.carousel-track');
    var prev = row.querySelector('.carousel-arrow--prev');
    var next = row.querySelector('.carousel-arrow--next');
    if (!track || !prev || !next) return;

    wirePagedCarousel({
      track: track,
      prev: prev,
      next: next,
      cardW: parseInt(row.dataset.cardW, 10) || 310,
      gap: parseInt(row.dataset.gap, 10) || 14,
      visible: parseInt(row.dataset.visible, 10) || 4
    });
    row.dataset.pagedRowWired = '1';
  }

  function centerVideoCard(card, smooth) {
    var track = document.getElementById('videoTrack');
    if (!track || !card || !isLaptopContent()) return;

    function runCenter() {
      var trackRect = track.getBoundingClientRect();
      var cardRect = card.getBoundingClientRect();
      var cardCenter = cardRect.left + cardRect.width / 2;
      var trackCenter = trackRect.left + trackRect.width / 2;
      var targetScroll = track.scrollLeft + (cardCenter - trackCenter);
      var maxScroll = track.scrollWidth - track.clientWidth;

      targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
      track.scrollTo({
        left: targetScroll,
        behavior: smooth === false ? 'instant' : 'smooth'
      });
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(runCenter);
    });
  }

  function selectVideoCard(card, options) {
    var track = document.getElementById('videoTrack');
    if (!track || !card) return;
    var smooth = !options || options.smooth !== false;

    track.querySelectorAll('.video-card').forEach(function (c) {
      c.classList.remove('is-selected');
    });
    card.classList.add('is-selected');
    centerVideoCard(card, smooth);

    window.setTimeout(function () {
      if (card.classList.contains('is-selected')) {
        centerVideoCard(card, smooth);
      }
    }, 280);
  }

  function initVideoSélectionnerion() {
    if (!isLaptopContent()) return;
    var track = document.getElementById('videoTrack');
    if (!track || track.dataset.videoSélectionnerWired === '1') return;

    var cards = track.querySelectorAll('.video-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.video-chev-btn') || e.target.closest('a')) return;
        selectVideoCard(card);
      });
    });

    if (!track.querySelector('.video-card.is-selected') && cards.length) {
      var mid = Math.floor(cards.length / 2);
      selectVideoCard(cards[mid], { smooth: false });
    }

    window.addEventListener('resize', function () {
      if (!isLaptopContent()) return;
      var selected = track.querySelector('.video-card.is-selected');
      if (selected) centerVideoCard(selected, false);
    });

    track.dataset.videoSélectionnerWired = '1';
  }

  window.selectVideoCard = selectVideoCard;

  function init() {
    if (!isLaptopContent()) return;
    CAROUSELS.forEach(wirePagedCarousel);
    document.querySelectorAll('.carousel-row--paged').forEach(wirePagedRow);
    initVideoSélectionnerion();
  }

  window.ProductCarousel = { init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('resize', function () {
    if (isLaptopContent()) init();
  });
})();
