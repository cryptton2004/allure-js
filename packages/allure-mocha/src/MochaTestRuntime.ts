import { MessageTestRuntime, ReporterRuntime, RuntimeMessage, setGlobalTestRuntime } from "allure-js-commons/sdk/node";
import { allure } from "./legacy.js";

export class MochaTestRuntime extends MessageTestRuntime {
  constructor(private readonly reporterRuntime: ReporterRuntime) {
    super();
  }

  async sendMessage(message: RuntimeMessage) {
    this.reporterRuntime.applyRuntimeMessages([message]);
    await Promise.resolve();
  }
}

export const setUpTestRuntime = (reporterRuntime: ReporterRuntime) => {
  setGlobalTestRuntime(new MochaTestRuntime(reporterRuntime));
  allure.runtime = reporterRuntime;
};
