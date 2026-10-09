/**
 * Van Der Waals HTML5 Presentation Engine
 * Features:
 * - 4:3 Aspect-ratio preservation (Zero distortion on any display)
 * - PowerPoint-accurate transitions (3D Peel Off, Morph, Smooth Fade)
 * - Slide 7 dynamic molecular GIF overlay
 * - Fullscreen mode, Laser pointer, Auto-play with SVG timer, Slide Sorter grid
 * - Keyboard shortcuts, touch swipe gestures, audio clicks, deep-linking via URL hash
 */

(function () {
  'use strict';

  // --- State ---
  let currentIndex = 0;
  const totalSlides = SLIDES_DATA.length;
  let isTransitioning = false;
  let isAutoplayActive = false;
  let autoplayInterval = null;
  const autoplayDuration = 6000; // 6s per slide
  let autoplayElapsed = 0;
  let autoplayTimer = null;
  let isLaserActive = false;
  let isSoundEnabled = true;
  let hudHideTimeout = null;

  // Web Audio Context for synthesized click
  let audioCtx = null;
  function playClickSound() {
    if (!isSoundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      // Audio not permitted or supported
    }
  }

  // --- DOM Elements ---
  const container = document.getElementById('presentation-container');
  const stage = document.getElementById('presentation-stage');
  const slideViewport = document.getElementById('slide-viewport');
  const layerA = document.getElementById('slide-layer-a');
  const layerB = document.getElementById('slide-layer-b');
  const imgA = layerA.querySelector('.slide-img');
  const imgB = layerB.querySelector('.slide-img');
  const gifOverlay = document.getElementById('molecule-gif-overlay');
  const progressBar = document.getElementById('progress-fill');
  const currentIdxEl = document.getElementById('current-idx');
  const totalCountEl = document.getElementById('total-count');
  const floatingHud = document.getElementById('floating-hud');
  const laserLayer = document.getElementById('laser-layer');
  const laserDot = document.getElementById('laser-dot');
  const overviewModal = document.getElementById('overview-modal');
  const overviewGrid = document.getElementById('overview-grid');
  const notesDrawer = document.getElementById('notes-drawer');
  const helpModal = document.getElementById('help-modal');
  const autoplayRingCircle = document.getElementById('autoplay-ring-circle');

  let activeLayer = layerA;
  let inactiveLayer = layerB;

  // Initialize slides
  function init() {
    totalCountEl.textContent = totalSlides;

    // Check URL hash (#slide-X)
    const hash = window.location.hash;
    if (hash && hash.startsWith('#slide-')) {
      const parsed = parseInt(hash.replace('#slide-', ''), 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= totalSlides) {
        currentIndex = parsed - 1;
      }
    }

    // Set initial slide
    const slide = SLIDES_DATA[currentIndex];
    imgA.src = slide.image;
    imgA.alt = slide.title;
    layerA.classList.add('active');
    layerB.classList.remove('active');
    activeLayer = layerA;
    inactiveLayer = layerB;

    updateUI();
    buildOverviewGrid();
    setupEventListeners();
    resetHudTimeout();

    // Preload next 3 slides
    preloadSlides(currentIndex);
  }

  function preloadSlides(centerIdx) {
    for (let offset = 1; offset <= 3; offset++) {
      const idx = centerIdx + offset;
      if (idx < totalSlides) {
        const img = new Image();
        img.src = SLIDES_DATA[idx].image;
      }
    }
  }

  // Update HUD, notes, and progress bar
  function updateUI() {
    const slide = SLIDES_DATA[currentIndex];
    currentIdxEl.textContent = currentIndex + 1;
    window.location.hash = `#slide-${currentIndex + 1}`;

    // Progress bar
    const progressPercent = ((currentIndex + 1) / totalSlides) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Slide 7 GIF overlay
    if (slide.hasMedia && slide.mediaType === 'gif') {
      gifOverlay.style.display = 'block';
    } else {
      gifOverlay.style.display = 'none';
    }

    // Update Notes
    document.getElementById('notes-slide-num').textContent = `Slide ${slide.index} / ${totalSlides}`;
    document.getElementById('notes-category').textContent = slide.category;
    document.getElementById('notes-title').textContent = slide.title;
    document.getElementById('notes-desc').textContent = slide.description;
    document.getElementById('notes-transcript').textContent = slide.fullText || 'Không có văn bản trích dẫn.';

    // Update Overview Active Card
    document.querySelectorAll('.overview-card').forEach((card, idx) => {
      card.classList.toggle('active', idx === currentIndex);
    });
  }

  // Go to specific slide with appropriate transition
  function goToSlide(targetIndex, instant = false) {
    if (targetIndex < 0 || targetIndex >= totalSlides || targetIndex === currentIndex) return;
    if (isTransitioning && !instant) return;

    isTransitioning = true;
    playClickSound();

    const currentSlide = SLIDES_DATA[currentIndex];
    const targetSlide = SLIDES_DATA[targetIndex];

    const outgoingLayer = activeLayer;
    const incomingLayer = inactiveLayer;
    const incomingImg = incomingLayer.querySelector('.slide-img');

    incomingImg.src = targetSlide.image;
    incomingImg.alt = targetSlide.title;

    // Reset classes
    outgoingLayer.className = 'slide-layer active';
    incomingLayer.className = 'slide-layer';

    // Slide 7 GIF hide during transition if departing
    if (currentSlide.hasMedia) {
      gifOverlay.style.display = 'none';
    }

    const directionForward = targetIndex > currentIndex;
    const transitionType = targetSlide.transition;

    if (instant) {
      outgoingLayer.classList.remove('active');
      incomingLayer.classList.add('active');
      finishTransition(targetIndex, incomingLayer, outgoingLayer);
      return;
    }

    // Apply PowerPoint-matched transitions
    if (directionForward && transitionType === 'peelOff') {
      // Slide 1 -> 2 Peel Off 3D Curl
      outgoingLayer.classList.add('peel-off-out');
      incomingLayer.classList.add('peel-off-in');
      setTimeout(() => {
        finishTransition(targetIndex, incomingLayer, outgoingLayer);
      }, 1250);
    } else if (directionForward && transitionType === 'morph') {
      // Slide 2 -> 3 Morph Transition
      outgoingLayer.classList.add('morph-out');
      incomingLayer.classList.add('morph-in');
      setTimeout(() => {
        finishTransition(targetIndex, incomingLayer, outgoingLayer);
      }, 1900);
    } else {
      // Standard smooth Fade
      outgoingLayer.classList.add('fade-out');
      incomingLayer.classList.add('fade-in');
      setTimeout(() => {
        finishTransition(targetIndex, incomingLayer, outgoingLayer);
      }, 680);
    }
  }

  function finishTransition(targetIndex, incomingLayer, outgoingLayer) {
    outgoingLayer.className = 'slide-layer';
    incomingLayer.className = 'slide-layer active';
    activeLayer = incomingLayer;
    inactiveLayer = outgoingLayer;
    currentIndex = targetIndex;
    isTransitioning = false;
    updateUI();
    preloadSlides(currentIndex);
  }

  function nextSlide() {
    if (currentIndex < totalSlides - 1) {
      goToSlide(currentIndex + 1);
    } else if (isAutoplayActive) {
      goToSlide(0); // Loop back in autoplay
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  }

  // --- Auto-Play Slideshow ---
  function toggleAutoplay() {
    isAutoplayActive = !isAutoplayActive;
    const btn = document.getElementById('btn-autoplay');
    btn.classList.toggle('active', isAutoplayActive);

    if (isAutoplayActive) {
      startAutoplayTimer();
    } else {
      stopAutoplayTimer();
    }
  }

  function startAutoplayTimer() {
    stopAutoplayTimer();
    autoplayElapsed = 0;
    const stepMs = 50;
    autoplayInterval = setInterval(() => {
      autoplayElapsed += stepMs;
      const progress = autoplayElapsed / autoplayDuration;
      const offset = 100 - progress * 100;
      if (autoplayRingCircle) {
        autoplayRingCircle.style.strokeDashoffset = `${offset}`;
      }

      if (autoplayElapsed >= autoplayDuration) {
        nextSlide();
        autoplayElapsed = 0;
      }
    }, stepMs);
  }

  function stopAutoplayTimer() {
    if (autoplayInterval) clearInterval(autoplayInterval);
    autoplayInterval = null;
    if (autoplayRingCircle) {
      autoplayRingCircle.style.strokeDashoffset = '100';
    }
  }

  // --- Laser Pointer Engine ---
  function toggleLaser() {
    isLaserActive = !isLaserActive;
    document.getElementById('btn-laser').classList.toggle('active', isLaserActive);
    laserLayer.classList.toggle('active', isLaserActive);
    stage.style.cursor = isLaserActive ? 'none' : 'default';
  }

  function updateLaserPosition(e) {
    if (!isLaserActive) return;
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      laserDot.style.left = `${x}px`;
      laserDot.style.top = `${y}px`;
      laserLayer.style.opacity = '1';
    } else {
      laserLayer.style.opacity = '0';
    }
  }

  // --- Overview Modal ---
  function buildOverviewGrid() {
    overviewGrid.innerHTML = '';
    SLIDES_DATA.forEach((slide, idx) => {
      const card = document.createElement('div');
      card.className = `overview-card ${idx === currentIndex ? 'active' : ''}`;
      card.innerHTML = `
        <div class="overview-card-thumb">
          <img src="${slide.thumb}" alt="Slide ${slide.index}" loading="lazy">
        </div>
        <div class="overview-card-info">
          <div class="overview-card-header">
            <span class="overview-card-num">#${slide.index}</span>
            <span class="overview-card-tag" title="${slide.category}">${slide.category}</span>
          </div>
          <div class="overview-card-title" title="${slide.title}">${slide.title}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        goToSlide(idx);
        closeOverview();
      });
      overviewGrid.appendChild(card);
    });
  }

  function openOverview() {
    overviewModal.classList.add('open');
  }

  function closeOverview() {
    overviewModal.classList.remove('open');
  }

  function toggleOverview() {
    if (overviewModal.classList.contains('open')) {
      closeOverview();
    } else {
      openOverview();
    }
  }

  // --- Speaker Notes Drawer ---
  function toggleNotes() {
    notesDrawer.classList.toggle('open');
    document.getElementById('btn-notes').classList.toggle('active', notesDrawer.classList.contains('open'));
  }

  // --- Help Modal ---
  function toggleHelp() {
    helpModal.classList.toggle('open');
  }

  // --- Fullscreen API ---
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  // --- Blank Screen (B / W keys) ---
  function toggleBlank(type) {
    const cls = type === 'black' ? 'blank-black' : 'blank-white';
    if (container.classList.contains(cls)) {
      container.classList.remove('blank-black', 'blank-white');
    } else {
      container.classList.remove('blank-black', 'blank-white');
      container.classList.add(cls);
    }
  }

  // --- HUD Auto-Hide ---
  function resetHudTimeout() {
    floatingHud.classList.remove('hidden');
    if (hudHideTimeout) clearTimeout(hudHideTimeout);
    hudHideTimeout = setTimeout(() => {
      if (!overviewModal.classList.contains('open') && !notesDrawer.classList.contains('open') && !helpModal.classList.contains('open')) {
        floatingHud.classList.add('hidden');
      }
    }, 2800);
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      // Ignore if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
        case 'PageDown':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'Backspace':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(totalSlides - 1);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'o':
        case 'O':
        case 'g':
        case 'G':
          toggleOverview();
          break;
        case 'l':
        case 'L':
          toggleLaser();
          break;
        case 'p':
        case 'P':
          toggleAutoplay();
          break;
        case 'b':
        case 'B':
          toggleBlank('black');
          break;
        case 'w':
        case 'W':
          toggleBlank('white');
          break;
        case 'n':
        case 'N':
          toggleNotes();
          break;
        case '?':
        case 'h':
        case 'H':
          toggleHelp();
          break;
        case 'Escape':
          closeOverview();
          notesDrawer.classList.remove('open');
          helpModal.classList.remove('open');
          container.classList.remove('blank-black', 'blank-white');
          break;
      }
      resetHudTimeout();
    });

    // Mouse movement
    window.addEventListener('mousemove', (e) => {
      resetHudTimeout();
      updateLaserPosition(e);
    });

    // Hotspot navigation clicks
    document.getElementById('hotspot-prev').addEventListener('click', prevSlide);
    document.getElementById('hotspot-next').addEventListener('click', nextSlide);

    // HUD buttons
    document.getElementById('btn-prev').addEventListener('click', prevSlide);
    document.getElementById('btn-next').addEventListener('click', nextSlide);
    document.getElementById('btn-overview').addEventListener('click', toggleOverview);
    document.getElementById('btn-laser').addEventListener('click', toggleLaser);
    document.getElementById('btn-autoplay').addEventListener('click', toggleAutoplay);
    document.getElementById('btn-notes').addEventListener('click', toggleNotes);
    document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);
    document.getElementById('btn-help').addEventListener('click', toggleHelp);

    // Overview close
    document.getElementById('overview-close').addEventListener('click', closeOverview);

    // Notes close
    document.getElementById('notes-close').addEventListener('click', () => {
      notesDrawer.classList.remove('open');
      document.getElementById('btn-notes').classList.remove('active');
    });

    // Help close
    document.getElementById('help-close').addEventListener('click', () => {
      helpModal.classList.remove('open');
    });

    // Touch Swipe gestures for mobile/tablet
    let touchStartX = 0;
    let touchStartY = 0;
    stage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
      resetHudTimeout();
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
      const diffX = e.changedTouches[0].clientX - touchStartX;
      const diffY = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) nextSlide();
        else prevSlide();
      }
    }, { passive: true });
  }

  // Run on page load
  window.addEventListener('DOMContentLoaded', init);
})();
