import { BASE_RATE } from '../../data/mock-data.js';
import { navigate, onEnter } from '../router.js';
import { fmtRate } from '../utils.js';

export function initOnboardingScreen() {
  const screen = document.getElementById('screen-onboarding');
  render(screen);
  onEnter('/onboarding', () => render(screen));
}

function render(screen) {
  screen.innerHTML = `
    <div class="onb-header">
      <button class="onb-close-btn" id="onb-close" aria-label="Закрыть">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="onb-hero">
      <div class="onb-hero__icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </div>
      <div class="onb-hero__title">Программа лояльности</div>
      <div class="onb-hero__sub">Берите займы — платите меньше</div>
    </div>

    <div class="onb-steps">
      <div class="onb-step">
        <div class="onb-step__num">1</div>
        <div class="onb-step__content">
          <div class="onb-step__title">Оформляете займ</div>
          <div class="onb-step__text">По ставке вашего уровня — уже выгоднее стандартных ${fmtRate(BASE_RATE)}/день</div>
        </div>
      </div>
      <div class="onb-step">
        <div class="onb-step__num">2</div>
        <div class="onb-step__content">
          <div class="onb-step__title">Погашаете вовремя</div>
          <div class="onb-step__text">Каждый своевременный платёж засчитывается в прогресс статуса</div>
        </div>
      </div>
      <div class="onb-step">
        <div class="onb-step__num">3</div>
        <div class="onb-step__content">
          <div class="onb-step__title">Статус растёт — ставка падает</div>
          <div class="onb-step__text">Бронза → Серебро → Золото. Чем выше статус, тем ниже ставка и выше лимит</div>
        </div>
      </div>
    </div>

    <div style="padding: var(--sp-xl) var(--sp-base); padding-bottom: calc(var(--bottom-nav-height, 64px) + var(--sp-xl))">
      <button class="btn-primary" id="onb-ok" style="width: 100%" aria-label="Понятно">Понятно!</button>
    </div>
  `;

  screen.querySelector('#onb-close')?.addEventListener('click', () => history.back());
  screen.querySelector('#onb-ok')?.addEventListener('click', () => history.back());
}
