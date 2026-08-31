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
            // Browsers block sound until the first user interaction on screen
            isPlaying = false;
        });
    }

    // Attempt autoplay immediately on page load
    attemptPlayAudio();

    // Listeners on window capture phase to start music on ANY initial gesture (touch/scroll/click anywhere)
    const unlockEvents = ['pointerdown', 'touchstart', 'mousedown', 'keydown', 'scroll', 'wheel'];

    function handleFirstUserGesture() {
        attemptPlayAudio();
    }

    function removeUnlockListeners() {
        unlockEvents.forEach(eventType => {
            window.removeEventListener(eventType, handleFirstUserGesture, { capture: true });
        });
    }

    unlockEvents.forEach(eventType => {
        window.addEventListener(eventType, handleFirstUserGesture, { capture: true, passive: true });
    });

    // Toggle button click handler
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
                                'couple-section',
                                'rsvp-anchor'
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