import { Router as P } from "express";
function I() {
  const n = process.env.PI_API_URL_BASE || "https://api.minepi.com", o = process.env.PI_API_VERSION || "v2", r = process.env.PI_API_CONTROLLER || "payments", e = process.env.PI_API_KEY || "";
  if (!e)
    throw new Error("Missing PiServer configuration (API URL, version, controller, or key). Please set PI_API_KEY environment variable.");
  return { apiUrlBase: n, apiVersion: o, apiController: r, apiKey: e };
}
async function d(n, o, r = {}, e = {}) {
  const { apiUrlBase: t, apiVersion: a, apiController: s, apiKey: i } = I(), l = `${t.replace(/\/$/, "")}/${a}/${s}/${o}/${n}`, p = {
    "Content-Type": "application/json",
    Authorization: `Key ${i}`,
    ...e.header || {}
  };
  let c;
  try {
    c = await fetch(l, {
      method: "POST",
      body: JSON.stringify(r),
      headers: p
    });
  } catch (u) {
    throw e.logFail?.(`Pi server POST ${n} failed: Network error`, u), new Error(`Network error for PiServer: ${u}`);
  }
  let m;
  const y = await c.text();
  try {
    m = JSON.parse(y);
  } catch {
    throw e.logFail?.(`Pi server POST ${n} failed: Invalid JSON (${c.status})`, y, c.status), new Error(`Invalid JSON from PiServer: ${y}`);
  }
  if (c.ok)
    return e.logOk?.(`Pi server POST ${n} succeeded (${c.status})`, m), m;
  throw e.logFail?.(`Pi server POST ${n} failed with status ${c.status}`, m, c.status), new Error(`PiServer call failed: HTTP ${c.status}: ${y}`);
}
async function g(n, o) {
  try {
    const { accessToken: r, paymentId: e } = n.body;
    if (console.log("[PiSDK][approve] Incoming request payload:", n.body), !r || !e) {
      console.warn("[PiSDK][approve] Missing params: accessToken or paymentId. Payload was:", n.body), o.status(400).json({
        error: "Missing required params: accessToken, paymentId"
      });
      return;
    }
    const t = await d(
      "approve",
      e,
      { paymentId: e, accessToken: r },
      {
        logOk: (a, s) => console.log(`Pi payment approved for paymentId=${e}`, a, s),
        logFail: (a, s) => console.error(`Pi approve error for paymentId=${e}`, a, s)
      }
    );
    console.log("[PiSDK][approve] Sent to Pi server. Received:", t), o.json({
      result: "approved",
      paymentId: e,
      piServer: t
    });
  } catch (r) {
    console.error("[PiSDK][approve] Error in handler:", r), o.status(400).json({ error: "Invalid payload or server error" });
  }
}
async function v(n, o) {
  try {
    const { paymentId: r, transactionId: e } = n.body;
    if (console.log("[PiSDK][complete] Incoming request payload:", n.body), !r || !e) {
      console.warn("[PiSDK][complete] Missing params: paymentId or transactionId. Payload was:", n.body), o.status(400).json({
        error: "Missing required params: paymentId, transactionId"
      });
      return;
    }
    const a = await d(
      "complete",
      r,
      { paymentId: r, txid: e },
      {
        logOk: (s, i) => console.log(`Pi payment completed for paymentId=${r}`, s, i),
        logFail: (s, i) => console.error(`Pi complete error for paymentId=${r}`, s, i)
      }
    );
    o.json({
      result: "completed",
      paymentId: r,
      piServer: a
    });
  } catch (r) {
    console.error("[PiSDK][complete] Error in handler:", r), o.status(400).json({ error: "Invalid payload or server error" });
  }
}
async function f(n, o) {
  try {
    const { paymentId: r } = n.body;
    if (console.log("[PiSDK][cancel] Incoming request payload:", n.body), !r) {
      console.warn("[PiSDK][cancel] Missing params: paymentId. Payload was:", n.body), o.status(400).json({
        error: "Missing required params: paymentId"
      });
      return;
    }
    const e = await d(
      "cancel",
      r,
      { paymentId: r },
      {
        logOk: (t, a) => console.log(`Pi payment cancelled for paymentId=${r}`, t, a),
        logFail: (t, a) => console.error(`Pi cancel error for paymentId=${r}`, t, a)
      }
    );
    o.json({
      result: "cancelled",
      paymentId: r,
      piServer: e
    });
  } catch (r) {
    console.error("[PiSDK][cancel] Error in handler:", r), o.status(400).json({ error: "Invalid payload or server error" });
  }
}
async function S(n, o) {
  try {
    const { paymentId: r, error: e } = n.body;
    if (console.log("[PiSDK][error] Incoming request payload:", n.body), !r || !e) {
      console.warn("[PiSDK][error] Missing params: paymentId or error. Payload was:", n.body), o.status(400).json({
        error: "Missing required params: paymentId, error"
      });
      return;
    }
    console.log(`[PiSDK][error] Error reported for payment ${r}: ${JSON.stringify(e)}`), o.json({
      result: "error-logged",
      paymentId: r,
      recorded: !0
    });
  } catch (r) {
    console.error("[PiSDK][error] Error in handler:", r), o.status(400).json({ error: "Invalid payload or server error" });
  }
}
async function w(n, o, r) {
  try {
    const { paymentId: e, transactionId: t } = n.body;
    if (console.log("[PiSDK][incomplete] Incoming request payload:", n.body), !e || !t) {
      console.warn("[PiSDK][incomplete] Missing params: paymentId or transactionId. Payload was:", n.body), o.status(400).json({
        error: "Missing required params: paymentId, transactionId"
      });
      return;
    }
    const a = r ? await Promise.resolve(r(e, t)) : "complete";
    if (a !== "complete" && a !== "cancel") {
      console.error(`[PiSDK][incomplete] Invalid decision: ${a}. Must be 'complete' or 'cancel'`), o.status(400).json({
        error: "incompleteCallback must return 'complete' or 'cancel'"
      });
      return;
    }
    let s;
    a === "complete" ? s = await d(
      "complete",
      e,
      { paymentId: e, txid: t },
      {
        logOk: (l, p) => console.log(`Pi payment completed for incomplete paymentId=${e}`, l, p),
        logFail: (l, p) => console.error(`Pi completion from incomplete failed for paymentId=${e}`, l, p)
      }
    ) : s = await d(
      "cancel",
      e,
      { paymentId: e },
      {
        logOk: (i, l) => console.log(`Pi payment cancelled for incomplete paymentId=${e}`, i, l),
        logFail: (i, l) => console.error(`Pi cancel from incomplete failed for paymentId=${e}`, i, l)
      }
    ), o.json({
      result: a,
      paymentId: e,
      piServer: s
    });
  } catch (e) {
    console.error("[PiSDK][incomplete] Error in handler:", e), o.status(400).json({ error: "Invalid payload or server error" });
  }
}
function h(n = {}) {
  const o = P(), { incompleteCallback: r, middleware: e = [] } = n;
  return e.forEach((t) => o.use(t)), o.use((t, a, s) => {
    if (!t.body && t.headers["content-type"]?.includes("application/json"))
      return a.status(400).json({ error: "Invalid JSON body. Ensure express.json() middleware is applied." });
    s();
  }), o.post("/approve", g), o.post("/complete", v), o.post("/cancel", f), o.post("/error", S), o.post("/incomplete", (t, a) => {
    w(t, a, r);
  }), o;
}
export {
  g as approveHandler,
  f as cancelHandler,
  v as completeHandler,
  h as createPiPaymentRouter,
  S as errorHandler,
  I as getPiServerConfig,
  w as incompleteHandler,
  d as postToPiServer
};
