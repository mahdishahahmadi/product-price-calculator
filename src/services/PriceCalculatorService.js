export class PriceCalculatorService {
  // قوانین مالی:
  // - کارمزد باسلام درصدی از قیمت نهایی محاسبه می‌شود.
  // - حاشیه سود فقط درصدی از قیمت خرید یا عددی ثابت (بسته به حالت) محاسبه می‌شود.
  // - سایر هزینه‌ها می‌تواند عددی ثابت یا درصدی از قیمت خرید باشد.
  calculateFinalPrice({ purchasePrice, shippingCost, otherCosts, otherCostsMode, profitMarginPercent, profitMode, commissionRate }) {
    const purchase = Number(purchasePrice || 0);
    const shipping = Number(shippingCost || 0);
    const otherVal = Number(otherCosts || 0);
    const commissionPercent = Number(commissionRate || 0); // 0..1
    const profitPercent = Number(profitMarginPercent || 0) / 100; // 0..1

    if (commissionPercent >= 1) {
      throw new Error('کارمزد نباید ۱۰۰٪ یا بیشتر باشد');
    }
    if (commissionPercent < 0) {
      throw new Error('درصدها نمی‌توانند منفی باشند');
    }

    const otherAmount = otherCostsMode === 'percent' ? purchase * (otherVal / 100) : otherVal;
    const profitAmount = profitMode === 'percent' ? (purchase * profitPercent) : Number(profitMarginPercent || 0);
    if (profitMode === 'percent' && profitPercent < 0) {
      throw new Error('درصدها نمی‌توانند منفی باشند');
    }
    if (profitMode === 'absolute' && profitAmount < 0) {
      throw new Error('مقادیر نمی‌توانند منفی باشند');
    }
    const basePlusProfit = purchase + shipping + otherAmount + profitAmount;
    const finalPrice = basePlusProfit / (1 - commissionPercent); // کمیسیون روی قیمت نهایی
    return Math.ceil(finalPrice);
  }
}
