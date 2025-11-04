import { defineComponent, ref, watch, computed, onMounted, onBeforeUnmount } from '../../node_modules/vue/dist/vue.esm-browser.prod.js';

export default defineComponent({
  name: 'CategorySelector',
  props: {
    modelValue: { type: String, default: 'انتخاب کنید' },
    categories: { type: Array, default: () => [] }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const search = ref('');
    const open = ref(false);
    const root = ref(null);

    // Sync external model changes to local search string
    watch(() => props.modelValue, (val, oldVal) => {
      // When selection is cleared externally, reset local search
      if (!val || val === 'انتخاب کنید') {
        search.value = '';
        return;
      }
      // When a real value is provided, reflect it only if user hasn't typed
      if (search.value === '' || search.value === oldVal) {
        search.value = val;
      }
    }, { immediate: true });

    const filtered = computed(() => {
      const q = (search.value || '').trim();
      if (!q) return props.categories.slice(0, 450);
      const lowerQ = q.toLowerCase();
      // Persian-aware search: test raw and lowercased
      return props.categories.filter(c => c.includes(q) || c.toLowerCase().includes(lowerQ)).slice(0, 30);
    });

    const select = (val) => {
      emit('update:modelValue', val);
      search.value = val;
      open.value = false;
    };

    const onInput = () => {
      // Make sure dropdown is visible while typing
      open.value = true;
    };

    const showList = computed(() => {
      const q = (search.value || '').trim();
      // hide pills when selected item equals current search
      return q !== props.modelValue;
    });

    // close on outside click / escape
    const onDocClick = (e) => {
      if (!open.value) return;
      const el = root.value;
      if (el && !el.contains(e.target)) {
        open.value = false;
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') open.value = false;
    };
    onMounted(() => {
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('touchstart', onDocClick, { passive: true });
      document.addEventListener('keydown', onKey);
    });
    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
      document.removeEventListener('keydown', onKey);
    });

    return { search, filtered, select, showList, open, root, onInput };
  },
  template: `
    <div class="relative" ref="root">
      <input 
        type="text" 
        placeholder="جستجوی دسته‌بندی..."
        v-model="search"
        @focus="open = true"
        @input="onInput"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
        class="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-400/20"
      />
      <!-- Dropdown (all breakpoints) -->
      <div v-if="open && showList" class="absolute right-0 left-0 z-20 mt-1 max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow">
        <button v-for="c in filtered" :key="c" type="button" @click.prevent="select(c)" class="w-full text-right px-3 py-2 hover:bg-gray-100 text-sm">{{ c }}</button>
        <div v-if="filtered.length === 0" class="text-gray-400 px-3 py-2">موردی یافت نشد</div>
      </div>
      <!-- Chip list hidden (dropdown used everywhere) -->
      <div v-if="showList" class="hidden"></div>
    </div>
  `
});
