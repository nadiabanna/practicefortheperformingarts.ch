/* Practice for the Performing Arts: interactions (vanilla, no dependencies) */
(function () {
  'use strict';
  var doc = document.documentElement;

  /* ----- Localised UI strings (used by the form interactions below) ----- */
  var isDe = (doc.lang || 'en').toLowerCase().indexOf('de') === 0;
  var L = isDe ? {
    menuOpen: 'Menü öffnen',
    menuClose: 'Menü schliessen',
    sending: 'Wird gesendet…',
    success: 'Vielen Dank. Ihre Nachricht wurde gesendet, wir melden uns in Kürze.',
    error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt eine E-Mail.',
    errorShort: 'Etwas ist schiefgelaufen. Bitte schreiben Sie uns direkt eine E-Mail.',
    network: 'Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung oder schreiben Sie uns direkt.',
    required: 'Bitte füllen Sie dieses Feld aus.',
    invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
  } : {
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    sending: 'Sending…',
    success: 'Thank you. Your message has been sent, and we will be in touch shortly.',
    error: 'Something went wrong. Please try again or email us directly.',
    errorShort: 'Something went wrong. Please email us directly.',
    network: 'Network error. Please check your connection or email us directly.',
    required: 'Please fill out this field.',
    invalidEmail: 'Please enter a valid email address.'
  };

  /* ----- Mobile navigation ----- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    var setNav = function (open) {
      doc.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? L.menuClose : L.menuOpen);
    };
    var closeNav = function () { setNav(false); };

    /* the toggle plus everything inside the open panel, in document order */
    var trapStops = function () {
      return [toggle].concat(Array.prototype.slice.call(
        nav.querySelectorAll('a[href], button:not([disabled])')
      ));
    };

    toggle.addEventListener('click', function () {
      setNav(!doc.classList.contains('nav-open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { closeNav(); }
    });
    overlay.addEventListener('click', closeNav);
    document.addEventListener('keydown', function (e) {
      if (!doc.classList.contains('nav-open')) { return; }

      if (e.key === 'Escape') {
        closeNav();
        toggle.focus();
        return;
      }

      /* keep focus inside the panel so it cannot wander onto the hidden page */
      if (e.key === 'Tab') {
        var stops = trapStops();
        if (!stops.length) { return; }
        var first = stops[0];
        var last = stops[stops.length - 1];
        var active = document.activeElement;

        if (stops.indexOf(active) === -1) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    /* leaving the mobile breakpoint puts the nav back in the header, so drop
       the open state rather than leaving the scroll lock and trap in place */
    var mq = window.matchMedia('(max-width: 940px)');
    var onBreakpoint = function (e) { if (!e.matches) { closeNav(); } };
    if (mq.addEventListener) { mq.addEventListener('change', onBreakpoint); }
    else if (mq.addListener) { mq.addListener(onBreakpoint); }
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

  /* ----- Localised constraint-validation messages -----
     The browser writes its own bubble text in the browser's UI language, not
     the page's, so a German page can show English (and the reverse). Override
     it so the message always matches the page the visitor is reading. */
  document.querySelectorAll('form[data-ajax] input, form[data-ajax] textarea').forEach(function (el) {
    el.addEventListener('invalid', function () {
      /* clear first so validity re-evaluates against the native constraints */
      el.setCustomValidity('');
      if (el.validity.valid) { return; }
      if (el.validity.valueMissing) { el.setCustomValidity(L.required); }
      else if (el.validity.typeMismatch && el.type === 'email') { el.setCustomValidity(L.invalidEmail); }
    });
    /* a non-empty custom message keeps the field invalid, so drop it on edit */
    el.addEventListener('input', function () { el.setCustomValidity(''); });
  });

  /* ----- Formspree AJAX submit (graceful fallback to normal POST) ----- */
  document.querySelectorAll('form[data-ajax]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('[type="submit"]');
    /* keep the markup, not just the text, so the arrow span survives a submit */
    var btnMarkup = btn ? btn.innerHTML : '';

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
        if (btn) { btn.disabled = false; btn.innerHTML = btnMarkup; }
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
