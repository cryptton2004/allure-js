import { expect, it } from "vitest";
import { Status } from "allure-js-commons";
import { runJestInlineTest } from "../../../utils.js";

it("single step", async () => {
  const { tests } = await runJestInlineTest(
    `
    it("step", async () => {
      await allure.step("foo", async () => {
        await allure.label("foo", "bar");
      });
    });
  `,
  );

  expect(tests).toHaveLength(1);
  expect(tests[0].labels).toContainEqual(expect.objectContaining({ name: "foo", value: "bar" }));
  expect(tests[0].steps).toHaveLength(1);
  expect(tests[0].steps).toContainEqual(expect.objectContaining({ name: "foo" }));
});

it("multiple steps", async () => {
  const { tests } = await runJestInlineTest(
    `
    it("step", async () => {
      await allure.step("foo", async () => {
        await allure.label("foo", "1");
      });

      await allure.step("bar", async () => {
        await allure.label("bar", "2");
      });

      await allure.step("baz", async () => {
        await allure.label("baz", "3");
      });
    });
  `,
  );

  expect(tests).toHaveLength(1);
  expect(tests[0].labels).toContainEqual(expect.objectContaining({ name: "foo", value: "1" }));
  expect(tests[0].labels).toContainEqual(expect.objectContaining({ name: "bar", value: "2" }));
  expect(tests[0].labels).toContainEqual(expect.objectContaining({ name: "baz", value: "3" }));
  expect(tests[0].steps).toHaveLength(3);
  expect(tests[0].steps).toContainEqual(expect.objectContaining({ name: "foo" }));
  expect(tests[0].steps).toContainEqual(expect.objectContaining({ name: "bar" }));
  expect(tests[0].steps).toContainEqual(expect.objectContaining({ name: "baz" }));
});

it("nested steps", async () => {
  const { tests } = await runJestInlineTest(
    `
    it("step", async () => {
      await allure.step("foo", async () => {
        await allure.step("bar", async () => {
           await allure.step("baz", async () => {
             await allure.label("foo", "bar");
           });
        });
      });
    });
  `,
  );

  expect(tests).toHaveLength(1);
  expect(tests[0].labels).toContainEqual(expect.objectContaining({ name: "foo", value: "bar" }));
  expect(tests[0].steps).toHaveLength(1);
  expect(tests[0].steps).toContainEqual(expect.objectContaining({ name: "foo" }));
  expect(tests[0].steps[0].steps).toHaveLength(1);
  expect(tests[0].steps[0].steps).toContainEqual(expect.objectContaining({ name: "bar" }));
  expect(tests[0].steps[0].steps[0].steps).toHaveLength(1);
  expect(tests[0].steps[0].steps[0].steps).toContainEqual(expect.objectContaining({ name: "baz" }));
});

it("step with attachments", async () => {
  const { tests, attachments } = await runJestInlineTest(
    `
    it("text attachment", async () => {
      await allure.step("foo", async () => {
        await allure.attachment("foo.txt", "bar", "text/plain");
      })
    });
  `,
  );

  expect(tests).toHaveLength(1);
  expect(tests[0].attachments).toHaveLength(0);
  expect(tests[0].steps).toHaveLength(1);
  expect(tests[0].steps).toContainEqual(expect.objectContaining({ name: "foo" }));

  const [step] = tests[0].steps[0].steps;
  expect(step.name).toBe("foo.txt");
  const [attachment] = step.attachments;

  expect(attachment.name).toBe("foo.txt");
  expect(Buffer.from(attachments[attachment.source] as string, "base64").toString("utf8")).toBe("bar");
});

it("step with assertion error", async () => {
  const { tests } = await runJestInlineTest(
    `
    it("step", async () => {
      await allure.step("foo", async () => {
        expect(1).toBe(2);
      });
    });
  `,
  );

  expect(tests).toHaveLength(1);
  expect(tests[0].status).toBe(Status.FAILED);
  expect(tests[0].steps).toHaveLength(1);
  expect(tests[0].steps).toContainEqual(
    expect.objectContaining({
      name: "foo",
      status: Status.FAILED,
    }),
  );
});

it("step with unexpected error", async () => {
  const { tests } = await runJestInlineTest(
    `
    it("step", async () => {
      await allure.step("foo", async () => {
        throw new Error("foo");
      });
    });
  `,
  );

  expect(tests).toHaveLength(1);
  expect(tests[0].status).toBe(Status.BROKEN);
  expect(tests[0].steps).toHaveLength(1);
  expect(tests[0].steps[0]).toMatchObject({
    name: "foo",
    status: Status.BROKEN,
  });
});

it("step runtime api", async () => {
  const { tests } = await runJestInlineTest(
    `
    it("step", async () => {
      await allure.step("step", (ctx) => {
        ctx.displayName("bar");
        ctx.parameter("p1", "v1");
        ctx.parameter("p2", "v2", "default");
        ctx.parameter("p3", "v3", "masked");
        ctx.parameter("p4", "v4", "hidden");
      });
    });
  `,
  );

  expect(tests).toHaveLength(1);
  expect(tests[0].status).toEqual("passed");
  expect(tests[0].steps).toHaveLength(1);
  const actualStep = tests[0].steps[0];
  expect(actualStep.status).toEqual("passed");
  expect(actualStep.name).toEqual("bar");
  expect(actualStep.parameters).toHaveLength(4);
  expect(actualStep.parameters).toEqual([
    { name: "p1", value: "v1" },
    { name: "p2", value: "v2", mode: "default" },
    { name: "p3", value: "v3", mode: "masked" },
    { name: "p4", value: "v4", mode: "hidden" },
  ]);
});
