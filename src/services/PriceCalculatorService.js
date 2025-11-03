export class PriceCalculatorService {
  calculateFinalPrice({ purchasePrice, shippingCost, otherCosts, profitMarginPercent, commissionRate }) {
    const totalFixedCosts = Number(purchasePrice || 0) + Number(shippingCost || 0) + Number(otherCosts || 0);
    const commissionPercent = Number(commissionRate || 0);
    const profitPercent = Number(profitMarginPercent || 0) / 100;

    const totalPercentages = commissionPercent + profitPercent;
    if (totalPercentages >= 1) {
      throw new Error('حاصل جمع کارمزد و سود نباید ۱۰۰٪ یا بیشتر باشد');
    }
    if (totalPercentages < 0) {
      throw new Error('درصدها نمیتوانند منفی باشند');
    }

    const finalPrice = totalFixedCosts / (1 - totalPercentages);
    return Math.ceil(finalPrice);
  }
}

