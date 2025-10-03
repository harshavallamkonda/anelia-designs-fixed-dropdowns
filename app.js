// Global variables
let currentStep = 1;
let formData = {};
let heroCarouselInterval;
let projectImageIntervals = {};
let leadCaptureShown = false;
let projectsScrollInterval;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Optimize: Add lazy loading to all images
    // Only set lazy loading for non-project images
    document.querySelectorAll('img:not(.project-image)').forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
    });
    // Force project images to always load
    document.querySelectorAll('.project-image').forEach(img => {
        img.removeAttribute('loading');
        if (img.dataset && img.dataset.src) {
            img.src = img.dataset.src;
        }
    });
    initializeApp();
});

// Main app initialization
function initializeApp() {
    setupNavigation();
    setupMobileMenu();
    setupHeroCarousel();
    setupOptimizedHeroVideo();
    setupScrollTriggers();
    setupPackageToggle();
    setupPackageDropdowns();
    setupEnhancedProjects();
    setupProjectModal();
    setupInteriorForm();
    setupLeadCapture();
    setupFAQ();
    setupContactForm(); // Web3Forms integration with user feedback
    setupFormValidation();
    setupScrollAnimations();
    setupHeroButton();
    initializePerformanceMonitoring();
    
    console.log('Anelia Designs app initialized successfully');
}

// Setup Hero Button
function setupHeroButton() {
    const heroButton = document.querySelector('.hero-cta');
    if (heroButton) {
        heroButton.addEventListener('click', function(e) {
            e.preventDefault();
            // Add your hero button logic here if needed
        });
    }
}

// Setup Optimized Hero Video
function setupOptimizedHeroVideo() {
    const video = document.getElementById('heroVideo');
    if (!video) return;
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check connection speed
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
    
    // Skip video on slow connections or if user prefers reduced motion
    if (prefersReducedMotion || isSlowConnection) {
        video.style.display = 'none';
        console.log('Video disabled due to user preferences or slow connection');
        return;
    }
    
    // Progressive loading strategy
    let videoLoaded = false;
    
    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !videoLoaded) {
                loadHeroVideo();
                videoLoaded = true;
                observer.disconnect();
            }
        });
    }, { threshold: 0.1 });
    
    observer.observe(video);
    
    function loadHeroVideo() {
        // Preload video metadata first
        video.preload = 'metadata';
        
        // Once metadata is loaded, check if we should load the full video
        video.addEventListener('loadedmetadata', () => {
            // Only fully load if viewport is large enough and connection is good
            if (window.innerWidth >= 768 && !isSlowConnection) {
                video.preload = 'auto';
                video.load();
            }
        }, { once: true });
        
        // Show video with smooth transition when it can play
        video.addEventListener('canplaythrough', () => {
            video.style.opacity = '1';
            video.play().catch(e => {
                console.log('Video autoplay prevented:', e);
            });
        }, { once: true });
        
        // Error handling
        video.addEventListener('error', (e) => {
            console.error('Video failed to load:', e);
            video.style.display = 'none';
        });
        
        // Start loading
        video.load();
    }
    
    // Pause video when not visible (performance optimization)
    const videoVisibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (video.paused && videoLoaded) {
                    video.play().catch(() => {});
                }
            } else {
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, { threshold: 0.5 });
    
    videoVisibilityObserver.observe(video);
}

// Performance Monitoring
function initializePerformanceMonitoring() {
    // Core Web Vitals monitoring
    try {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
                console.log('FID:', entry.processingStart - entry.startTime);
            });
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift (CLS)
        new PerformanceObserver((entryList) => {
            let clsValue = 0;
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            console.log('CLS:', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
        
    } catch (e) {
        console.log('Performance monitoring not supported');
    }
    
    // Resource loading monitoring
    window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart);
        console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart);
        console.log('First Paint:', performance.getEntriesByType('paint')[0]?.startTime);
    });
}

// Navigation functionality
function setupNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            console.log('Nav link clicked:', targetId);
            
            // Special handling for packages navigation
            if (targetId === 'packages') {
                showPackages();
                setTimeout(() => {
                    scrollToSection('packages', -80);
                }, 300);
            } else {
                scrollToSection(targetId);
            }
            closeMobileMenu();
        });
    });
    
    // Optimize: Throttle scroll event
    let lastScrollY = 0;
    let scrollTimeout = null;
    window.addEventListener('scroll', function() {
        lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                if (lastScrollY > 100) {
                    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                    navbar.style.boxShadow = '0 2px 15px rgba(0,0,0,0.1)';
                } else {
                    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                    navbar.style.boxShadow = 'none';
                }
                scrollTimeout = null;
            }, 100); // Throttle to every 100ms
        }
    }, { passive: true });
}

// Mobile menu functionality
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
        this.classList.toggle('active');
    });
    
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

function closeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}

// Hero Carousel Setup
function setupHeroCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;
    
    let currentSlide = 0;
    
    slides[0].classList.add('active');
    
    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    
    heroCarouselInterval = setInterval(nextSlide, 5000);
    
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.addEventListener('mouseenter', () => {
            clearInterval(heroCarouselInterval);
        });
        
        heroSection.addEventListener('mouseleave', () => {
            heroCarouselInterval = setInterval(nextSlide, 5000);
        });
    }
    
    // console.log('Hero carousel initialized with', slides.length, 'slides');
}

// Scroll Triggers Setup
function setupScrollTriggers() {
    let ticking = false;
    
    // Lead Capture Popup trigger when user scrolls to "Our Projects" section
    function checkScrollTriggers() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const projectsSection = document.getElementById('projects');
        if (projectsSection && !leadCaptureShown) {
            const projectsOffset = projectsSection.offsetTop - 200; // Trigger 200px before projects section
            if (scrollTop >= projectsOffset) {
                console.log('Projects section reached - showing lead capture popup');
                setTimeout(() => {
                    openLeadCapture();
                }, 500); // Small delay for better UX
                leadCaptureShown = true;
            }
        }
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(checkScrollTriggers);
            ticking = true;
        }
    }, { passive: true });
    
    console.log('Lead capture scroll trigger enabled - will show popup when user reaches projects section');
    
    // For testing: Allow manual trigger via console
    window.testLeadPopup = function() {
        console.log('Manual test trigger for lead capture popup');
        openLeadCapture();
    };
    
    // Debug function to check scroll status
    window.checkScrollStatus = function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
            const projectsOffset = projectsSection.offsetTop - 200;
            console.log(`Scroll Position: ${scrollTop}px`);
            console.log(`Projects Trigger Point: ${projectsOffset}px`);
            console.log(`Lead Capture Shown: ${leadCaptureShown}`);
            console.log(`Will Trigger: ${scrollTop >= projectsOffset && !leadCaptureShown}`);
        }
    };
}

// CRITICAL FIX: Package Toggle with proper button connection
function setupPackageToggle() {
    // console.log('Setting up package toggle functionality');
    
    // Find the View Packages button by ID
    const viewPackagesBtn = document.getElementById('viewPackagesBtn');
    
    if (viewPackagesBtn) {
        // Remove any existing event listeners by cloning
        const newBtn = viewPackagesBtn.cloneNode(true);
        viewPackagesBtn.parentNode.replaceChild(newBtn, viewPackagesBtn);
        
        // Add the FIXED event listener
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const packagesSection = document.getElementById('packages');
            if (!packagesSection) return;
            const isVisible = !packagesSection.classList.contains('hidden') && packagesSection.classList.contains('show');
            if (isVisible) {
                // Hide packages
                packagesSection.classList.remove('show');
                setTimeout(() => {
                    packagesSection.classList.add('hidden');
                    packagesSection.style.display = '';
                    packagesSection.style.opacity = '';
                }, 300);
            } else {
                showPackages();
            }
        });
        
    // console.log('FIXED: View Packages button connected successfully');
    } else {
        // console.error('View Packages button not found!');
    }
    
    // Global function for backward compatibility
    window.togglePackages = function() {
        console.log('Legacy togglePackages function called');
        showPackages();
    };
}

// CRITICAL FIX: Show packages function
function showPackages() {
    const packagesSection = document.getElementById('packages');
    if (!packagesSection) {
        console.error('Packages section not found');
        return;
    }
    
    // console.log('CRITICAL FIX: Showing packages section');
    
    // Remove hidden class and add show class
    packagesSection.classList.remove('hidden');
    
    // Force immediate visibility
    packagesSection.style.display = 'block';
    packagesSection.style.opacity = '0';
    
    // Animate in
    setTimeout(() => {
        packagesSection.classList.add('show');
        packagesSection.style.opacity = '1';
        
    // console.log('CRITICAL FIX: Packages section is now visible');
        
        // Scroll to packages after animation
        setTimeout(() => {
            scrollToSection('packages', -80);
        }, 400);
    }, 50);
}

// CRITICAL FIX: Package Dropdowns - Independent functionality with NO auto-closing
function setupPackageDropdowns() {
    console.log('CRITICAL FIX: Setting up package dropdowns with independent functionality');
    
    // Wait a bit to ensure DOM is ready
    setTimeout(() => {
        const packageSections = document.querySelectorAll('.package-category');
        console.log(`Found ${packageSections.length} package categories`);
        
        packageSections.forEach((section, index) => {
            const header = section.querySelector('.dropdown-toggle');
            const content = section.querySelector('.dropdown-content');
            if (header && content) {
                // Remove any existing event listeners by cloning
                const newHeader = header.cloneNode(true);
                header.parentNode.replaceChild(newHeader, header);
                const sectionTitleElem = newHeader.querySelector('.dropdown-title');
                const sectionTitle = sectionTitleElem ? sectionTitleElem.textContent.trim() : '';
                // Add the event listener
                newHeader.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    // Determine if this dropdown is currently active
                    const isActive = this.classList.contains('active');
                    // Find all dropdowns with the same title
                    packageSections.forEach((otherSection) => {
                        const otherHeader = otherSection.querySelector('.dropdown-toggle');
                        const otherContent = otherSection.querySelector('.dropdown-content');
                        const otherTitleElem = otherHeader ? otherHeader.querySelector('.dropdown-title') : null;
                        const otherTitle = otherTitleElem ? otherTitleElem.textContent.trim() : '';
                        if (otherHeader && otherContent && otherTitle === sectionTitle) {
                            if (isActive) {
                                otherHeader.classList.remove('active');
                                otherContent.classList.remove('show');
                                otherContent.style.maxHeight = '0';
                                otherContent.style.opacity = '0';
                            } else {
                                otherHeader.classList.add('active');
                                otherContent.classList.add('show');
                                otherContent.style.maxHeight = '400px';
                                otherContent.style.opacity = '1';
                            }
                        }
                    });
                });
                // Ensure dropdown content starts hidden
                content.classList.remove('show');
                content.style.maxHeight = '0';
                content.style.opacity = '0';
                newHeader.classList.remove('active');
            }
        });
        
        console.log('CRITICAL FIX: All package dropdowns setup complete - NO auto-closing behavior!');
        
        // Prevent document clicks from interfering
        document.addEventListener('click', function(e) {
            // Only handle clicks that are NOT on dropdown elements
            const isDropdownClick = e.target.closest('.dropdown-toggle') || e.target.closest('.dropdown-content');
            if (!isDropdownClick) {
                // Don't close dropdowns automatically - this was the main problem!
                console.log('CRITICAL FIX: Document click ignored - dropdowns remain independent');
            }
        });
        
    }, 500); // Give time for the DOM to be fully ready
}

// Project Carousels Setup
function setupProjectCarousels() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, cardIndex) => {
        const images = card.querySelectorAll('.project-image');
        if (images.length <= 1) return;
        
        let currentImage = 0;
        
        images[0].classList.add('active');
        
        function nextImage() {
            images[currentImage].classList.remove('active');
            currentImage = (currentImage + 1) % images.length;
            images[currentImage].classList.add('active');
        }
        
        projectImageIntervals[cardIndex] = setInterval(nextImage, 4000);
        
        card.addEventListener('mouseenter', () => {
            if (projectImageIntervals[cardIndex]) {
                clearInterval(projectImageIntervals[cardIndex]);
            }
        });
        
        card.addEventListener('mouseleave', () => {
            projectImageIntervals[cardIndex] = setInterval(nextImage, 4000);
        });
        
        console.log(`Project card ${cardIndex} initialized with ${images.length} images`);
    });
}

// Projects Auto-Scroll Setup (now handled by setupProjectsCarouselInteraction)
function setupProjectsAutoScroll() {
    // Auto-scroll is now handled by the advanced carousel system
    // This function is kept for compatibility but functionality moved to setupProjectsCarouselInteraction
    console.log('Auto-scroll handled by advanced carousel system');
}

// Lead Capture Popup
function setupLeadCapture() {
    const modal = document.getElementById('leadCaptureModal');
    const form = document.getElementById('leadCaptureForm');
    const result = document.getElementById('leadResult');
    
    if (!modal || !form || !result) return;
    
    // Web3Forms integration for Lead Capture
    form.addEventListener('submit', function(e) {
        // Show loading message
        result.innerHTML = "Submitting your details...";
        result.style.display = "block";
        result.style.backgroundColor = "#e3f2fd";
        result.style.color = "#1976d2";
        result.style.border = "1px solid #bbdefb";
        
        // Disable submit button to prevent double submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Submitting...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        
        // The form will submit naturally to Web3Forms
        // We'll show success message after a delay
        setTimeout(() => {
            // Hide loading message
            result.style.display = "none";
            
            // Close modal first
            closeLeadCapture();
            
            // Show success popup
            showSuccessPopup("Wow, your message just landed in Anelia Design's inbox with a splash! 🎉 Thanks for connecting—we'll dive in and get back to you in a flash!");
            
            // Reset form after successful submission
            setTimeout(() => {
                form.reset();
                
                // Re-enable submit button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            }, 1000);
            
        }, 2000); // Show success after 2 seconds to simulate processing
        
        console.log('Lead capture form submitted to Web3Forms API');
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeLeadCapture();
        }
    });
    
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLeadCapture);
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeLeadCapture();
        }
    });
}

window.openLeadCapture = function() {
    const modal = document.getElementById('leadCaptureModal');
    if (!modal) return;
    
    console.log('Opening lead capture popup');
    modal.classList.remove('hidden');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            firstInput.focus();
        }
    }, 150);
};

window.closeLeadCapture = function() {
    const modal = document.getElementById('leadCaptureModal');
    if (!modal) return;
    
    modal.classList.add('hidden');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
};

// Interior Design Multi-Step Form
function setupInteriorForm() {
    const modal = document.getElementById('interiorFormModal');
    const form = document.getElementById('interiorForm');
    
    if (!modal || !form) return;
    
    form.addEventListener('click', function(e) {
        const btn = e.target.closest('.option-btn');
        if (!btn) return;
        
        const step = btn.closest('.form-step');
        const stepNumber = parseInt(step.dataset.step);
        
        const siblings = step.querySelectorAll('.option-btn');
        siblings.forEach(sibling => {
            sibling.classList.remove('selected');
            sibling.style.transform = 'scale(1)';
        });
        
        btn.classList.add('selected');
        btn.style.transform = 'scale(1.05)';
        
        const value = btn.dataset.value;
        storeFormData(`step${stepNumber}`, value);
        
        console.log(`Step ${stepNumber} selected: ${value}`);
        
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
            
            if (stepNumber === 1 && value === 'commercial') {
                storeFormData('step2', 'commercial');
                goToStep(3);
            } else if (stepNumber < 5) {
                goToStep(stepNumber + 1);
            }
        }, 1000);
    });
    
    form.addEventListener('submit', function(e) {
        // Update hidden fields with step selections before submission
        updateHiddenFields();
        
        // Show loading message
        const result = document.getElementById('interiorResult');
        result.innerHTML = "Processing your request...";
        result.style.display = "block";
        result.style.backgroundColor = "#e3f2fd";
        result.style.color = "#1976d2";
        result.style.border = "1px solid #bbdefb";
        
        // Disable submit button to prevent double submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Processing...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        
        // The form will submit naturally to Web3Forms
        // We'll show success message after a delay
        setTimeout(() => {
            // Hide loading message
            result.style.display = "none";
            
            // Close modal first
            closeInteriorForm();
            
            // Show success popup
            showSuccessPopup("Wow, your message just landed in Anelia Design's inbox with a splash! 🎉 Thanks for connecting—we'll dive in and get back to you in a flash!");
            
            // Reset form after successful submission
            setTimeout(() => {
                resetInteriorForm();
                
                // Re-enable submit button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            }, 1000);
            
        }, 2000); // Show success after 2 seconds to simulate processing
        
        console.log('Interior design form submitted to Web3Forms API');
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeInteriorForm();
        }
    });
    
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeInteriorForm);
    }
}

window.openInteriorForm = function() {
    const modal = document.getElementById('interiorFormModal');
    if (!modal) return;
    
    console.log('Opening interior design form');
    modal.classList.remove('hidden');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    resetInteriorForm();
    goToStep(1);
    
    setTimeout(() => {
        const firstButton = modal.querySelector('.option-btn');
        if (firstButton) {
            firstButton.focus();
        }
    }, 200);
};

window.closeInteriorForm = function() {
    const modal = document.getElementById('interiorFormModal');
    if (!modal) return;
    
    modal.classList.add('hidden');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
};

function goToStep(stepNumber) {
    const steps = document.querySelectorAll('.form-step');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (!steps.length || !progressFill || !progressText) return;
    
    console.log(`Navigating to step ${stepNumber}`);
    
    steps.forEach(step => {
        step.classList.remove('active');
        step.style.opacity = '0';
    });
    
    setTimeout(() => {
        const currentStepEl = document.querySelector(`[data-step="${stepNumber}"]`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
            currentStepEl.style.opacity = '1';
            console.log(`Step ${stepNumber} activated`);
        }
    }, 150);
    
    const progress = (stepNumber / 5) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Step ${stepNumber} of 5`;
    
    currentStep = stepNumber;
    
    restoreStepSelection(stepNumber);
}

function storeFormData(key, value) {
    formData[key] = value;
    console.log('Form data stored:', key, value);
}

// Update hidden fields with step selections for Web3Forms submission
function updateHiddenFields() {
    const spaceTypeField = document.getElementById('hiddenSpaceType');
    const bhkTypeField = document.getElementById('hiddenBhkType');
    const purposeField = document.getElementById('hiddenPurpose');
    const interiorStyleField = document.getElementById('hiddenInteriorStyle');
    
    if (spaceTypeField) spaceTypeField.value = formData.step1 || '';
    if (bhkTypeField) bhkTypeField.value = formData.step2 || '';
    if (purposeField) purposeField.value = formData.step3 || '';
    if (interiorStyleField) interiorStyleField.value = formData.step4 || '';
    
    console.log('Hidden fields updated for Web3Forms submission:', {
        spaceType: formData.step1,
        bhkType: formData.step2,
        purpose: formData.step3,
        interiorStyle: formData.step4
    });
}

function restoreStepSelection(stepNumber) {
    const step = document.querySelector(`[data-step="${stepNumber}"]`);
    const savedValue = formData[`step${stepNumber}`];
    
    if (step && savedValue) {
        const button = step.querySelector(`[data-value="${savedValue}"]`);
        if (button) {
            button.classList.add('selected');
        }
    }
    
    if (stepNumber === 5) {
        const budgetInput = document.getElementById('customBudget');
        const emailInput = document.getElementById('interiorEmail');
        const phoneInput = document.getElementById('interiorPhone');
        
        if (budgetInput && formData.budget) {
            budgetInput.value = formData.budget;
        }
        
        if (emailInput && formData.email) {
            emailInput.value = formData.email;
        }
        
        if (phoneInput && formData.phone) {
            phoneInput.value = formData.phone;
        }
    }
}

function resetInteriorForm() {
    formData = {};
    currentStep = 1;
    
    document.querySelectorAll('.option-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.transform = 'scale(1)';
    });
    
    const budgetInput = document.getElementById('customBudget');
    const emailInput = document.getElementById('interiorEmail');
    const phoneInput = document.getElementById('interiorPhone');
    
    if (budgetInput) budgetInput.value = '';
    if (emailInput) emailInput.value = '';
    if (phoneInput) phoneInput.value = '';
    
    // Clear hidden fields for Web3Forms
    const hiddenFields = ['hiddenSpaceType', 'hiddenBhkType', 'hiddenPurpose', 'hiddenInteriorStyle'];
    hiddenFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    console.log('Interior form reset');
}

// Theme-based Success Popup
function showSuccessPopup(message) {
    // Remove any existing success popup
    const existingPopup = document.querySelector('.success-popup-overlay');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.className = 'success-popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
        backdrop-filter: blur(3px);
    `;
    
    // Create popup content
    const popup = document.createElement('div');
    popup.className = 'success-popup';
    popup.style.cssText = `
        background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.98) 50%, rgba(255, 255, 255, 1) 100%);
        color: rgba(94, 82, 64, 1);
        padding: 40px 30px 45px 30px;
        border-radius: 20px;
        text-align: center;
        max-width: 450px;
        margin: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
        border: 3px solid rgba(94, 82, 64, 0.8);
        transform: translateY(30px) scale(0.9);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: 'Noto Sans', sans-serif;
        position: relative;
    `;
    
    popup.innerHTML = `
        <button class="popup-close-btn" style="
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(94, 82, 64, 0.1);
            border: 2px solid rgba(94, 82, 64, 0.3);
            color: rgba(94, 82, 64, 1);
            width: 35px;
            height: 35px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: bold;
            transition: all 0.2s ease;
            z-index: 10;
        " onmouseover="this.style.background='rgba(94, 82, 64, 0.2)'; this.style.transform='scale(1.1)'; this.style.borderColor='rgba(94, 82, 64, 0.6)'" 
           onmouseout="this.style.background='rgba(94, 82, 64, 0.1)'; this.style.transform='scale(1)'; this.style.borderColor='rgba(94, 82, 64, 0.3)'"
           onclick="this.closest('.success-popup-overlay').click()">×</button>
        <div style="font-size: 3rem; margin-bottom: 20px; animation: bounce 0.6s ease-out;">🎉</div>
        <h3 style="margin: 0 0 15px 0; font-size: 1.4rem; font-weight: 600; color: rgba(0, 0, 0, 1);">Success!</h3>
        <p style="margin: 0; font-size: 1rem; line-height: 1.5; color: rgba(94, 82, 64, 1);">${message}</p>
        <div style="margin-top: 25px; height: 4px; background: rgba(94, 82, 64, 0.2); border-radius: 2px; overflow: hidden;">
            <div class="progress-bar" style="height: 100%; background: rgba(94, 82, 64, 0.7); border-radius: 2px; width: 100%; animation: shrink 8.5s linear;"></div>
        </div>
        <p style="margin: 8px 0 0 0; font-size: 0.8rem; color: rgba(94, 82, 64, 0.7);">Auto-closes in 8.5 seconds or click × to close</p>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Add animations to head if not already present
    if (!document.querySelector('#success-popup-styles')) {
        const style = document.createElement('style');
        style.id = 'success-popup-styles';
        style.textContent = `
            @keyframes bounce {
                0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
                40%, 43% { transform: translate3d(0,-15px,0); }
                70% { transform: translate3d(0,-7px,0); }
                90% { transform: translate3d(0,-2px,0); }
            }
            @keyframes shrink {
                from { width: 100%; }
                to { width: 0%; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Animate in
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        popup.style.transform = 'translateY(0) scale(1)';
    });
    
    // Auto close after 8.5 seconds
    const autoCloseTimer = setTimeout(() => {
        closePopup();
    }, 8500);
    
    // Close popup function
    function closePopup() {
        clearTimeout(autoCloseTimer);
        overlay.style.opacity = '0';
        popup.style.transform = 'translateY(-20px) scale(0.95)';
        
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 300);
    }
    
    // Allow manual close by clicking overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('popup-close-btn')) {
            closePopup();
        }
    });
    
    // ESC key to close
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closePopup();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
    
    // Remove ESC listener when popup is closed
    overlay.addEventListener('click', () => {
        document.removeEventListener('keydown', handleEsc);
    });
    
    console.log('Theme-based success popup shown with auto-close in 8.5 seconds');
}

function closeSuccessModal() {
    // Legacy function - now handled by the new showSuccessPopup function
    // Remove any existing success popup
    const existingPopup = document.querySelector('.success-popup-overlay');
    if (existingPopup) {
        existingPopup.remove();
    }
}

// FAQ Section Setup
function setupFAQ() {
    window.toggleFaq = function(button) {
        const faqItem = button.closest('.faq-item');
        const answer = faqItem.querySelector('.faq-answer');
        const isActive = button.classList.contains('active');
        
        document.querySelectorAll('.faq-question').forEach(btn => {
            if (btn !== button) {
                btn.classList.remove('active');
                const otherAnswer = btn.closest('.faq-item').querySelector('.faq-answer');
                if (otherAnswer) {
                    otherAnswer.classList.remove('show');
                }
            }
        });
        
        if (isActive) {
            button.classList.remove('active');
            answer.classList.remove('show');
        } else {
            button.classList.add('active');
            answer.classList.add('show');
        }
    };
}

// Contact Form Setup - Web3Forms Integration with User Feedback
function setupContactForm() {
    const form = document.getElementById('contactForm');
    const result = document.getElementById('result');
    
    if (!form || !result) {
        console.warn('Contact form or result div not found');
        return;
    }
    
    form.addEventListener('submit', function(e) {
        // Show loading message
        result.innerHTML = "Sending your message...";
        result.style.display = "block";
        result.style.backgroundColor = "#e3f2fd";
        result.style.color = "#1976d2";
        result.style.border = "1px solid #bbdefb";
        
        // Disable submit button to prevent double submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        
        // The form will submit naturally to Web3Forms
        // We'll show success message after a delay (since we can't detect actual response)
        setTimeout(() => {
            // Hide loading message
            result.style.display = "none";
            
            // Show success popup
            showSuccessPopup("Wow, your message just landed in Anelia Design's inbox with a splash! 🎉 Thanks for connecting—we'll dive in and get back to you in a flash!");
            
            // Reset form after successful submission
            setTimeout(() => {
                form.reset();
                
                // Re-enable submit button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            }, 1000);
            
        }, 2000); // Show success after 2 seconds to simulate processing
        
        console.log('Contact form submitted to Web3Forms API');
    });
}

// Form Validation
function setupFormValidation() {
    // Enhanced security form setup (exclude contactForm for Web3Forms)
    const emailInputs = document.querySelectorAll('form:not(#contactForm) input[type="email"]');
    emailInputs.forEach(input => {
        input.setAttribute('pattern', '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$');
        input.setAttribute('maxlength', '254'); // RFC 5321 limit
        input.setAttribute('autocomplete', 'email');
        input.setAttribute('spellcheck', 'false');
    });
    
    const phoneInputs = document.querySelectorAll('form:not(#contactForm) input[type="tel"]');
    phoneInputs.forEach(input => {
        input.setAttribute('pattern', '^[\\d\\s\\+\\-\\(\\)]+$');
        input.setAttribute('inputmode', 'tel');
        input.setAttribute('maxlength', '20');
        input.setAttribute('autocomplete', 'tel');
    });
    
    const textInputs = document.querySelectorAll('form:not(#contactForm) input[type="text"], form:not(#contactForm) textarea');
    textInputs.forEach(input => {
        input.setAttribute('maxlength', input.tagName === 'TEXTAREA' ? '1000' : '100');
        input.setAttribute('autocomplete', 'off');
        
        // Real-time input sanitization
        input.addEventListener('input', (e) => {
            e.target.value = sanitizeInput(e.target.value);
        });
        
        // Prevent XSS attempts
        input.addEventListener('paste', (e) => {
            setTimeout(() => {
                e.target.value = sanitizeInput(e.target.value);
            }, 0);
        });
    });
    
    // Add CSRF protection token to forms (exclude contactForm for Web3Forms)
    const forms = document.querySelectorAll('form:not(#contactForm)');
    forms.forEach(form => {
        addCSRFProtection(form);
        
        // Rate limiting
        let lastSubmit = 0;
        form.addEventListener('submit', (e) => {
            const now = Date.now();
            if (now - lastSubmit < 3000) { // 3 second cooldown
                e.preventDefault();
                showFormError(form, 'Please wait before submitting again');
                return false;
            }
            lastSubmit = now;
        });
    });
}

function validateInput(input) {
    if (!input) return false;
    
    const value = input.value.trim();
    const type = input.type;
    const required = input.hasAttribute('required');
    
    clearInputError(input);
    
    if (required && !value) {
        showInputError(input, 'This field is required');
        return false;
    }
    
    if (!value && !required) {
        return true;
    }
    
    if (type === 'email' && !isValidEmail(value)) {
        showInputError(input, 'Please enter a valid email address');
        return false;
    }
    
    if (type === 'tel' && !isValidPhone(value)) {
        showInputError(input, 'Please enter a valid phone number');
        return false;
    }
    
    if (input.name === 'name' && value.length < 2) {
        showInputError(input, 'Name must be at least 2 characters long');
        return false;
    }
    
    if (input.name === 'message' && value.length < 10) {
        showInputError(input, 'Message must be at least 10 characters long');
        return false;
    }
    
    return true;
}

function showInputError(input, message) {
    input.classList.add('error');
    input.style.borderColor = '#dc3545';
    input.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
    
    const errorId = input.getAttribute('aria-describedby');
    if (errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }
}

function clearInputError(input) {
    input.classList.remove('error');
    input.style.borderColor = '';
    input.style.boxShadow = '';
    
    const errorId = input.getAttribute('aria-describedby');
    if (errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }
}

function clearAllErrors(form) {
    const errorInputs = form.querySelectorAll('.error');
    errorInputs.forEach(input => clearInputError(input));
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Scroll Animations
function setupScrollAnimations() {
    if (!window.IntersectionObserver) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.opacity = '1';
            }
        });
    }, observerOptions);
    
    const elementsToAnimate = document.querySelectorAll('.service-card, .package-card, .project-card, .stat-item, .feature-item, .process-step, .contact-item, .faq-item');
    elementsToAnimate.forEach(el => {
        el.style.transform = 'translateY(20px)';
        el.style.opacity = '0';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
}

// Utility Functions
function scrollToSection(sectionId, offset = -80) {
    const section = document.getElementById(sectionId);
    if (!section) {
        console.error('Section not found:', sectionId);
        return;
    }
    
    const offsetTop = section.offsetTop + offset;
    console.log('Scrolling to section:', sectionId, 'at offset:', offsetTop);
    
    window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
    });
    
    setTimeout(() => {
        section.setAttribute('tabindex', '-1');
        section.focus();
        section.removeAttribute('tabindex');
    }, 600);
}

function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#007bff'
    };
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    // Sanitize message to prevent XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, function(tag) {
            const charsToReplace = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            };
            return charsToReplace[tag] || tag;
        });
    }
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${escapeHTML(message)}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()" aria-label="Close notification">×</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 3000;
        max-width: 400px;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 6px 25px rgba(0,0,0,0.15);
        color: white;
        font-weight: 500;
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        background: ${colors[type] || colors.info};
        font-family: 'Noto Sans', sans-serif;
        backdrop-filter: blur(10px);
    `;
    
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 25px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        opacity: 0.8;
        transition: all 0.2s ease;
        margin-left: auto;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => notification.remove(), 400);
        }
    }, 6000);
}

// CSV Export Simulation
function exportToCSV(data, formType) {
    const enhancedCsvData = {
        formType: formType,
        timestamp: data.timestamp,
        source: data.source || 'anelia_designs_website',
        ...data
    };
    
    console.log(`CSV Export for ${formType}:`, enhancedCsvData);
    
    const emailData = {
        to: 'sales@aneliadesign.com',
        cc: 'info@aneliadesign.com',
        subject: `New ${formType.replace('_', ' ')} submission - Anelia Designs`,
        body: JSON.stringify(enhancedCsvData, null, 2),
        attachments: [{
            filename: `anelia_designs_${formType}_${Date.now()}.csv`,
            content: generateCSVContent(enhancedCsvData)
        }]
    };
    
    console.log('Email with CSV attachment:', emailData);
}

function generateCSVContent(data) {
    const headers = Object.keys(data).join(',');
    const values = Object.values(data).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    ).join(',');
    
    return `${headers}\n${values}`;
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            if (activeModal.id === 'interiorFormModal') {
                closeInteriorForm();
            } else if (activeModal.id === 'leadCaptureModal') {
                closeLeadCapture();
            } else if (activeModal.id === 'successModal') {
                activeModal.classList.add('hidden');
                activeModal.classList.remove('active');
                activeModal.setAttribute('aria-hidden', 'true');
            }
        }
        
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    }
});


// Performance optimizations
document.addEventListener('DOMContentLoaded', function() {
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
        }
        .notification-close:hover {
            opacity: 1;
            background: rgba(255,255,255,0.1);
        }
        .notification-icon {
            flex-shrink: 0;
            font-size: 1.2rem;
        }
        .notification-message {
            flex: 1;
        }
    `;
    document.head.appendChild(animationStyles);
});

// Lazy image loading
if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]:not(.project-image)');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    lazyImages.forEach(img => imageObserver.observe(img));
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (heroCarouselInterval) {
        clearInterval(heroCarouselInterval);
    }
    
    Object.values(projectImageIntervals).forEach(interval => {
        if (interval) {
            clearInterval(interval);
        }
    });
    
    if (projectsScrollInterval) {
        clearInterval(projectsScrollInterval);
    }
    
});

// =============================================================================
// ENHANCED PROJECTS SECTION - FOLDER-DRIVEN WITH RESPONSIVE IMAGES
// =============================================================================

// Project folders configuration
const PROJECT_FOLDERS = ['Archan', 'Banaswadi', 'Harsha', 'HP Cafeteria', 'Laggare', 'Manoj', 'MPL', 'Reshma', 'Sites'];
let projectsData = [];
let currentModalProject = null;
let currentModalImageIndex = 0;
let projectAutoAdvanceTimers = [];
let projectCarouselTimer = null;

// Manual interaction state
let isUserInteracting = false;
let userInteractionTimer = null;
let isDragging = false;
let startX = 0;
let scrollLeft = 0;

// Setup enhanced projects functionality
function setupEnhancedProjects() {
    loadProjectsFromFolders()
        .then(() => {
            renderProjects();
            setupProjectsCarouselInteraction();
        })
        .catch(error => {
            console.error('Failed to load projects:', error);
            renderProjectsError();
        });
}

// Load projects from manifest or fallback to folder scanning
async function loadProjectsFromFolders() {
    try {
        // Try to load from manifest first
        const response = await fetch('./assets/projects-manifest.json');
        if (response.ok) {
            const manifest = await response.json();
            projectsData = manifest.projects;
            return;
        }
    } catch (error) {
        console.log('Manifest not found, scanning folders directly');
    }

    // Fallback: scan folders directly
    projectsData = await Promise.all(
        PROJECT_FOLDERS.map(async (folderName, index) => {
            const images = await scanFolderForImages(folderName);
            return {
                id: folderName.toLowerCase().replace(/\s+/g, '-'),
                title: folderName,
                folderName,
                description: `Premium ${folderName.includes('HP') ? 'commercial' : 'residential'} project showcasing our expertise`,
                type: folderName.includes('HP') ? 'Commercial' : 'Residential',
                images: images.map((img, imgIndex) => ({
                    original: {
                        src: `assets/${folderName}/${img}`,
                        alt: `${folderName} project image ${imgIndex + 1}`,
                        width: 1920,
                        height: 1080
                    },
                    isLCP: index === 0 && imgIndex === 0,
                    variants: [] // No optimized variants in fallback mode
                }))
            };
        })
    );
}

// Scan folder for images (fallback method)
async function scanFolderForImages(folderName) {
    try {
        // This is a simplified approach - in a real implementation,
        // you'd need a server endpoint to list directory contents
        // For now, we'll use common image filenames
        const commonImages = [
            'PHOTO-2023-11-25-10-29-41 2.jpg',
            'PHOTO-2023-11-25-10-29-44.jpg',
            'PHOTO-2023-11-25-10-29-46.jpg',
            'PHOTO-2023-11-25-10-29-47.jpg',
            'PHOTO-2023-07-20-23-11-58.jpg',
            'PHOTO-2023-11-25-10-09-39.jpg',
            'IMG_20220429_124409.jpg',
            'IMG_20220429_124702.jpg',
            'IMG_20220502_023305.jpg',
            'IMG_20220502_023324.jpg',
            'IMG_0193.jpg',
            'PHOTO-2023-11-25-10-02-18.jpg'
        ];
        
        // Test which images exist for this folder
        const existingImages = [];
        for (const imageName of commonImages) {
            try {
                const response = await fetch(`assets/${folderName}/${imageName}`, { method: 'HEAD' });
                if (response.ok) {
                    existingImages.push(imageName);
                }
            } catch {
                // Image doesn't exist, continue
            }
        }
        
        return existingImages.length > 0 ? existingImages : ['placeholder.jpg'];
    } catch {
        return ['placeholder.jpg'];
    }
}

// Render projects in the carousel
function renderProjects() {
    const track = document.getElementById('projectsTrack');
    
    if (!track) {
        console.error('Projects track element not found!');
        return;
    }
    
    if (!projectsData || projectsData.length === 0) {
        console.error('No projects data available!');
        track.innerHTML = '<p>No projects data available</p>';
        return;
    }
    
    // Clear any error messages
    track.innerHTML = '';
    
    // Filter out 'Manoj Executive Residence' by id before rendering
    const filteredProjects = projectsData.filter(project => project.id !== 'manoj');
    
    // Create cards twice for seamless infinite scrolling
    const allProjects = [...filteredProjects, ...filteredProjects];
    
    allProjects.forEach((project, projectIndex) => {
        const card = document.createElement('article');
        card.className = 'project-card';
        card.setAttribute('data-project-id', project.id);
        card.style.cssText = 'min-width: 350px; max-width: 350px; flex-shrink: 0; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); cursor: pointer; transition: transform 0.3s ease; scroll-snap-align: start;';
        
        // Image container
        const imagesDiv = document.createElement('div');
        imagesDiv.style.cssText = 'position: relative; height: 250px; overflow: hidden;';
        
        // First image only for now
        const firstImage = project.images[0];
        const img = document.createElement('img');
        img.src = `assets/${firstImage.original.src}`;
        img.alt = firstImage.original.alt;
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
        img.loading = projectIndex === 0 ? 'eager' : 'lazy';
        
        // Add error handling for image loading
        img.addEventListener('error', function() {
            console.error(`Failed to load image: ${img.src}`);
            // Create placeholder with project info
            const placeholder = document.createElement('div');
            placeholder.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%); color: #666; font-size: 14px; text-align: center;';
            placeholder.innerHTML = `<div>Image not available<br><small>${project.title}</small></div>`;
            img.style.display = 'none';
            imagesDiv.appendChild(placeholder);
        });
        
        img.addEventListener('load', function() {
            console.log(`Successfully loaded image: ${img.src}`);
        });
        
        imagesDiv.appendChild(img);
        
        // Project info
        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = 'padding: 20px;';
        infoDiv.innerHTML = `
            <h3 style="margin: 0 0 8px 0; font-size: 1.2rem; font-weight: 600;">${project.title}</h3>
            <p style="margin: 0 0 12px 0; color: #555; font-size: 0.85rem; line-height: 1.4;">${project.description}</p>
            <p style="margin: 0; color: #888; font-size: 0.8rem;">${project.images.length} images</p>
        `;
        
        card.appendChild(imagesDiv);
        card.appendChild(infoDiv);
        
        // Simple hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
        
        // Click handler to open modal gallery
        card.addEventListener('click', () => openProjectModal(project));
        
        track.appendChild(card);
    });
    
    console.log(`Rendered ${projectsData.length} project cards`);
    
    // Carousel navigation removed - using auto-scroll only
}

// Setup advanced infinite carousel with continuous auto-sliding and manual controls
function setupProjectsCarouselInteraction() {
    const track = document.getElementById('projectsTrack');
    const carousel = track?.parentElement;
    if (!track || !carousel) return;
    
    // Carousel state
    let isUserInteracting = false;
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;
    let animationId = null;
    let autoScrollSpeed = 0.5; // pixels per frame
    
    // Get card width for calculations
    const getCardWidth = () => {
        const firstCard = track.querySelector('.project-card');
        return firstCard ? firstCard.offsetWidth + 25 : 375; // 25px gap
    };
    
    // Get total width of original cards (before duplication)
    const getOriginalWidth = () => {
        const cards = track.querySelectorAll('.project-card');
        return (cards.length / 2) * getCardWidth(); // Divided by 2 because cards are duplicated
    };
    
    // Initialize infinite scroll setup
    function initializeInfiniteScroll() {
        // Disable CSS animation in favor of JavaScript control
        track.style.animation = 'none';
        
        // Set initial position with small offset to enable left scrolling
        setTimeout(() => {
            carousel.scrollLeft = 50; // Start with small offset to allow left scrolling
        }, 100);
        
        // Start auto-scroll animation
        startAutoScroll();
    }
    
    // Continuous auto-scroll function
    function startAutoScroll() {
        function animate() {
            if (!isUserInteracting) {
                carousel.scrollLeft += autoScrollSpeed;
                
                // Check for seamless loop reset (right edge)
                const maxScroll = getOriginalWidth();
                if (carousel.scrollLeft >= maxScroll - 10) {
                    carousel.scrollLeft = 50; // Reset to beginning with offset
                }
            }
            
            animationId = requestAnimationFrame(animate);
        }
        animate();
    }
    
    // Handle seamless infinite scrolling during manual interaction
    function handleInfiniteLoop() {
        const maxScroll = getOriginalWidth();
        const currentScroll = carousel.scrollLeft;
        const buffer = 10; // Small buffer to prevent flickering
        
        // If scrolled past original content (right edge), jump to beginning
        if (currentScroll >= maxScroll - buffer) {
            carousel.scrollLeft = buffer;
        }
        // If scrolled before beginning (left edge), jump to end of original content
        else if (currentScroll <= buffer) {
            carousel.scrollLeft = maxScroll - buffer;
        }
    }
    
    // Mouse drag events
    carousel.addEventListener('mousedown', (e) => {
        isDragging = true;
        isUserInteracting = true;
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
        carousel.style.cursor = 'grabbing';
        carousel.style.scrollBehavior = 'auto';
        e.preventDefault();
    });
    
    carousel.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            isUserInteracting = false;
            carousel.style.cursor = 'grab';
        }
    });
    
    carousel.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            carousel.style.cursor = 'grab';
            carousel.style.scrollBehavior = 'smooth';
            
            // Handle infinite loop immediately, then allow brief interaction period
            handleInfiniteLoop();
            
            setTimeout(() => {
                isUserInteracting = false;
            }, 100);
        }
    });
    
    carousel.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 1.5;
        carousel.scrollLeft = scrollLeft - walk;
        handleInfiniteLoop();
    });
    
    // Touch events for mobile
    carousel.addEventListener('touchstart', (e) => {
        isDragging = true;
        isUserInteracting = true;
        const touch = e.touches[0];
        startX = touch.pageX;
        scrollLeft = carousel.scrollLeft;
        carousel.style.scrollBehavior = 'auto';
    }, { passive: true });
    
    carousel.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            carousel.style.scrollBehavior = 'smooth';
            
            // Handle infinite loop immediately, then allow brief interaction period
            handleInfiniteLoop();
            
            setTimeout(() => {
                isUserInteracting = false;
            }, 100);
        }
    }, { passive: true });
    
    carousel.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const walk = startX - touch.pageX;
        carousel.scrollLeft = scrollLeft + walk;
        handleInfiniteLoop();
    }, { passive: true });
    
    // Wheel events for horizontal scrolling
    carousel.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            isUserInteracting = true;
            carousel.scrollLeft += e.deltaY * 0.5;
            handleInfiniteLoop();
            
            // Brief pause in user interaction detection
            setTimeout(() => {
                isUserInteracting = false;
            }, 100);
        }
    }, { passive: false });
    
    // Keyboard navigation
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            isUserInteracting = true;
            const cardWidth = getCardWidth();
            const direction = e.key === 'ArrowLeft' ? -1 : 1;
            carousel.scrollLeft += cardWidth * direction;
            handleInfiniteLoop();
            
            setTimeout(() => {
                isUserInteracting = false;
            }, 500);
        }
    });
    
    // Handle scroll events for infinite loop
    let scrollTimeout;
    carousel.addEventListener('scroll', () => {
        // Clear previous timeout to debounce rapid scroll events
        clearTimeout(scrollTimeout);
        
        // Handle infinite loop immediately for smooth experience
        if (!isDragging) {
            handleInfiniteLoop();
        }
        
        // Additional check after scroll settles
        scrollTimeout = setTimeout(() => {
            handleInfiniteLoop();
        }, 50);
    });
    
    // Make carousel focusable for keyboard navigation
    carousel.setAttribute('tabindex', '0');
    carousel.style.cursor = 'grab';
    
    // Initialize the infinite scroll
    initializeInfiniteScroll();
    
    console.log('Advanced infinite carousel initialized');
}

// Setup Carousel Manual Navigation
// Carousel navigation removed - auto-scroll only implementation

// createProjectCard function removed - using inline creation in renderProjects()

// Create responsive picture element
function createResponsivePicture(imageData, isActive, isLCP) {
    const picture = document.createElement('picture');
    picture.className = `project-image ${isActive ? 'active' : ''}`;
    
    // Add optimized sources if available
    if (imageData.variants && imageData.variants.length > 0) {
        const avifSources = imageData.variants.filter(v => v.format === 'avif');
        const webpSources = imageData.variants.filter(v => v.format === 'webp');
        const jpegSources = imageData.variants.filter(v => v.format === 'jpeg');
        
        // AVIF sources
        if (avifSources.length > 0) {
            const avifSource = document.createElement('source');
            avifSource.type = 'image/avif';
            avifSource.srcset = avifSources.map(v => `assets/${v.src} ${v.width}w`).join(', ');
            avifSource.sizes = '(max-width: 768px) 280px, 350px';
            picture.appendChild(avifSource);
        }
        
        // WebP sources
        if (webpSources.length > 0) {
            const webpSource = document.createElement('source');
            webpSource.type = 'image/webp';
            webpSource.srcset = webpSources.map(v => `assets/${v.src} ${v.width}w`).join(', ');
            webpSource.sizes = '(max-width: 768px) 280px, 350px';
            picture.appendChild(webpSource);
        }
    }
    
    // Fallback img element
    const img = document.createElement('img');
    img.src = `assets/${imageData.original.src}`;
    img.alt = imageData.original.alt;
    img.width = imageData.original.width;
    img.height = imageData.original.height;
    img.loading = isLCP ? 'eager' : 'lazy';
    img.decoding = 'async';
    
    // Add srcset for fallback if variants exist
    if (imageData.variants && imageData.variants.length > 0) {
        const jpegSources = imageData.variants.filter(v => v.format === 'jpeg');
        if (jpegSources.length > 0) {
            img.srcset = jpegSources.map(v => `assets/${v.src} ${v.width}w`).join(', ');
            img.sizes = '(max-width: 768px) 280px, 350px';
        }
    }
    
    picture.appendChild(img);
    
    // Preload LCP image
    if (isLCP && imageData.variants) {
        const lcpSource = imageData.variants.find(v => v.format === 'avif' && v.width <= 768) ||
                         imageData.variants.find(v => v.format === 'webp' && v.width <= 768) ||
                         imageData.variants.find(v => v.format === 'jpeg' && v.width <= 768);
        
        if (lcpSource) {
            const preload = document.createElement('link');
            preload.rel = 'preload';
            preload.as = 'image';
            preload.href = `assets/${lcpSource.src}`;
            document.head.appendChild(preload);
        }
    }
    
    return picture;
}

// Setup individual project image carousels
// setupProjectImageCarousels function removed

// Start image carousel for a specific project
function startProjectImageCarousel(projectId, imageCount) {
    const card = document.querySelector(`[data-project-id="${projectId}"]`);
    if (!card) return;
    
    let currentIndex = 0;
    
    const timer = setInterval(() => {
        if (card.matches(':hover')) return; // Pause on hover
        
        const images = card.querySelectorAll('.project-image');
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % imageCount;
        images[currentIndex].classList.add('active');
    }, 4000);
    
    projectAutoAdvanceTimers.push(timer);
    
    // Pause/resume on hover
    card.addEventListener('mouseenter', () => {
        card.style.setProperty('--advance-duration', 'paused');
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.setProperty('--advance-duration', '4s');
    });
}

// Setup projects carousel auto-scroll
function setupProjectsCarouselAutoScroll() {
    const track = document.getElementById('projectsTrack');
    if (!track) return;
    
    let scrollDirection = 1;
    const scrollStep = 370; // Card width + gap
    
    projectCarouselTimer = setInterval(() => {
        if (track.matches(':hover')) return; // Pause on hover
        
        const maxScroll = track.scrollWidth - track.clientWidth;
        const currentScroll = track.scrollLeft;
        
        if (scrollDirection === 1 && currentScroll >= maxScroll) {
            scrollDirection = -1;
        } else if (scrollDirection === -1 && currentScroll <= 0) {
            scrollDirection = 1;
        }
        
        track.scrollBy({
            left: scrollStep * scrollDirection,
            behavior: 'smooth'
        });
    }, 6000);
}

// Modal functionality
function setupProjectModal() {
    const modal = document.getElementById('projectsModal');
    if (!modal) return;
    
    const closeBtn = modal.querySelector('.projects-modal-close');
    const prevBtn = modal.querySelector('.projects-gallery-prev');
    const nextBtn = modal.querySelector('.projects-gallery-next');
    
    closeBtn?.addEventListener('click', closeProjectModal);
    prevBtn?.addEventListener('click', () => navigateModalImage(-1));
    nextBtn?.addEventListener('click', () => navigateModalImage(1));
    
    // Keyboard navigation
    modal.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'Escape':
                closeProjectModal();
                break;
            case 'ArrowLeft':
                navigateModalImage(-1);
                break;
            case 'ArrowRight':
                navigateModalImage(1);
                break;
        }
    });
    
    // Backdrop click to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeProjectModal();
        }
    });
}

function openProjectModal(project) {
    const modal = document.getElementById('projectsModal');
    if (!modal) return;
    
    currentModalProject = project;
    currentModalImageIndex = 0;
    
    const title = modal.querySelector('#projects-modal-title');
    if (title) {
        title.textContent = project.title;
    }
    
    updateModalImage();
    modal.showModal();
    
    // Focus trap
    const focusableElements = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length > 0) {
        focusableElements[0].focus();
    }
}

function closeProjectModal() {
    const modal = document.getElementById('projectsModal');
    if (!modal) return;
    
    modal.close();
    currentModalProject = null;
    
    // Return focus to the card that opened the modal
    const card = document.querySelector(`[data-project-id="${currentModalProject?.id}"]`);
    if (card) {
        card.focus();
    }
}

function navigateModalImage(direction) {
    if (!currentModalProject) return;
    
    currentModalImageIndex = (currentModalImageIndex + direction + currentModalProject.images.length) % currentModalProject.images.length;
    updateModalImage();
}

function updateModalImage() {
    if (!currentModalProject) return;
    
    const imageData = currentModalProject.images[currentModalImageIndex];
    const container = document.querySelector('.projects-gallery-images');
    const counter = document.querySelector('.projects-gallery-counter');
    
    if (container) {
        // Create simple image element for modal
        const img = document.createElement('img');
        img.src = `assets/${imageData.original.src}`;
        img.alt = imageData.original.alt;
        img.style.cssText = 'max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: 8px;';
        
        container.innerHTML = '';
        container.appendChild(img);
    }
    
    if (counter) {
        const current = counter.querySelector('.projects-gallery-current');
        const total = counter.querySelector('.projects-gallery-total');
        if (current) current.textContent = currentModalImageIndex + 1;
        if (total) total.textContent = currentModalProject.images.length;
    }
}

function renderProjectsError() {
    const track = document.getElementById('projectsTrack');
    if (!track) return;
    
    track.innerHTML = `
        <div class="projects-loading">
            <p>Unable to load projects. Please try refreshing the page.</p>
            <button onclick="setupEnhancedProjects()" class="btn btn--primary">Retry</button>
        </div>
    `;
}

// Cleanup function for projects
function cleanupProjects() {
    projectAutoAdvanceTimers.forEach(timer => {
        if (timer) clearInterval(timer);
    });
    projectAutoAdvanceTimers = [];
    
    if (projectCarouselTimer) {
        clearInterval(projectCarouselTimer);
        projectCarouselTimer = null;
    }
}

// Add cleanup to existing window beforeunload event
window.addEventListener('beforeunload', cleanupProjects);

// Security Helper Functions
function sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';
    
    // Remove potentially dangerous characters and patterns
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
        .replace(/&lt;script/gi, '') // Remove encoded script tags
        .replace(/&lt;\/script&gt;/gi, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
        .trim()
        .substring(0, 1000); // Limit length
}

function addCSRFProtection(form) {
    // Generate simple CSRF token
    const token = btoa(Date.now() + Math.random().toString()).substring(0, 32);
    
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrf_token';
    csrfInput.value = token;
    
    form.appendChild(csrfInput);
    
    // Store token in sessionStorage for validation
    sessionStorage.setItem('csrf_token', token);
}

function validateCSRFToken(form) {
    const formToken = form.querySelector('input[name="csrf_token"]')?.value;
    const sessionToken = sessionStorage.getItem('csrf_token');
    
    return formToken && sessionToken && formToken === sessionToken;
}

function showFormError(form, message) {
    let errorDiv = form.querySelector('.form-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.cssText = 'color: #e74c3c; padding: 10px; margin: 10px 0; border: 1px solid #e74c3c; border-radius: 4px; background: #fdf2f2;';
        form.insertBefore(errorDiv, form.firstChild);
    }
    errorDiv.textContent = message;
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Content Security and Performance Monitoring
function initializeSecurityMonitoring() {
    // Monitor for potential XSS attempts
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const scripts = node.querySelectorAll?.('script') || [];
                    scripts.forEach((script) => {
                        if (!script.src || !script.src.startsWith(window.location.origin)) {
                            console.warn('Potential XSS attempt detected');
                            script.remove();
                        }
                    });
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Disable dev tools in production (basic deterrent)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
                return false;
            }
        });
        
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
    }
}

// Initialize security monitoring
document.addEventListener('DOMContentLoaded', () => {
    initializeSecurityMonitoring();
});

console.log('🚀 ANELIA DESIGNS: Ultra-fast, secure website loaded with advanced optimizations!');