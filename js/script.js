const legalFooter = document.querySelector(".main-footer");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (legalFooter && !reduceMotion && "IntersectionObserver" in window) {
	legalFooter.classList.add("reveal-on-scroll");

	const footerObserver = new IntersectionObserver((entries, observer) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			}
		}
	}, { threshold: 0.15 });

	footerObserver.observe(legalFooter);
}
