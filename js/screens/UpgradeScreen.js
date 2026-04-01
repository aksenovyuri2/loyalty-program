import { TIERS, TIER_ORDER, STATUS_HISTORY } from '../../data/mock-data.js';
import { getState } from '../state.js';
import { navigate, onEnter } from '../router.js';

export function initUpgradeScreen() {
  const screen = document.getElementById('screen-upgrade');
  render(screen);
  onEnter('/upgrade', () => render(screen));
}

function render(screen) {
  const state = getState();
  const currentIdx = TIER_ORDER.indexOf(state.currentTier);
  const isMaxTier = currentIdx >= TIER_ORDER.length - 1;
  const nextTierId = isMaxTier ? state.currentTier : TIER_ORDER[currentIdx + 1];
  const nextTier = TIERS[nextTierId];
  const currentTier = TIERS[state.currentTier];

  screen.innerHTML = `
    <div class="app-header">
      <div class="app-header__logo">boostra</div>
      <div class="app-header__icons">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1l4 4m0 0a11 11 0 1 1-4 4"/></svg>
      </div>
    </div>

    <div class="upgrade-card-area">
      <div class="upgrade-user-card upgrade-user-card--${isMaxTier ? state.currentTier : nextTierId}">
        <div class="upgrade-user-card__left">
          <div class="upgrade-user-card__avatar"></div>
          <div class="upgrade-user-card__name">${state.user.fullName}</div>
        </div>
        <div class="upgrade-user-card__right">
          <span class="upgrade-user-card__badge">${isMaxTier ? currentTier.name : nextTier.name}</span>
          <button class="upgrade-user-card__close" id="upgrade-close">✕</button>
        </div>
      </div>
    </div>

    ${isMaxTier ? `
    <div class="upgrade-body">
      <h1 class="upgrade-body__title">Вы на максимуме!</h1>
      <p class="upgrade-body__subtitle">У вас максимальный статус «${currentTier.name}» — лучшие условия уже ваши</p>
    </div>

    <div class="upgrade-benefits">
      <div class="upgrade-benefit">
        <span class="upgrade-benefit__label">Ваша ставка</span>
        <span class="upgrade-benefit__value">${fmtRate(currentTier.dailyRate)}/день</span>
      </div>
      <div class="upgrade-benefit">
        <span class="upgrade-benefit__label">Ваш лимит</span>
        <span class="upgrade-benefit__value">${fmtNum(currentTier.maxLimit)} ₽</span>
      </div>
    </div>

    <div class="section-title" style="text-align:left">Ваши привилегии</div>
    <div class="apply-perks" style="padding: 0 var(--sp-base); margin-bottom: var(--sp-xl)">
      ${currentTier.perks.map(p => `
        <div class="apply-perk">
          <span class="apply-perk__check">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          ${p}
        </div>
      `).join('')}
    </div>
    ` : `
    <div class="upgrade-body">
      <h1 class="upgrade-body__title">Поздравляем!</h1>
      <p class="upgrade-body__subtitle">Статус повышен до «${nextTier.name}»</p>
    </div>

    <div class="upgrade-benefits">
      <div class="upgrade-benefit">
        <span class="upgrade-benefit__label">Ставка от</span>
        <span class="upgrade-benefit__value">${fmtRate(nextTier.dailyRate)}/день</span>
      </div>
      <div class="upgrade-benefit">
        <span class="upgrade-benefit__label">Доступно до</span>
        <span class="upgrade-benefit__value">${fmtNum(nextTier.maxLimit)} ₽</span>
      </div>
    </div>
    `}

    <div class="section-title" style="text-align:left">История статусов</div>
    <div class="upgrade-history">
      ${STATUS_HISTORY.slice().reverse().map(h => `
        <div class="history-item history-item--${h.tier}">
          <div class="history-item__left">
            <span class="pill--tier pill--tier-${h.tier}">${TIERS[h.tier].name}</span>
            ${h.active ? '<span class="history-item__badge history-item__badge--current">текущий</span>' : ''}
          </div>
          <span class="history-item__date">${h.date}</span>
        </div>
      `).join('')}
    </div>

    <div class="upgrade-cta">
      <button class="btn-loan" id="upgrade-loan">${isMaxTier ? 'Оформить заявку' : 'Получить займ'}</button>
    </div>

    <div class="upgrade-disclaimer">
      Ставка и лимит определяются индивидуально, не является публичной офертой
    </div>
  `;

  screen.querySelector('#upgrade-close')?.addEventListener('click', () => navigate('/lk'));
  screen.querySelector('#upgrade-loan')?.addEventListener('click', () => navigate(isMaxTier ? '/apply' : '/lk'));

  // Spawn confetti
  spawnConfetti(screen);
}

function spawnConfetti(screen) {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  screen.prepend(container);

  const colors = ['#ffd700', '#e8870e', '#2eaa57', '#2b7de9', '#e05a3a', '#c0c0c0'];
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random() * 100 + '%';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDelay = (Math.random() * 1.2) + 's';
    el.style.animationDuration = (1.8 + Math.random() * 1.5) + 's';
    el.style.width = (5 + Math.random() * 6) + 'px';
    el.style.height = (5 + Math.random() * 6) + 'px';
    container.appendChild(el);
  }
}

function fmtNum(n) { return new Intl.NumberFormat('ru-RU').format(n); }
function fmtRate(r) { return r.toFixed(2).replace('.', ',') + '%'; }
