import { formatMoney, statusColor } from "../../screens/grocery/groceryUi";

describe("groceryUi", () => {
  it("formats currency amounts", () => {
    expect(formatMoney(12.5, "ZAR")).toMatch(/12/);
  });

  it("maps grocery order statuses to web chip colors", () => {
    expect(statusColor("new")).toEqual({ bg: "#EFF6FF", text: "#1D4ED8" });
    expect(statusColor("delivered")).toEqual({ bg: "#ECFDF5", text: "#047857" });
    expect(statusColor("cancelled")).toEqual({ bg: "#FEF2F2", text: "#B91C1C" });
    expect(statusColor("ready")).toEqual({ bg: "#FFFBEB", text: "#92400E" });
  });
});
