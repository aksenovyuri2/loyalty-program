import { TIERS, TIER_ORDER, STATUS_HISTORY } from '../../data/mock-data.js';
import { getState } from '../state.js';
import { navigate, onEnter } from '../router.js';

let activeTab = null;

export function initStatusScreen() {
  const screen = document.getElementById('screen-status');
  render(screen);
  onEnter('/status', () => {
    activeTab = null;
    render(screen);
  });
}

function render(screen) {
  const state = getState();
  const currentTier = state.currentTier;
  const viewTier = activeTab || currentTier;
  const tier = TIERS[viewTier];
  const currentIdx = TIER_ORDER.indexOf(currentTier);

  screen.innerHTML = `
    <div class="screen-header">
      <button class="screen-header__back" id="status-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="screen-header__title">Ваш статус</span>
    </div>

    <div class="status-card-area">
      <div class="status-card status-card--${currentTier}">
        <div class="status-card__avatar">${TIERS[currentTier].name.charAt(0)}</div>
        <div class="status-card__label">Ваш статус</div>
        <div class="status-card__tier">${TIERS[currentTier].name}</div>
      </div>
    </div>

    <div class="status-progress">
      <div class="status-progress__bar">
        <div class="status-progress__fill status-progress__fill--${currentTier}" style="width: 65%"></div>
      </div>
      <div class="status-progress__labels">
        <span>${fmtNum(10000)} ₽</span>
      </div>
    </div>

    <div class="section-title">Выгоды</div>
    <div class="benefits-section">
      ${TIER_ORDER.map((tid, idx) => {
        const t = TIERS[tid];
        const isActive = idx <= currentIdx;
        return `
          <div class="benefit-row ${!isActive ? 'benefit-row--inactive' : ''}">
            <div class="benefit-row__tier">
              <span class="benefit-row__dot benefit-row__dot--${tid}"></span>
              <span class="benefit-row__name">${t.name}</span>
            </div>
            <span class="benefit-row__value">Ставка от ${fmtRate(t.dailyRate)}/день</span>
          </div>
          <div class="benefit-row ${!isActive ? 'benefit-row--inactive' : ''}">
            <div class="benefit-row__tier">
              <span class="benefit-row__dot" style="visibility:hidden"></span>
              <span class="benefit-row__name" style="color:var(--color-text-secondary)">Лимит до</span>
            </div>
            <span class="benefit-row__value">${fmtNum(t.maxLimit)} ₽</span>
          </div>
        `;
      }).join('')}
    </div>

    <div class="section-title">Условия перехода</div>
    <div class="tab-bar">
      ${TIER_ORDER.map(tid => {
        const t = TIERS[tid];
        const isActive = tid === viewTier;
        return `<button class="tab-btn ${isActive ? 'active--' + tid : ''}" data-view-tier="${tid}">${t.name}</button>`;
      }).join('')}
    </div>
    <div class="conditions-section">
      ${tier.conditions.map(c => `
        <div class="condition-item">
          <div class="condition-item__left">
            <div class="condition-item__check ${c.completed ? 'condition-item__check--done' : ''}">
              ${c.completed ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
            </div>
            <span class="condition-item__text">${c.text}</span>
          </div>
          <span class="condition-item__amount">${fmtNum(c.amount)} ₽</span>
        </div>
      `).join('')}
    </div>

    <div class="section-title">История статусов</div>
    <div class="history-section">
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
  `;

  // Back button
  screen.querySelector('#status-back')?.addEventListener('click', () => navigate('/lk'));

  // Tab switching — local re-render only
  screen.querySelectorAll('[data-view-tier]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.viewTier;
      render(screen);
    });
  });
}

function fmtNum(n) { return new Intl.NumberFormat('ru-RU').format(n); }
function fmtRate(r) { return r.toFixed(2).replace('.', ',') + '%'; }
