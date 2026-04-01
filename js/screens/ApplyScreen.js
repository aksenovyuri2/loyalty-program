import { TIERS, BASE_RATE } from '../../data/mock-data.js';
import { getState } from '../state.js';
import { navigate, onEnter } from '../router.js';
import { setLastApplication } from './ApplySuccessScreen.js';

const TERMS = [5, 10, 15, 21, 30];
let selectedAmount = 10000;
let selectedTerm = 10;

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

function render(screen) {
  const state = getState();
  const tier = TIERS[state.currentTier];
  const maxAmount = tier.maxLimit;

  if (selectedAmount > maxAmount) selectedAmount = maxAmount;

  const dailyRate = tier.dailyRate / 100;
  const baseDaily = BASE_RATE / 100;
  const interest = selectedAmount * dailyRate * selectedTerm;
  const baseInterest = selectedAmount * baseDaily * selectedTerm;
  const savings = baseInterest - interest;
  const total = selectedAmount + interest;

  screen.innerHTML = `
    <div class="screen-header">
      <button class="screen-header__back" id="apply-back">&#8592;</button>
      <span class="screen-header__title">&#128190; Новая заявка — boostra</span>
      <div style="display:flex;gap:2px;margin-left:auto;">
        <div style="color:#fff;font-size:11px;padding:0 3px;">_</div>
        <div style="color:#fff;font-size:11px;padding:0 3px;">&#9633;</div>
        <div style="color:#fff;font-size:11px;padding:0 3px;">&#x2715;</div>
      </div>
    </div>

    <div class="apply-tier-badge apply-tier-badge--${state.currentTier}">
      <div class="apply-tier-badge__icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </div>
      <div class="apply-tier-badge__text">
        Ваш статус <strong>${tier.name}</strong> — ставка от ${fmtRate(tier.dailyRate)}/день
      </div>
    </div>

    <div class="apply-field">
      <label class="apply-field__label">Сумма займа</label>
      <div class="apply-field__value-row">
        <span class="apply-field__amount" id="apply-amount-display">${fmtNum(selectedAmount)}</span>
        <span class="apply-field__currency">₽</span>
      </div>
      <input type="range" class="apply-slider" id="apply-amount-slider"
        min="1000" max="${maxAmount}" step="1000" value="${selectedAmount}">
      <div class="apply-field__range-labels">
        <span>1 000 ₽</span>
        <span>${fmtNum(maxAmount)} ₽</span>
      </div>
    </div>

    <div class="apply-field">
      <label class="apply-field__label">Срок</label>
      <div class="apply-terms">
        ${TERMS.map(t => `
          <button class="apply-term-chip ${t === selectedTerm ? 'active' : ''}" data-term="${t}">
            ${t} дн.
          </button>
        `).join('')}
      </div>
    </div>

    <div class="apply-calc">
      <div class="apply-calc__row">
        <span class="apply-calc__label">Сумма займа</span>
        <span class="apply-calc__value">${fmtNum(selectedAmount)} ₽</span>
      </div>
      <div class="apply-calc__row">
        <span class="apply-calc__label">Ставка</span>
        <span class="apply-calc__value">${fmtRate(tier.dailyRate)}/день</span>
      </div>
      <div class="apply-calc__row">
        <span class="apply-calc__label">Срок</span>
        <span class="apply-calc__value">${selectedTerm} дн.</span>
      </div>
      <div class="apply-calc__row">
        <span class="apply-calc__label">Проценты</span>
        <span class="apply-calc__value">${fmtNum(Math.round(interest))} ₽</span>
      </div>
      <div class="apply-calc__row apply-calc__row--total">
        <span class="apply-calc__label">К возврату</span>
        <span class="apply-calc__value">${fmtNum(Math.round(total))} ₽</span>
      </div>
    </div>

    ${savings > 0 ? `
    <div class="apply-savings">
      <div class="apply-savings__icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="apply-savings__text">
        Без программы: <strong>${fmtNum(Math.round(baseInterest))} \u20bd</strong> процентов<br>
        Ваши проценты: <strong>${fmtNum(Math.round(interest))} \u20bd</strong>.
        Экономия: <strong>${fmtNum(Math.round(savings))} \u20bd</strong>
      </div>
    </div>
    ` : ''}

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

    ${tier.nextPerks && tier.nextPerks.length > 0 ? `
    <div class="section-title" style="text-align:left">На следующем уровне</div>
    <div class="apply-perks" style="opacity: 0.65">
      ${tier.nextPerks.map(p => `
        <div class="apply-perk">
          <span class="apply-perk__check" style="background: var(--color-text-tertiary)">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg>
          </span>
          ${p}
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="apply-submit">
      <button class="btn-repay" id="apply-submit-btn">Оформить заявку</button>
    </div>

    <div class="apply-disclaimer">
      Нажимая «Оформить заявку», вы соглашаетесь с условиями договора.
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
  });
  slider?.addEventListener('change', () => {
    selectedAmount = parseInt(slider.value);
    render(screen);
  });

  screen.querySelectorAll('[data-term]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedTerm = parseInt(btn.dataset.term);
      render(screen);
    });
  });

  screen.querySelector('#apply-submit-btn')?.addEventListener('click', () => {
    setLastApplication({ amount: selectedAmount, term: selectedTerm, rate: tier.dailyRate });
    navigate('/apply-success');
  });
}

function fmtNum(n) { return new Intl.NumberFormat('ru-RU').format(n); }
function fmtRate(r) { return r.toFixed(2).replace('.', ',') + '%'; }
