import commissionRates from '../data/commission_data.js';

export class CommissionDataService {
  static #instance;

  #rates = {};

  constructor() {
    if (CommissionDataService.#instance) {
      return CommissionDataService.#instance;
    }
    this.#rates = commissionRates || {};
    CommissionDataService.#instance = this;
  }

  static getInstance() { return new CommissionDataService(); }

  get ready() { return Promise.resolve(); }
  getCommissionRates() { return this.#rates; }
  getCategoryNames() { return Object.keys(this.#rates); }
  getRateForCategory(category, mode = 'retail') {
    if (!category) return 0;
    const entry = this.#rates[category];
    if (entry == null) return 0;
    if (typeof entry === 'number') return entry; // backward compat
    return entry[mode] ?? 0;
  }
}
