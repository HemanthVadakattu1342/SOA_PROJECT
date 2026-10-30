import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import axios from "axios";
import api from "../src/api/axios.js";

beforeEach(() => {
  const values = new Map([
    ["token", "expired-token"],
    ["user", "{\"id\":1}"],
  ]);
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
  };
  globalThis.window = { location: { href: "" } };

  api.defaults.adapter = async (config) => {
    const response = {
      data: { success: false },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config,
    };
    throw new axios.AxiosError(
      "Unauthorized",
      axios.AxiosError.ERR_BAD_REQUEST,
      config,
      undefined,
      response,
    );
  };
});

test("failed login clears stale session without reloading the login page", async () => {
  await assert.rejects(api.post("/auth/login", {
    email: "person@example.com",
    password: "incorrect",
  }));

  assert.equal(globalThis.window.location.href, "");
  assert.equal(globalThis.localStorage.getItem("token"), null);
  assert.equal(globalThis.localStorage.getItem("user"), null);
});

test("unauthorized protected requests still redirect to login", async () => {
  await assert.rejects(api.get("/budgets"));

  assert.equal(globalThis.window.location.href, "/login");
});
