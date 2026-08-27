/* OB Prime Events — small, dependency-free interactions for the static site. */
(function () {
  "use strict";

  var header = document.querySelector("[data-header]");
  var menuToggle = document.querySelector(".menu-toggle");
  var mainNav = document.querySelector("#main-nav");
  var navLinks = document.querySelectorAll(".nav-link");
  var year = document.querySelector("[data-year]");
  var quoteForm = document.querySelector("[data-quote-form]");
  var formStatus = document.querySelector("[data-form-status]");
  var modal = document.querySelector("[data-lightbox-modal]");
  var modalImage = document.querySelector("[data-lightbox-image]");
  var modalClose = document.querySelector("[data-lightbox-close]");

  if (year) year.textContent = new Date().getFullYear();

  function closeMenu() {
    if (!mainNav || !menuToggle) return;
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navLinks.forEach(function (link) { link.addEventListener("click", closeMenu); });
  }

  function updateHeader() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 16);
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  var observer = "IntersectionObserver" in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 })
    : null;
  document.querySelectorAll(".reveal").forEach(function (element) {
    if (observer) observer.observe(element);
    else element.classList.add("is-visible");
  });

  var sections = document.querySelectorAll("main section[id]");
  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  function openLightbox(source, alt) {
    if (!modal || !modalImage) return;
    modalImage.src = source;
    modalImage.alt = alt || "OB Prime Events setup";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeLightbox() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  document.querySelectorAll("[data-lightbox]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var image = trigger.querySelector("img");
      openLightbox(trigger.getAttribute("data-lightbox"), image ? image.alt : "");
    });
  });
  if (modalClose) modalClose.addEventListener("click", closeLightbox);
  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeLightbox();
  });

  function formatDate(value) {
    if (!value) return "date to be confirmed";
    var date = new Date(value + "T00:00:00");
    return date.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });
  }

  if (quoteForm) {
    quoteForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(quoteForm);
      var name = data.get("name");
      var contact = data.get("contact");
      var date = formatDate(data.get("date"));
      var guests = data.get("guests") || "guest count to be confirmed";
      var message = data.get("message") || "Event details to be discussed.";
      var enquiry = [
        "Hello OB Prime Events,",
        "",
        "I'd like to request a quote.",
        "Name: " + name,
        "Contact: " + contact,
        "Event date: " + date,
        "Approx. guests: " + guests,
        "Details: " + message
      ].join("\n");

      /*
       * Add the real number when ready, digits only with country code:
       * var whatsappNumber = "2547XXXXXXXX";
       * The empty value intentionally prevents the site from sending enquiries
       * to a number that has not yet been supplied.
       */
      var whatsappNumber = "";
      if (whatsappNumber) {
        window.open("https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(enquiry), "_blank", "noopener");
        formStatus.textContent = "Your enquiry is ready in WhatsApp.";
        formStatus.classList.add("success");
      } else if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(enquiry).then(function () {
          formStatus.textContent = "Your enquiry is copied. Add OB's WhatsApp number to send it.";
          formStatus.classList.add("success");
        }).catch(function () {
          formStatus.textContent = "Add OB's WhatsApp number in script.js before publishing.";
        });
      } else {
        formStatus.textContent = "Add OB's WhatsApp number in script.js before publishing.";
      }
    });
  }
})();