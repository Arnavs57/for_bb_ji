/**
 * Relationship Journey Timeline — Main Script
 * Sound-track cards: click to flip, play audio when flipped to back.
 */

(function () {
  'use strict';

  var cards = document.querySelectorAll('.sound-track-card[data-sound-card]');

  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      var audio = card.querySelector('.sound-track-audio');
      var isFlipped = card.classList.contains('flipped');

      if (isFlipped) {
        card.classList.remove('flipped');
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        return;
      }

      /* Only one card plays: unflip and pause all others, then flip this and play */
      cards.forEach(function (other) {
        if (other !== card) {
          other.classList.remove('flipped');
          var a = other.querySelector('.sound-track-audio');
          if (a) {
            a.pause();
            a.currentTime = 0;
          }
        }
      });
      card.classList.add('flipped');
      if (audio && audio.src) {
        audio.currentTime = 0;
        audio.play().catch(function () {});
      }
    });
  });

  /* Scratch-to-reveal gift card */
  var canvas = document.getElementById('giftScratchCanvas');
  if (!canvas) return;

  var wrap = canvas.closest('.gift-scratch-wrap');
  var ctx = canvas.getContext('2d');
  var isDrawing = false;
  var hasScratched = false;
  var brushRadius = 24;

  function sizeCanvas() {
    if (!wrap) return;
    var rect = wrap.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    drawScratch(rect.width, rect.height);
  }

  function drawScratch(w, h) {
    /* Soft silver/scratch gradient */
    var grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, '#c4b8c9');
    grd.addColorStop(0.5, '#d8d0de');
    grd.addColorStop(1, '#b8acc0');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
    /* Hint text could go here; keeping minimal */
  }

  function getPos(e) {
    var rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function scratch(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  function start(e) {
    e.preventDefault();
    isDrawing = true;
    hasScratched = false;
  }

  function move(e) {
    e.preventDefault();
    if (!isDrawing) return;
    hasScratched = true;
    var hint = document.getElementById('giftScratchHint');
    if (hint) hint.classList.add('gift-scratch-hint-hidden');
    var pos = getPos(e);
    scratch(pos.x, pos.y);
  }

  function end(e) {
    if (!hasScratched) {
      var img = wrap.querySelector('.gift-image');
      var lightbox = document.getElementById('giftLightbox');
      var lightboxImg = lightbox && lightbox.querySelector('.gift-lightbox-image');
      if (img && img.src && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightbox.classList.add('gift-lightbox-open');
        lightbox.setAttribute('aria-hidden', 'false');
      }
    }
    isDrawing = false;
  }

  /* Close lightbox on click */
  var lightbox = document.getElementById('giftLightbox');
  if (lightbox) {
    lightbox.addEventListener('click', function () {
      lightbox.classList.remove('gift-lightbox-open');
      lightbox.setAttribute('aria-hidden', 'true');
    });
  }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', end);
  canvas.addEventListener('mouseleave', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end);

  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);
})();
