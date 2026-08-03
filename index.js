document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       MOBILE MENU TOGGLE
       ========================================================================== */
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    const toggleMenu = () => {
        hamburgerBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    };

    const closeMenu = () => {
        hamburgerBtn.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
    };

    hamburgerBtn.addEventListener('click', toggleMenu);
    navLinks.forEach(link => link.addEventListener('click', closeMenu));


    /* ==========================================================================
       TYPEWRITER ANIMATION (HERO SECTION)
       ========================================================================== */
    const typingTextElement = document.getElementById('typing-text');
    const professions = [
        'Full-Stack Developer',
        'Python Developer',
        'Backend Developer',
        'Systems Integrator'
    ];

    let professionIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    const handleTypewriter = () => {
        const currentProfession = professions[professionIndex];

        if (isDeleting) {
            // Delete character
            typingTextElement.textContent = currentProfession.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50; // Delete faster
        } else {
            // Type character
            typingTextElement.textContent = currentProfession.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100; // Normal typing speed
        }

        // Handle states
        if (!isDeleting && charIndex === currentProfession.length) {
            isDeleting = true;
            typeSpeed = 1500; // Pause at end of word
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            professionIndex = (professionIndex + 1) % professions.length;
            typeSpeed = 500; // Pause before typing next word
        }

        setTimeout(handleTypewriter, typeSpeed);
    };

    // Start typewriter
    if (typingTextElement) {
        setTimeout(handleTypewriter, 1000);
    }


    /* ==========================================================================
       NAVBAR SCROLL SHADOW & LINK HIGHLIGHTING
       ========================================================================== */
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section');

    const handleNavbarScroll = () => {
        // Shadow toggle
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active link highlighting
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    };

    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll(); // Run once initially


    /* ==========================================================================
       SCROLL REVEAL & INTERSECT ENGINE
       ========================================================================== */
    const scrollRevealItems = document.querySelectorAll('.scroll-reveal, .scroll-reveal-item');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    scrollRevealItems.forEach(item => revealObserver.observe(item));


    /* ==========================================================================
       SKILL PROGRESS BARS ANIMATION
       ========================================================================== */
    const skillsSection = document.getElementById('skills');
    const skillFills = document.querySelectorAll('.skill-fill');

    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                skillFills.forEach(fill => {
                    const width = fill.getAttribute('data-width');
                    fill.style.width = width;
                });
                skillsObserver.unobserve(skillsSection); // Animate only once
            }
        });
    }, {
        threshold: 0.2
    });

    if (skillsSection) {
        skillsObserver.observe(skillsSection);
    }


    /* ==========================================================================
       PROJECT DETAIL MODALS & POPUPS
       ========================================================================== */
    const modalButtons = document.querySelectorAll('[data-project]');
    const modals = document.querySelectorAll('.modal-overlay');
    const closeButtons = document.querySelectorAll('.modal-close');
    const successOkBtn = document.querySelector('.success-ok-btn');
    const successModal = document.getElementById('modal-success');

    const openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('no-scroll');
        }
    };

    const closeModal = (modal) => {
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll');
    };

    modalButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projectKey = btn.getAttribute('data-project');
            openModal(`modal-${projectKey}`);
        });
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = btn.closest('.modal-overlay');
            closeModal(modal);
        });
    });

    // Close on overlay clicking
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    if (successOkBtn && successModal) {
        successOkBtn.addEventListener('click', () => {
            closeModal(successModal);
        });
    }


    /* ==========================================================================
       CONTACT FORM HANDLING (MOCK SUBMISSION)
       ========================================================================== */
    const contactForm = document.getElementById('portfolio-contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;

            // Update button UI to loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span>Sending...</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning-icon"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M4 12a8 8 0 0 1 8-8"></path></svg>
            `;

            // CSS Spinner styling injected if not defined
            if (!document.getElementById('spin-keyframes')) {
                const style = document.createElement('style');
                style.id = 'spin-keyframes';
                style.innerHTML = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .spinning-icon {
                        animation: spin 1s linear infinite;
                    }
                    .no-scroll {
                        overflow: hidden;
                    }
                `;
                document.head.appendChild(style);
            }

            // Real submission via Web3Forms API
            const formData = new FormData(contactForm);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
                .then(async (response) => {
                    const json = await response.json();
                    if (response.status === 200) {
                        // Show Success Modal
                        openModal('modal-success');
                        // Reset form fields
                        contactForm.reset();
                    } else {
                        console.error(json);
                        alert(json.message || "Failed to send message. Please check your access key.");
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert("Form submission failed due to a network error. Please try again.");
                })
                .finally(() => {
                    // Restore button state
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                });
        });
    }

    /* ==========================================================================
       MOUSE MOVING, CUSTOM CURSOR, & HOVER 3D TILT EFFECTS
       ========================================================================== */
    const mouseGlow = document.getElementById('mouseGlow');
    const customCursor = document.getElementById('customCursor');
    const cursorFollower = document.getElementById('cursorFollower');

    // Mouse Tracking (Custom Cursor & Glow Spotlight)
    if (customCursor && cursorFollower) {
        // Set initial visibility
        customCursor.style.opacity = '0';
        cursorFollower.style.opacity = '0';

        let lastX = 0;
        let lastY = 0;
        let lastTime = Date.now();

        window.addEventListener('mousemove', (e) => {
            // Make cursors visible on first move
            customCursor.style.opacity = '1';
            cursorFollower.style.opacity = '1';

            // Positioning elements
            customCursor.style.left = `${e.clientX}px`;
            customCursor.style.top = `${e.clientY}px`;

            cursorFollower.style.left = `${e.clientX}px`;
            cursorFollower.style.top = `${e.clientY}px`;

            if (mouseGlow) {
                mouseGlow.style.opacity = '1';
                mouseGlow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;

                // Calculate velocity to splash scale the backlight!
                const now = Date.now();
                const dt = now - lastTime;
                if (dt > 15) {
                    const dx = e.clientX - lastX;
                    const dy = e.clientY - lastY;
                    const speed = Math.sqrt(dx * dx + dy * dy) / dt;

                    // Base size 250px up to 420px splash on high velocity
                    const size = Math.min(250 + speed * 120, 420);
                    mouseGlow.style.width = `${size}px`;
                    mouseGlow.style.height = `${size}px`;

                    lastX = e.clientX;
                    lastY = e.clientY;
                    lastTime = now;
                }
            }
        });

        window.addEventListener('click', (e) => {
            // Spreading circle ripple effect
            cursorFollower.classList.add('clicked');
            setTimeout(() => {
                cursorFollower.classList.remove('clicked');
            }, 400);

            // Fireworks spark burst (8 particles flying out)
            for (let i = 0; i < 8; i++) {
                const spark = document.createElement('div');
                spark.className = 'click-spark';

                // Even distribution around the click point with slight randomness
                const angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
                const distance = 30 + Math.random() * 45;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;

                spark.style.setProperty('--tx', `${tx}px`);
                spark.style.setProperty('--ty', `${ty}px`);
                spark.style.left = `${e.clientX}px`;
                spark.style.top = `${e.clientY}px`;

                document.body.appendChild(spark);

                // Remove the element after animation ends
                setTimeout(() => {
                    spark.remove();
                }, 500);
            }

            // Backlight click splash flash!
            if (mouseGlow) {
                mouseGlow.style.width = '550px';
                mouseGlow.style.height = '550px';
                mouseGlow.style.opacity = '0.95';
                setTimeout(() => {
                    mouseGlow.style.width = '250px';
                    mouseGlow.style.height = '250px';
                    mouseGlow.style.opacity = '1';
                }, 300);
            }
        });

        window.addEventListener('mouseleave', () => {
            customCursor.style.opacity = '0';
            cursorFollower.style.opacity = '0';
            if (mouseGlow) {
                mouseGlow.style.opacity = '0';
            }
        });

        // Scaled cursor state for interactive items
        const hoverTargets = document.querySelectorAll('a, button, .project-card, .skill-logo-card, .social-icon-wrapper, input, textarea');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                customCursor.classList.add('hovered');
                cursorFollower.classList.add('hovered');
            });
            el.addEventListener('mouseleave', () => {
                customCursor.classList.remove('hovered');
                cursorFollower.classList.remove('hovered');
            });
        });
    }

    // 3D Card Hover Tilt Effects (Smooth and Lag-Free)
    const tiltCards = document.querySelectorAll('.project-card, .skill-logo-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // Mouse relative X inside card
            const y = e.clientY - rect.top;  // Mouse relative Y inside card

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate offsets scaled to max ~10 degrees rotation
            const rotateX = ((centerY - y) / centerY) * 10;
            const rotateY = ((x - centerX) / centerX) * 10;

            // Disable transition during active movement to prevent jitter/lag
            card.style.transition = 'none';
            // Apply rotation and subtle lift/scale
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            // Restore smooth transition to return to original state
            card.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
            card.style.transform = '';
        });
    });


    /* ==========================================================================
       INTERACTIVE CLI TERMINAL LOGIC
       ========================================================================== */
    const terminalInput = document.getElementById('terminalInput');
    const terminalOutput = document.getElementById('terminalOutput');
    const terminalBody = document.getElementById('terminalBody');

    if (terminalInput && terminalOutput && terminalBody) {
        // Handle clicking anywhere in the terminal to focus input
        terminalBody.addEventListener('click', () => {
            terminalInput.focus();
        });

        // Set focus initially
        terminalInput.focus();

        const commands = {
            help: `Available commands:
  <span class="term-highlight">about</span>    - Brief overview of Athil Hisham
  <span class="term-highlight">skills</span>   - Professional technical skills list
  <span class="term-highlight">projects</span> - Showcase of retail & IoT projects
  <span class="term-highlight">contact</span>  - Email, Phone and social coordinates
  <span class="term-highlight">clear</span>    - Clear terminal logs
  <span class="term-highlight">print</span>    - Download PDF Resume`,

            about: `Athil Hisham - Software Developer
B.Tech Graduate in Computer Science & Engineering.
Specialized in writing clean Python APIs, backend systems, full-stack Angular applications, computer vision models, and IoT prototypes.`,

            skills: `Technical Skills:
  • Languages: Python (90%), Java (75%), C/C++ (70%)
  • Web & Backend: FastAPI, Flask, REST APIs, HTML5, CSS3, JS, Angular
  • Databases & Cloud: MongoDB Atlas, Firebase Firestore
  • AI & CV: YOLOv8, OpenCV
  • Embedded & Tools: Raspberry Pi, Git, GitHub`,

            projects: `Key Projects:
  1. <span class="term-highlight">Cartify GnG</span> - Smart shopping cart system integrated with Raspberry Pi, load cells, and a YOLOv8 AI object scanner for automated checkout.
  2. <span class="term-highlight">Grab & Go</span> - Supermarket assistant web app with real-time synchronized shopping lists and pathfinding.`,

            contact: `Get In Touch:
  • Email: athilhishamcym@gmail.com
  • Phone: +91 8943544897
  • GitHub: github.com/OxxY-ScoobY
  • LinkedIn: linkedin.com/in/athil-hisham`,

            print: `Downloading PDF Resume...`
        };

        const processCommand = (cmdText) => {
            const cleanCmd = cmdText.trim().toLowerCase();
            let response = '';

            if (cleanCmd === '') return;

            if (cleanCmd === 'clear') {
                terminalOutput.innerHTML = '';
                return;
            }

            if (cleanCmd === 'print') {
                setTimeout(() => {
                    const link = document.createElement('a');
                    link.href = 'Athil_Hisham_Resume.pdf';
                    link.download = 'Athil_Hisham_Resume.pdf';
                    link.click();
                }, 500);
            }

            if (commands.hasOwnProperty(cleanCmd)) {
                response = commands[cleanCmd];
            } else {
                response = `Command not found: '${cleanCmd}'. Type <span class="term-highlight">help</span> for a list of valid commands.`;
            }

            // Output the command entered
            const line = document.createElement('div');
            line.className = 'terminal-response-line';
            line.innerHTML = `
                <div class="terminal-response-cmd">guest@athilhisham:~$ ${cmdText}</div>
                <div class="terminal-response-output">${response}</div>
            `;
            terminalOutput.appendChild(line);

            // Auto scroll to bottom
            terminalBody.scrollTop = terminalBody.scrollHeight;
        };

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Stop newline creation in contenteditable
                const text = terminalInput.textContent;
                terminalInput.textContent = '';
                processCommand(text);
            }
        });
    }


    /* ==========================================================================
       PROJECTS FILTER LOGIC
       ========================================================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');

                if (filterValue === 'all' || category === filterValue) {
                    card.classList.remove('filtered-out');
                } else {
                    card.classList.add('filtered-out');
                }
            });
        });
    });


    /* ==========================================================================
       SCROLL-ACTIVATED TYPING EFFECTS ON SECTION TITLES
       ========================================================================== */
    const startTypingEffect = (element) => {
        if (element.classList.contains('typing-started')) return;
        element.classList.add('typing-started');
        const originalText = element.textContent.trim();
        element.textContent = '';
        let index = 0;

        const typeChar = () => {
            if (index < originalText.length) {
                element.textContent += originalText.charAt(index);
                index++;
                setTimeout(typeChar, 60); // Speed of typing (60ms)
            }
        };
        typeChar();
    };

    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startTypingEffect(entry.target);
                titleObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.8,
        rootMargin: '0px 0px -20px 0px'
    });

    document.querySelectorAll('.section-title').forEach(title => {
        titleObserver.observe(title);
    });


    /* ==========================================================================
       ENHANCED SCROLL PROGRESS (WITHOUT BACKGROUND PARALLAX)
       ========================================================================== */
    const scrollProgress = document.getElementById('scrollProgress');

    const handleScrollEffects = () => {
        const scrollY = window.scrollY;

        // Update Scroll Progress Bar
        if (scrollProgress) {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = totalHeight > 0 ? (scrollY / totalHeight) * 100 : 0;
            scrollProgress.style.width = `${scrollPercent}%`;
        }
    };

    window.addEventListener('scroll', handleScrollEffects);
    handleScrollEffects(); // Trigger once on mount
});
