import { getPartnerDashboardKind, isPartnerRole } from '../../utils/partnerRoles';

describe('grocery partner routing', () => {
  it('treats grocery_store_owner as a partner role', () => {
    expect(isPartnerRole('grocery_store_owner')).toBe(true);
  });

  it('opens the grocery dashboard for grocery partners', () => {
    expect(getPartnerDashboardKind('grocery')).toBe('grocery');
    expect(getPartnerDashboardKind('restaurant')).toBe('store');
  });
});
