import { defineComponent } from '../../node_modules/vue/dist/vue.esm-browser.prod.js';

function normalizeNumberInput(value) {
  if (value === null || value === undefined) return '';
  let s = String(value).trim();
  // Convert Persian and Arabic-Indic digits to Latin
  const persian = '۰۱۲۳۴۵۶۷۸۹';
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  s = s
    .replace(/[۰-۹]/g, d => String(persian.indexOf(d)))
    .replace(/[٠-٩]/g, d => String(arabic.indexOf(d)));
  // Remove thousand separators and spaces
  s = s.replace(/[\s_,٬،,]/g, '');
  return s;
}

function formatFaNumber(n) {
  try {
    const num = Number(n || 0);
    if (!Number.isFinite(num)) return '';
    return num.toLocaleString('fa-IR');
  } catch {
    return String(n ?? '');
  }
}

export default defineComponent({
  name: 'CalculatorForm',
  props: {
    modelValue: { type: Object, required: true }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      // وقتی ارسال رایگان باشد، امکان وارد کردن هزینه‌ی ارسال وجود دارد
      freeShipping: false,
      helpOpen: { purchase: false, shipping: false, other: false, profit: false },
    };
  },
  methods: {
    updateField(key, evt) {
      const value = evt && evt.target ? evt.target.value : evt;
      // Avoid wiping computed result when user clears field to retype
      if (value === '' || value === null || value === undefined) {
        return;
      }
      const numKeys = ['purchasePrice', 'shippingCost', 'otherCosts', 'profitMarginPercent'];
      let v = value;
      if (numKeys.includes(key)) {
        const norm = normalizeNumberInput(value);
        const n = Number(norm);
        v = Number.isFinite(n) ? n : 0;
        // Update the visible input with grouped Persian digits
        if (evt && evt.target) {
          let shouldFormat = true;
          if (key === 'otherCosts' && this.modelValue.otherCostsMode === 'percent') shouldFormat = false;
          if (key === 'profitMarginPercent' && this.modelValue.profitMode === 'percent') shouldFormat = false;
          if (shouldFormat) {
            evt.target.value = formatFaNumber(n);
          }
        }
      }
      this.$emit('update:modelValue', { ...this.modelValue, [key]: v });
    },
    setShippingMode(isFree) {
      this.freeShipping = !!isFree;
      if (!this.freeShipping) {
        // اگر ارسال رایگان نیست (هزینه از مشتری گرفته می‌شود) مقدار هزینه برای فروشنده صفر است
        this.updateField('shippingCost', 0);
      }
    },
    setProfitMode(mode) {
      const m = mode === 'absolute' ? 'absolute' : 'percent';
      this.$emit('update:modelValue', { ...this.modelValue, profitMode: m });
    },
    setOtherCostsMode(mode) {
      const m = mode === 'percent' ? 'percent' : 'absolute';
      this.$emit('update:modelValue', { ...this.modelValue, otherCostsMode: m });
    },
    toggleHelp(key) {
      const next = !this.helpOpen[key];
      this.closeAllHelp();
      this.helpOpen[key] = next;
    },
    closeAllHelp() {
      this.helpOpen.purchase = false;
      this.helpOpen.shipping = false;
      this.helpOpen.other = false;
      this.helpOpen.profit = false;
    }
  },
  mounted() {
    this._onDocClick = (e) => {
      const root = this.$refs && this.$refs.root;
      if (root && !root.contains(e.target)) this.closeAllHelp();
    };
    document.addEventListener('mousedown', this._onDocClick);
    document.addEventListener('touchstart', this._onDocClick, { passive: true });
  },
  beforeUnmount() {
    if (this._onDocClick) {
      document.removeEventListener('mousedown', this._onDocClick);
      document.removeEventListener('touchstart', this._onDocClick);
    }
  },
  template: `
    <div ref="root" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <div class="relative mb-1">
          <label class="block text-xs md:text-sm text-gray-600">
            <span class="inline-flex items-center gap-1">
              <span>قیمت پایه محصول (تومان)</span>
              <span class="text-rose-500" aria-hidden="true">*</span>
              <button type="button" aria-label="راهنما" @click="toggleHelp('purchase')"
                class="inline-flex items-center justify-center w-5 h-5 text-teal-600 hover:text-teal-700">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M9.14648 9.07361C9.31728 8.54732 9.63015 8.07896 10.0508 7.71948C10.4714 7.36001 10.9838 7.12378 11.5303 7.03708C12.0768 6.95038 12.6362 7.0164 13.1475 7.22803C13.6587 7.43966 14.1014 7.78875 14.4268 8.23633C14.7521 8.68391 14.9469 9.21256 14.9904 9.76416C15.0339 10.3158 14.9238 10.8688 14.6727 11.3618C14.4215 11.8548 14.0394 12.2685 13.5676 12.5576C13.0958 12.8467 12.5533 12.9998 12 12.9998V14.0002M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 17V17.1L11.9502 17.1002V17H12.0498Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </span>
          </label>
          <div v-if="helpOpen.purchase" class="absolute top-full mt-1 right-0 w-64 md:w-72 text-[11px] md:text-xs text-gray-600 bg-white border border-gray-200 rounded-lg shadow p-2">
            قیمت خرید یا هزینه تولید هر واحد محصول خود را وارد کنید.
          </div>
        </div>
        <input 
          class="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-400/20" 
          type="text" 
          inputmode="numeric" 
          pattern="[0-9۰-۹٠-٩]*" 
          required 
          aria-required="true"
          :value="modelValue.purchasePrice > 0 ? modelValue.purchasePrice.toLocaleString('fa-IR') : ''" 
          @input="updateField('purchasePrice', $event)" 
          placeholder="0" 
        />
      </div>
      <div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="relative inline-flex items-center gap-2">
              <label class="block text-xs md:text-sm text-gray-600">هزینه ارسال (تومان)</label>
              <button type="button" aria-label="راهنما" @click="toggleHelp('shipping')"
                class="inline-flex items-center justify-center w-5 h-5 text-teal-600 hover:text-teal-700">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M9.14648 9.07361C9.31728 8.54732 9.63015 8.07896 10.0508 7.71948C10.4714 7.36001 10.9838 7.12378 11.5303 7.03708C12.0768 6.95038 12.6362 7.0164 13.1475 7.22803C13.6587 7.43966 14.1014 7.78875 14.4268 8.23633C14.7521 8.68391 14.9469 9.21256 14.9904 9.76416C15.0339 10.3158 14.9238 10.8688 14.6727 11.3618C14.4215 11.8548 14.0394 12.2685 13.5676 12.5576C13.0958 12.8467 12.5533 12.9998 12 12.9998V14.0002M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 17V17.1L11.9502 17.1002V17H12.0498Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div v-if="helpOpen.shipping" class="absolute top-full mt-1 right-0 w-64 md:w-72 text-[11px] md:text-xs text-gray-600 bg-white border border-gray-200 rounded-lg shadow p-2">
                تعیین کنید هزینه ارسال را از مشتری می‌گیرید یا در قیمت محصول محاسبه می‌کنید.
              </div>
            </div>
            <div class="flex items-center gap-2 text-[11px] md:text-xs text-gray-600 select-none cursor-pointer">
              <label class="inline-flex items-center gap-1">
                <input type="radio" class="sr-only" name="shippingMode" :checked="!freeShipping" @change="setShippingMode(false)" />
                <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full border', !freeShipping ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600']">هزینه با مشتری</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <input type="radio" class="sr-only" name="shippingMode" :checked="freeShipping" @change="setShippingMode(true)" />
                <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full border', freeShipping ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600']">ارسال رایگان</span>
              </label>
            </div>
          </div>
        </div>
        
        <input 
          class="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-400/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" 
          type="text" inputmode="numeric" pattern="[0-9۰-۹٠-٩]*" :disabled="!freeShipping"
          :value="modelValue.shippingCost > 0 ? modelValue.shippingCost.toLocaleString('fa-IR') : ''" @input="updateField('shippingCost', $event)" placeholder="0" />
      </div>
      <div>
        <div class="mb-2">
          <div class="flex items-center justify-between">
            <div class="relative inline-flex items-center gap-2">
              <label class="block text-xs md:text-sm text-gray-600">
                {{ modelValue.otherCostsMode === 'percent' ? 'سایر هزینه‌ها (%)' : 'سایر هزینه‌ها (تومان)' }}
              </label>
              <button type="button" aria-label="راهنما" @click="toggleHelp('other')"
                class="inline-flex items-center justify-center w-5 h-5 text-teal-600 hover:text-teal-700">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M9.14648 9.07361C9.31728 8.54732 9.63015 8.07896 10.0508 7.71948C10.4714 7.36001 10.9838 7.12378 11.5303 7.03708C12.0768 6.95038 12.6362 7.0164 13.1475 7.22803C13.6587 7.43966 14.1014 7.78875 14.4268 8.23633C14.7521 8.68391 14.9469 9.21256 14.9904 9.76416C15.0339 10.3158 14.9238 10.8688 14.6727 11.3618C14.4215 11.8548 14.0394 12.2685 13.5676 12.5576C13.0958 12.8467 12.5533 12.9998 12 12.9998V14.0002M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 17V17.1L11.9502 17.1002V17H12.0498Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div v-if="helpOpen.other" class="absolute top-full mt-1 right-0 w-64 md:w-72 text-[11px] md:text-xs text-gray-600 bg-white border border-gray-200 rounded-lg shadow p-2">
                می‌توانید هزینه‌هایی مثل بسته‌بندی، کارتن، انبار یا نیروی انسانی را برای هر واحد محصول وارد کنید.
              </div>
            </div>
            <div class="flex items-center gap-2 text-[11px] md:text-xs text-gray-600 select-none cursor-pointer">
              <label class="inline-flex items-center gap-1">
                <input type="radio" class="sr-only" name="otherMode" :checked="modelValue.otherCostsMode !== 'percent'" @change="setOtherCostsMode('absolute')" />
                <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full border', modelValue.otherCostsMode !== 'percent' ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600']">عددی</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <input type="radio" class="sr-only" name="otherMode" :checked="modelValue.otherCostsMode === 'percent'" @change="setOtherCostsMode('percent')" />
                <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full border', modelValue.otherCostsMode === 'percent' ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600']">درصدی</span>
              </label>
            </div>
          </div>
        </div>
        
        <input 
          class="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-400/20"
          type="text" inputmode="numeric" pattern="[0-9۰-۹٠-٩]*"
          :value="modelValue.otherCostsMode === 'percent' 
            ? (modelValue.otherCosts != null && modelValue.otherCosts !== 0 ? String(modelValue.otherCosts) : '') 
            : (modelValue.otherCosts > 0 ? modelValue.otherCosts.toLocaleString('fa-IR') : '')"
          @input="updateField('otherCosts', $event)" 
          :placeholder="modelValue.otherCostsMode === 'percent' ? '0' : '0'" />
      </div>
      <div>
        <div class="mb-2">
          <div class="flex items-center justify-between">
            <div class="relative inline-flex items-center gap-2">
              <label class="block text-xs md:text-sm text-gray-600">
                {{ modelValue.profitMode === 'percent' ? 'حاشیه سود (%)' : 'حاشیه سود (تومان)' }}
              </label>
              <button type="button" aria-label="راهنما" @click="toggleHelp('profit')"
                class="inline-flex items-center justify-center w-5 h-5 text-teal-600 hover:text-teal-700">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M9.14648 9.07361C9.31728 8.54732 9.63015 8.07896 10.0508 7.71948C10.4714 7.36001 10.9838 7.12378 11.5303 7.03708C12.0768 6.95038 12.6362 7.0164 13.1475 7.22803C13.6587 7.43966 14.1014 7.78875 14.4268 8.23633C14.7521 8.68391 14.9469 9.21256 14.9904 9.76416C15.0339 10.3158 14.9238 10.8688 14.6727 11.3618C14.4215 11.8548 14.0394 12.2685 13.5676 12.5576C13.0958 12.8467 12.5533 12.9998 12 12.9998V14.0002M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 17V17.1L11.9502 17.1002V17H12.0498Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div v-if="helpOpen.profit" class="absolute top-full mt-1 right-0 w-64 md:w-72 text-[11px] md:text-xs text-gray-600 bg-white border border-gray-200 rounded-lg shadow p-2">
                درصد یا مبلغ سود مورد نظرتان را تعیین کنید (حاشیه سود نسبت به قیمت پایه محصول لحاظ می‌شود.)
              </div>
            </div>
            <div class="flex items-center gap-2 text-[11px] md:text-xs text-gray-600 select-none cursor-pointer">
              <label class="inline-flex items-center gap-1">
                <input type="radio" class="sr-only" name="profitMode" :checked="modelValue.profitMode === 'percent'" @change="setProfitMode('percent')" />
                <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full border', modelValue.profitMode === 'percent' ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600']">درصدی</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <input type="radio" class="sr-only" name="profitMode" :checked="modelValue.profitMode === 'absolute'" @change="setProfitMode('absolute')" />
                <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full border', modelValue.profitMode === 'absolute' ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600']">عددی</span>
              </label>
            </div>
          </div>
        </div>
        <input 
          class="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-400/20"
          type="text" inputmode="numeric" pattern="[0-9۰-۹٠-٩]*"
          :value="modelValue.profitMode === 'percent' 
            ? (modelValue.profitMarginPercent != null && modelValue.profitMarginPercent !== 0 ? String(modelValue.profitMarginPercent) : '') 
            : (modelValue.profitMarginPercent > 0 ? modelValue.profitMarginPercent.toLocaleString('fa-IR') : '')"
          @input="updateField('profitMarginPercent', $event)"
          :placeholder="modelValue.profitMode === 'percent' ? '20' : '0'" />
      </div>
    </div>
  `
});
