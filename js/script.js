document.addEventListener('DOMContentLoaded', () => {
  const $ = (s) => document.querySelector(s), $$ = (s) => document.querySelectorAll(s);
  const nav = $('#mainNav'), progress = $('#scrollProgress'), back = $('#backToTop');
  function scrollUI() {
    const y = window.scrollY,
      h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? y / h * 100 : 0) + '%';
    nav.classList.toggle('scrolled', y > 20);
    back.classList.toggle('show', y > 500);
  }
  window.addEventListener('scroll', scrollUI, { passive: true });
  scrollUI();
  back?.addEventListener('click', () => window.scrollTo({
    top: 0, behavior: 'smooth'
  }));

  const theme = $('#themeToggle');
  const saved = localStorage.getItem('serene-theme');
  if (saved === 'dark') {
    document.body.classList.add('dark-mode');
    theme.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
  }

  theme?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const dark = document.body.classList.contains('dark-mode');
    localStorage.setItem('serene-theme', dark ? 'dark' : 'light');
    theme.innerHTML = dark ?
      '<i class="bi bi-moon-stars-fill"></i>' : '<i class="bi bi-sun-fill"></i>';
  });

  const sections = [...$$('main section[id]')], links = [...$$('.nav-link')];
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    }),
    {
      rootMargin: '-30% 0px -60% 0px', threshold: 0
    });

  sections.forEach(s => observer.observe(s));
  links.forEach(l => l.addEventListener('click', () => {
    const menu = $('#navbarContent');
    if (menu.classList.contains('show') && window.bootstrap)
      bootstrap.Collapse.getOrCreateInstance(menu).hide();
  }));

  $$('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    $$('.service-item').forEach(item => {
      item.style.display = f === 'all' || item.dataset.category === f ? 'block' : 'none';
    });
  }));

  const range = $('#comparisonRange'), before = $('#beforeLayer'), handle = $('#compareHandle');
  function compare(v) {
    before.style.width = v + '%';
    handle.style.left = v + '%';
    handle.setAttribute('aria-valuenow', v);
  }

  range?.addEventListener('input', e => compare(
    e.target.value
  ));

  handle?.addEventListener('keydown', e => {
    let v = +range.value;
    if (e.key === 'ArrowLeft')
      v = Math.max(0, v - 5);
    if (e.key === 'ArrowRight')
      v = Math.min(100, v + 5);
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault(); range.value = v; compare(v);
    }
  });

  const stats = $$('.stat'); let counted = false;
  const statObs = new IntersectionObserver(es => {
    if (es.some(e => e.isIntersecting) && !counted) {
      counted = true; stats.forEach(el => {
        const target = +el.dataset.target;
        let start = 0;
        const step = Math.max(1, Math.ceil(target / 45));
        const timer = setInterval(() => {
          start = Math.min(target, start + step);
          el.textContent = start;
          if (start >= target)
            clearInterval(timer)
        }, 25);
      });
      statObs.disconnect();
    }
  },
    { threshold: .35 });
  if ($('#services'))
    statObs.observe($('.stats-section'));

  const modal = $('#appointmentModal'),
    form = $('#appointmentForm'),
    date = $('#apptDate'),
    service = $('#serviceType'),
    packageType = $('#packageType');

  if (date) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    date.min = d.toISOString().split('T')[0];
  }
  
  $$('[data-service]').forEach(b => {
    b.addEventListener('click', () => {
      setTimeout(() => {
        if (service) {
          service.value = b.dataset.service;
        }
      }, 100);
    });
  });

  $$('.package-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedPackage = btn.dataset.package;

      setTimeout(() => {
        if (packageType) {
          packageType.value = selectedPackage;
        }
      }, 100);
    });
  });


  function error(id, msg) {
    const e = $('#' + id);
    if (e) e.textContent = msg;
  }

  form?.addEventListener('submit', e => {
    e.preventDefault();
    ['nameError', 'phoneError', 'emailError', 'packageError']
      .forEach(x => error(x, ''));
    $('#formError').classList.add('d-none');
    $('#formSuccess').classList.add('d-none');
    let ok = true;
    const name = $('#patientName').value.trim(),
      phone = $('#phone').value.trim(),
      email = $('#email').value.trim(),
      selectedPackage = packageType ? packageType.value : '';
    if (!selectedPackage) {
      error('packageError', 'Please choose a care package.');
      ok = false;
    }
    if (name.length < 2) {
      error('nameError', 'Enter your full name.');
      ok = false;
    }
    if (!/^[+\d][\d\s()-]{7,}$/.test(phone)) {
      error('phoneError', 'Enter a valid phone number.');
      ok = false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      error('emailError', 'Enter a valid email address.');
      ok = false;
    }
    if (!service.value || !date.value || !$('#apptTime').value) {
      ok = false;
    }
    if (!ok) {
      $('#formError').classList.remove('d-none');
      return;
    }
    $('#formSuccess').classList.remove('d-none');
    form.querySelectorAll('input,select,textarea,button[type="submit"]').forEach(x => x.disabled = true);
    setTimeout(() => {
      form.reset();
      form.querySelectorAll('input,select,textarea,button[type="submit"]').forEach(x => x.disabled = false);
      if (window.bootstrap)
        bootstrap.Modal.getOrCreateInstance(modal).hide();
      $('#formSuccess').classList.add('d-none');
    }, 2600);
  });

  const reveal = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      reveal.unobserve(e.target);
    }
  }),
    {
      threshold: .12
    }
  );
  $$('.service-card,.price-card,.doctor-card,.testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity .65s ease,transform .65s ease';
    reveal.observe(el);
  });
});
