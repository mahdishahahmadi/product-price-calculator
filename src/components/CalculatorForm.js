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
          evt.target.value = formatFaNumber(n);
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
    }
  },
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs md:text-sm text-gray-600 mb-1">قیمت خرید (تومان)</label>
        <input class="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-400/20" type="text" inputmode="numeric" pattern="[0-9۰-۹٠-٩]*" :value="modelValue.purchasePrice > 0 ? modelValue.purchasePrice.toLocaleString('fa-IR') : ''" @input="updateField('purchasePrice', $event)" placeholder="0" />
      </div>
      <div>
        <div class="mb-1">
          <div class="flex items-center justify-between">
            <label class="block text-xs md:text-sm text-gray-600">هزینه ارسال (تومان)</label>
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
        <label class="block text-xs md:text-sm text-gray-600 mb-1">سایر هزینه‌ها (تومان)</label>
        <input class="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-400/20" type="text" inputmode="numeric" pattern="[0-9۰-۹٠-٩]*" :value="modelValue.otherCosts > 0 ? modelValue.otherCosts.toLocaleString('fa-IR') : ''" @input="updateField('otherCosts', $event)" placeholder="0" />
      </div>
      <div>
        <label class="block text-xs md:text-sm text-gray-600 mb-1">حاشیه سود (%)</label>
        <input class="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-400/20" type="text" inputmode="numeric" pattern="[0-9۰-۹٠-٩]*" :value="modelValue.profitMarginPercent != null ? modelValue.profitMarginPercent.toLocaleString('fa-IR') : ''" @input="updateField('profitMarginPercent', $event)" placeholder="20" />
      </div>
    </div>
  `
});
