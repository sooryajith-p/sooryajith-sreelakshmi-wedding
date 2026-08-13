(function () {
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Disable text selection, copying, and cutting
    document.addEventListener('selectstart', (e) => e.preventDefault());
    document.addEventListener('copy', (e) => e.preventDefault());
    document.addEventListener('cut', (e) => e.preventDefault());

    // Prevent dragging and saving/taking images
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });

    // Disable developer tools and restricted shortcuts
    document.addEventListener('keydown', (e) => {
        const key = e.key ? e.key.toUpperCase() : '';
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(key)) ||
            (e.ctrlKey && ['U', 'S', 'P', 'A'].includes(key))
        ) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });
})();

const openBtn = document.querySelector('.glass-open-btn');
if (openBtn) {
    openBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (openBtn.classList.contains('is-opening')) return;
        openBtn.classList.add('is-opening');

        if (typeof navigator.vibrate === 'function') {
            navigator.vibrate([40, 60, 40]);
        }

        openBtn.style.transform = 'scale(0.95)';
        openBtn.style.transition = 'transform 0.15s ease';

        window.scrollTo({ top: 0, behavior: 'instant' });
        document.body.classList.remove('cover-active');

        const cover = document.getElementById('cover');
        if (cover) {
            cover.classList.add('opened');

            cover.addEventListener('transitionend', () => {
                cover.style.pointerEvents = 'none';
            }, { once: true });
        }

        setTimeout(() => {
            if (typeof fireRomanticConfetti === 'function') {
                fireRomanticConfetti();
            }
        }, 400);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const cover = document.getElementById('cover');
    const openBtn = document.getElementById('openBtn');
    const heroSection = document.getElementById('hero');
    const bgMusic = document.getElementById('bg-music');
    const musicToggleBtn = document.getElementById('musicToggleBtn');

    // Pre-warm the audio context on first user interaction to prevent volume inconsistency
    let sharedAudioCtx = null;
    function getAudioContext() {
        if (!sharedAudioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            sharedAudioCtx = new AudioContextClass();
        }
        if (sharedAudioCtx.state === 'suspended') {
            sharedAudioCtx.resume();
        }
        return sharedAudioCtx;
    }

    if (openBtn && cover) {
        openBtn.addEventListener('click', function () {
            cover.classList.add('opened');
            setTimeout(() => {
                fireRomanticConfetti();
            }, 300);

            // Play background music safely after the party popper sound finishes completely
            if (bgMusic) {
                setTimeout(() => {
                    bgMusic.play().then(() => {
                        if (musicToggleBtn) {
                            musicToggleBtn.style.display = 'flex';
                            musicToggleBtn.classList.add('playing');
                        }
                    }).catch(error => {
                        console.log("Audio playback was prevented by the browser:", error);
                    });
                }, 1400);
            }

            // Scroll to #hero section smoothly after opening cover
            if (heroSection) {
                heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            function playPartyPopperSound() {
                try {
                    const audioCtx = getAudioContext();
                    const now = audioCtx.currentTime + 0.05; // Tiny buffer offset to guarantee consistent volume

                    // Soft White Noise Buffer for a consistent paper rustle
                    const bufferSize = audioCtx.sampleRate * 0.35;
                    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                    const output = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
                    }

                    const whiteNoise = audioCtx.createBufferSource();
                    whiteNoise.buffer = buffer;

                    const filter = audioCtx.createBiquadFilter();
                    filter.type = 'highpass';
                    filter.frequency.setValueAtTime(1500, now);
                    filter.frequency.exponentialRampToValueAtTime(800, now + 0.25);

                    const noiseGain = audioCtx.createGain();
                    noiseGain.gain.setValueAtTime(0.01, now);
                    noiseGain.gain.linearRampToValueAtTime(0.15, now + 0.02); // Smooth fade-in prevents clipping
                    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

                    whiteNoise.connect(filter);
                    filter.connect(noiseGain);
                    noiseGain.connect(audioCtx.destination);

                    // Dual-Oscillator Setup for a smooth pop
                    const osc1 = audioCtx.createOscillator();
                    const osc1Gain = audioCtx.createGain();

                    osc1.type = 'sine';
                    osc1.frequency.setValueAtTime(220, now);
                    osc1.frequency.exponentialRampToValueAtTime(50, now + 0.2);

                    osc1Gain.gain.setValueAtTime(0.01, now);
                    osc1Gain.gain.linearRampToValueAtTime(0.12, now + 0.02); // Smooth fade-in
                    osc1Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

                    osc1.connect(osc1Gain);
                    osc1Gain.connect(audioCtx.destination);

                    // Trigger all layers concurrently
                    whiteNoise.start(now);
                    whiteNoise.stop(now + 0.35);

                    osc1.start(now);
                    osc1.stop(now + 0.2);

                } catch (e) {
                    console.log("Audio context blocked or unsupported", e);
                }
            }

            function fireRomanticConfetti() {
                playPartyPopperSound();

                const colors = ['#d8b4a0', '#c59b92', '#e3d5ca', '#d4af37', '#d5bdaf', '#f5ebe0'];

                // Left Burst
                confetti({
                    particleCount: 80,
                    angle: 60,
                    spread: 80,
                    origin: { x: 0, y: 0.7 },
                    colors: colors,
                    zIndex: 9999
                });

                // Right Burst
                confetti({
                    particleCount: 80,
                    angle: 120,
                    spread: 80,
                    origin: { x: 1, y: 0.7 },
                    colors: colors,
                    zIndex: 9999
                });
            }
        });
    }

    // Music Toggle Button Event Listener (Play/Pause State)
    if (musicToggleBtn && bgMusic) {
        musicToggleBtn.addEventListener('click', function () {
            if (bgMusic.paused) {
                bgMusic.play();
                musicToggleBtn.classList.add('playing');
            } else {
                bgMusic.pause();
                musicToggleBtn.classList.remove('playing');
            }
        });
    }

    // Floating Petals Generator
    const petalsContainer = document.getElementById('petals');

    if (petalsContainer) {
        const PETAL_COUNT = 20;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!prefersReducedMotion) {
            for (let i = 0; i < PETAL_COUNT; i++) {
                const petal = document.createElement('div');
                petal.classList.add('petal');

                const size = Math.random() * 8 + 8;
                const duration = Math.random() * 20 + 35;
                const delay = -Math.random() * duration;
                const opacity = (Math.random() * 0.4 + 0.3).toFixed(2);

                const rotStart = Math.random() * 360;
                const rotEnd = rotStart + (Math.random() * 720 - 360);
                const drift = Math.random() * 80 - 40;

                petal.style.setProperty('--left', `${Math.random() * 100}%`);
                petal.style.setProperty('--size', `${size}px`);
                petal.style.setProperty('--duration', `${duration}s`);
                petal.style.setProperty('--delay', `${delay}s`);
                petal.style.setProperty('--opacity', opacity);
                petal.style.setProperty('--drift', `${drift}px`);
                petal.style.setProperty('--rot-start', `${rotStart}deg`);
                petal.style.setProperty('--rot-end', `${rotEnd}deg`);

                petalsContainer.appendChild(petal);
            }

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    petalsContainer.style.display = 'none';
                } else {
                    petalsContainer.style.display = 'block';
                }
            });
        }
    }
});

function scrollToNextSection(element) {
    const currentSection = element.closest('section') || element.parentElement;
    let nextSection = currentSection.nextElementSibling;

    // Loop through subsequent siblings to find the next visible section
    while (nextSection) {
        if (window.getComputedStyle(nextSection).display !== 'none') {
            break;
        }
        nextSection = nextSection.nextElementSibling;
    }

    if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Countdown Timer — Target: 24 Oct 2026, 8:00 AM (Start of the wedding ceremony)
var target = new Date("2026-10-24T08:00:00+05:30").getTime();

// End of the wedding day / ceremony window (24 Oct 2026, 23:59:59 IST)
var endOfDayTarget = new Date("2026-10-24T23:59:59+05:30").getTime();

// Helper function to update elements with an advanced slide/fade animation if value changes
function updateDigit(elementId, newValue) {
    var el = document.getElementById(elementId);
    if (!el) return;

    var formattedValue = String(newValue).padStart(2, '0');

    if (el.textContent !== formattedValue) {
        el.classList.add('tick-animate');
        setTimeout(() => {
            el.textContent = formattedValue;
            el.classList.remove('tick-animate');
        }, 180); // Halfway through transition
    }
}

function tick() {
    var now = Date.now();

    // If the wedding day (Oct 24) is completely over, hide the whole section
    if (now > endOfDayTarget) {
        var wrap = document.getElementById('countdown-wrap');
        if (wrap) wrap.style.display = 'none';
        return;
    }

    // If today is the wedding day (Oct 24), show the special message, update titles, and hide the timer
    if (now >= target) {
        var countdownEl = document.getElementById('countdown');
        if (countdownEl) countdownEl.style.display = 'none';

        var eyebrowEl = document.getElementById('section-eyebrow');
        if (eyebrowEl) eyebrowEl.textContent = "THE SPECIAL DAY";

        var titleEl = document.getElementById('section-title');
        if (titleEl) titleEl.style.display = 'none';

        var messageEl = document.getElementById('countdown-expired-message');
        if (messageEl) {
            messageEl.style.display = 'block';
            messageEl.classList.add('in');
        }
        return;
    }

    // Standard Countdown before the wedding day arrives
    var diff = target - now;
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);

    updateDigit('cd-days', d);
    updateDigit('cd-hours', h);
    updateDigit('cd-mins', m);
    updateDigit('cd-secs', s);
}

tick();
var timerInterval = setInterval(tick, 1000);

// Scroll Intersection Observer for smooth reveal
var revealEls = document.querySelectorAll('.reveal');
var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); }
    });
}, { threshold: 0.15 });
revealEls.forEach(function (el) { io.observe(el); });

// Advanced Dynamic Google Calendar & ICS Link Generator
const createAdvancedCalendarLink = (() => {
    const formatDate = (isoString) => isoString.replace(/[-:]/g, '').split('.')[0];

    return (config) => {
        const startTime = formatDate(config.startTime);
        const endTime = formatDate(config.endTime);

        const googleParams = new URLSearchParams({
            action: 'TEMPLATE',
            text: config.title,
            details: config.description,
            location: config.location,
            dates: `${startTime}/${endTime}`
        });

        const icsData = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            `SUMMARY:${config.title}`,
            `DESCRIPTION:${config.description.replace(/\n/g, '\\n')}`,
            `LOCATION:${config.location}`,
            `DTSTART:${startTime}`,
            `DTEND:${endTime}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        return {
            google: `https://calendar.google.com/calendar/render?${googleParams.toString()}`,
            ics: `data:text/calendar;charset=utf-8,${encodeURIComponent(icsData)}`
        };
    };
})();

// Wedding Event Links Generation
const weddingEvent = createAdvancedCalendarLink({
    title: "Sreelakshmi & Sooryajith — Wedding Ceremony",
    description: "Join us as we tie the knot!",
    location: "Enayat Convention Center, Arikkanchira, Tirur",
    startTime: "2026-10-24T11:00:00",
    endTime: "2026-10-24T14:00:00"
});

const receptionEvent = createAdvancedCalendarLink({
    title: "Sooryajith & Sreelakshmi — Reception",
    description: "Join us for the reception celebration!",
    location: "Enayat Convention Center, Arikkanchira, Tirur",
    startTime: "2026-10-24T17:00:00",
    endTime: "2026-10-24T21:00:00"
});

// Dynamic Element Binding with Multi-Platform Support (Google / ICS Fallback)
const bindCalendarElement = (elementId, eventData) => {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.href = eventData.google;

    // Optional enhancement for mobile devices or direct download preference
    el.addEventListener('click', (e) => {
        if (navigator.userAgent.match(/(iPhone|iPod|iPad).*AppleWebKit/i)) {
            e.preventDefault();
            const downloadAnchor = document.createElement('a');
            downloadAnchor.href = eventData.ics;
            downloadAnchor.download = `${elementId}.ics`;
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        }
    });
};

bindCalendarElement('cal-wedding', weddingEvent);
bindCalendarElement('cal-reception', receptionEvent);

/* --- Interactive Floating Heart Cursor Trail --- */
(function createHeartTrail() {
    const hearts = ['✨', '💖', '🌸', '✨', '🤍'];

    function createParticle(x, y) {
        const particle = document.createElement('span');
        particle.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        particle.style.cssText = `
                    position: fixed;
                    left: ${x}px;
                    top: ${y}px;
                    font-size: ${Math.random() * 12 + 10}px;
                    pointer-events: none;
                    z-index: 99999;
                    opacity: 0.9;
                    transform: translate(-50%, -50%) scale(1);
                    transition: transform 1.2s ease-out, opacity 1.2s ease-out;
                    filter: drop-shadow(0 0 6px rgba(234, 196, 158, 0.8));
                `;
        document.body.appendChild(particle);

        requestAnimationFrame(() => {
            const translateY = -(Math.random() * 50 + 30);
            const translateX = (Math.random() - 0.5) * 40;
            particle.style.transform = `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) scale(0.3)`;
            particle.style.opacity = '0';
        });

        setTimeout(() => particle.remove(), 1200);
    }

    let lastTime = 0;
    window.addEventListener('mousemove', (e) => {
        if (Date.now() - lastTime > 60) { // Limit density for smooth performance
            createParticle(e.clientX, e.clientY);
            lastTime = Date.now();
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches[0] && Date.now() - lastTime > 60) {
            createParticle(e.touches[0].clientX, e.touches[0].clientY);
            lastTime = Date.now();
        }
    });
})();