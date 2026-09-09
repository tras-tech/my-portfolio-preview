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

    // Vehicle sales: inventory lives in cars-data.js so vehicles can be updated in one place.
    const inventory = Array.isArray(window.CAR_INVENTORY) ? window.CAR_INVENTORY : [];
    const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
    const listingGrid = document.getElementById("cars-listing-grid");
    const homeTrack = document.getElementById("homepage-cars");
    const homeNote = document.getElementById("homepage-cars-note");
    const dialog = document.getElementById("car-details-dialog");
    const detailsContent = document.getElementById("car-details-content");

    function esc(value) {
        return String(value == null ? "" : value).replace(/[&<>'\"]/g, function (character) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[character];
        });
    }
    function titleOf(car) { return esc(car.year) + " " + esc(car.make) + " " + esc(car.model); }
    function imagesOf(car) { return Array.isArray(car.images) ? car.images : (car.image ? [car.image] : []); }
    function phoneOf(car) { return car.phone || "+2348033969149"; }
    function whatsappLink(car) {
        const number = String(car.whatsapp || "2348033969149").replace(/\D/g, "");
        return "https://wa.me/" + number + "?text=" + encodeURIComponent("Hello Humble David Global Logistics, I am interested in the " + car.year + " " + car.make + " " + car.model + ".");
    }
    function cardMarkup(car, homepage) {
        const sold = String(car.availability).toUpperCase() === "SOLD";
        const image = imagesOf(car)[0] ? '<img src="' + esc(imagesOf(car)[0]) + '" alt="' + titleOf(car) + '" loading="lazy">' : "";
        const details = homepage ? 'cars.html?car=' + encodeURIComponent(car.id) : '#details';
        return '<article class="vehicle-card' + (sold ? ' vehicle-sold' : '') + '">' +
            '<div class="vehicle-image">' + image + '<span class="vehicle-status ' + (sold ? 'status-sold' : 'status-available') + '">' + (sold ? 'SOLD' : 'AVAILABLE') + '</span></div>' +
            '<div class="vehicle-content"><p class="vehicle-eyebrow">' + esc(car.condition) + ' · ' + esc(car.location) + '</p><h3>' + titleOf(car) + '</h3>' +
            '<p class="vehicle-price">' + money.format(Number(car.price) || 0) + '</p><p class="vehicle-summary">' + esc(car.condition) + ' · ' + esc(car.year) + '</p>' +
            '<div class="vehicle-actions"><a class="vehicle-detail" href="' + details + '" data-car-id="' + esc(car.id) + '">View details</a><a class="vehicle-whatsapp" href="' + whatsappLink(car) + '" target="_blank" rel="noopener">WhatsApp us</a><a class="vehicle-call" href="tel:' + esc(phoneOf(car)) + '">Call us</a></div></div></article>';
    }
    function populateSelect(id, values) {
        const select = document.getElementById(id);
        if (!select) return;
        values.filter(Boolean).filter(function (item, index, all) { return all.indexOf(item) === index; }).sort().forEach(function (value) {
            select.insertAdjacentHTML("beforeend", '<option value="' + esc(value) + '">' + esc(value) + '</option>');
        });
    }
    function showDetails(car) {
        if (!dialog || !detailsContent || !car) return;
        const sold = String(car.availability).toUpperCase() === "SOLD";
        const images = imagesOf(car).map(function (src) { return '<img src="' + esc(src) + '" alt="' + titleOf(car) + '">'; }).join("");
        detailsContent.innerHTML = '<div class="details-gallery">' + images + '</div><div class="details-copy"><span class="vehicle-status ' + (sold ? 'status-sold' : 'status-available') + '">' + (sold ? 'SOLD' : 'AVAILABLE') + '</span><p class="details-kicker">' + esc(car.condition) + ' · ' + esc(car.location) + '</p><h2 id="car-details-title">' + titleOf(car) + '</h2><p class="details-price">' + money.format(Number(car.price) || 0) + '</p><p class="details-description">' + esc(car.description) + '</p><dl class="vehicle-specs"><div><dt>Mileage</dt><dd>' + esc(car.mileage) + '</dd></div><div><dt>Transmission</dt><dd>' + esc(car.transmission) + '</dd></div><div><dt>Engine</dt><dd>' + esc(car.engine) + '</dd></div><div><dt>Fuel</dt><dd>' + esc(car.fuel) + '</dd></div><div><dt>Condition</dt><dd>' + esc(car.condition) + '</dd></div><div><dt>Location</dt><dd>' + esc(car.location) + '</dd></div></dl><div class="details-actions"><a class="btn btn-gold" href="' + whatsappLink(car) + '" target="_blank" rel="noopener">WhatsApp us</a><a class="btn" href="tel:' + esc(phoneOf(car)) + '">Call us</a></div></div>';
        if (!dialog.open) dialog.showModal();
    }
    function bindDetails(scope) {
        scope.querySelectorAll(".vehicle-detail").forEach(function (link) {
            link.addEventListener("click", function (event) {
                if (!listingGrid) return;
                event.preventDefault();
                showDetails(inventory.find(function (car) { return String(car.id) === link.dataset.carId; }));
            });
        });
    }
    if (homeTrack) {
        const available = inventory.filter(function (car) { return String(car.availability).toUpperCase() === "AVAILABLE"; });
        homeTrack.innerHTML = available.map(function (car) { return cardMarkup(car, true); }).join("");
        if (homeNote) homeNote.hidden = available.length > 0;
        const viewport = homeTrack.parentElement;
        const moveCarousel = function (direction) { viewport.scrollBy({ left: direction * Math.max(280, viewport.clientWidth * .78), behavior: reduceMotion ? "auto" : "smooth" }); };
        const previous = document.querySelector(".carousel-prev"), next = document.querySelector(".carousel-next");
        if (previous) previous.addEventListener("click", function () { moveCarousel(-1); });
        if (next) next.addEventListener("click", function () { moveCarousel(1); });
        if (available.length > 1 && !reduceMotion) setInterval(function () { if (viewport.scrollLeft + viewport.clientWidth >= homeTrack.scrollWidth - 8) viewport.scrollTo({ left: 0, behavior: "smooth" }); else moveCarousel(1); }, 5000);
    }
    if (listingGrid) {
        populateSelect("filter-make", inventory.map(function (car) { return car.make; })); populateSelect("filter-model", inventory.map(function (car) { return car.model; })); populateSelect("filter-year", inventory.map(function (car) { return car.year; })); populateSelect("filter-condition", inventory.map(function (car) { return car.condition; }));
        const empty = document.getElementById("listing-empty"), count = document.getElementById("listing-count");
        function renderListing() {
            const make = document.getElementById("filter-make").value, model = document.getElementById("filter-model").value, year = document.getElementById("filter-year").value, condition = document.getElementById("filter-condition").value, range = document.getElementById("filter-price").value.split("-");
            const filtered = inventory.filter(function (car) { return (!make || car.make === make) && (!model || car.model === model) && (!year || String(car.year) === year) && (!condition || car.condition === condition) && (!range[0] || Number(car.price) >= Number(range[0])) && (!range[1] || Number(car.price) <= Number(range[1])); });
            listingGrid.innerHTML = filtered.map(function (car) { return cardMarkup(car, false); }).join(""); bindDetails(listingGrid);
            if (count) count.textContent = filtered.length ? filtered.length + " vehicle" + (filtered.length === 1 ? "" : "s") + " found" : "";
            if (empty) { empty.hidden = filtered.length > 0; empty.textContent = inventory.length ? "No vehicles match those filters." : "Our current stock is being updated. Contact us to ask about vehicle sourcing."; }
        }
        document.getElementById("car-filters").addEventListener("input", renderListing); document.getElementById("car-filters").addEventListener("reset", function () { setTimeout(renderListing, 0); }); renderListing();
        const requestedId = new URLSearchParams(window.location.search).get("car"); if (requestedId) showDetails(inventory.find(function (car) { return String(car.id) === requestedId; }));
    }
    if (dialog) { dialog.querySelector(".dialog-close").addEventListener("click", function () { dialog.close(); }); dialog.addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); }); }

    document.querySelectorAll("[data-page-link]").forEach(function (card) {
        const destination = card.dataset.pageLink;
        function openDestination(event) {
            if (event.target.closest("a")) return;
            window.location.href = destination;
        }
        card.addEventListener("click", openDestination);
        card.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); window.location.href = destination; } });
    });
});
