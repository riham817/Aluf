// =============================================
// Central Audio System
// =============================================
function playQuack() {
    try {
        const audio = new Audio('assets/pack.mp3');
        audio.currentTime = 0;
        audio.play().catch(e => {
            console.log("Audio playback notice: 'assets/pack.mp3' waiting for user gesture or not found.");
        });
    } catch (e) {
        console.error("Audio error: ", e);
    }
}

// Global delegated button click sound so even dynamic buttons quack
document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) {
        playQuack();
    }
});


// =============================================
// SPA Page Navigation System
// =============================================
let celebrationTimeout = null;

function triggerBirthdayCelebration() {
    const splash = document.getElementById('birthday-splash');
    if (!splash) return;
    
    if (celebrationTimeout) clearTimeout(celebrationTimeout);
    
    splash.classList.remove('splash-exit');
    splash.classList.add('active');
    
    playQuack();
    fireConfetti();
    setTimeout(fireConfetti, 400);
    setTimeout(fireConfetti, 900);
    
    // Auto dismiss after 4 seconds with smooth exit animation
    celebrationTimeout = setTimeout(() => {
        dismissBirthdaySplash();
    }, 4000);
}

function dismissBirthdaySplash(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (celebrationTimeout) clearTimeout(celebrationTimeout);
    
    const splash = document.getElementById('birthday-splash');
    if (!splash || !splash.classList.contains('active')) return;
    
    splash.classList.add('splash-exit');
    
    setTimeout(() => {
        splash.classList.remove('active');
        splash.classList.remove('splash-exit');
    }, 650);
}

function goToPage(pageNum) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    setTimeout(() => {
        const targetPage = document.getElementById('page-' + pageNum);
        if (targetPage) {
            targetPage.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // If going to Page 2, trigger grand full-screen Happy Birthday celebration
            if (pageNum === 2) {
                triggerBirthdayCelebration();
            }

            // If going to Page 3, trigger memories album start
            if (pageNum === 3) {
                startAlbumAutoplay();
            }
        }
    }, 300);
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex';
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}


// =============================================
// PAGE 1: Slider & Quiz Logic
// =============================================
let currentMessengerSlide = 0;
const messengerTrack = document.getElementById('messenger-track');
const messengerDots = document.getElementById('messenger-dots');

function setMessengerSlide(index) {
    currentMessengerSlide = index;
    if (messengerTrack) {
        messengerTrack.style.transform = `translateX(-${index * 100}%)`;
    }
    if (messengerDots) {
        const dots = messengerDots.querySelectorAll('.dot');
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }
}

// Auto toggle messenger screenshots every 4 seconds
setInterval(() => {
    currentMessengerSlide = (currentMessengerSlide === 0) ? 1 : 0;
    setMessengerSlide(currentMessengerSlide);
}, 4000);

function handleQuiz(name) {
    if (name === 'Mahir') {
        fireConfetti();
        setTimeout(() => {
            goToPage(2);
        }, 1800);
    } else {
        const modalText = document.getElementById('modal-text');
        modalText.innerHTML = `বললাম না বুঝেশুনে ক্লিক করতে <b>${name}</b>!<br>তোর জন্মদিনে এরম Website বানাইছে?! 😤🦆`;
        
        const wrongImg = document.querySelector('#wrong-modal .modal-img');
        if (wrongImg) {
            if (name === 'Munira') {
                wrongImg.src = 'assets/wrong-bestie2.jpg';
            } else {
                wrongImg.src = 'assets/wrong-bestie.jpg';
            }
        }
        
        openModal('wrong-modal');
    }
}


// =============================================
// PAGE 2: Fast Food Trap Logic
// =============================================
let giftClicks = 0;

function handleAcceptGift() {
    giftClicks++;
    const btn = document.getElementById('accept-gift-btn');
    const hint = document.getElementById('gift-hint');

    if (giftClicks === 1 || giftClicks === 2) {
        btn.classList.add('shake');
        setTimeout(() => btn.classList.remove('shake'), 450);
        hint.textContent = ` ${giftClicks} - Are you sure? 🤨`;
    } else if (giftClicks >= 3) {
        hint.textContent = "";
        openModal('fat-modal');
        giftClicks = 0; // Reset
    }
}

function handleDeclineGift() {
    openModal('angry-modal');
}


// =============================================
// PAGE 3: Memories Album (1 Image at a Time + Individual Caption)
// =============================================
const memories = [
    {
        src: 'assets/aed7da8c-f2f4-4af9-8ec5-9d37efbc487f.jpg',
        fallback: 'assets/gallery1.jpg',
        tag: 'মাহির আর আলুফ',
        caption: '🌸',
    },
    {
        src: 'assets/1b216ad8-65a0-4c77-828c-14930740b2a1.jpg',
        fallback: 'assets/gallery2.jpg',
        tag: 'খাওয়া দাওয়া করা আলুফ',
        caption: '💜',
    },
    {
        src: 'assets/0a12c563-9b2f-45d8-8b20-62a61c7958c2.jpg',
        fallback: 'assets/gallery3.jpg',
        tag: 'ছেলে আলুফ',
        caption: '✨',
    },
    {
        src: 'assets/402e8f24-8409-44c8-adb1-d9251731d2a9.jpg',
        fallback: 'assets/gallery4.jpg',
        tag: 'দেখ আলুফ',
        caption: '❤️',
    },
    {
        src: 'assets/225e78e8-9152-4b6a-8003-fc3dae311607.jpg',
        fallback: 'assets/gallery5.jpg',
        tag: 'গলায় থাক আলুফ',
        caption: '😂',
    },
    {
        src: 'assets/c4fd7378-d2f3-471d-b4a7-d89056fc191e.jpg',
        fallback: 'assets/gallery1.jpg',
        tag: 'নাচতে থাকা আলুফ',
        caption: '🎉',
    }
];

let currentMemoryIndex = 0;
let albumTimer = null;
let autoplayProgress = 0;
let progressInterval = null;
const AUTOPLAY_DELAY = 3800; // 3.8 seconds per photo

function initMemoriesAlbum() {
    const dotsContainer = document.getElementById('carousel-dots');
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        memories.forEach((_, idx) => {
            const dot = document.createElement('span');
            dot.className = 'dot' + (idx === 0 ? ' active' : '');
            dot.onclick = () => showMemory(idx);
            dotsContainer.appendChild(dot);
        });
    }
    showMemory(0);
}

function showMemory(index) {
    if (index < 0) index = memories.length - 1;
    if (index >= memories.length) index = 0;
    currentMemoryIndex = index;

    const data = memories[index];
    const imgEl = document.getElementById('memory-image');
    const tagEl = document.getElementById('memory-tag');
    const captionEl = document.getElementById('memory-caption');
    const counterEl = document.getElementById('memory-counter');

    if (imgEl) {
        imgEl.style.opacity = '0';
        imgEl.style.transform = 'scale(0.96)';
        setTimeout(() => {
            imgEl.src = data.src;
            imgEl.onerror = function() {
                this.src = data.fallback;
            };
            imgEl.style.opacity = '1';
            imgEl.style.transform = 'scale(1)';
        }, 200);
    }

    if (tagEl) tagEl.textContent = data.tag;
    if (captionEl) captionEl.textContent = data.caption;
    if (counterEl) counterEl.textContent = `${index + 1} / ${memories.length}`;

    // Update active dot
    const dots = document.querySelectorAll('#carousel-dots .dot');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));

    resetAutoplayTimer();
}

function nextMemory() {
    showMemory(currentMemoryIndex + 1);
}

function prevMemory() {
    showMemory(currentMemoryIndex - 1);
}

function resetAutoplayTimer() {
    clearInterval(progressInterval);
    clearTimeout(albumTimer);
    autoplayProgress = 0;
    const bar = document.getElementById('autoplay-bar');
    if (bar) bar.style.width = '0%';

    const stepTime = 50;
    const stepIncrement = (stepTime / AUTOPLAY_DELAY) * 100;

    progressInterval = setInterval(() => {
        autoplayProgress += stepIncrement;
        if (bar) bar.style.width = Math.min(autoplayProgress, 100) + '%';
        if (autoplayProgress >= 100) {
            clearInterval(progressInterval);
            nextMemory();
        }
    }, stepTime);
}

function startAlbumAutoplay() {
    initMemoriesAlbum();
    resetAutoplayTimer();
}

// Pause autoplay on hovering the album card
const albumCard = document.getElementById('memory-album-card');
if (albumCard) {
    albumCard.addEventListener('mouseenter', () => {
        clearInterval(progressInterval);
    });
    albumCard.addEventListener('mouseleave', () => {
        resetAutoplayTimer();
    });
}


// =============================================
// PAGE 3: Escaping Treat Buttons & Gulshan Reveal
// =============================================
const runawayBtns = document.querySelectorAll('.runaway-btn');
const treatContainer = document.getElementById('treat-container');

function evadeCursor(e) {
    const btn = e.target.closest('.runaway-btn');
    if (!btn || !treatContainer) return;

    const cRect = treatContainer.getBoundingClientRect();
    const bWidth = btn.offsetWidth;
    const bHeight = btn.offsetHeight;

    const maxX = cRect.width - bWidth - 20;
    const maxY = cRect.height - bHeight - 20;

    const randomX = Math.max(10, Math.floor(Math.random() * maxX));
    const randomY = Math.max(10, Math.floor(Math.random() * maxY));

    btn.style.position = 'absolute';
    btn.style.left = randomX + 'px';
    btn.style.top = randomY + 'px';
    btn.style.transition = 'left 0.15s ease-out, top 0.15s ease-out';
}

runawayBtns.forEach(btn => {
    btn.addEventListener('mouseenter', evadeCursor);
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        evadeCursor(e);
    }, { passive: false });
});

function handleTreatSuccess() {
    fireConfetti();
    const reveal = document.getElementById('treat-reveal');
    if (reveal) {
        reveal.classList.add('visible');
        setTimeout(() => {
            reveal.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
    }
}


// =============================================
// Canvas Duck Confetti Explosion System
// =============================================
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];
let animationTimer = null;

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createParticles() {
    particles = [];
    const colors = ['#FFD23F', '#FF914D', '#FF6584', '#FFE169', '#FFFFFF'];
    
    for (let i = 0; i < 110; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            r: Math.random() * 8 + 5,
            dx: Math.random() * 24 - 12,
            dy: Math.random() * 24 - 14,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleInc: (Math.random() * 0.08) + 0.04,
            tiltAngle: 0,
            isDuck: Math.random() > 0.65 // Duck emoji or confetti ribbon
        });
    }
}

function drawConfetti() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = 0;

    particles.forEach(p => {
        p.tiltAngle += p.tiltAngleInc;
        p.y += (Math.cos(p.tiltAngle) + 1 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle) * 2;
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.25; // Gravity

        if (p.y <= canvas.height) {
            activeParticles++;
            if (p.isDuck) {
                ctx.font = "26px Arial";
                ctx.fillText("🦆", p.x, p.y);
            } else {
                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
                ctx.stroke();
            }
        }
    });

    if (activeParticles > 0) {
        animationTimer = requestAnimationFrame(drawConfetti);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function fireConfetti() {
    if (!canvas) return;
    if (animationTimer) cancelAnimationFrame(animationTimer);
    createParticles();
    drawConfetti();
}

// Initial initialization
document.addEventListener('DOMContentLoaded', () => {
    initMemoriesAlbum();
});
