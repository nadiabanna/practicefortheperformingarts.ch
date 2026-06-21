/* Practice for the Performing Arts: interactions (vanilla, no dependencies) */
(function () {
  'use strict';
  var doc = document.documentElement;

  /* ----- Localised UI strings (used by the form interactions below) ----- */
  var isDe = (doc.lang || 'en').toLowerCase().indexOf('de') === 0;
  var L = isDe ? {
    sending: 'Wird gesendet…',
    success: 'Vielen Dank. Ihre Nachricht wurde gesendet, wir melden uns in Kürze.',
    error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt eine E-Mail.',
    errorShort: 'Etwas ist schiefgelaufen. Bitte schreiben Sie uns direkt eine E-Mail.',
    network: 'Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung oder schreiben Sie uns direkt.'
  } : {
    sending: 'Sending…',
    success: 'Thank you. Your message has been sent, and we will be in touch shortly.',
    error: 'Something went wrong. Please try again or email us directly.',
    errorShort: 'Something went wrong. Please email us directly.',
    network: 'Network error. Please check your connection or email us directly.'
  };

  /* ----- Mobile navigation ----- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    var closeNav = function () {
      doc.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', function () {
      var open = doc.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { closeNav(); }
    });
    overlay.addEventListener('click', closeNav);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && doc.classList.contains('nav-open')) {
        closeNav();
        toggle.focus();
      }
    });
  }

  /* ----- Header shadow on scroll ----- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----- Scroll reveal ----- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -2% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* ----- Formspree AJAX submit (graceful fallback to normal POST) ----- */
  document.querySelectorAll('form[data-ajax]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('[type="submit"]');
    var btnText = btn ? btn.textContent : '';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (status) { status.className = 'form-status'; }
      if (btn) { btn.disabled = true; btn.textContent = L.sending; }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          show('is-success', form.getAttribute('data-success') || L.success);
        } else {
          res.json().then(function (data) {
            var msg = (data && data.errors) ? data.errors.map(function (x) { return x.message; }).join(', ')
              : L.error;
            show('is-error', msg);
          }).catch(function () { show('is-error', L.errorShort); });
        }
      }).catch(function () {
        show('is-error', L.network);
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = btnText; }
      });

      function show(kind, message) {
        if (!status) { return; }
        status.textContent = message;
        status.classList.add('form-status', kind, 'is-visible');
        status.setAttribute('role', 'status');
        status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  /* ----- Footer year ----- */
  var yr = document.querySelector('[data-year]');
  if (yr) { yr.textContent = new Date().getFullYear(); }
})();
