import { navigate } from '../router.js';

const NAV_ITEMS = [
  {
    route: '/lk',
    label: 'Главная',
    dot: true,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor" stroke="none">b</text></svg>`,
  },
  {
    route: null,
    label: 'Документы',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  },
  {
    route: '/status',
    label: 'Статус',
    dot: true,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  },
  {
    route: null,
    label: 'Карты',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
  },
  {
    route: null,
    label: 'FAQ',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  },
];

export function renderBottomNav(container) {
  container.innerHTML = `
    <nav class="bottom-nav">
      ${NAV_ITEMS.map(item => `
        <button class="bottom-nav__item" data-route="${item.route || ''}">
          <span class="bottom-nav__icon">
            ${item.icon}
            ${item.dot ? '<span class="bottom-nav__dot"></span>' : ''}
          </span>
          <span class="bottom-nav__label">${item.label}</span>
        </button>
      `).join('')}
    </nav>
  `;

  container.querySelectorAll('.bottom-nav__item').forEach(btn => {
    btn.addEventListener('click', () => {
      const route = btn.dataset.route;
      if (route) navigate(route);
    });
  });
}
