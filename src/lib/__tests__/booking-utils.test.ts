import { describe, expect, it } from "vitest";
import { formatCardNumber, formatExpiry, luhnValid, paymentOutcome } from "../booking-utils";

describe("formatimi", () => {
  it("grupon numrin e kartës në 4 shifra", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatCardNumber("42a4 2")).toBe("4242");
    expect(formatCardNumber("12345678901234567890")).toBe("1234 5678 9012 3456");
  });
  it("formaton skadimin si MM/VV", () => {
    expect(formatExpiry("1230")).toBe("12/30");
    expect(formatExpiry("12")).toBe("12");
    expect(formatExpiry("1")).toBe("1");
  });
});

describe("paymentOutcome (pasqyron simulate_payment në SQL)", () => {
  const today = "2026-11-10";
  it("karta provë kalon", () => {
    expect(paymentOutcome("4242 4242 4242 4242", "12/30", today).status).toBe("succeeded");
  });
  it("karta e refuzuar dhe fondet e pamjaftueshme", () => {
    expect(paymentOutcome("4000 0000 0000 0002", "12/30", today).reason).toContain("refuzua");
    expect(paymentOutcome("4000 0000 0000 9995", "12/30", today).reason).toContain("Fonde");
  });
  it("numër i pavlefshëm (Luhn), i shkurtër, skadim i kaluar dhe format i gabuar", () => {
    expect(paymentOutcome("1234 5678 1234 5678", "12/30", today).reason).toContain("nuk është i vlefshëm");
    expect(paymentOutcome("4242", "12/30", today).reason).toContain("16 shifra");
    expect(paymentOutcome("4242 4242 4242 4242", "01/20", today).reason).toBe("Karta ka skaduar");
    expect(paymentOutcome("4242 4242 4242 4242", "13/30", today).reason).toContain("MM/VV");
  });
  it("karta vlen deri në fund të muajit të skadimit", () => {
    expect(paymentOutcome("4242 4242 4242 4242", "11/26", "2026-11-30").status).toBe("succeeded");
    expect(paymentOutcome("4242 4242 4242 4242", "11/26", "2026-12-01").reason).toBe("Karta ka skaduar");
  });
  it("Luhn", () => {
    expect(luhnValid("4242424242424242")).toBe(true);
    expect(luhnValid("4242424242424241")).toBe(false);
    expect(luhnValid("abc")).toBe(false);
  });
});
