Here is the technical development plan for the "Basalam Price Calculator," built with Vue.js and TypeScript, and incorporating OOP principles and design patterns as requested.

-----

## Technical Development Plan: Basalam Price Calculator (Vue.js + TypeScript)

### 1\. Project Overview & Goals

  * **Objective:** To create a highly-accurate, simple-to-use, client-side web application for Basalam vendors to calculate their final product selling price.
  * **Core Challenge:** The calculation must be precise, factoring in variable commission rates (based on 854 specific categories), fixed costs, and a desired profit margin.
  * **User Experience Goal:** Provide an immediate and accurate price recommendation with minimal user friction, especially when selecting a category.

### 2\. Core Technology Stack

  * **Framework:** Vue.js 3 (using Composition API)
  * **Build Tool:** Vite
  * **Language:** TypeScript
  * **Styling:** Scoped CSS (`<style scoped>`) for component encapsulation.

### 3\. Core Architecture & Design Decisions

This plan balances Vue's modern functional/composable-based architecture with the user's request for explicit OOP and Design Patterns.

1.  **OOP (Services Layer):** We will abstract all non-Vue "business logic" into pure TypeScript classes (Services). This makes the logic testable, portable, and separate from the view.

      * `PriceCalculatorService.ts`: A class responsible for the core calculation formula.
      * `CommissionDataService.ts`: A class responsible for loading and providing access to the commission data.

2.  **Design Patterns:**

      * **Singleton Pattern:** The `CommissionDataService` will be implemented as a Singleton. The 854-category JSON data will be loaded *once* (from an imported `commission_data.json` file) and held in a single instance, preventing redundant data loading.
      * **Dependency Injection (DI):** The `PriceCalculatorService` will receive the `CommissionDataService` as a dependency in its constructor. This decouples the calculator from *how* the commission data is fetched.

3.  **Composition API (Vue Layer):** We will use a Vue Composable (`useCalculator.ts`) as the primary "ViewModel" or "State Controller." This composable will:

      * Hold all reactive state (e.g., `ref`s for inputs, `computed` for outputs).
      * Instantiate and *use* the OOP services.
      * Expose the reactive state and methods to the Vue components.

4.  **Component-Based UI:** The UI will be broken down into small, single-responsibility components.

### 4\. Phased Development Plan

-----

#### Phase 0: Project Setup & Scaffolding

1.  **Initialize Project:** Use Vite to scaffold a new Vue + TypeScript project.
    ```bash
    npm create vite@latest basalam-calculator -- --template vue-ts
    ```
2.  **Install Dependencies:** No external libraries are strictly required for this plan, but `vue-select` or a similar library is *highly recommended* for Phase 3 to handle the 854-item dropdown.
3.  **Directory Structure:** Create the following directory structure inside `/src`:
    ```
    /src
    |-- /assets         # CSS, images
    |-- /components     # Reusable Vue components
    |-- /composables    # useCalculator.ts
    |-- /data           # commission_data.json
    |-- /services       # OOP classes (Calculator, Data)
    |-- /types          # TypeScript interfaces
    |-- App.vue         # Main application view
    |-- main.ts         # App entry point
    ```
4.  **Add Data:** Place the `commission_data.json` file (generated in the previous step) into `/src/data/`.

-----

#### Phase 1: Core Logic & Services (The "Model")

**Goal:** Implement the raw business logic in pure TypeScript.

1.  **Define Types (`/src/types/index.ts`):**
    ```typescript
    // The structure of the commission data
    export type CommissionData = {
      [category: string]: number; // e.g., "آجیل": 0.09
    };

    // Input for the calculator
    export interface ICalculatorInput {
      purchasePrice: number;
      shippingCost: number;
      otherCosts: number;
      profitMarginPercent: number; // e.g., 20
      commissionRate: number;      // e.g., 0.09
    }
    ```
2.  **Implement `CommissionDataService` (Singleton) (`/src/services/CommissionDataService.ts`):**
    ```typescript
    import { CommissionData } from '../types';
    import commissionJson from '../data/commission_data.json';

    export class CommissionDataService {
      private static instance: CommissionDataService;
      private rates: CommissionData;

      private constructor() {
        // Load data on first instantiation
        this.rates = commissionJson as CommissionData;
      }

      public static getInstance(): CommissionDataService {
        if (!CommissionDataService.instance) {
          CommissionDataService.instance = new CommissionDataService();
        }
        return CommissionDataService.instance;
      }

      public getCommissionRates(): CommissionData {
        return this.rates;
      }

      public getCategoryNames(): string[] {
        return Object.keys(this.rates);
      }

      public getRateForCategory(category: string): number {
        return this.rates[category] || 0;
      }
    }
    ```
3.  **Implement `PriceCalculatorService` (`/src/services/PriceCalculatorService.ts`):**
    ```typescript
    import { ICalculatorInput } from '../types';

    export class PriceCalculatorService {
      public calculateFinalPrice(input: ICalculatorInput): number {
        const totalFixedCosts = input.purchasePrice + input.shippingCost + input.otherCosts;
        
        const commissionPercent = input.commissionRate;
        const profitPercent = input.profitMarginPercent / 100;
        
        const totalPercentages = commissionPercent + profitPercent;

        // Validation / Edge Case
        if (totalPercentages >= 1.0) {
          throw new Error("Profit margin and commission cannot exceed 100%");
        }
        if (totalPercentages < 0) {
          throw new Error("Percentages cannot be negative");
        }

        // The core formula
        const finalPrice = totalFixedCosts / (1 - totalPercentages);
        
        return Math.ceil(finalPrice); // Round up to be safe
      }
    }
    ```

-----

#### Phase 2: State Management (The "Controller")

**Goal:** Bridge the gap between the Services (Logic) and Components (View) using a Vue Composable.

1.  **Create Composable (`/src/composables/useCalculator.ts`):**
    ```typescript
    import { ref, computed, reactive } from 'vue';
    import { PriceCalculatorService } from '../services/PriceCalculatorService';
    import { CommissionDataService } from '../services/CommissionDataService';
    import { ICalculatorInput } from '../types';

    // Instantiate services (Singleton is retrieved, new service is created)
    const dataService = CommissionDataService.getInstance();
    const calculatorService = new PriceCalculatorService();

    export function useCalculator() {
      // 1. STATE (Reactive Inputs)
      const inputs = reactive({
        purchasePrice: 0,
        shippingCost: 0,
        otherCosts: 0,
        profitMarginPercent: 20,
        selectedCategory: "انتخاب کنید",
      });

      // 2. STATE (Static Data)
      const categories = ref<string[]>(dataService.getCategoryNames());
      
      // 3. COMPUTED STATE (Derived Data)
      const currentCommissionRate = computed(() => {
        return dataService.getRateForCategory(inputs.selectedCategory);
      });

      const calculationResult = computed(() => {
        try {
          const calculatorInput: ICalculatorInput = {
            ...inputs,
            commissionRate: currentCommissionRate.value,
          };
          
          // Validation
          if (calculatorInput.purchasePrice <= 0 || inputs.selectedCategory === "انتخاب کنید") {
            return { price: 0, error: null };
          }

          const price = calculatorService.calculateFinalPrice(calculatorInput);
          return { price, error: null };
        
        } catch (e: any) {
          return { price: 0, error: e.message };
        }
      });

      // 4. EXPOSED API
      return {
        inputs,
        categories,
        calculationResult,
        currentCommissionRate,
      };
    }
    ```

-----

#### Phase 3: Component Implementation (The "View")

**Goal:** Build the UI components that consume the `useCalculator` composable.

1.  **`App.vue` (Main View):**
      * Import and call `useCalculator()`.
      * Pass the reactive state and categories as props to child components.
      * Display the `calculationResult`.
2.  **`CalculatorForm.vue` (`/src/components/CalculatorForm.vue`):**
      * Receives `inputs` as a prop (or uses `v-model`).
      * Contains `<input type="number">` for `purchasePrice`, `shippingCost`, `otherCosts`, `profitMarginPercent`.
      * Emits changes back to the parent (`App.vue`).
3.  **`CategorySelector.vue` (`/src/components/CategorySelector.vue`):**
      * **CRITICAL UX:** A standard `<select>` with 854 options is unusable.
      * **Implementation:** This component *must* be a **searchable/autocomplete dropdown**.
      * It will receive the `categories` array (854 items) as a prop.
      * It will hold its own internal state (`searchText`).
      * It will display a *filtered* list of categories based on `searchText`.
      * When an item is selected, it emits the change (e.g., `v-model` for `selectedCategory`).
4.  **`ResultDisplay.vue` (`/src/components/ResultDisplay.vue`):**
      * Receives `calculationResult` (which includes `price` and `error`) as a prop.
      * Displays the error message if `error` exists.
      * Displays the final price (with currency formatting) if `price > 0`.

-----

#### Phase 4: Styling & Finalization

1.  **Scoped Styling:** Use `<style scoped>` in each component file to apply simple, clean CSS. Ensure the layout is responsive (RTL-first).
2.  **Formatting:** Create a utility function to format the final price (e.g., `120,000 تومان`).
3.  **Validation:** Enhance the UI-level validation (e.g., red borders on invalid inputs) based on the `calculationResult.error`.

-----

#### Phase 5: Review & Build

1.  **Testing:** Manually test edge cases:
      * Profit + Commission \>= 100%.
      * No category selected.
      * Zero or negative purchase price.
2.  **Build:** Run `npm run build` to generate the static production assets.
3.  **Deploy:** Deploy the contents of the `/dist` folder to any static hosting provider.