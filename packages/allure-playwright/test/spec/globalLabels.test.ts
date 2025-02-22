import { expect, it } from "vitest";
import { runPlaywrightInlineTest } from "../utils.js";

it("sets allure labels from env variables", async () => {
  const { tests } = await runPlaywrightInlineTest(
    {
      "sample.test.js": `
      import { test } from '@playwright/test';

      test.describe('nested', () => {
        test('test', async ({}, testInfo) => {});
      });
      `,
    },
    undefined,
    {
      ALLURE_LABEL_A: "a",
      ALLURE_LABEL_B: "b",
    },
  );

  expect(tests).toHaveLength(1);
  expect(tests[0].labels).toEqual(
    expect.arrayContaining([
      { name: "A", value: "a" },
      { name: "B", value: "b" },
    ]),
  );
});
