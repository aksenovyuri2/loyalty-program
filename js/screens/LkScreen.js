import { TIERS, TIER_ORDER, CURRENT_LOAN, BASE_RATE, TIER_PROGRESS } from '../../data/mock-data.js';
import { getState } from '../state.js';
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
  const currentIdx = TIER_ORDER.indexOf(state.currentTier);
  const isMaxTier = currentIdx >= TIER_ORDER.length - 1;
  const nextTier = isMaxTier ? null : TIERS[TIER_ORDER[currentIdx + 1]];
  const prog = TIER_PROGRESS;
  const progressPct = Math.round((prog.loansCompleted / prog.loansNeeded) * 100);

  screen.innerHTML = `
    <div class="app-header">
      <div class="app-header__logo">boostra</div>
      <div class="app-header__icons">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </div>
    </div>

    <div class="lk-card-area" id="lk-user-card"></div>

    ${loan.dpd >= 7 ? `
    <div class="frozen-banner">
      <div class="frozen-banner__icon">\u26a0\ufe0f</div>
      <div class="frozen-banner__text">
        <strong>Статус заморожен</strong>
        Просрочка ${loan.dpd} дн. Накопление баллов приостановлено.
        Погасите задолженность для восстановления.
      </div>
    </div>
    ` : ''}

    ${state.hasActiveLoan ? `
    <div class="loan-section">
      <div class="loan-header">Текущий заём</div>
      <div class="loan-number">${loan.id}</div>
      <div class="loan-info-row">
        <span class="loan-info-row__label">Остаток долга</span>
        <span class="loan-info-row__value">${fmtNum(loan.remainingDebt)} \u20bd</span>
      </div>
      <div class="loan-info-row">
        <span class="loan-info-row__label">Дата платежа</span>
        <span class="loan-info-row__value">${loan.paymentDate}</span>
      </div>
      <div class="min-payment">
        <span class="min-payment__label">Минимальный платёж</span>
        <span class="min-payment__value">${fmtNum(loan.minPayment)} \u20bd</span>
      </div>
      <div class="loan-actions">
        <button class="btn-repay" id="btn-pay-loan">Погасить займ</button>
      </div>
    </div>

    <div class="lk-new-loan-section">
      <div class="lk-new-loan__text">
        <div class="lk-new-loan__title">Нужны ещё деньги?</div>
        <div class="lk-new-loan__subtitle">Ставка от <strong>${fmtRate(tier.dailyRate)}/день</strong> по статусу ${tier.name}</div>
      </div>
      <button class="btn-loan" id="btn-new-apply" style="width:100%">Новая заявка</button>
    </div>
    ` : `
    <div class="empty-state">
      <div class="empty-state__icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
      </div>
      <div class="empty-state__title">Нет активных займов</div>
      <div class="empty-state__text">Ставка от <strong>${fmtRate(tier.dailyRate)}/день</strong> по статусу ${tier.name} вместо ${fmtRate(BASE_RATE)}</div>
      <button class="btn-repay" style="width:100%" id="btn-new-loan">Оформить заявку</button>
    </div>
    `}

    <!-- Comparison section -->
    <div class="section-title">Уровни программы</div>
    <div class="lk-tiers-compare">
      ${TIER_ORDER.map((tid, idx) => {
        const t = TIERS[tid];
        const isCurrent = tid === state.currentTier;
        const isLocked = idx > currentIdx;
        return `
          <div class="lk-tier-row ${isCurrent ? 'lk-tier-row--current' : ''} ${isLocked ? 'lk-tier-row--locked' : ''}">
            <div class="lk-tier-row__left">
              <span class="lk-tier-row__dot lk-tier-row__dot--${tid}"></span>
              <span class="lk-tier-row__name">${t.name}</span>
              ${isCurrent ? '<span class="lk-tier-row__badge">ваш</span>' : ''}
            </div>
            <div class="lk-tier-row__right">
              <span class="lk-tier-row__rate">${fmtRate(t.dailyRate)}/день</span>
              <span class="lk-tier-row__limit">до ${fmtNum(t.maxLimit)} \u20bd</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- How it works -->
    <div class="section-title">Как это работает</div>
    <div class="lk-how-it-works">
      <div class="lk-how-step">
        <div class="lk-how-step__num">1</div>
        <div class="lk-how-step__text">Берёте займ по текущей ставке</div>
      </div>
      <div class="lk-how-step">
        <div class="lk-how-step__num">2</div>
        <div class="lk-how-step__text">Возвращаете вовремя — растёт статус</div>
      </div>
      <div class="lk-how-step">
        <div class="lk-how-step__num">3</div>
        <div class="lk-how-step__text">Выше статус — ниже ставка и больше лимит</div>
      </div>
    </div>

    <div class="sbp-banner">
      <div class="sbp-banner__logo">СБП</div>
      <div class="sbp-banner__text">Погашайте через СБП — быстро и без комиссии</div>
      <button class="sbp-banner__btn">Подключить</button>
    </div>
  `;

  updateCard();

  // Navigation
  screen.querySelector('#btn-pay-loan')?.addEventListener('click', () => {
    // Payment flow — for now just visual feedback
    const btn = screen.querySelector('#btn-pay-loan');
    btn.textContent = 'Переход к оплате...';
    setTimeout(() => { btn.textContent = 'Погасить займ'; }, 1500);
  });
  screen.querySelector('#btn-new-apply')?.addEventListener('click', () => navigate('/apply'));
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
  const prog = TIER_PROGRESS;
  const loansLeft = prog.loansNeeded - prog.loansCompleted;

  container.innerHTML = `
    <div class="user-card user-card--${tier.id}">
      <div class="user-card__top">
        <div>
          <div class="user-card__name">${state.user.fullName}</div>
          <div class="user-card__subtitle">Программа лояльности boostra</div>
        </div>
        <div class="user-card__badge" id="lk-badge">
          ${tier.name} <span class="user-card__badge-arrow">\u203a</span>
        </div>
      </div>
      <div class="user-card__metrics">
        <div class="user-card__metric">
          <span class="user-card__metric-value"><s class="user-card__metric-old">${fmtRate(BASE_RATE)}</s> ${fmtRate(tier.dailyRate)}</span>
          <span class="user-card__metric-label">ставка/день</span>
        </div>
        <div class="user-card__metric">
          <span class="user-card__metric-value">${fmtNum(tier.maxLimit)} \u20bd</span>
          <span class="user-card__metric-label">макс. лимит</span>
        </div>
      </div>
      <div class="user-card__progress">
        <div class="user-card__progress-bar">
          <div class="user-card__progress-fill" style="width: ${Math.round((prog.loansCompleted / prog.loansNeeded) * 100)}%"></div>
        </div>
        <span class="user-card__progress-text">${isMaxTier ? 'Максимальный уровень' : `Ещё ${loansLeft} ${loanWord(loansLeft)} до «${nextTier.name}»`}</span>
      </div>
    </div>
  `;

  container.querySelector('#lk-badge')?.addEventListener('click', (e) => {
    e.stopPropagation();
    tooltipOpen = !tooltipOpen;
    renderTooltip(container);
  });

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
    <div class="badge-tooltip__link" id="tooltip-more">Подробнее о статусе \u2192</div>
  `;
  tooltip.addEventListener('click', (e) => e.stopPropagation());
  container.style.position = 'relative';
  container.appendChild(tooltip);

  tooltip.querySelector('#tooltip-more')?.addEventListener('click', () => {
    tooltipOpen = false;
    navigate('/status');
  });
}

function loanWord(n) {
  if (n === 1) return 'займ';
  if (n >= 2 && n <= 4) return 'займа';
  return 'займов';
}

function fmtNum(n) { return new Intl.NumberFormat('ru-RU').format(n); }
function fmtRate(r) { return r.toFixed(2).replace('.', ',') + '%'; }
