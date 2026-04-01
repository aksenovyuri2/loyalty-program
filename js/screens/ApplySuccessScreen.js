import { TIERS } from '../../data/mock-data.js';
import { getState } from '../state.js';
import { navigate, onEnter } from '../router.js';

export function initApplySuccessScreen() {
  const screen = document.getElementById('screen-apply-success');
  render(screen);
  onEnter('/apply-success', () => render(screen));
}

function render(screen) {
  const state = getState();
  const tier = TIERS[state.currentTier];

  screen.innerHTML = `
    <div class="app-header">
      <div class="app-header__logo">boostra</div>
    </div>

    <div class="empty-state" style="padding-top: 60px">
      <div class="empty-state__icon" style="background: rgba(46,170,87,0.12); width: 80px; height: 80px">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--brand-green)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 class="empty-state__title">Заявка отправлена!</h2>
      <p class="empty-state__text">
        Мы рассмотрим вашу заявку в ближайшее время.
        Статус <strong>${tier.name}</strong> даёт вам приоритет в обработке.
      </p>
      <button class="btn-repay" style="width: 100%; max-width: 300px" id="success-to-lk">Вернуться в ЛК</button>
    </div>
  `;

  screen.querySelector('#success-to-lk')?.addEventListener('click', () => navigate('/lk'));
}
