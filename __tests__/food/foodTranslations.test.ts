import { foodT, foodTranslations, type FoodTranslationKey } from '../../configs/foodTranslations';

const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();

describe('food translations', () => {
  const keys = Object.keys(foodTranslations.en) as FoodTranslationKey[];

  it.each(['pt', 'fr', 'es'] as const)('%s has every key with the same placeholders as English', (locale) => {
    for (const key of keys) {
      const value = foodTranslations[locale][key];
      expect(value).toBeTruthy();
      expect(placeholders(value)).toEqual(placeholders(foodTranslations.en[key]));
    }
  });

  it('interpolates variables and falls back to English for unknown locales', () => {
    expect(foodT('en', 'foodItemsCount', { count: 3 })).toBe('3 items');
    expect(foodT('xx', 'foodTabNew')).toBe('New');
    expect(foodT('pt', 'foodTabWithCourier')).toBe('Com o estafeta');
  });
});
