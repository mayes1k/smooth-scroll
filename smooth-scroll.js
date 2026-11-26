/*!
 * smooth-scroll.js — lightweight inertial smooth scrolling (no dependencies).
 *  - eases mouse-wheel / trackpad scrolling with a lerp loop
 *  - eases keyboard scrolling (arrows, PageUp/Down, Space, Home/End)
 *  - eases in-page anchor links (#section)
 *  - leaves touch devices, nested scrollable areas and reduced-motion users alone
 *  Public API: SmoothScroll.scrollTo(yOrElement, {duration}), SmoothScroll.stop(), SmoothScroll.destroy()
 */
(function () {
  'use strict';
  if (window.SmoothScroll) return;

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = matchMedia('(pointer: coarse)').matches;
  if (reduced) { window.SmoothScroll = { scrollTo: function (t) { jump(t); }, stop: function () {}, destroy: function () {} }; return; }

  var root = document.documentElement;
  var LERP = 0.085;           // lower = floatier
  var WHEEL_MULT = 1;         // wheel distance multiplier
  var current = window.scrollY, target = current, raf = 0, tween = null;

  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var maxY = function () { return Math.max(0, root.scrollHeight - window.innerHeight); };
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  function jump(t) {
    var y = typeof t === 'number' ? t : (t && t.getBoundingClientRect ? t.getBoundingClientRect().top + window.scrollY : 0);
    window.scrollTo(0, y);
  }

  function setY(y) { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); }

  function loop() {
    if (tween) {
      var k = Math.min(1, (performance.now() - tween.t0) / tween.d);
      current = tween.from + (tween.to - tween.from) * ease(k);
      setY(current);
      if (k >= 1) { tween = null; target = current = window.scrollY; raf = 0; return; }
    } else {
      var diff = target - current;
      if (Math.abs(diff) < 0.4) { current = target; setY(current); raf = 0; return; }
      current += diff * LERP;
      setY(current);
    }
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!raf) raf = requestAnimationFrame(loop); }
  function stop() { tween = null; if (raf) cancelAnimationFrame(raf); raf = 0; target = current = window.scrollY; }

  // does an ancestor of el scroll natively in this direction? (e.g. the heatmap)
  function nestedScroller(el, dx, dy) {
    for (; el && el !== document.body && el !== root; el = el.parentElement) {
      var cs = getComputedStyle(el);
      var oy = /(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1;
      var ox = /(auto|scroll)/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 1;
      if (oy && dy) {
        if ((dy < 0 && el.scrollTop > 0) || (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1)) return true;
      }
      if (ox && dx && Math.abs(dx) > Math.abs(dy)) return true;
    }
    return false;
  }

  function onWheel(e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;          // horizontal gesture
    if (nestedScroller(e.target, e.deltaX, e.deltaY)) return;
    var dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 34; else if (e.deltaMode === 2) dy *= window.innerHeight;
    e.preventDefault();
    tween = null;
    if (!raf) { current = window.scrollY; target = current; }
    target = clamp(target + dy * WHEEL_MULT, 0, maxY());
    start();
  }

  function onKey(e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON' || tag === 'A' || (t && t.isContentEditable)) return;
    var h = window.innerHeight, d = 0, abs = null;
    switch (e.key) {
      case 'ArrowDown': d = 70; break;
      case 'ArrowUp': d = -70; break;
      case 'PageDown': d = h * .9; break;
      case 'PageUp': d = -h * .9; break;
      case ' ': d = (e.shiftKey ? -1 : 1) * h * .9; break;
      case 'Home': abs = 0; break;
      case 'End': abs = maxY(); break;
      default: return;
    }
    e.preventDefault();
    if (!raf) { current = window.scrollY; target = current; }
    tween = null;
    target = clamp(abs !== null ? abs : target + d, 0, maxY());
    start();
  }

  function scrollTo(t, opts) {
    var y = typeof t === 'number' ? t : t.getBoundingClientRect().top + window.scrollY - ((opts && opts.offset) || 0);
    y = clamp(y, 0, maxY());
    var from = window.scrollY;
    var d = (opts && opts.duration) || clamp(Math.abs(y - from) * 0.9, 500, 1400);
    current = from; tween = { from: from, to: y, t0: performance.now(), d: d };
    start();
  }

  function onClick(e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    var el = id ? document.getElementById(id) : null;
    if (id && !el) return;
    e.preventDefault();
    scrollTo(el || 0);
    if (id) history.pushState(null, '', '#' + id);
  }

  // keep in sync when the page is scrolled by something else (scrollbar drag, find-in-page, focus…)
  window.addEventListener('scroll', function () { if (!raf) current = target = window.scrollY; }, { passive: true });
  window.addEventListener('resize', function () { target = clamp(target, 0, maxY()); }, { passive: true });
  document.addEventListener('mousedown', function (e) { if (e.clientX >= root.clientWidth) stop(); }); // scrollbar grab
  if (!coarse) window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKey);
  document.addEventListener('click', onClick);

  window.SmoothScroll = {
    scrollTo: scrollTo,
    stop: stop,
    destroy: function () {
      stop();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    }
  };
})();
