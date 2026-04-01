import { TIERS, TIER_ORDER, STATUS_HISTORY } from '../../data/mock-data.js';
import { getState } from '../state.js';
import { navigate, onEnter } from '../router.js';
import { fmtNum, fmtRate } from '../utils.js';

let confettiShown = false;

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

  const displayTier = isMaxTier ? currentTier : nextTier;
  const tierInitial = displayTier.name.charAt(0).toUpperCase();

  screen.innerHTML = `
    <div class="screen-header">
      <button class="screen-header__back" id="upgrade-close" aria-label="Назад">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="screen-header__title">${isMaxTier ? 'Ваш статус' : 'Повышение статуса'}</span>
    </div>

    <div class="upgrade-hero">
      <div class="upgrade-hero__avatar upgrade-hero__avatar--${displayTier.id}">${tierInitial}</div>
      ${isMaxTier ? `
        <h1 class="upgrade-hero__title">Вы на максимуме!</h1>
        <p class="upgrade-hero__subtitle">Статус «${currentTier.name}» — лучшие условия уже ваши</p>
      ` : `
        <h1 class="upgrade-hero__title">Поздравляем!</h1>
        <p class="upgrade-hero__subtitle">Статус повышен до «${nextTier.name}»</p>
      `}
    </div>

    <div class="upgrade-benefits">
      <div class="upgrade-benefit">
        <span class="upgrade-benefit__value">${fmtRate(displayTier.dailyRate)}</span>
        <span class="upgrade-benefit__label">ставка/день</span>
      </div>
      <div class="upgrade-benefit">
        <span class="upgrade-benefit__value">${fmtNum(displayTier.maxLimit)} ₽</span>
        <span class="upgrade-benefit__label">макс. лимит</span>
      </div>
    </div>

    ${isMaxTier ? `
    <div class="upgrade-perks-card">
      <div style="font-size: var(--fs-base); font-weight: 700; margin-bottom: var(--sp-sm)">Ваши привилегии</div>
      ${currentTier.perks.map(p => `
        <div class="apply-perk">
          <span class="apply-perk__check">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          ${p}
        </div>
      `).join('')}
    </div>
    ` : ''}

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
      <button class="btn-primary" id="upgrade-ok" aria-label="Отлично">${isMaxTier ? 'Отлично!' : 'Отлично!'}</button>
    </div>
    <div class="upgrade-cta" style="margin-top: calc(-1 * var(--sp-sm))">
      <button class="btn-secondary" id="upgrade-loan" aria-label="Оформить заявку по новой ставке">Оформить заявку по новой ставке</button>
    </div>

    <div class="upgrade-disclaimer">
      Ставка и лимит определяются индивидуально, не является публичной офертой
    </div>
  `;

  screen.querySelector('#upgrade-close')?.addEventListener('click', () => navigate('/lk'));
  screen.querySelector('#upgrade-ok')?.addEventListener('click', () => navigate('/lk'));
  screen.querySelector('#upgrade-loan')?.addEventListener('click', () => navigate('/apply'));

  // Confetti — only once per session
  if (!confettiShown) {
    spawnConfetti(screen);
    confettiShown = true;
  }
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
