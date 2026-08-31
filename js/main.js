
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. STAGE TIMINGS (Manual scroll for first 2 images) ---
    const stages = {
        ganesh: document.getElementById('stage-ganesh'),
        shiv: document.getElementById('stage-shiv'),
        envelope: document.getElementById('stage-envelope'),
        main: document.getElementById('stage-main')
    };
    
    let currentStage = 'ganesh'; // Track which stage we're on
    let isTransitioning = false; // Prevent rapid transitions
    
    // Manual navigation for Ganesh & Shiv Parvati stages
    function navigateToNextStage() {
        if (isTransitioning) return;
        isTransitioning = true;
        
        if (currentStage === 'ganesh') {
            stages.ganesh.classList.add('hidden');
            // Wait for fade out before showing next
            setTimeout(() => {
                stages.shiv.classList.remove('hidden');
                currentStage = 'shiv';
                isTransitioning = false;
            }, 400);
        } else if (currentStage === 'shiv') {
            stages.shiv.classList.add('hidden');
            setTimeout(() => {
                stages.envelope.classList.remove('hidden');
                currentStage = 'envelope';
                isTransitioning = false;
            }, 400);
        }
    }
    
    // Smooth scroll detection for manual advancement
    let lastScrollTime = 0;
    window.addEventListener('wheel', (e) => {
        if ((currentStage === 'ganesh' || currentStage === 'shiv') && !isTransitioning) {
            const now = Date.now();
            if (now - lastScrollTime > 500) { // Smooth debounce
                if (e.deltaY > 0) { // Scroll down
                    navigateToNextStage();
                    lastScrollTime = now;
                }
            }
        }
    }, { passive: true });
    
    // Touch swipe detection for mobile
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    window.addEventListener('touchend', (e) => {
        if (isTransitioning || (currentStage !== 'ganesh' && currentStage !== 'shiv')) return;
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;
        if (Math.abs(diff) > 50) { // Swipe threshold
            if (diff > 0) { // Swipe up (scroll down equivalent)
                navigateToNextStage();
            }
        }
    }, { passive: true });

    // --- 2. ENVELOPE (Perfect Mechanics) ---
    const envTrigger = document.getElementById('envelope-trigger');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    let envelopeOpened = false;

    envTrigger.addEventListener('click', () => {
        if (envelopeOpened) return;
        envelopeOpened = true;
        
        document.querySelector('.tap-hint').style.opacity = '0';
        // Triggers the CSS 3D Rotation and Slide Up
        envTrigger.classList.add('open');
        
        bgMusic.play().catch(() => console.log("Audio requires user interaction first."));
        musicToggle.classList.remove('hidden');
        
        // Wait for card to fully slide up (1.2s transition), then fade screen
        setTimeout(() => {
            stages.envelope.classList.add('hidden');
            setTimeout(() => {
                stages.main.classList.remove('hidden');
                currentStage = 'main';
                initScrollObserver();
                startRSVPTimer();
            }, 400);
        }, 1600);
    });

    // Music control
    let isPlaying = true;
    musicToggle.addEventListener('click', () => {
        if(isPlaying) { bgMusic.pause(); musicToggle.innerText = '🔇'; }
        else { bgMusic.play(); musicToggle.innerText = '🎵'; }
        isPlaying = !isPlaying;
    });
    
    // --- 2b. COUPLE PHOTO SLIDESHOW ---
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 3000); // Changes every 3 seconds
    }

    // --- 3. SCROLL REVEALS ---
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

    // --- 4. SCRATCH CARD (High Contrast) ---
    const canvas = document.getElementById('scratch-card');
    const ctx = canvas.getContext('2d');
    const wrapper = document.querySelector('.scratch-wrapper');
    
    function initScratch() {
        canvas.width = wrapper.offsetWidth;
        canvas.height = wrapper.offsetHeight;
        
        ctx.fillStyle = '#E8EDE7'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '700 18px Lato';
        ctx.fillStyle = '#7A868C';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SCRATCH TO REVEAL', canvas.width/2, canvas.height/2);
    }
    
    setTimeout(initScratch, 100);

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
    canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, {passive: false});
    canvas.addEventListener('touchmove', scratch, {passive: false});
    canvas.addEventListener('touchend', () => { isDrawing = false; checkScratch(); });

    function checkScratch() {
        if (scratched) return;
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let transparent = 0;
        for (let i = 3; i < imgData.data.length; i += 4) {
            if (imgData.data[i] === 0) transparent++;
        }
        if ((transparent / (canvas.width * canvas.height)) * 100 > 45) {
            scratched = true;
            canvas.style.transition = 'opacity 1s ease';
            canvas.style.opacity = '0';
            
            setTimeout(() => { 
                canvas.style.display = 'none'; 
                document.getElementById('countdown-section').classList.remove('hidden-initial');
                document.getElementById('events-section').classList.remove('hidden-initial');
                setTimeout(() => {
                    document.getElementById('countdown-section').classList.add('visible');
                    document.getElementById('events-section').querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
                }, 50);
                startCountdown();
            }, 1000);
        }
    }

    // --- 5. COUNTDOWN ---
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

    // --- 6. FORMS & LOGIC ---
    
    // Main Form Elements
    const rsvpRadios = document.querySelectorAll('#rsvp-form input[name="response"]');
    const rsvpDetails = document.getElementById('rsvp-details');
    const guestCounter = document.getElementById('guest-counter');
    const nameInput = document.querySelector('#rsvp-details input[name="name"]');
    const guestCountInput = document.getElementById('guest-count');
    
    // Popup Form Elements (New features added based on feedback)
    const popRadios = document.querySelectorAll('#popup-form input[name="response"]');
    const popGuestCounter = document.getElementById('pop-guest-counter');
    const popGuestCountInput = document.getElementById('guest-count-pop');
    
    // Counters Logic
    document.getElementById('btn-minus').addEventListener('click', () => {
        let val = parseInt(guestCountInput.value);
        if(val > 1) guestCountInput.value = val - 1;
    });
    document.getElementById('btn-plus').addEventListener('click', () => {
        let val = parseInt(guestCountInput.value);
        if(val < 10) guestCountInput.value = val + 1;
    });
    
    document.getElementById('btn-minus-pop').addEventListener('click', () => {
        let val = parseInt(popGuestCountInput.value);
        if(val > 1) popGuestCountInput.value = val - 1;
    });
    document.getElementById('btn-plus-pop').addEventListener('click', () => {
        let val = parseInt(popGuestCountInput.value);
        if(val < 10) popGuestCountInput.value = val + 1;
    });

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

    document.getElementById('rsvp-form').addEventListener('submit', (e) => {
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

    document.getElementById('popup-form').addEventListener('submit', (e) => {
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

    // --- 7. POPUP LOGIC ---
    const rsvpModal = document.getElementById('rsvp-modal');
    document.getElementById('close-modal').addEventListener('click', () => rsvpModal.classList.add('hidden-initial'));

    function startRSVPTimer() {
        setTimeout(() => {
            if(!localStorage.getItem('rsvpSubmitted') && !sessionStorage.getItem('rsvpPopupShown')) {
                const rect = document.getElementById('rsvp-anchor').getBoundingClientRect();
                if(!(rect.top >= 0 && rect.bottom <= window.innerHeight + 200)) {
                    rsvpModal.classList.remove('hidden-initial');
                    sessionStorage.setItem('rsvpPopupShown', 'true');
                }
            }
        }, 30000);
    }
});
