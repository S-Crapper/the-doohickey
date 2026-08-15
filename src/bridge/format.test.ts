import { describe, expect, it } from "bun:test";
import { discordToRevolt, revoltToDiscord } from "./format.ts";

describe("mention sanitization", () => {
  it("strips Discord @everyone and @here from bridged content", () => {
    const input = "Hello @everyone and @here folks";
    expect(discordToRevolt(input)).toBe("Hello everyone and here folks");
  });

  it("strips Stoat text mentions that would trigger Discord pings", () => {
    const input = "Hello @everyone and @here folks";
    expect(revoltToDiscord(input)).toBe("Hello everyone and here folks");
  });
});
