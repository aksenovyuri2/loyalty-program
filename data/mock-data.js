export const BASE_RATE = 1.00; // базовая ставка без программы лояльности

export const TIERS = {
  bronze: {
    id: 'bronze',
    name: 'Бронза',
    dailyRate: 0.80,
    maxLimit: 30000,
    perks: ['Сниженная ставка 0,80%/день'],
    nextPerks: ['Ставка 0,70%/день', 'Финансовая консультация'],
    conditions: [
      { text: 'Своевременное погашение 3 займов', amount: 10000, completed: false },
      { text: 'Общая сумма займов от 5 000 ₽', amount: 5000, completed: true },
      { text: 'Регистрация в программе', amount: 1000, completed: true },
    ],
  },
  silver: {
    id: 'silver',
    name: 'Серебро',
    dailyRate: 0.70,
    maxLimit: 60000,
    perks: ['Сниженная ставка 0,70%/день', 'Финансовая консультация'],
    nextPerks: ['Ставка 0,60%/день', 'Телемедицина 30 дней', 'Приоритетная линия'],
    conditions: [
      { text: 'Своевременное погашение 6 займов', amount: 10000, completed: false },
      { text: 'Общая сумма займов от 30 000 ₽', amount: 5000, completed: true },
      { text: 'Статус «Бронза» не менее 30 дней', amount: 1000, completed: true },
    ],
  },
  gold: {
    id: 'gold',
    name: 'Золото',
    dailyRate: 0.60,
    maxLimit: 90000,
    perks: ['Сниженная ставка 0,60%/день', 'Телемедицина 30 дней', 'Приоритетная линия'],
    nextPerks: [],
    conditions: [
      { text: 'Своевременное погашение 10 займов', amount: 10000, completed: true },
      { text: 'Общая сумма займов от 60 000 ₽', amount: 5000, completed: true },
      { text: 'Статус «Серебро» не менее 60 дней', amount: 1000, completed: true },
    ],
  },
};

// Progress toward next tier
export const TIER_PROGRESS = {
  loansCompleted: 2,
  loansNeeded: 3,
  amountPaid: 6500,
  amountNeeded: 10000,
};

export const TIER_ORDER = ['bronze', 'silver', 'gold'];

export const USER = {
  name: 'Андрей',
  fullName: 'Андрей Александрович',
  tier: 'bronze',
};

export const CURRENT_LOAN = {
  id: 'A24-2758246',
  remainingDebt: 1000,
  paymentDate: '24.04.2024',
  minPayment: 250,
  dpd: 0,  // days past due — set >= 7 to test frozen state
};

export const STATUS_HISTORY = [
  { tier: 'bronze', date: '10 мая 2025', active: true },
];
