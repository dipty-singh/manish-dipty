document.addEventListener('DOMContentLoaded', () => {

    // Prevent browser from remembering previous scroll position & force page top
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            easing: 'ease-out',
            duration: 800,
            offset: 100
        });
    }

    // ==========================================
    // 1. AUDIO & MUSIC CONTROL (Global Unlock)
    // ==========================================
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    let isPlaying = false;

    if (musicToggle) {
        musicToggle.classList.remove('hidden');
    }

    function attemptPlayAudio() {
        if (!bgMusic || isPlaying) return;

        bgMusic.play().then(() => {
            isPlaying = true;
            if (musicToggle) musicToggle.innerText = '🎵';
            removeUnlockListeners();
        }).catch(() => {
            isPlaying = false;
        });
    }

    // 1. Try playing immediately on load
    attemptPlayAudio();

    // 2. Strict Tap-Only Unlock Events (Removed 'scroll' and 'wheel' for Android compatibility)
    const unlockEvents = ['pointerdown', 'touchstart', 'click'];

    function handleFirstUserGesture() {
        attemptPlayAudio();
    }

    function removeUnlockListeners() {
        unlockEvents.forEach(eventType => {
            window.removeEventListener(eventType, handleFirstUserGesture);
        });
    }

    // Attach listeners for direct tap inputs anywhere on screen
    unlockEvents.forEach(eventType => {
        window.addEventListener(eventType, handleFirstUserGesture);
    });

    // 3. Manual Toggle Button Click Handler
    if (musicToggle) {
        musicToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (bgMusic) {
                if (isPlaying) {
                    bgMusic.pause();
                    musicToggle.innerText = '🔇';
                    isPlaying = false;
                } else {
                    bgMusic.play();
                    musicToggle.innerText = '🎵';
                    isPlaying = true;
                }
            }
        });
    }

    // ==========================================
    // 2. SCRATCH CARD SETUP (Global Scope)
    // ==========================================
    const canvas = document.getElementById('scratch-card');
    let initScratch = () => {};

    if (canvas) {
        const ctx = canvas.getContext('2d');
        const wrapper = document.querySelector('.scratch-wrapper');

        initScratch = function() {
            if (!wrapper || wrapper.offsetWidth === 0) return;

            canvas.width = wrapper.offsetWidth;
            canvas.height = wrapper.offsetHeight;

            ctx.fillStyle = '#E8EDE7';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = '700 18px Lato';
            ctx.fillStyle = '#7A868C';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SCRATCH TO REVEAL', canvas.width / 2, canvas.height / 2);
        };

        let isDrawing = false, scratched = false;

        const getCoords = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return { x: clientX - rect.left, y: clientY - rect.top };
        };

        const scratch = (e) => {
            if (!isDrawing) return;
            e.preventDefault();
            const { x, y } = getCoords(e);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 22, 0, Math.PI * 2);
            ctx.fill();
        };

        canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
        canvas.addEventListener('mousemove', scratch);
        canvas.addEventListener('mouseup', () => { isDrawing = false; checkScratch(); });
        canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, { passive: false });
        canvas.addEventListener('touchmove', scratch, { passive: false });
        canvas.addEventListener('touchend', () => { isDrawing = false; checkScratch(); });

        function checkScratch() {
                    if (scratched) return;
                    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    let transparent = 0;
                    for (let i = 3; i < imgData.data.length; i += 4) {
                        if (imgData.data[i] === 0) transparent++;
                    }
                    if ((transparent / (canvas.width * canvas.height)) * 100 > 35) {
                        scratched = true;
                        canvas.style.transition = 'opacity 0.8s ease';
                        canvas.style.opacity = '0';

                        setTimeout(() => {
                            canvas.style.display = 'none';

                            const flowOrder = [
                                'countdown-section',
                                'events-section',
                                'story-section',
                                'rsvp-anchor',
                                'couple-section'
                            ];

                            // 1. Unhide all sections
                            flowOrder.forEach(id => {
                                const sec = document.getElementById(id);
                                if (sec) {
                                    sec.classList.remove('hidden-initial');
                                }
                            });

                            // 2. Force visibility on inner elements
                            document.querySelectorAll('.fade-up').forEach(el => {
                                el.classList.add('visible');
                            });

                            // 3. Re-sync observers
                            initScrollObserver();
                            if (typeof AOS !== 'undefined') {
                                AOS.refresh();
                            }

                            // 4. Start countdown
                            startCountdown();

                            // 5. Scroll down smoothly by 320px (adjust this number to scroll more or less)
                            window.scrollBy({ top: 320, behavior: 'smooth' });

                        }, 800);
                    }
                }
    }

    // ==========================================
    // 3. ENVELOPE OPENING & TRIGGER
    // ==========================================
    const envTrigger = document.getElementById('envelope-trigger');
    let envelopeOpened = false;

    if (envTrigger) {
        envTrigger.addEventListener('click', () => {
            if (envelopeOpened) return;
            envelopeOpened = true;

            // Fade out the flower shower canvas
            const flowerCanvas = document.getElementById('flower-shower-canvas');
            if (flowerCanvas) {
                flowerCanvas.classList.add('fade-out');
            }

            const tapHint = document.querySelector('.tap-hint');
            if (tapHint) tapHint.style.opacity = '0';

            envTrigger.classList.add('open');

            setTimeout(() => {
                const mainElement = document.getElementById('stage-main');
                if (mainElement) {
                    mainElement.classList.remove('hidden-initial');
                    mainElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

                    // Initialize scratch canvas dimensions now that section is visible
                    if (typeof initScratch === 'function') {
                        initScratch();
                    }
                }
                if (typeof AOS !== 'undefined') {
                    AOS.refresh();
                }
            }, 1400);
        });
    }

    // ==========================================
    // 4. COUPLE PHOTO SLIDESHOW
    // ==========================================
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 3000);
    }

    // ==========================================
    // 5. SCROLL OBSERVER
    // ==========================================
    function initScrollObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    }

    initScrollObserver();

    // ==========================================
    // 6. COUNTDOWN TIMER
    // ==========================================
    function startCountdown() {
        const target = new Date(CONFIG.WEDDING_DATE).getTime();
        setInterval(() => {
            const now = new Date().getTime();
            const diff = target - now;
            if(diff > 0) {
                document.getElementById('cd-days').innerText = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
                document.getElementById('cd-hours').innerText = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
                document.getElementById('cd-mins').innerText = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
                document.getElementById('cd-secs').innerText = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
            }
        }, 1000);
    }

    // ==========================================
    // 7. RSVP FORM HANDLERS
    // ==========================================
    const rsvpRadios = document.querySelectorAll('#rsvp-form input[name="response"]');
    const rsvpDetails = document.getElementById('rsvp-details');
    const guestCounter = document.getElementById('guest-counter');
    const nameInput = document.querySelector('#rsvp-details input[name="name"]');
    const guestCountInput = document.getElementById('guest-count');

    const popRadios = document.querySelectorAll('#popup-form input[name="response"]');
    const popGuestCounter = document.getElementById('pop-guest-counter');
    const popGuestCountInput = document.getElementById('guest-count-pop');

    const btnMinus = document.getElementById('btn-minus');
    if (btnMinus) {
        btnMinus.addEventListener('click', () => {
            let val = parseInt(guestCountInput.value);
            if(val > 1) guestCountInput.value = val - 1;
        });
    }
    const btnPlus = document.getElementById('btn-plus');
    if (btnPlus) {
        btnPlus.addEventListener('click', () => {
            let val = parseInt(guestCountInput.value);
            if(val < 10) guestCountInput.value = val + 1;
        });
    }

    const btnMinusPop = document.getElementById('btn-minus-pop');
    if (btnMinusPop) {
        btnMinusPop.addEventListener('click', () => {
            let val = parseInt(popGuestCountInput.value);
            if(val > 1) popGuestCountInput.value = val - 1;
        });
    }
    const btnPlusPop = document.getElementById('btn-plus-pop');
    if (btnPlusPop) {
        btnPlusPop.addEventListener('click', () => {
            let val = parseInt(popGuestCountInput.value);
            if(val < 10) popGuestCountInput.value = val + 1;
        });
    }

    // Main RSVP Visibility Logic
    rsvpRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            rsvpDetails.classList.remove('hidden-initial');
            nameInput.required = true;
            if(e.target.value === 'Yes') {
                guestCounter.classList.remove('hidden-initial');
            } else {
                guestCounter.classList.add('hidden-initial');
                guestCountInput.value = 1;
            }
        });
    });

    // Popup RSVP Visibility Logic
    popRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if(e.target.value === 'Yes') {
                popGuestCounter.classList.remove('hidden-initial');
            } else {
                popGuestCounter.classList.add('hidden-initial');
                popGuestCountInput.value = 1;
            }
        });
    });

    async function submitData(data, msgElement, formElement) {
        msgElement.className = "msg-box";
        msgElement.classList.remove('hidden-initial');
        msgElement.innerText = "Sending... ✉️";

        try {
            await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(data)
            });
            msgElement.classList.add('success');
            msgElement.innerText = "RSVP Confirmed. Thank you!";
            formElement.reset();
            if(data.source === 'End RSVP') {
                document.getElementById('rsvp-details').classList.add('hidden-initial');
            }
        } catch (error) {
            msgElement.classList.add('error');
            msgElement.innerText = "Error sending RSVP. Please try again.";
        }
    }

    const rsvpForm = document.getElementById('rsvp-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const responseVal = document.querySelector('#rsvp-form input[name="response"]:checked').value;
            const data = {
                type: 'rsvp', source: 'End RSVP',
                name: e.target.name.value.trim(), response: responseVal,
                guestCount: responseVal === 'Yes' ? e.target.guestCount.value : 0
            };
            localStorage.setItem('rsvpSubmitted', 'true');
            submitData(data, document.getElementById('rsvp-msg'), e.target);
        });
    }

    const popupForm = document.getElementById('popup-form');
    if (popupForm) {
        popupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const responseVal = document.querySelector('#popup-form input[name="response"]:checked').value;
            const data = {
                type: 'rsvp', source: 'Popup',
                name: e.target.name.value.trim(), response: responseVal,
                guestCount: responseVal === 'Yes' ? e.target.guestCount.value : 0
            };
            localStorage.setItem('rsvpSubmitted', 'true');
            submitData(data, document.getElementById('popup-msg'), e.target);
            setTimeout(() => document.getElementById('rsvp-modal').classList.add('hidden-initial'), 2000);
        });
    }

    // ==========================================
    // FLOWER & LEAF SHOWER CANVAS ANIMATION
    // ==========================================
    const flowerCanvas = document.getElementById('flower-shower-canvas');

    if (flowerCanvas) {
        const ctx = flowerCanvas.getContext('2d');
        const container = flowerCanvas.parentElement;

        let width = (flowerCanvas.width = container.offsetWidth || window.innerWidth);
        let height = (flowerCanvas.height = container.offsetHeight || window.innerHeight);

        window.addEventListener('resize', () => {
            width = flowerCanvas.width = container.offsetWidth || window.innerWidth;
            height = flowerCanvas.height = container.offsetHeight || window.innerHeight;
        });

        // Pastel Flower & Leaf Color Palettes
//            const flowerColors = [
//                '#F2C4CE', // Cherry blossom pink 🌸
//                '#F7EBE8', // Soft blush
//                '#E8B4B8', // Rose pink
//                '#FAF9F6', // Ivory white
//                '#D4A3A8'  // Warm dusty rose
//            ];

        // Flower Colors (Red, Yellow, Pink, White, Orange + Lighter Shades)
        const flowerColors = [
            // Reds & Light Reds
            '#E63946', // Crimson Red
            '#FF6B6B', // Soft Coral Red
            '#FF8787', // Light Pastel Red

            // Yellows & Light Yellows
            '#FFD166', // Marigold Yellow
            '#FFE699', // Light Pastel Yellow
            '#FFF3BF', // Soft Lemon

            // Pinks & Soft Pinks
            '#FF85A1', // Rose Pink
            '#FFC2D1', // Soft Baby Pink
            '#FFE5EC', // Light Blush Pink

            // Whites & Creams
            '#FFFFFF', // Bright White
            '#FFFDF0', // Creamy Warm White
            '#F8F9FA', // Soft Off-White

            // Oranges & Light Peaches
            '#FF7B00', // Sunset Orange
            '#F4A261', // Peach Orange
            '#FFC09F', // Light Apricot / Pastel Orange
            '#FFE3D8'  // Soft Peach Glow
        ];

        const leafColors = [
            '#A8C3A0', // Soft sage green
            '#B5C9B1', // Light mint sage
            '#8DAA85'  // Muted olive sage
        ];

        const particles = [];
        const particleCount = 45; // Mix of flowers and leaves

        for (let i = 0; i < particleCount; i++) {
            const isLeaf = Math.random() < 0.3; // 30% leaves, 70% flowers
            particles.push({
                type: isLeaf ? 'leaf' : 'flower',
                x: Math.random() * width,
                y: Math.random() * height,
                r: isLeaf ? (Math.random() * 4 + 5) : (Math.random() * 5 + 6),
                speedY: Math.random() * 1.2 + 0.6,
                speedX: Math.random() * 0.8 - 0.4,
                color: isLeaf
                    ? leafColors[Math.floor(Math.random() * leafColors.length)]
                    : flowerColors[Math.floor(Math.random() * flowerColors.length)],
                angle: Math.random() * Math.PI * 2,
                spin: Math.random() * 0.04 - 0.02
            });
        }

        // Draw 🌸 Cherry Blossom Flower
        function drawFlower(ctx, p) {
            const numPetals = 5;
            const petalLength = p.r * 1.8;
            const petalWidth = p.r * 0.85;

            // 5 Notched Petals
            for (let i = 0; i < numPetals; i++) {
                const petalAngle = (i * Math.PI * 2) / numPetals;
                ctx.save();
                ctx.rotate(petalAngle);

                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.88;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                // Outer left curve
                ctx.quadraticCurveTo(-petalWidth, -petalLength * 0.5, -petalWidth * 0.4, -petalLength);
                // Notched tip center (🌸 emoji style)
                ctx.lineTo(0, -petalLength * 0.82);
                ctx.lineTo(petalWidth * 0.4, -petalLength);
                // Outer right curve back to center
                ctx.quadraticCurveTo(petalWidth, -petalLength * 0.5, 0, 0);
                ctx.fill();

                ctx.restore();
            }

            // Gold Pistil Center
            ctx.fillStyle = '#C5A059';
            ctx.globalAlpha = 0.95;
            ctx.beginPath();
            ctx.arc(0, 0, p.r * 0.38, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw Leaf
        function drawLeaf(ctx, p) {
            const length = p.r * 2.2;
            const width = p.r * 0.9;

            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.82;

            // Leaf Body
            ctx.beginPath();
            ctx.moveTo(0, -length);
            ctx.quadraticCurveTo(width, 0, 0, length);
            ctx.quadraticCurveTo(-width, 0, 0, -length);
            ctx.fill();

            // Leaf Center Vein
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -length * 0.8);
            ctx.lineTo(0, length * 0.8);
            ctx.stroke();
        }

        function renderFlowers() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);

                // 3D Flutter/flip effect
                const flipScale = Math.cos(p.angle * 1.2);
                ctx.scale(flipScale, 1);

                if (p.type === 'flower') {
                    drawFlower(ctx, p);
                } else {
                    drawLeaf(ctx, p);
                }

                ctx.restore();

                // Movement physics
                p.y += p.speedY;
                p.x += Math.sin(p.angle) * 0.6 + p.speedX;
                p.angle += p.spin;

                // Reset to top when off-screen
                if (p.y > height + 30) {
                    p.y = -30;
                    p.x = Math.random() * width;
                }
            });

            requestAnimationFrame(renderFlowers);
        }

        renderFlowers();
    }

    // ==========================================
    // 8. POPUP MODAL LOGIC
    // ==========================================
    const rsvpModal = document.getElementById('rsvp-modal');
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', () => rsvpModal.classList.add('hidden-initial'));
    }

    function startRSVPTimer() {
        setTimeout(() => {
            if(!localStorage.getItem('rsvpSubmitted') && !sessionStorage.getItem('rsvpPopupShown')) {
                const anchor = document.getElementById('rsvp-anchor');
                if (anchor) {
                    const rect = anchor.getBoundingClientRect();
                    if(!(rect.top >= 0 && rect.bottom <= window.innerHeight + 200)) {
                        rsvpModal?.classList.remove('hidden-initial');
                        sessionStorage.setItem('rsvpPopupShown', 'true');
                    }
                }
            }
        }, 30000);
    }
    
    startRSVPTimer();
});