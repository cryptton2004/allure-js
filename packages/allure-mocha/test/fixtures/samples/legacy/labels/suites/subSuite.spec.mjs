import { it } from "mocha";
import { allure } from "allure-mocha/runtime";

it("a test with a sub-suite", () => {
  allure.subSuite("foo");
});
