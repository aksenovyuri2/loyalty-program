import { TIERS, TIER_ORDER, BASE_RATE, TIER_PROGRESS } from '../../data/mock-data.js';
import { getState } from '../state.js';
import { navigate, onEnter } from '../router.js';
import { setLastApplication } from './ApplySuccessScreen.js';
import { fmtNum, fmtRate, loanWord } from '../utils.js';

const TERMS = [5, 10, 15, 21, 30];
const POPULAR_TERM = 15;
let selectedAmount = 15000; // Anchoring bias: higher default = higher AOV
let selectedTerm = POPULAR_TERM;

export function initApplyScreen() {
  const screen = document.getElementById('screen-apply');
  render(screen);
  onEnter('/apply', () => {
    const state = getState();
    const tier = TIERS[state.currentTier];
    selectedAmount = Math.min(selectedAmount, tier.maxLimit);
    render(screen);
  });
}

function updateCalc(screen) {
  const state = getState();
  const tier = TIERS[state.currentTier];
  const dailyRate = tier.dailyRate / 100;
  const baseDaily = BASE_RATE / 100;
  const interest = selectedAmount * dailyRate * selectedTerm;
  const baseInterest = selectedAmount * baseDaily * selectedTerm;
  const savings = baseInterest - interest;
  const total = selectedAmount + interest;
  const savingsPct = baseInterest > 0 ? Math.round((savings / baseInterest) * 100) : 0;

  screen.querySelector('#calc-amount').textContent = `${fmtNum(selectedAmount)} ₽`;
  screen.querySelector('#calc-interest').textContent = `${fmtNum(Math.round(interest))} ₽`;
  screen.querySelector('#calc-total').textContent = `${fmtNum(Math.round(total))} ₽`;

  // Loss aversion framing for savings
  const wrap = screen.querySelector('#apply-savings-wrap');
  if (wrap) {
    wrap.innerHTML = savings > 0 ? `
      <div class="apply-savings">
        <div class="apply-savings__icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="apply-savings__text">
          Без программы: <strong>${fmtNum(Math.round(baseInterest))} \u20bd</strong> процентов.<br>
          Вы не переплатите <strong>${fmtNum(Math.round(savings))} \u20bd</strong> (−${savingsPct}%)
        </div>
      </div>
    ` : '';
  }
}

function render(screen) {
  const state = getState();
  const tier = TIERS[state.currentTier];
  const maxAmount = tier.maxLimit;
  const currentIdx = TIER_ORDER.indexOf(state.currentTier);
  const isMaxTier = currentIdx >= TIER_ORDER.length - 1;
  const nextTier = isMaxTier ? null : TIERS[TIER_ORDER[currentIdx + 1]];
  const prog = TIER_PROGRESS;
  const loansLeft = prog.loansNeeded - prog.loansCompleted;

  if (selectedAmount > maxAmount) selectedAmount = maxAmount;

  const dailyRate = tier.dailyRate / 100;
  const baseDaily = BASE_RATE / 100;
  const interest = selectedAmount * dailyRate * selectedTerm;
  const baseInterest = selectedAmount * baseDaily * selectedTerm;
  const savings = baseInterest - interest;
  const total = selectedAmount + interest;
  const savingsPct = baseInterest > 0 ? Math.round((savings / baseInterest) * 100) : 0;

  // Progress ring for tier banner
  const circumference = 2 * Math.PI * 14;
  const pct = Math.min(prog.loansCompleted / prog.loansNeeded, 1);
  const offset = circumference * (1 - pct);

  screen.innerHTML = `
    <div class="screen-header">
      <button class="screen-header__back" id="apply-back" aria-label="Назад">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="screen-header__title">Новая заявка</span>
    </div>

    <div class="apply-tier-badge apply-tier-badge--${state.currentTier}">
      <div class="apply-tier-badge__icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </div>
      <div class="apply-tier-badge__text">
        Ваш статус <strong>${tier.name}</strong> — ставка от ${fmtRate(tier.dailyRate)}/день
      </div>
    </div>

    ${!isMaxTier ? `
    <div class="tier-progress-banner">
      <svg width="36" height="36" viewBox="0 0 36 36" class="tier-progress-banner__ring">
        <circle cx="18" cy="18" r="14" class="tier-progress-banner__ring-bg"/>
        <circle cx="18" cy="18" r="14" class="tier-progress-banner__ring-fill"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
        <text x="18" y="18" text-anchor="middle" dy="0.35em"
          fill="var(--brand-blue)" font-size="10" font-weight="800">${prog.loansCompleted}/${prog.loansNeeded}</text>
      </svg>
      <div class="tier-progress-banner__content">
        <div class="tier-progress-banner__title">Этот займ засчитается в прогресс к ${nextTier.name}</div>
        <div class="tier-progress-banner__sub">Ещё ${loansLeft} ${loanWord(loansLeft)} вовремя \u2192 ставка ${fmtRate(nextTier.dailyRate)}, лимит ${fmtNum(nextTier.maxLimit)} \u20bd</div>
      </div>
    </div>
    ` : ''}

    <div class="apply-field">
      <label class="apply-field__label">Сумма займа</label>
      <div class="apply-field__value-row">
        <span class="apply-field__amount" id="apply-amount-display">${fmtNum(selectedAmount)}</span>
        <span class="apply-field__currency">\u20bd</span>
      </div>
      <input type="range" class="apply-slider" id="apply-amount-slider"
        min="1000" max="${maxAmount}" step="1000" value="${selectedAmount}"
        aria-label="Сумма займа">
      <div class="apply-field__range-labels">
        <span>1 000 \u20bd</span>
        <span>${fmtNum(maxAmount)} \u20bd</span>
      </div>
    </div>

    <div class="apply-field">
      <label class="apply-field__label">Срок</label>
      <div class="apply-terms">
        ${TERMS.map(t => `
          <button class="apply-term-chip ${t === selectedTerm ? 'active' : ''} ${t === POPULAR_TERM ? 'popular-badge' : ''}"
            data-term="${t}" aria-label="${t} дней${t === POPULAR_TERM ? ', популярный выбор' : ''}" aria-pressed="${t === selectedTerm}">
            ${t} дн.
          </button>
        `).join('')}
      </div>
    </div>

    <div class="apply-calc">
      <div class="apply-calc__row">
        <span class="apply-calc__label">Сумма займа</span>
        <span class="apply-calc__value" id="calc-amount">${fmtNum(selectedAmount)} \u20bd</span>
      </div>
      <div class="apply-calc__row">
        <span class="apply-calc__label">Ставка (${tier.name})</span>
        <span class="apply-calc__value">${fmtRate(tier.dailyRate)}/день</span>
      </div>
      <div class="apply-calc__row">
        <span class="apply-calc__label">Срок</span>
        <span class="apply-calc__value" id="calc-term">${selectedTerm} дн.</span>
      </div>
      <div class="apply-calc__row">
        <span class="apply-calc__label">Проценты</span>
        <span class="apply-calc__value" id="calc-interest">${fmtNum(Math.round(interest))} \u20bd</span>
      </div>
      <div class="apply-calc__row apply-calc__row--total">
        <span class="apply-calc__label">К возврату</span>
        <span class="apply-calc__value" id="calc-total">${fmtNum(Math.round(total))} \u20bd</span>
      </div>
    </div>

    <div id="apply-savings-wrap">
    ${savings > 0 ? `
    <div class="apply-savings">
      <div class="apply-savings__icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="apply-savings__text">
        Без программы: <strong>${fmtNum(Math.round(baseInterest))} \u20bd</strong> процентов.<br>
        Вы не переплатите <strong>${fmtNum(Math.round(savings))} \u20bd</strong> (\u2212${savingsPct}%)
      </div>
    </div>
    ` : ''}
    </div>

    <div class="section-title" style="text-align:left">Ваши привилегии</div>
    <div class="apply-perks">
      ${tier.perks.map(p => `
        <div class="apply-perk">
          <span class="apply-perk__check">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          ${p}
        </div>
      `).join('')}
    </div>

    ${!isMaxTier ? `
    <div class="section-title" style="text-align:left">До ${nextTier.name} — ${loansLeft} ${loanWord(loansLeft)}</div>
    <div class="apply-perks" style="opacity: 0.65">
      <div class="apply-perk">
        <span class="apply-perk__check" style="background: var(--color-text-tertiary)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg></span>
        Ставка ${fmtRate(nextTier.dailyRate)}/день
      </div>
      <div class="apply-perk">
        <span class="apply-perk__check" style="background: var(--color-text-tertiary)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg></span>
        Лимит до ${fmtNum(nextTier.maxLimit)} \u20bd
      </div>
      ${nextTier.perks.filter(p => !p.includes('Ставка') && !p.includes('Лимит')).map(p => `
        <div class="apply-perk">
          <span class="apply-perk__check" style="background: var(--color-text-tertiary)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg></span>
          ${p}
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="apply-submit">
      <button class="btn-primary" id="apply-submit-btn" aria-label="Оформить заявку">Оформить по ставке ${fmtRate(tier.dailyRate)}</button>
    </div>

    <div class="apply-disclaimer">
      Нажимая кнопку, вы соглашаетесь с условиями договора.
      Ставка и лимит определяются индивидуально.
    </div>
  `;

  // Events
  screen.querySelector('#apply-back')?.addEventListener('click', () => navigate('/lk'));

  const slider = screen.querySelector('#apply-amount-slider');
  const display = screen.querySelector('#apply-amount-display');
  slider?.addEventListener('input', () => {
    selectedAmount = parseInt(slider.value);
    display.textContent = fmtNum(selectedAmount);
    updateCalc(screen);
  });

  screen.querySelectorAll('[data-term]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedTerm = parseInt(btn.dataset.term);
      screen.querySelectorAll('[data-term]').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.term) === selectedTerm);
        b.setAttribute('aria-pressed', parseInt(b.dataset.term) === selectedTerm);
      });
      screen.querySelector('#calc-term').textContent = `${selectedTerm} дн.`;
      updateCalc(screen);
    });
  });

  screen.querySelector('#apply-submit-btn')?.addEventListener('click', () => {
    const btn = screen.querySelector('#apply-submit-btn');
    btn.classList.add('btn-loading');
    btn.textContent = 'Отправка';
    setTimeout(() => {
      setLastApplication({ amount: selectedAmount, term: selectedTerm, rate: tier.dailyRate });
      navigate('/apply-success');
      btn.classList.remove('btn-loading');
      btn.textContent = `Оформить по ставке ${fmtRate(tier.dailyRate)}`;
    }, 500);
  });
}
