import { TIERS, TIER_ORDER, TIER_PROGRESS, BASE_RATE, STATUS_HISTORY } from '../../data/mock-data.js';
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
  const tier = TIERS[currentTier];
  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const isMaxTier = currentIdx >= TIER_ORDER.length - 1;
  const nextTierId = isMaxTier ? null : TIER_ORDER[currentIdx + 1];
  const nextTier = nextTierId ? TIERS[nextTierId] : null;

  const prog = TIER_PROGRESS;
  const progressPct = Math.round((prog.loansCompleted / prog.loansNeeded) * 100);
  const loansLeft = prog.loansNeeded - prog.loansCompleted;

  // Default tab = next tier (P0 fix), or current if max
  const viewTier = activeTab || (isMaxTier ? currentTier : nextTierId);
  const viewTierData = TIERS[viewTier];

  // Savings example: 10 000 ₽ on 10 days
  const exampleAmount = 10000;
  const exampleDays = 10;
  const baseInterest = exampleAmount * (BASE_RATE / 100) * exampleDays;
  const currentInterest = exampleAmount * (tier.dailyRate / 100) * exampleDays;
  const nextInterest = nextTier ? exampleAmount * (nextTier.dailyRate / 100) * exampleDays : 0;
  const savingsVsBase = baseInterest - currentInterest;
  const savingsNextVsCurrent = nextTier ? currentInterest - nextInterest : 0;

  screen.innerHTML = `
    <div class="screen-header">
      <button class="screen-header__back" id="status-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="screen-header__title">Ваш статус</span>
    </div>

    <!-- Status card with rate + limit (P0) -->
    <div class="status-card-area">
      <div class="status-card status-card--${currentTier}">
        <div class="status-card__top">
          <div class="status-card__tier-name">${tier.name}</div>
          <div class="status-card__badge">Программа лояльности</div>
        </div>
        <div class="status-card__metrics">
          <div class="status-card__metric">
            <span class="status-card__metric-value"><s class="status-card__metric-old">${fmtRate(BASE_RATE)}</s> ${fmtRate(tier.dailyRate)}</span>
            <span class="status-card__metric-label">ставка/день</span>
          </div>
          <div class="status-card__metric">
            <span class="status-card__metric-value">${fmtNum(tier.maxLimit)} ₽</span>
            <span class="status-card__metric-label">макс. лимит</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress bar with labels (P0) -->
    ${!isMaxTier ? `
    <div class="status-progress-section">
      <div class="status-progress__header">
        <span class="status-progress__title">Погашено ${prog.loansCompleted} из ${prog.loansNeeded} займов</span>
        <span class="status-progress__target">до «${nextTier.name}»</span>
      </div>
      <div class="status-progress__bar">
        <div class="status-progress__fill status-progress__fill--${currentTier}" style="width: ${progressPct}%"></div>
      </div>
      <div class="status-progress__hint">Ещё ${loansLeft} ${loanWord(loansLeft)} вовремя — и статус повысится</div>
    </div>
    ` : `
    <div class="status-progress-section">
      <div class="status-progress__header">
        <span class="status-progress__title">Максимальный уровень</span>
      </div>
      <div class="status-progress__bar">
        <div class="status-progress__fill status-progress__fill--${currentTier}" style="width: 100%"></div>
      </div>
      <div class="status-progress__hint">Вам доступны лучшие условия</div>
    </div>
    `}

    <!-- Tier comparison (P1: compact rows) -->
    <div class="section-title">Ставки по уровням</div>
    <div class="status-tiers-compare">
      ${TIER_ORDER.map((tid, idx) => {
        const t = TIERS[tid];
        const isCurrent = tid === currentTier;
        const isLocked = idx > currentIdx;
        return `
          <div class="status-tier-row ${isCurrent ? 'status-tier-row--current' : ''} ${isLocked ? 'status-tier-row--locked' : ''}">
            <div class="status-tier-row__left">
              <span class="status-tier-row__dot status-tier-row__dot--${tid}"></span>
              <span class="status-tier-row__name">${t.name}</span>
              ${isCurrent ? '<span class="status-tier-row__badge">ваш</span>' : ''}
            </div>
            <div class="status-tier-row__right">
              <span class="status-tier-row__rate">${fmtRate(t.dailyRate)}/день</span>
              <span class="status-tier-row__limit">до ${fmtNum(t.maxLimit)} ₽</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Savings example (P2) -->
    ${!isMaxTier ? `
    <div class="status-savings-example">
      <div class="status-savings-example__title">Пример экономии</div>
      <div class="status-savings-example__subtitle">Займ ${fmtNum(exampleAmount)} ₽ на ${exampleDays} дней</div>
      <div class="status-savings-example__rows">
        <div class="status-savings-example__row">
          <span>Без программы (${fmtRate(BASE_RATE)})</span>
          <span>${fmtNum(Math.round(baseInterest))} ₽</span>
        </div>
        <div class="status-savings-example__row status-savings-example__row--current">
          <span>${tier.name} (${fmtRate(tier.dailyRate)})</span>
          <span>${fmtNum(Math.round(currentInterest))} ₽</span>
        </div>
        <div class="status-savings-example__row status-savings-example__row--next">
          <span>${nextTier.name} (${fmtRate(nextTier.dailyRate)})</span>
          <span>${fmtNum(Math.round(nextInterest))} ₽</span>
        </div>
      </div>
      <div class="status-savings-example__result">
        Повысив статус, сэкономите ещё <strong>${fmtNum(Math.round(savingsNextVsCurrent))} ₽</strong> на процентах
      </div>
    </div>
    ` : `
    <div class="status-savings-example">
      <div class="status-savings-example__title">Ваша экономия</div>
      <div class="status-savings-example__subtitle">Займ ${fmtNum(exampleAmount)} ₽ на ${exampleDays} дней</div>
      <div class="status-savings-example__rows">
        <div class="status-savings-example__row">
          <span>Без программы (${fmtRate(BASE_RATE)})</span>
          <span>${fmtNum(Math.round(baseInterest))} ₽</span>
        </div>
        <div class="status-savings-example__row status-savings-example__row--current">
          <span>${tier.name} (${fmtRate(tier.dailyRate)})</span>
          <span>${fmtNum(Math.round(currentInterest))} ₽</span>
        </div>
      </div>
      <div class="status-savings-example__result">
        Вы экономите <strong>${fmtNum(Math.round(savingsVsBase))} ₽</strong> благодаря статусу ${tier.name}
      </div>
    </div>
    `}

    <!-- Conditions with tabs (P0: default=next, P1: progress inline) -->
    <div class="section-title">Условия перехода</div>
    <div class="tab-bar">
      ${TIER_ORDER.map(tid => {
        const t = TIERS[tid];
        const isActive = tid === viewTier;
        return `<button class="tab-btn ${isActive ? 'active--' + tid : ''}" data-view-tier="${tid}">${t.name}</button>`;
      }).join('')}
    </div>
    <div class="conditions-section">
      ${viewTierData.conditions.map(c => {
        return `
        <div class="condition-item ${c.completed ? 'condition-item--done' : ''}">
          <div class="condition-item__left">
            <div class="condition-item__check ${c.completed ? 'condition-item__check--done' : ''}">
              ${c.completed
                ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
                : ''}
            </div>
            <span class="condition-item__text">${c.text}</span>
          </div>
        </div>
        `;
      }).join('')}
      ${allCompleted(viewTierData.conditions) ? `
      <div class="condition-item condition-item--all-done">
        <span class="condition-item__text" style="color: var(--brand-green); font-weight: 600">Все условия выполнены ✓</span>
      </div>
      ` : ''}
    </div>

    <!-- History -->
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

    <!-- CTA -->
    <div style="padding: 0 var(--sp-base); margin-bottom: var(--sp-md)">
      <button class="btn-loan" id="status-apply" style="width:100%">Оформить заявку со ставкой ${fmtRate(tier.dailyRate)}</button>
    </div>
    <div style="padding: 0 var(--sp-base); margin-bottom: var(--sp-lg); font-size: var(--fs-xs); color: var(--color-text-tertiary); text-align: center">
      Ваш статус ${tier.name} даёт лучшие условия
    </div>
  `;

  // Back button
  screen.querySelector('#status-back')?.addEventListener('click', () => navigate('/lk'));
  screen.querySelector('#status-apply')?.addEventListener('click', () => navigate('/apply'));

  // Tab switching
  screen.querySelectorAll('[data-view-tier]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.viewTier;
      render(screen);
    });
  });
}

function allCompleted(conditions) {
  return conditions.every(c => c.completed);
}

function loanWord(n) {
  if (n === 1) return 'займ';
  if (n >= 2 && n <= 4) return 'займа';
  return 'займов';
}

function fmtNum(n) { return new Intl.NumberFormat('ru-RU').format(n); }
function fmtRate(r) { return r.toFixed(2).replace('.', ',') + '%'; }
