import { expect, it } from "vitest";
import { Stage, Status } from "allure-js-commons";
import { runCucumberInlineTest } from "../utils.js";

it("sets label from env variables", async () => {
  const { tests } = await runCucumberInlineTest(["simple"], ["simple"], undefined, undefined, {
    ALLURE_LABEL_A: "a",
    ALLURE_LABEL_B: "b",
  });

  expect(tests).toHaveLength(3);
  expect(tests).toContainEqual(
    expect.objectContaining({
      name: "passed",
      status: Status.PASSED,
      stage: Stage.FINISHED,
      steps: [
        expect.objectContaining({
          name: "Given a passed step",
          status: Status.PASSED,
          stage: Stage.FINISHED,
        }),
      ],
      labels: expect.arrayContaining([
        {
          name: "A",
          value: "a",
        },
        {
          name: "B",
          value: "b",
        },
      ]),
    }),
  );
  expect(tests).toContainEqual(
    expect.objectContaining({
      name: "failed",
      status: Status.FAILED,
      stage: Stage.FINISHED,
      steps: [
        expect.objectContaining({
          name: "Given a failed step",
          status: Status.FAILED,
          stage: Stage.FINISHED,
          statusDetails: expect.objectContaining({
            message: expect.stringContaining("AssertionError"),
            trace: expect.any(String),
          }),
        }),
      ],
      labels: expect.arrayContaining([
        {
          name: "A",
          value: "a",
        },
        {
          name: "B",
          value: "b",
        },
      ]),
    }),
  );
  expect(tests).toContainEqual(
    expect.objectContaining({
      name: "broken",
      status: Status.BROKEN,
      stage: Stage.FINISHED,
      steps: [
        expect.objectContaining({
          name: "Given a broken step",
          status: Status.BROKEN,
          stage: Stage.FINISHED,
          statusDetails: expect.objectContaining({
            message: expect.stringContaining("Error"),
            trace: expect.any(String),
          }),
        }),
      ],
      labels: expect.arrayContaining([
        {
          name: "A",
          value: "a",
        },
        {
          name: "B",
          value: "b",
        },
      ]),
    }),
  );
});
