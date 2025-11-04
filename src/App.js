import { defineComponent, ref } from '../node_modules/vue/dist/vue.esm-browser.prod.js';
import { useCalculator } from './composables/useCalculator.js';
import CalculatorForm from './components/CalculatorForm.js';
import CategorySelector from './components/CategorySelector.js';
import ResultDisplay from './components/ResultDisplay.js';

export default defineComponent({
  name: 'App',
  components: { CalculatorForm, CategorySelector, ResultDisplay },
  setup() {
    const { inputs, categories, calculationResult, currentCommissionRate, saleMode } = useCalculator();
    const formKey = ref(0);
    const categoryKey = ref(0);

    const clearAll = () => {
      inputs.purchasePrice = 0;
      inputs.shippingCost = 0;
      inputs.otherCosts = 0;
      inputs.otherCostsMode = 'absolute';
      inputs.profitMarginPercent = 20;
      inputs.profitMode = 'percent';
      inputs.selectedCategory = 'انتخاب کنید';
      // Re-mount form and category selector to reset their internal states
      formKey.value++;
      categoryKey.value++;
    };
    if (typeof window !== 'undefined') {
      // expose for E2E debug
      window.__calc = { inputs, calculationResult, currentCommissionRate, saleMode };
    }
    return { inputs, categories, calculationResult, currentCommissionRate, saleMode, clearAll, formKey, categoryKey };
  },
  template: `
    <div class="max-w-5xl mx-auto p-4">
      <div class="text-right md:text-center">
        <h1 class="relative inline-flex items-center gap-2 md:gap-3 font-black text-[18px] md:text-[20px] mt-[8px] md:mt-[10px] mb-[16px] md:mb-[20px]" style="font-family: 'KalamehFaNum', sans-serif;">
          <img src="src/assets/logo.png" alt="لوگو" class="shrink-0 w-12 h-12 md:w-10 md:h-10" />
          <span class="relative inline-block" style="font-size:20px;font-weight:900;font-family:'Kalameh', system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif;">قیمت‌یار | ماشین‌حساب قیمت‌گذاری محصولات باسلام</span>
        </h1>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div class="bg-white border border-gray-200 rounded-2xl p-5">
          <p class="mb-2 text-gray-500">نوع فروش</p>
          <!-- چیپ‌های انتخاب خرده/عمده زیر عنوان -->
          <div class="relative inline-block mb-4 text-gray-600 select-none">
            <span class="inline-flex items-center gap-2">
              <button type="button" @click="saleMode='retail'"
                :class="['inline-flex items-center gap-1 px-3 py-1.5 rounded-full border shadow-sm', saleMode==='retail' ? 'border-teal-200 bg-teal-50 text-teal-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100']">
                خرده
              </button>
              <button type="button" @click="saleMode='wholesale'"
                :class="['inline-flex items-center gap-1 px-3 py-1.5 rounded-full border shadow-sm', saleMode==='wholesale' ? 'border-teal-200 bg-teal-50 text-teal-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100']">
                عمده
              </button>
            </span>
          </div>

          <!-- جست‌وجوی دسته‌بندی (ادغام‌شده) -->
          <div class="mb-5">
            <label class="block text-sm text-gray-500 mb-1">انتخاب دسته‌بندی محصول</label>
            <CategorySelector 
              :key="categoryKey"
              v-model="inputs.selectedCategory" 
              :categories="categories" />
          </div>

          <!-- خلاصه دسته‌بندی انتخاب‌شده -->
          <div class="mb-4">
            <div class="text-sm text-gray-500 mb-1">دسته‌بندی انتخاب‌شده</div>
            <div v-if="inputs.selectedCategory && inputs.selectedCategory !== 'انتخاب کنید'" class="relative inline-block">
              <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-teal-200 bg-teal-50 text-teal-700 shadow-sm">
                {{ inputs.selectedCategory }}
                <span class="text-xs">• {{ (currentCommissionRate * 100).toFixed(1) }}%</span>
              </span>
              <button type="button" aria-label="حذف" title="حذف" @click="inputs.selectedCategory = 'انتخاب کنید'"
                class="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-white/90 border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-300 shadow transition text-xs flex items-center justify-center">
                ×
              </button>
            </div>
            <div v-else class="text-xs text-gray-400">انتخاب نشده</div>
          </div>

          <!-- فرم محاسبه -->
          <CalculatorForm :key="formKey" :modelValue="inputs" @update:modelValue="val => Object.assign(inputs, val)" />

          <!-- نتیجه -->
          <div class="mt-4 md:mt-4">
            <ResultDisplay :result="calculationResult" @clear-all="clearAll" />
          </div>
      </div>
    </div>
  `
});
