import { TIERS, TIER_ORDER, CURRENT_LOAN, BASE_RATE, TIER_PROGRESS } from '../../data/mock-data.js';
import { getState } from '../state.js';
import { navigate } from '../router.js';
import { fmtNum, fmtRate, loanWord } from '../utils.js';
import { renderTierRows } from '../components/TierRow.js';

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

  screen.innerHTML = `
    <div class="app-header">
      <div class="app-header__logo">boostra</div>
    </div>

    <div class="lk-card-area" id="lk-user-card"></div>

    ${loan.dpd >= 7 ? `
    <div class="frozen-banner">
      <div class="frozen-banner__icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <div class="frozen-banner__text">
        <strong>Статус заморожен</strong>
        Просрочка ${loan.dpd} дн. Накопление баллов приостановлено.
        Погасите задолженность для восстановления.
      </div>
    </div>
    ` : ''}

    ${state.isFirstVisit ? `
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
        <button class="btn-primary" id="btn-pay-loan" aria-label="Погасить займ">Погасить займ</button>
      </div>
    </div>

    <div class="lk-new-loan-section">
      <div class="lk-new-loan__text">
        <div class="lk-new-loan__title">Нужны ещё деньги?</div>
        <div class="lk-new-loan__subtitle">Ставка от <strong>${fmtRate(tier.dailyRate)}/день</strong> по статусу ${tier.name}</div>
      </div>
      <button class="btn-secondary" id="btn-new-apply" aria-label="Новая заявка">Новая заявка</button>
    </div>
    ` : `
    <div class="empty-state">
      <div class="empty-state__icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
      </div>
      <div class="empty-state__title">Нет активных займов</div>
      <div class="empty-state__text">Ставка от <strong>${fmtRate(tier.dailyRate)}/день</strong> по статусу ${tier.name} вместо ${fmtRate(BASE_RATE)}</div>
      <button class="btn-primary" style="width:100%" id="btn-new-loan" aria-label="Оформить заявку">Оформить заявку</button>
    </div>
    `}

    <!-- Comparison section -->
    <div class="section-title">Уровни программы</div>
    ${renderTierRows(state.currentTier)}

    ${!state.isFirstVisit ? `
    <!-- How it works (for returning users — at bottom) -->
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
    ` : ''}

    <div class="sbp-banner">
      <div class="sbp-banner__logo">СБП</div>
      <div class="sbp-banner__text">Погашайте через СБП — быстро и без комиссии</div>
      <button class="sbp-banner__btn" aria-label="Подключить СБП">Подключить</button>
    </div>
  `;

  updateCard();

  // Navigation
  screen.querySelector('#btn-pay-loan')?.addEventListener('click', () => showPaymentStub(screen));
  screen.querySelector('#btn-new-apply')?.addEventListener('click', () => navigate('/apply'));
  screen.querySelector('#btn-new-loan')?.addEventListener('click', () => navigate('/apply'));
}

function showPaymentStub(screen) {
  // Check if already showing
  if (screen.querySelector('.payment-stub')) return;

  const stub = document.createElement('div');
  stub.className = 'payment-stub';
  stub.innerHTML = `
    <div class="payment-stub__overlay"></div>
    <div class="payment-stub__sheet">
      <div class="payment-stub__header">
        <span class="payment-stub__title">Оплата</span>
        <button class="payment-stub__close" aria-label="Закрыть">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="payment-stub__body">
        <div class="payment-stub__icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brand-blue)" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
        </div>
        <p>Функция оплаты находится в разработке.</p>
        <p style="color: var(--color-text-secondary); font-size: var(--fs-sm)">Для погашения перейдите в мобильный банк или воспользуйтесь СБП.</p>
      </div>
      <button class="btn-primary payment-stub__ok" aria-label="Понятно">Понятно</button>
    </div>
  `;
  screen.appendChild(stub);

  // Animate in
  requestAnimationFrame(() => stub.classList.add('payment-stub--open'));

  const close = () => {
    stub.classList.remove('payment-stub--open');
    setTimeout(() => stub.remove(), 200);
  };
  stub.querySelector('.payment-stub__close').addEventListener('click', close);
  stub.querySelector('.payment-stub__ok').addEventListener('click', close);
  stub.querySelector('.payment-stub__overlay').addEventListener('click', close);
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
        <div class="user-card__badge" id="lk-badge" role="button" aria-label="Подробнее о статусе ${tier.name}">
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
