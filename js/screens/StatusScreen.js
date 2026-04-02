import { TIERS, TIER_ORDER, TIER_PROGRESS, BASE_RATE, STATUS_HISTORY, CURRENT_LOAN, STREAK, LIFETIME_SAVINGS } from '../../data/mock-data.js';
import { getState } from '../state.js';
import { navigate, onEnter } from '../router.js';
import { fmtNum, fmtRate, loanWord } from '../utils.js';
import { renderTierRows } from '../components/TierRow.js';

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

  // Default tab = next tier, or current if max
  const viewTier = activeTab || (isMaxTier ? currentTier : nextTierId);
  const viewTierData = TIERS[viewTier];
  const viewTierAllDone = viewTierData.conditions.every(c => c.completed);

  // Savings example — use REALISTIC amounts for motivation (not tiny 5k)
  const exampleAmount = 20000;
  const exampleDays = 30;
  const baseInterest = exampleAmount * (BASE_RATE / 100) * exampleDays;
  const currentInterest = exampleAmount * (tier.dailyRate / 100) * exampleDays;
  const nextInterest = nextTier ? exampleAmount * (nextTier.dailyRate / 100) * exampleDays : 0;
  const savingsVsBase = baseInterest - currentInterest;
  const savingsNextVsCurrent = nextTier ? currentInterest - nextInterest : 0;

  // History: inline if only 1 entry
  const showHistorySection = STATUS_HISTORY.length >= 2;

  // Conditions with inline progress (Zeigarnik effect)
  function conditionText(text, tierConditions) {
    // Extract "X займов" and show progress if it's the loans condition
    const loansMatch = text.match(/погашение (\d+) займов/);
    if (loansMatch) {
      const needed = parseInt(loansMatch[1]);
      const done = Math.min(prog.loansCompleted, needed);
      return `${text} <span style="color: var(--brand-blue); font-weight: 600">(${done} из ${needed})</span>`;
    }
    return text;
  }

  screen.innerHTML = `
    <div class="screen-header">
      <button class="screen-header__back" id="status-back" aria-label="Назад">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="screen-header__title">Ваш статус</span>
    </div>

    <div class="status-card-area">
      <div class="status-card status-card--${currentTier}">
        <div class="status-card__top">
          <div>
            <div class="status-card__user-name">${state.user.name}, ваш статус</div>
            <div class="status-card__tier-name">${tier.name}</div>
          </div>
          ${!showHistorySection && STATUS_HISTORY.length === 1 ? `
            <div class="status-card__since">с ${STATUS_HISTORY[0].date}</div>
          ` : ''}
        </div>
        <div class="status-card__metrics">
          <div class="status-card__metric">
            <span class="status-card__metric-value"><s class="status-card__metric-old">${fmtRate(BASE_RATE)}</s> ${fmtRate(tier.dailyRate)}</span>
            <span class="status-card__metric-label">ставка/день</span>
          </div>
          <div class="status-card__metric">
            <span class="status-card__metric-value">${fmtNum(tier.maxLimit)} \u20bd</span>
            <span class="status-card__metric-label">макс. лимит</span>
          </div>
        </div>
      </div>
      <button class="status-card__how-works" id="status-how-works" aria-label="Как работает программа лояльности">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Как работает программа лояльности →
      </button>
    </div>

    ${STREAK.isActive && STREAK.count >= 2 ? `
    <div class="streak-badge" style="margin-top: calc(-1 * var(--sp-sm))">
      <div class="streak-badge__icon">\uD83D\uDD25</div>
      <div>
        <div class="streak-badge__text">${STREAK.count} ${loanWord(STREAK.count)} подряд вовремя</div>
        <div class="streak-badge__sub">Серия не прервана — продолжайте</div>
      </div>
    </div>
    ` : ''}

    ${!isMaxTier ? `
    <div class="status-progress-section">
      <div class="status-progress__header">
        <span class="status-progress__title">Погашено ${prog.loansCompleted} из ${prog.loansNeeded} займов</span>
        <span class="status-progress__target" id="status-scroll-to-conditions" role="button" aria-label="Перейти к условиям ${nextTier.name}">до «${nextTier.name}»</span>
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

    ${LIFETIME_SAVINGS > 0 ? `
    <div class="lifetime-savings">
      <div class="lifetime-savings__icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="lifetime-savings__text">
        Вы уже сэкономили <span class="lifetime-savings__amount">${fmtNum(LIFETIME_SAVINGS)} \u20bd</span> с программой boostra.
        Повышайте статус — экономьте ещё больше.
      </div>
    </div>
    ` : ''}

    <div class="section-title">Ставки по уровням</div>
    ${renderTierRows(currentTier)}

    ${!isMaxTier ? `
    <div class="status-savings-example">
      <div class="status-savings-example__title">Пример: займ ${fmtNum(exampleAmount)} \u20bd на ${exampleDays} дней</div>
      <div class="status-savings-example__rows">
        <div class="status-savings-example__row">
          <span>Без программы (${fmtRate(BASE_RATE)})</span>
          <span>${fmtNum(Math.round(baseInterest))} \u20bd</span>
        </div>
        <div class="status-savings-example__row status-savings-example__row--current">
          <span>${tier.name} (${fmtRate(tier.dailyRate)})</span>
          <span>${fmtNum(Math.round(currentInterest))} \u20bd</span>
        </div>
        <div class="status-savings-example__row status-savings-example__row--next">
          <span>${nextTier.name} (${fmtRate(nextTier.dailyRate)})</span>
          <span>${fmtNum(Math.round(nextInterest))} \u20bd</span>
        </div>
      </div>
      <div class="status-savings-example__result">
        Повысив статус, не переплатите <strong>${fmtNum(Math.round(savingsNextVsCurrent))} \u20bd</strong> на процентах
      </div>
    </div>
    ` : `
    <div class="status-savings-example">
      <div class="status-savings-example__title">Ваша экономия: займ ${fmtNum(exampleAmount)} \u20bd на ${exampleDays} дней</div>
      <div class="status-savings-example__rows">
        <div class="status-savings-example__row">
          <span>Без программы (${fmtRate(BASE_RATE)})</span>
          <span>${fmtNum(Math.round(baseInterest))} \u20bd</span>
        </div>
        <div class="status-savings-example__row status-savings-example__row--current">
          <span>${tier.name} (${fmtRate(tier.dailyRate)})</span>
          <span>${fmtNum(Math.round(currentInterest))} \u20bd</span>
        </div>
      </div>
      <div class="status-savings-example__result">
        Вы не переплачиваете <strong>${fmtNum(Math.round(savingsVsBase))} \u20bd</strong> благодаря статусу ${tier.name}
      </div>
    </div>
    `}

    <div class="section-title" id="conditions-anchor">Условия перехода</div>
    <div class="tab-bar">
      ${TIER_ORDER.map(tid => {
        const t = TIERS[tid];
        const isActive = tid === viewTier;
        const allDone = t.conditions.every(c => c.completed);
        return `<button class="tab-btn ${isActive ? 'active--' + tid : ''}" data-view-tier="${tid}" aria-label="${t.name}${allDone ? ' — выполнено' : ''}">${t.name}${allDone && TIER_ORDER.indexOf(tid) <= currentIdx ? ' \u2713' : ''}</button>`;
      }).join('')}
    </div>
    <div class="conditions-section">
      ${viewTierAllDone ? `
      <div class="condition-item condition-item--all-done">
        <div class="condition-item__left">
          <div class="condition-item__check condition-item__check--done">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span class="condition-item__text" style="color: var(--brand-green); font-weight: 600">Все условия выполнены</span>
        </div>
      </div>
      ` : `
      ${viewTierData.conditions.map(c => `
        <div class="condition-item ${c.completed ? 'condition-item--done' : ''}">
          <div class="condition-item__left">
            <div class="condition-item__check ${c.completed ? 'condition-item__check--done' : ''}">
              ${c.completed
                ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
                : ''}
            </div>
            <span class="condition-item__text">${conditionText(c.text, viewTierData.conditions)}</span>
          </div>
        </div>
      `).join('')}
      `}
    </div>

    ${showHistorySection ? `
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
    ` : ''}

    <!-- Personalized CTA — Goal Gradient in copy -->
    <div style="padding: 0 var(--sp-base); margin-bottom: var(--sp-md)">
      <button class="btn-primary" id="status-apply" style="width:100%" aria-label="Оформить заявку">
        ${isMaxTier
          ? `Оформить заявку по ставке ${fmtRate(tier.dailyRate)}`
          : `Оформить ${prog.loansCompleted + 1}-й займ \u2192 ${nextTier.name}`
        }
      </button>
    </div>
    <div style="padding: 0 var(--sp-base); margin-bottom: var(--sp-lg); font-size: var(--fs-xs); color: var(--color-text-secondary); text-align: center">
      ${isMaxTier
        ? `Статус ${tier.name} — лучшие условия уже ваши`
        : `Погасите вовремя — и статус ${nextTier.name} ваш`
      }
    </div>
  `;

  screen.querySelector('#status-back')?.addEventListener('click', () => navigate('/lk'));
  screen.querySelector('#status-apply')?.addEventListener('click', () => navigate('/apply'));
  screen.querySelector('#status-scroll-to-conditions')?.addEventListener('click', () => {
    const anchor = screen.querySelector('#conditions-anchor');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
  });
  screen.querySelector('#status-how-works')?.addEventListener('click', () => navigate('/onboarding'));
  screen.querySelectorAll('[data-view-tier]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.viewTier;
      render(screen);
    });
  });
}
