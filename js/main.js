/* Nußbaumer – Hängeschild, Laufband-Richtung, Filmstreifen */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  function berlinNow() {
    var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }, o = {};
    try {
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
      return { d: map[o.weekday], h: parseInt(o.hour, 10) % 24 + parseInt(o.minute, 10) / 60 };
    } catch (e) { var n = new Date(); return { d: n.getDay(), h: n.getHours() + n.getMinutes() / 60 }; }
  }
  /* 1 · Schild „Offen / Geschlossen“ */
  var sign = document.querySelector('[data-sign]');
  if (sign) {
    var hours = {};
    try { hours = JSON.parse(sign.getAttribute('data-sign')); } catch (e) {}
    var st = sign.querySelector('.sign-state'), sub = sign.querySelector('.sign-sub');
    var update = function () {
      var n = berlinNow(), t = hours[n.d], open = t && n.h >= t[0] && n.h < t[1];
      sign.classList.toggle('open', !!open); sign.classList.toggle('closed', !open);
      if (open) { st.textContent = 'Offen'; sub.textContent = 'bis ' + t[1] + ' Uhr'; return; }
      if (t && n.h < t[0]) { st.textContent = 'Gleich offen'; sub.textContent = 'heute ab ' + t[0] + ' Uhr'; return; }
      for (var i = 1; i <= 7; i++) {
        var d = (n.d + i) % 7;
        if (hours[d]) { st.textContent = 'Geschlossen'; sub.textContent = (i === 1 ? 'morgen' : DAYS[d]) + ' ab ' + hours[d][0] + ' Uhr'; return; }
      }
    };
    update(); setInterval(update, 60000);
    if (!reduce) {
      var ang = 0, vel = 0, lastY = window.scrollY, running = false;
      var tick = function () {
        vel += -ang * 0.035; vel *= 0.95; ang += vel;
        sign.style.setProperty('--sw', ang.toFixed(2) + 'deg');
        if (Math.abs(ang) > 0.02 || Math.abs(vel) > 0.02) requestAnimationFrame(tick); else { running = false; sign.style.setProperty('--sw', '0deg'); }
      };
      var kick = function (v) { vel += v; if (vel > 4) vel = 4; if (vel < -4) vel = -4; if (!running) { running = true; requestAnimationFrame(tick); } };
      window.addEventListener('scroll', function () { var y = window.scrollY, dy = y - lastY; lastY = y; if (y < 1200) kick(Math.max(-1.2, Math.min(1.2, dy * 0.05))); }, { passive: true });
      sign.addEventListener('pointerenter', function (e) { kick(e.movementX >= 0 ? 2.4 : -2.4); });
      setTimeout(function () { kick(3); }, 900);
    }
  }
  /* 2 · Laufband dreht mit der Scrollrichtung */
  var tape = document.querySelector('.tape');
  if (tape && !reduce) {
    var ly = window.scrollY;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (Math.abs(y - ly) > 4) { tape.style.setProperty('--tdir', y > ly ? 'normal' : 'reverse'); ly = y; }
    }, { passive: true });
  }
  /* 3 · Filmstreifen: vertikal scrollen, horizontal fahren */
  var film = document.querySelector('[data-film]');
  if (film) {
    var track = film.querySelector('.film-track'), mq = window.matchMedia('(min-width: 900px)'), dist = 0;
    var setup = function () {
      if (mq.matches && !reduce) {
        film.classList.add('on');
        dist = Math.max(0, track.scrollWidth - window.innerWidth);
        film.style.setProperty('--film-h', (window.innerHeight + dist) + 'px');
        move();
      } else {
        film.classList.remove('on'); film.style.removeProperty('--film-h'); track.style.removeProperty('--fx');
        track.style.setProperty('--track-w', track.scrollWidth + 'px');
      }
    };
    var move = function () {
      if (!film.classList.contains('on')) return;
      var r = film.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / Math.max(1, dist)));
      track.style.setProperty('--fx', (p * dist).toFixed(1));
    };
    window.addEventListener('scroll', function () { requestAnimationFrame(move); }, { passive: true });
    window.addEventListener('resize', setup);
    window.addEventListener('load', setup);
    setup();
  }
})();
