import { defineComponent, ref, onMounted, onBeforeUnmount } from '../node_modules/vue/dist/vue.esm-browser.prod.js';
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
    const helpCategoryOpen = ref(false);
    const categoryHelpRoot = ref(null);

    const toggleCategoryHelp = () => {
      helpCategoryOpen.value = !helpCategoryOpen.value;
    };

    let _onDocClick;
    onMounted(() => {
      _onDocClick = (e) => {
        const el = categoryHelpRoot.value;
        if (helpCategoryOpen.value && el && !el.contains(e.target)) {
          helpCategoryOpen.value = false;
        }
      };
      document.addEventListener('mousedown', _onDocClick);
      document.addEventListener('touchstart', _onDocClick, { passive: true });
    });
    onBeforeUnmount(() => {
      if (_onDocClick) {
        document.removeEventListener('mousedown', _onDocClick);
        document.removeEventListener('touchstart', _onDocClick);
      }
    });

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
    return { inputs, categories, calculationResult, currentCommissionRate, saleMode, clearAll, formKey, categoryKey, helpCategoryOpen, toggleCategoryHelp, categoryHelpRoot };
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
            <div class="relative inline-flex items-center gap-2 mb-1" ref="categoryHelpRoot">
              <label class="block text-sm text-gray-500 m-0">انتخاب دسته‌بندی محصول</label>
              <button type="button" aria-label="راهنما" @click="toggleCategoryHelp()"
                class="inline-flex items-center justify-center w-5 h-5 text-teal-600 hover:text-teal-700">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M9.14648 9.07361C9.31728 8.54732 9.63015 8.07896 10.0508 7.71948C10.4714 7.36001 10.9838 7.12378 11.5303 7.03708C12.0768 6.95038 12.6362 7.0164 13.1475 7.22803C13.6587 7.43966 14.1014 7.78875 14.4268 8.23633C14.7521 8.68391 14.9469 9.21256 14.9904 9.76416C15.0339 10.3158 14.9238 10.8688 14.6727 11.3618C14.4215 11.8548 14.0394 12.2685 13.5676 12.5576C13.0958 12.8467 12.5533 12.9998 12 12.9998V14.0002M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 17V17.1L11.9502 17.1002V17H12.0498Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div v-if="helpCategoryOpen" class="absolute top-full mt-1 right-0 z-50 w-64 md:w-72 text-[11px] md:text-xs text-gray-600 bg-white border border-gray-200 rounded-lg shadow p-2">
                کارمزد باسلام نسبت به قیمت نهایی فروش محصول محاسبه می‌شود.
              </div>
            </div>

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
