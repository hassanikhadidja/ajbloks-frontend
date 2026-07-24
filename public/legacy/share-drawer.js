(function () {
  if (window.__shareDrawerInit) return;
  window.__shareDrawerInit = true;

  function injectShareMarkup() {
    if (document.getElementById('shareDrawer')) return;

    var wrap = document.createElement('div');
    wrap.innerHTML = [
      '<div class="share-backdrop" id="shareBackdrop" aria-hidden="true"></div>',
      '<div class="share-drawer" id="shareDrawer" role="dialog" aria-label="Partager" aria-hidden="true">',
      '  <div class="share-drawer-hetle"></div>',
      '  <div class="share-drawer-header">',
      '    <h3>Partager</h3>',
      '    <button class="share-drawer-close" id="shareCloseBtn" type="button" aria-label="Fermer le menu de partage">✕</button>',
      '  </div>',
      '  <div class="share-grid">',
      '    <button class="share-article" type="button" data-share="whatsapp" aria-label="Partager sur WhatsApp">',
      '      <span class="share-icon"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg></span>',
      '      WhatsApp',
      '    </button>',
      '    <button class="share-article" type="button" data-share="tiktok" aria-label="Partager sur TikTok">',
      '      <span class="share-icon"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 3c.4 2.3 2 4 4.4 4.2v3.1c-1.5.1-2.9-.4-4.4-1.3v6.6a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v3.2a2.6 2.6 0 1 0 1.8 2.5V3z"/></svg></span>',
      '      TikTok',
      '    </button>',
      '    <button class="share-article" type="button" data-share="instagram" aria-label="Partager sur Instagram">',
      '      <span class="share-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></span>',
      '      Instagram',
      '    </button>',
      '    <button class="share-article" type="button" data-share="pinterest" aria-label="Partager sur Pinterest">',
      '      <span class="share-icon"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.17.6 2.123 1.775 2.123 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg></span>',
      '      Pinterest',
      '    </button>',
      '    <button class="share-article" type="button" data-share="facebook" aria-label="Partager sur Facebook">',
      '      <span class="share-icon"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-9h3l.5-3.5h-3.5V7.4c0-1 .3-1.7 1.7-1.7H17V2.6C16.6 2.5 15.5 2.4 14.2 2.4c-2.7 0-4.6 1.6-4.6 4.7v2.4H6.9V13h2.7v9z"/></svg></span>',
      '      Facebook',
      '    </button>',
      '  </div>',
      '</div>',
      '<div class="share-toast" id="shareToast" role="status" aria-live="polite"></div>'
    ].join('');

    while (wrap.firstChild) {
      document.body.appendChild(wrap.firstChild);
    }
  }

  function showShareToast(message) {
    var toast = document.getElementById('shareToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showShareToast._timer);
    showShareToast._timer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2200);
  }

  function wireShareDrawer() {
    var drawer = document.getElementById('shareDrawer');
    var backdrop = document.getElementById('shareBackdrop');
    var closeBtn = document.getElementById('shareCloseBtn');
    if (!drawer || !backdrop || !closeBtn) return;

    function drawerTransform(y) {
      return 'translateX(-50%) translateY(' + y + ')';
    }

    function open() {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      backdrop.setAttribute('aria-hidden', 'false');
    }

    function close() {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      drawer.style.transform = '';
      drawer.setAttribute('aria-hidden', 'true');
      backdrop.setAttribute('aria-hidden', 'true');
    }

    document.querySelectorAll('.share-btn').forEach(function (btn) {
      if (btn.dataset.shareWired === 'true') return;
      btn.dataset.shareWired = 'true';
      btn.addEventListener('click', function () {
        open();
      });
    });

    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);

    var startY = null;
    drawer.addEventListener('touchstart', function (e) {
      startY = e.touches[0].clientY;
    }, { passive: true });

    drawer.addEventListener('touchmove', function (e) {
      if (startY === null) return;
      var dy = e.touches[0].clientY - startY;
      if (dy > 0) drawer.style.transform = drawerTransform(dy + 'px');
    }, { passive: true });

    drawer.addEventListener('touchend', function (e) {
      if (startY === null) return;
      var dy = e.changedTouches[0].clientY - startY;
      drawer.style.transform = '';
      if (dy > 90) close();
      startY = null;
    });

    document.querySelectorAll('.share-article').forEach(function (btn) {
      if (btn.dataset.shareItemWired === 'true') return;
      btn.dataset.shareItemWired = 'true';
      btn.addEventListener('click', function () {
        var label = btn.getAttribute('aria-label') || 'Share';
        showShareToast('Ouverture de ' + label.replace('Share on ', '') + '…');
        close();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) close();
    });

    window.shareDrawer = { open: open, close: close };
  }

  function init() {
    injectShareMarkup();
    wireShareDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
