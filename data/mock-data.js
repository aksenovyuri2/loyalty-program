export const BASE_RATE = 1.00; // базовая ставка без программы лояльности

export const TIERS = {
  bronze: {
    id: 'bronze',
    name: 'Бронза',
    dailyRate: 0.80,
    maxLimit: 30000,
    perks: ['Сниженная ставка 0,80%'],
    conditions: [
      { text: 'Оформить заявку', amount: 10000, completed: false },
      { text: 'Оформить заявку', amount: 5000, completed: true },
      { text: 'Оформить заявку', amount: 1000, completed: true },
    ],
  },
  silver: {
    id: 'silver',
    name: 'Серебро',
    dailyRate: 0.70,
    maxLimit: 60000,
    perks: ['Сниженная ставка 0,70%', 'Консультация финансовая'],
    conditions: [
      { text: 'Оформить заявку', amount: 10000, completed: false },
      { text: 'Оформить заявку', amount: 5000, completed: true },
      { text: 'Оформить заявку', amount: 1000, completed: true },
    ],
  },
  gold: {
    id: 'gold',
    name: 'Золото',
    dailyRate: 0.60,
    maxLimit: 90000,
    perks: ['Сниженная ставка 0,60%', 'Телемедицина 30 дней', 'Приоритетная линия'],
    conditions: [
      { text: 'Оформить заявку', amount: 10000, completed: true },
      { text: 'Оформить заявку', amount: 5000, completed: true },
      { text: 'Оформить заявку', amount: 1000, completed: true },
    ],
  },
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
  { tier: 'bronze', date: '10 мая 2025', active: false },
  { tier: 'silver', date: '10 сентября 2025', active: false },
  { tier: 'gold', date: '20 ноября 2025', active: true },
];
