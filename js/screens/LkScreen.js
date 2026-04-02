import { TIERS, TIER_ORDER, CURRENT_LOAN, BASE_RATE, TIER_PROGRESS, STREAK } from '../../data/mock-data.js';
import { getState } from '../state.js';
import { navigate, onEnter } from '../router.js';
import { fmtNum, fmtRate, loanWord } from '../utils.js';

let tooltipOpen = false;
let streakDismissed = false;

export function initLkScreen() {
  const screen = document.getElementById('screen-lk');
  renderFull(screen);
  onEnter('/lk', () => renderFull(screen));
}

/* ---------- helpers ---------- */

function daysUntilPayment() {
  const [dd, mm, yyyy] = CURRENT_LOAN.paymentDate.split('.');
  const target = new Date(+yyyy, +mm - 1, +dd);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / 86400000);
}

function countdownColor(days) {
  if (days > 7) return 'green';
  if (days >= 3) return 'yellow';
  return 'red';
}

function dayWord(n) {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'дней';
  if (mod10 === 1) return 'день';
  if (mod10 >= 2 && mod10 <= 4) return 'дня';
  return 'дней';
}

function progressRingSVG(completed, needed, radius = 18) {
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(completed / needed, 1);
  const offset = circumference * (1 - pct);
  const size = (radius + 3) * 2;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="progress-ring__svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" class="progress-ring__circle-bg"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" class="progress-ring__circle-fill"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
      <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dy="0.35em"
        fill="#fff" font-size="11" font-weight="800">${completed}/${needed}</text>
    </svg>`;
}

/* ---------- Main render ---------- */

function renderFull(screen) {
  const state = getState();
  const tier = TIERS[state.currentTier];
  const loan = CURRENT_LOAN;
  const currentIdx = TIER_ORDER.indexOf(state.currentTier);
  const isMaxTier = currentIdx >= TIER_ORDER.length - 1;
  const nextTier = isMaxTier ? null : TIERS[TIER_ORDER[currentIdx + 1]];
  const prog = TIER_PROGRESS;
  const days = daysUntilPayment();
  const loansLeft = prog.loansNeeded - prog.loansCompleted;
  const showStreak = STREAK.isActive && STREAK.count >= 2 && !streakDismissed;

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

    ${showStreak ? `
    <div class="streak-badge" id="streak-badge">
      <div class="streak-badge__icon">\uD83D\uDD25</div>
      <div>
        <div class="streak-badge__text">${STREAK.count} ${loanWord(STREAK.count)} погашены вовремя подряд</div>
        <div class="streak-badge__sub">Продолжайте — каждый вовремя приближает к ${isMaxTier ? 'лучшим условиям' : nextTier.name}</div>
      </div>
      <button class="streak-badge__dismiss" id="streak-dismiss" aria-label="Скрыть">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    ` : ''}

    ${state.hasActiveLoan ? `

    <!-- PRIORITY 1: Pay current loan -->
    <div class="loan-section">
      <div class="loan-header">Текущий заём</div>
      <div class="loan-info-row">
        <span class="loan-info-row__label">Остаток долга</span>
        <span class="loan-info-row__value">${fmtNum(loan.remainingDebt)} \u20bd</span>
      </div>
      <div class="loan-info-row">
        <span class="loan-info-row__label">Дата платежа</span>
        <span class="loan-info-row__value">
          ${loan.paymentDate}
          <span class="countdown-badge countdown-badge--${countdownColor(days)}">${days} ${dayWord(days)}</span>
        </span>
      </div>
      <div class="min-payment">
        <span class="min-payment__label">Минимальный платёж</span>
        <span class="min-payment__value">${fmtNum(loan.minPayment)} \u20bd</span>
      </div>
      ${!isMaxTier ? `
      <div class="loan-progress-hint">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Погасите вовремя \u2192 +1 шаг к ${nextTier.name}
      </div>
      ` : ''}
      <div class="loan-actions">
        <button class="btn-primary" id="btn-pay-loan" aria-label="Погасить займ">Погасить займ</button>
      </div>
      <button class="loan-sbp-link" id="btn-sbp-link" aria-label="Погасить через СБП">
        <span class="loan-sbp-badge">СБП</span>
        Погасить через СБП — без комиссии
      </button>
    </div>

    <!-- PRIORITY 2: New loan -->
    <div class="lk-new-loan-section">
      <div class="lk-new-loan__text">
        <div class="lk-new-loan__title">Займ по ставке ${fmtRate(tier.dailyRate)}/день</div>
        <div class="lk-new-loan__subtitle">Экономия на процентах: вместо стандартных ${fmtRate(BASE_RATE)}</div>
      </div>
      <button class="btn-secondary" id="btn-new-apply" aria-label="Новая заявка">Новая заявка</button>
    </div>

    ` : `
    <!-- Empty state: no active loan — new loan is priority 1 -->
    <div class="empty-state">
      <div class="empty-state__icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
      </div>
      <div class="empty-state__title">Оформите займ</div>
      <div class="empty-state__text">Ставка <strong>${fmtRate(tier.dailyRate)}/день</strong> по статусу ${tier.name} — вы не переплатите как без программы</div>
      <button class="btn-primary" style="width:100%" id="btn-new-loan" aria-label="Оформить заявку">Оформить заявку по ставке ${fmtRate(tier.dailyRate)}</button>
    </div>
    `}

    <!-- PRIORITY 4: Loyalty program -->
    <div class="lk-loyalty-header">
      <span class="lk-loyalty-header__title">Программа лояльности</span>
      <button class="lk-loyalty-header__link" id="btn-how-works">Как работает?</button>
    </div>
  `;

  updateCard();

  screen.querySelector('#btn-pay-loan')?.addEventListener('click', () => showPaymentStub(screen));
  screen.querySelector('#btn-sbp-link')?.addEventListener('click', () => showPaymentStub(screen));
  screen.querySelector('#btn-new-apply')?.addEventListener('click', () => navigate('/apply'));
  screen.querySelector('#btn-new-loan')?.addEventListener('click', () => navigate('/apply'));
  screen.querySelector('#btn-how-works')?.addEventListener('click', () => navigate('/onboarding'));
  screen.querySelector('#streak-dismiss')?.addEventListener('click', () => {
    streakDismissed = true;
    screen.querySelector('#streak-badge')?.remove();
  });
}

function showPaymentStub(screen) {
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
  requestAnimationFrame(() => stub.classList.add('payment-stub--open'));

  const close = () => {
    stub.classList.remove('payment-stub--open');
    setTimeout(() => stub.remove(), 200);
  };
  stub.querySelector('.payment-stub__close').addEventListener('click', close);
  stub.querySelector('.payment-stub__ok').addEventListener('click', close);
  stub.querySelector('.payment-stub__overlay').addEventListener('click', close);
}

/* ---------- Card with Progress Ring ---------- */

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
        ${!isMaxTier ? `
        <div class="progress-ring">
          ${progressRingSVG(prog.loansCompleted, prog.loansNeeded)}
          <div class="progress-ring__text">до<br>${nextTier.name}</div>
        </div>
        ` : ''}
      </div>
      <div class="user-card__progress">
        <span class="user-card__progress-text">${isMaxTier ? 'Максимальный уровень — лучшие условия ваши' : `Ещё ${loansLeft} ${loanWord(loansLeft)} до «${nextTier.name}»`}</span>
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
