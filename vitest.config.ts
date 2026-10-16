import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Worktrees unter .claude/worktrees enthalten Kopien der Tests – nicht doppelt ausführen
    exclude: ["**/node_modules/**", ".claude/**"],
  },
});
