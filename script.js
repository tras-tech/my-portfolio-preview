document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const navigation = document.querySelector("nav");
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    const backToTop = document.createElement("button");
    const scrollBehavior = reduceMotion ? "auto" : "smooth";

    function scrollToTarget(target) {
        if (target) target.scrollIntoView({ behavior: scrollBehavior, block: "start" });
    }

    function closeMenu(restoreFocus) {
        if (!menuToggle || !navLinks) return;
        navLinks.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
        document.body.classList.remove("menu-open");
        if (restoreFocus) menuToggle.focus();
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (event) {
            const selector = link.getAttribute("href");
            const target = selector && selector !== "#" ? document.querySelector(selector) : null;
            if (!target) return;
            event.preventDefault();
            closeMenu(false);
            scrollToTarget(target);
        });
    });

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function () {
            const isOpen = !navLinks.classList.contains("active");
            navLinks.classList.toggle("active", isOpen);
            menuToggle.classList.toggle("active", isOpen);
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
            document.body.classList.toggle("menu-open", isOpen);
        });

        window.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && navLinks.classList.contains("active")) closeMenu(true);
        });
    }

    backToTop.type = "button";
    backToTop.className = "back-to-top";
    backToTop.textContent = "↑";
    backToTop.setAttribute("aria-label", "Back to top");
    document.body.appendChild(backToTop);
    backToTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: scrollBehavior });
    });

    let scrollQueued = false;
    function updateScrollState() {
        const isScrolled = window.scrollY > 72;
        if (navigation) navigation.classList.toggle("nav-scrolled", isScrolled);
        backToTop.classList.toggle("show", window.scrollY > 520);
        scrollQueued = false;
    }
    window.addEventListener("scroll", function () {
        if (!scrollQueued) {
            window.requestAnimationFrame(updateScrollState);
            scrollQueued = true;
        }
    }, { passive: true });
    updateScrollState();

    const heroContent = document.querySelector(".hero-content");
    if (heroContent) heroContent.classList.add("hero-loaded");

    const revealSelector = [
        ".about-visual", ".about-content", ".profile-intro", ".profile-card", ".value-item",
        ".services-header", ".service-card", ".projects-heading", ".project-feature", ".logistics-feature", ".partners-content", ".partners-figure",
        ".leadership-heading", ".executive-card", ".car-card", ".contact-header", ".contact-info", ".contact-form"
    ].join(", ");
    const revealItems = Array.from(document.querySelectorAll(revealSelector));

    revealItems.forEach(function (element) {
        element.classList.add("scroll-hidden");
        if (element.matches(".service-card, .executive-card")) {
            const siblings = Array.from(element.parentElement ? element.parentElement.children : []);
            element.style.setProperty("--reveal-delay", String(Math.max(0, siblings.indexOf(element)) * 70) + "ms");
        }
    });

    function revealElement(element) { element.classList.add("scroll-show"); }

    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach(revealElement);
    } else {
        const revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    revealElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -30px" });
        revealItems.forEach(function (element) { revealObserver.observe(element); });
    }

    const navItems = Array.from(document.querySelectorAll('.nav-links a:not(.nav-cta)[href^="#"]'));
    const sectionLinks = navItems.map(function (link) {
        const id = link.getAttribute("href");
        const section = id ? document.querySelector(id) : null;
        return section ? { link: link, section: section } : null;
    }).filter(Boolean);

    function setActiveNavigation(activeSection) {
        sectionLinks.forEach(function (item) {
            const isActive = item.section === activeSection;
            item.link.classList.toggle("is-active", isActive);
            if (isActive) item.link.setAttribute("aria-current", "page");
            else item.link.removeAttribute("aria-current");
        });
    }

    if (sectionLinks.length) {
        if ("IntersectionObserver" in window) {
            const sectionObserver = new IntersectionObserver(function (entries) {
                const visible = entries.filter(function (entry) { return entry.isIntersecting; });
                if (!visible.length) return;
                visible.sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
                setActiveNavigation(visible[0].target);
            }, { rootMargin: "-28% 0px -58% 0px", threshold: [0.05, 0.25, 0.5] });
            sectionLinks.forEach(function (item) { sectionObserver.observe(item.section); });
        } else {
            setActiveNavigation(sectionLinks[0].section);
        }
    }

    document.querySelectorAll("img").forEach(function (image) {
        const markReady = function () { image.classList.add("image-ready"); };
        const showFallback = function () {
            const frame = image.closest(".executive-portrait, .partners-image-wrap, .project-feature, .about-visual, .logistics-feature-image");
            if (frame) {
                image.style.display = "none";
                frame.classList.add("image-fallback");
            }
            markReady();
        };
        image.classList.add("image-loading");
        if (image.complete) {
            if (image.naturalWidth === 0) showFallback();
            else markReady();
        }
        else {
            image.addEventListener("load", markReady, { once: true });
            image.addEventListener("error", showFallback, { once: true });
        }
    });
});
