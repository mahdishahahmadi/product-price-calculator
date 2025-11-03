import { ref, computed, reactive, watch } from '../../node_modules/vue/dist/vue.esm-browser.prod.js';
import { PriceCalculatorService } from '../services/PriceCalculatorService.js';
import { CommissionDataService } from '../services/CommissionDataService.js';

const dataService = CommissionDataService.getInstance();
const calculatorService = new PriceCalculatorService();

export function useCalculator() {
  const inputs = reactive({
    purchasePrice: 0,
    shippingCost: 0,
    otherCosts: 0,
    profitMarginPercent: 20,
    selectedCategory: 'انتخاب کنید',
  });

  const categories = ref([]);
  // Load categories asynchronously
  dataService.ready?.then(() => {
    categories.value = dataService.getCategoryNames();
  });

  const saleMode = ref('retail'); // 'retail' | 'wholesale'
  const currentCommissionRate = computed(() => dataService.getRateForCategory(inputs.selectedCategory, saleMode.value));

  // Debounced copy of inputs to reduce recalculations while typing
  const debouncedInputs = reactive({
    purchasePrice: 0,
    shippingCost: 0,
    otherCosts: 0,
    profitMarginPercent: 20,
    selectedCategory: 'انتخاب کنید',
  });
  let debounceTimer = null;
  watch(inputs, (v) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      Object.assign(debouncedInputs, v);
    }, 300);
  }, { deep: true });

  const commissionRateDebounced = computed(() => dataService.getRateForCategory(debouncedInputs.selectedCategory, saleMode.value));

  const calculationResult = computed(() => {
    try {
      const calculatorInput = {
        ...debouncedInputs,
        commissionRate: commissionRateDebounced.value,
      };
      // فقط قیمت خرید شرط لازم است؛ انتخاب دستهبندی اختیاری است (در صورت عدم انتخاب، کارمزد 0 لحاظ میشود)
      if (calculatorInput.purchasePrice <= 0) {
        return { price: 0, error: null };
      }
      const price = calculatorService.calculateFinalPrice(calculatorInput);
      const commissionAmount = Math.round(price * calculatorInput.commissionRate);
      const profitAmount = Math.round(price * (calculatorInput.profitMarginPercent / 100));
      const breakdown = {
        purchase: Math.round(debouncedInputs.purchasePrice || 0),
        shipping: Math.round(debouncedInputs.shippingCost || 0),
        other: Math.round(debouncedInputs.otherCosts || 0),
        commission: commissionAmount,
        profit: profitAmount,
      };
      return { price, error: null, breakdown };
    } catch (e) {
      return { price: 0, error: e && e.message ? e.message : 'خطای نامشخص' };
    }
  });

  return { inputs, categories, calculationResult, currentCommissionRate, saleMode };
}
