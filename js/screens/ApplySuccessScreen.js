import { TIERS, TIER_ORDER, BASE_RATE, TIER_PROGRESS } from '../../data/mock-data.js';
import { getState } from '../state.js';
import { navigate, onEnter } from '../router.js';

// Store last application details (set by ApplyScreen before navigating)
let lastApplication = null;

export function setLastApplication(data) {
  lastApplication = data;
}

export function initApplySuccessScreen() {
  const screen = document.getElementById('screen-apply-success');
  render(screen);
  onEnter('/apply-success', () => render(screen));
}

function render(screen) {
  const state = getState();
  const tier = TIERS[state.currentTier];
  const currentIdx = TIER_ORDER.indexOf(state.currentTier);
  const isMaxTier = currentIdx >= TIER_ORDER.length - 1;
  const nextTier = isMaxTier ? null : TIERS[TIER_ORDER[currentIdx + 1]];
  const prog = TIER_PROGRESS;
  const loansLeft = prog.loansNeeded - prog.loansCompleted;

  // Use stored application data or defaults
  const app = lastApplication || { amount: 10000, term: 10, rate: tier.dailyRate };
  const interest = app.amount * (app.rate / 100) * app.term;
  const total = app.amount + interest;
  const baseInterest = app.amount * (BASE_RATE / 100) * app.term;
  const savings = baseInterest - interest;

  screen.innerHTML = `
    <div class="app-header">
      <div class="app-header__logo">boostra</div>
    </div>

    <div class="empty-state" style="padding-top: 40px; padding-bottom: var(--sp-lg)">
      <div class="empty-state__icon" style="background: rgba(46,170,87,0.12); width: 80px; height: 80px">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--brand-green)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 class="empty-state__title">Заявка отправлена!</h2>
      <p class="empty-state__text" style="margin-bottom: var(--sp-md)">
        Мы рассмотрим её в ближайшее время и сообщим результат.
      </p>
    </div>

    <div class="apply-calc" style="margin-bottom: var(--sp-lg)">
      <div class="apply-calc__row">
        <span class="apply-calc__label">Сумма</span>
        <span class="apply-calc__value">${fmtNum(app.amount)} \u20bd</span>
      </div>
      <div class="apply-calc__row">
        <span class="apply-calc__label">Срок</span>
        <span class="apply-calc__value">${app.term} дн.</span>
      </div>
      <div class="apply-calc__row">
        <span class="apply-calc__label">Ставка (${tier.name})</span>
        <span class="apply-calc__value">${fmtRate(app.rate)}/день</span>
      </div>
      <div class="apply-calc__row apply-calc__row--total">
        <span class="apply-calc__label">К возврату</span>
        <span class="apply-calc__value">${fmtNum(Math.round(total))} \u20bd</span>
      </div>
    </div>

    ${savings > 0 ? `
    <div class="apply-savings" style="margin-bottom: var(--sp-lg)">
      <div class="apply-savings__icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="apply-savings__text">
        Вы сэкономили <strong>${fmtNum(Math.round(savings))} \u20bd</strong> благодаря статусу ${tier.name}
      </div>
    </div>
    ` : ''}

    ${!isMaxTier ? `
    <div class="lk-new-loan-section" style="margin: 0 var(--sp-base) var(--sp-lg); text-align: center">
      <div style="font-size: 28px; margin-bottom: var(--sp-sm)">\ud83c\udf1f</div>
      <div class="lk-new-loan__title">Ещё ${loansLeft > 0 ? loansLeft : 1} ${loanWord(loansLeft > 0 ? loansLeft : 1)} до «${nextTier.name}»</div>
      <div class="lk-new-loan__subtitle">Ставка станет <strong>${fmtRate(nextTier.dailyRate)}/день</strong> — ещё выгоднее!</div>
    </div>
    ` : ''}

    <div style="padding: 0 var(--sp-base)">
      <button class="btn-repay" style="width: 100%" id="success-to-lk">Вернуться в ЛК</button>
    </div>
  `;

  screen.querySelector('#success-to-lk')?.addEventListener('click', () => navigate('/lk'));
}

function loanWord(n) {
  if (n === 1) return 'займ';
  if (n >= 2 && n <= 4) return 'займа';
  return 'займов';
}

function fmtNum(n) { return new Intl.NumberFormat('ru-RU').format(n); }
function fmtRate(r) { return r.toFixed(2).replace('.', ',') + '%'; }
