import { TIERS, TIER_ORDER, CURRENT_LOAN } from '../../data/mock-data.js';
import { getState, setTier } from '../state.js';
import { navigate } from '../router.js';

let tooltipOpen = false;

export function initLkScreen() {
  const screen = document.getElementById('screen-lk');
  renderFull(screen);
}

function renderFull(screen) {
  const state = getState();
  const tier = TIERS[state.currentTier];
  const loan = CURRENT_LOAN;

  screen.innerHTML = `
    <div class="app-header">
      <div class="app-header__logo">boostra</div>
      <div class="app-header__icons">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1l4 4m0 0a11 11 0 1 1-4 4"/></svg>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </div>
    </div>

    <div class="lk-card-area" id="lk-user-card"></div>

    ${loan.dpd >= 7 ? `
    <div class="frozen-banner">
      <div class="frozen-banner__icon">⚠️</div>
      <div class="frozen-banner__text">
        <strong>Статус заморожен</strong>
        Просрочка ${loan.dpd} дн. Накопление баллов приостановлено.
        Погасите задолженность для восстановления.
      </div>
    </div>
    ` : ''}

    <div class="lk-tier-selector" style="display:flex;gap:6px;padding:0 16px 12px">
      ${Object.values(TIERS).map(t => `
        <button class="tab-btn ${t.id === state.currentTier ? 'active--' + t.id : ''}" data-tier="${t.id}" style="flex:1;min-width:0">
          ${t.name}
        </button>
      `).join('')}
    </div>

    ${state.hasActiveLoan ? `
    <div class="loan-section">
      <div class="loan-header">Текущий заём</div>
      <div class="loan-number">${loan.id}</div>
      <div class="loan-info-row">
        <span class="loan-info-row__label">Остаток основного долга</span>
        <span class="loan-info-row__value">${fmtNum(loan.remainingDebt)} ₽</span>
      </div>
      <div class="loan-info-row">
        <span class="loan-info-row__label">Дата планового платежа</span>
        <span class="loan-info-row__value">${loan.paymentDate}</span>
      </div>
      <div class="min-payment">
        <span class="min-payment__label">Минимальный платёж</span>
        <span class="min-payment__value">${fmtNum(loan.minPayment)} ₽</span>
      </div>
      <div class="loan-actions">
        <button class="btn-repay" id="btn-full-repay">Полное погашение и новая заявка</button>
        <a class="link" id="link-repay">Полное погашение</a>
      </div>
    </div>

    <div class="sbp-banner">
      <div class="sbp-banner__logo">СБП</div>
      <div class="sbp-banner__text">Пользуйтесь СБП для удобной оплаты</div>
      <button class="sbp-banner__btn">Выделить</button>
    </div>
    ` : `
    <div class="empty-state">
      <div class="empty-state__icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
      </div>
      <div class="empty-state__title">Нет активных займов</div>
      <div class="empty-state__text">Оформите заявку на займ с выгодными условиями по вашему статусу «${tier.name}»</div>
      <button class="btn-repay" style="width:100%" id="btn-new-loan">Оформить заявку</button>
    </div>
    `}
  `;

  // Render card initially
  updateCard();

  // Tier selector — only updates card + tabs, no full re-render
  screen.querySelectorAll('[data-tier]').forEach(btn => {
    btn.addEventListener('click', () => {
      setTier(btn.dataset.tier);
      updateCard();
      updateTabs(screen);
    });
  });

  // Navigation
  screen.querySelector('#btn-full-repay')?.addEventListener('click', () => navigate('/apply'));
  screen.querySelector('#link-repay')?.addEventListener('click', () => navigate('/upgrade'));
  screen.querySelector('#btn-new-loan')?.addEventListener('click', () => navigate('/apply'));
}

function updateCard() {
  const state = getState();
  const tier = TIERS[state.currentTier];
  const container = document.getElementById('lk-user-card');
  if (!container) return;

  const currentIdx = TIER_ORDER.indexOf(state.currentTier);
  const isMaxTier = currentIdx >= TIER_ORDER.length - 1;
  const nextTier = isMaxTier ? null : TIERS[TIER_ORDER[currentIdx + 1]];
  const progressPct = isMaxTier ? 100 : 65; // mock progress

  container.innerHTML = `
    <div class="user-card user-card--${tier.id}">
      <div class="user-card__top">
        <div>
          <div class="user-card__name">${state.user.fullName}</div>
          <div class="user-card__subtitle">Программа лояльности boostra</div>
        </div>
        <div class="user-card__badge" id="lk-badge">
          ${tier.name} <span class="user-card__badge-arrow">›</span>
        </div>
      </div>
      <div class="user-card__metrics">
        <div class="user-card__metric">
          <span class="user-card__metric-value">${fmtRate(tier.dailyRate)}</span>
          <span class="user-card__metric-label">ставка/день</span>
        </div>
        <div class="user-card__metric">
          <span class="user-card__metric-value">${fmtNum(tier.maxLimit)} ₽</span>
          <span class="user-card__metric-label">макс. лимит</span>
        </div>
      </div>
      <div class="user-card__progress">
        <div class="user-card__progress-bar">
          <div class="user-card__progress-fill" style="width: ${progressPct}%"></div>
        </div>
        <span class="user-card__progress-text">${isMaxTier ? 'Максимальный уровень' : `До «${nextTier.name}» — ${100 - progressPct}%`}</span>
      </div>
    </div>
  `;

  container.querySelector('#lk-badge')?.addEventListener('click', (e) => {
    e.stopPropagation();
    tooltipOpen = !tooltipOpen;
    renderTooltip(container);
  });

  // Close tooltip on outside click
  document.addEventListener('click', () => {
    if (tooltipOpen) {
      tooltipOpen = false;
      renderTooltip(container);
    }
  }, { once: true });
}

function renderTooltip(container) {
  const existing = container.querySelector('.badge-tooltip');
  if (existing) existing.remove();

  if (!tooltipOpen) return;

  const state = getState();
  const tier = TIERS[state.currentTier];
  const tooltip = document.createElement('div');
  tooltip.className = 'badge-tooltip';
  tooltip.innerHTML = `
    <div class="badge-tooltip__title">${tier.name}</div>
    ${tier.perks.map(p => `<div class="badge-tooltip__item">${p}</div>`).join('')}
    <div class="badge-tooltip__link" id="tooltip-more">Подробнее о статусе →</div>
  `;
  tooltip.addEventListener('click', (e) => e.stopPropagation());

  // Place tooltip on the container (outside card overflow:hidden)
  container.style.position = 'relative';
  container.appendChild(tooltip);

  tooltip.querySelector('#tooltip-more')?.addEventListener('click', () => {
    tooltipOpen = false;
    navigate('/status');
  });
}

function updateTabs(screen) {
  const state = getState();
  screen.querySelectorAll('[data-tier]').forEach(btn => {
    const tid = btn.dataset.tier;
    btn.className = 'tab-btn' + (tid === state.currentTier ? ' active--' + tid : '');
  });
}

function fmtNum(n) { return new Intl.NumberFormat('ru-RU').format(n); }
function fmtRate(r) { return r.toFixed(2).replace('.', ',') + '%'; }
