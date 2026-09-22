/* Practice for the Performing Arts: interactions (vanilla, no dependencies) */
(function () {
  'use strict';
  var doc = document.documentElement;

  /* Handshake with the inline <head> script. Every .reveal element starts at
     opacity 0 under `.js` and is only brought back by this file, so if this
     file never runs, the page stays blank below the fold. The inline script
     therefore drops `.js` again unless it sees `js-on` within 2.5s.

     The class cannot simply be set here instead: `.js` has to be on the
     element before the first paint, and this file is deferred, so the content
     would flash in at full opacity and then be yanked back out. */
  doc.classList.add('js-on');

  var EMAIL = 'nadia@nadiabanna.com';

  /* ----- Localised UI strings (used by the form interactions below) -----
     The failure strings end mid-sentence on purpose: show() appends EMAIL as
     a mailto link when called with withEmail. They tell people to write to us
     instead, and the address appears nowhere else on these pages, so being
     told to email with no address would be no help at the one moment it
     matters. */
  var isDe = (doc.lang || 'en').toLowerCase().indexOf('de') === 0;
  var L = isDe ? {
    menuOpen: 'Menü öffnen',
    menuClose: 'Menü schliessen',
    sending: 'Wird gesendet…',
    success: 'Vielen Dank. Ihre Nachricht wurde gesendet, wir melden uns in Kürze.',
    error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt: ',
    errorShort: 'Etwas ist schiefgelaufen. Bitte schreiben Sie uns direkt: ',
    network: 'Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung oder schreiben Sie uns direkt: ',
    required: 'Bitte füllen Sie dieses Feld aus.',
    invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
  } : {
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    sending: 'Sending…',
    success: 'Thank you. Your message has been sent, and we will be in touch shortly.',
    error: 'Something went wrong. Please try again, or email us directly at ',
    errorShort: 'Something went wrong. Please email us directly at ',
    network: 'Network error. Please check your connection, or email us directly at ',
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

    /* the toggle plus everything inside the open panel, in document order.
       The language button is included even though it lives outside .nav: it
       stays visible in the header bar while the panel is open (see the mobile
       block in styles.css), and the Tab handler below pulls focus back out of
       anything missing from this list, so leaving it out made a control that
       is on screen unreachable by keyboard for as long as the menu was open. */
    var trapStops = function () {
      return [toggle]
        .concat(Array.prototype.slice.call(nav.querySelectorAll('a[href], button:not([disabled])')))
        .concat(Array.prototype.slice.call(document.querySelectorAll('.site-header .lang-btn')));
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
       the open state rather than leaving the scroll lock and trap in place.
       Must match the burger media query in styles.css; if the two drift, the
       menu can be left stuck open at a width where it is no longer a panel. */
    var mq = window.matchMedia('(max-width: 1049px)');
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
    /* Blocks a second click or Enter while a request is in flight. This is a
       flag plus aria-disabled rather than btn.disabled: disabling the focused
       button sends focus to <body>, and it does not come back on re-enable,
       so every keyboard user's next Tab after sending restarted at the top
       of the page. */
    var sending = false;

    form.addEventListener('submit', function (e) {
      /* This is the fallback the heading above promises, and it has to come
         before preventDefault: cancelling the submit and only then finding
         there is no fetch to send it with would lose the message silently,
         on the only way a visitor can reach the practice from the site. */
      if (!window.fetch) { return; }
      e.preventDefault();
      if (sending) { return; }
      if (!form.checkValidity()) { form.reportValidity(); return; }
      /* clear the text as well as the state classes: the element stays
         rendered now, so a message left over from a previous attempt would
         otherwise sit there unstyled while this one is in flight */
      if (status) { status.className = 'form-status'; status.textContent = ''; }
      sending = true;
      if (btn) { btn.setAttribute('aria-disabled', 'true'); btn.textContent = L.sending; }

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
            /* Formspree's own wording is never shown. It is English only, and
               its errors array carries form-level failures (form inactive,
               blocked, not found) as well as field validation, so showing it
               verbatim told a German visitor "Form is inactive" with no way
               to reach us. The one field error the browser can let through
               is the address: type=email accepts anna@gmailcom, Formspree
               may not. Everything else gets the fall-back-to-email tail. */
            var errs = (data && data.errors) || [];
            var badEmail = errs.length && errs.every(function (x) { return x.code === 'TYPE_EMAIL'; });
            if (badEmail) {
              show('is-error', L.invalidEmail);
              var email = form.querySelector('[type="email"]');
              if (email) { email.focus(); }
            } else {
              show('is-error', L.error, true);
            }
          }).catch(function () { show('is-error', L.errorShort, true); });
        }
      }).catch(function () {
        show('is-error', L.network, true);
      }).finally(function () {
        sending = false;
        if (btn) { btn.removeAttribute('aria-disabled'); btn.innerHTML = btnMarkup; }
      });

      /* withEmail appends the address as a real mailto link. It is built as a
         node rather than interpolated markup so that nothing passed in here
         can ever be parsed as HTML; keep it that way. */
      function show(kind, message, withEmail) {
        if (!status) { return; }
        status.classList.add('form-status', kind, 'is-visible');
        status.textContent = message;
        if (withEmail) {
          var a = document.createElement('a');
          a.href = 'mailto:' + EMAIL;
          a.textContent = EMAIL;
          status.appendChild(a);
        }
        status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  /* ----- Footer year ----- */
  var yr = document.querySelector('[data-year]');
  if (yr) { yr.textContent = new Date().getFullYear(); }
})();
