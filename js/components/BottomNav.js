import { navigate } from '../router.js';

const NAV_ITEMS = [
  {
    route: '/lk',
    label: 'Главная',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor" stroke="none">b</text></svg>`,
  },
  {
    route: '/apply',
    label: 'Заявка',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  },
  {
    route: '/status',
    label: 'Статус',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  },
  {
    route: '/faq',
    label: 'Preview',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  },
];

export function renderBottomNav(container) {
  container.innerHTML = `
    <nav class="bottom-nav" role="navigation" aria-label="Основная навигация">
      ${NAV_ITEMS.map(item => `
        <button class="bottom-nav__item"
                data-route="${item.route}"
                aria-label="${item.label}">
          <span class="bottom-nav__icon">
            ${item.icon}
          </span>
          <span class="bottom-nav__label">${item.label}</span>
        </button>
      `).join('')}
    </nav>
  `;

  container.querySelectorAll('.bottom-nav__item').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });
}
