import { describe, expect, it } from "vitest";
import { signupMetadata } from "./family-invite";

describe("family invitation at signup", () => {
  it("includes the normalized family invitation when supplied", () => {
    expect(signupMetadata(" Maria ", " ab12cd34 ")).toEqual({ full_name: "Maria", family_invite_code: "AB12CD34" });
  });
  it("leaves signup without an invitation on the existing new-family path", () => {
    expect(signupMetadata("Maria", "   ")).toEqual({ full_name: "Maria" });
  });
});