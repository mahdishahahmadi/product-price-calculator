import { defineComponent } from '../../node_modules/vue/dist/vue.esm-browser.prod.js';

function formatPrice(num) {
  try {
    return Number(num || 0).toLocaleString('fa-IR');
  } catch {
    return String(num);
  }
}

export default defineComponent({
  name: 'ResultDisplay',
  props: {
    result: { type: Object, required: true }
  },
  emits: ['clear-all'],
  computed: {
    hasError() { return !!(this.result && this.result.error); },
    priceText() { return formatPrice(this.result && this.result.price); },
    breakdown() { return (this.result && this.result.breakdown) || null; },
    sumCheck() {
      if (!this.breakdown) return 0;
      const b = this.breakdown;
      return (b.purchase||0)+(b.shipping||0)+(b.other||0)+(b.commission||0)+(b.profit||0);
    }
  },
  methods: {
    // expose formatter to template context
    formatPrice,
  },
  template: `
    <div>
      <div v-if="hasError" class="text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{{ result.error }}</div>
      <div v-else>
        <div class="flex justify-end mb-2">
          <button type="button"
            @click="$emit('clear-all')"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs md:text-sm">
            پاک کردن همه
          </button>
        </div>
        <div class="flex items-center justify-between p-4 rounded-xl border border-teal-200 bg-teal-50">
          <div class="text-gray-700">قیمت پیشنهادی فروش</div>
          <div class="text-3xl text-teal-700 tabular-nums">{{ priceText }} <span class="text-base text-gray-500">تومان</span></div>
        </div>
        <!-- Show breakdown on mobile too (was hidden with hidden md:block) -->
        <div v-if="breakdown" class="mt-2 text-[14px] text-gray-600 border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div class="flex items-center py-0.5"><span class="shrink-0">قیمت خرید</span><span class="mx-2 grow border-b border-dashed border-gray-300"></span><span class="shrink-0 tabular-nums">{{ formatPrice(breakdown.purchase) }}</span><span class="shrink-0 text-gray-500 ms-1">تومان</span></div>
          <div class="flex items-center py-0.5"><span class="shrink-0">هزینه ارسال</span><span class="mx-2 grow border-b border-dashed border-gray-300"></span><span class="shrink-0 tabular-nums">{{ formatPrice(breakdown.shipping) }}</span><span class="shrink-0 text-gray-500 ms-1">تومان</span></div>
          <div class="flex items-center py-0.5"><span class="shrink-0">سایر هزینه‌ها</span><span class="mx-2 grow border-b border-dashed border-gray-300"></span><span class="shrink-0 tabular-nums">{{ formatPrice(breakdown.other) }}</span><span class="shrink-0 text-gray-500 ms-1">تومان</span></div>
          <div class="flex items-center py-0.5"><span class="shrink-0">کارمزد باسلام</span><span class="mx-2 grow border-b border-dashed border-gray-300"></span><span class="shrink-0 tabular-nums">{{ formatPrice(breakdown.commission) }}</span><span class="shrink-0 text-gray-500 ms-1">تومان</span></div>
          <div class="flex items-center py-0.5 text-teal-600"><span class="shrink-0">حاشیه سود</span><span class="mx-2 grow border-b border-dashed border-teal-300"></span><span class="shrink-0 tabular-nums">{{ formatPrice(breakdown.profit) }} +</span><span class="shrink-0 ms-1">تومان</span></div>
          <div class="my-2 border-t border-dashed border-gray-300"></div>
          <div class="flex justify-between font-medium"><span>جمع</span><span class="tabular-nums">{{ priceText }} تومان</span></div>
        </div>
      </div>
    </div>
  `
});
