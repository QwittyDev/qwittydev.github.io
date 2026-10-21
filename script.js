(() => {
  const menuBtn = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const progress = document.querySelector('.scroll-progress');
  const toast = document.getElementById('toast');
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  function setMenu(open) {
    if (!menuBtn || !mobileNav) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    mobileNav.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  }
  menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', e => {
    if (menuBtn && mobileNav && !mobileNav.hidden && !mobileNav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
  });

  let frame = 0;
  function onScroll() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (progress) progress.style.transform = `scaleX(${max > 0 ? doc.scrollTop / max : 0})`;
      document.querySelector('.header')?.classList.toggle('is-scrolled', doc.scrollTop > 15);
      frame = 0;
    });
  }
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('motion-enabled');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px 35px 0px' });
    document.querySelectorAll('.reveal, .fade-in').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal, .fade-in').forEach(el => el.classList.add('visible'));
  }

  document.querySelectorAll('.faq-list details').forEach(details => details.addEventListener('toggle', () => {
    if (details.open) document.querySelectorAll('.faq-list details').forEach(other => { if (other !== details) other.open = false; });
  }));


  // Highlight current section in the desktop navigation.
  if ('IntersectionObserver' in window) {
    const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
    const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(a => {
          const active = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('active', active);
          if (active) a.setAttribute('aria-current','location');
          else a.removeAttribute('aria-current');
        });
      });
    }, {rootMargin:'-22% 0px -60% 0px'});
    sections.forEach(section => sectionObserver.observe(section));
  }

  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 5500);
  }
  // Regular same-origin <a download> performs an actual file download when QwittyGram.apk exists.
  // A HEAD check only prevents confusing 404 navigation before it has been uploaded.
  let availability = null;
  fetch('./QwittyGram.apk', {method:'HEAD', cache:'no-store'})
    .then(r => { availability = r.ok; })
    .catch(() => { availability = null; });
  document.querySelectorAll('.apk-link').forEach(anchor => anchor.addEventListener('click', e => {
    if (availability === false) {
      e.preventDefault();
      showToast('APK пока не опубликован. Загрузка появится после размещения файла QwittyGram.apk на сайте.');
    }
  }));
})();
