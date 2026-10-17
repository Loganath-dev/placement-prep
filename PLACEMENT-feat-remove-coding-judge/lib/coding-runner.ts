export const CODING_TIMEOUT_MS = 5000;

export const CODING_WORKER_SOURCE = `
self.onmessage = function(e) {
  const { code, tests } = e.data;
  try {
    // Make the user code define 'solve' in the global scope of the worker
    const wrapper = new Function(code + "\\nif (typeof solve !== 'undefined') return solve; else return undefined;");
    const userFn = wrapper();

    if (typeof userFn !== 'function') {
      self.postMessage({ error: "Could not find a function named 'solve'. Make sure you defined it." });
      return;
    }

    const results = tests.map((test, index) => {
      try {
        const start = performance.now();
        // The input is a string, which we pass to the function. We parse it if it's JSON array.
        // Wait, the caller might already parse it. Let's assume input is an array of args if expected.
        let args = test.input;
        if (typeof args === 'string') {
           try { args = JSON.parse(args); } catch(e) { args = [args]; }
        }
        if (!Array.isArray(args)) args = [args];

        const result = userFn(...args);
        const duration = performance.now() - start;

        // Compare stringified versions for simplicity
        let expected = test.output !== undefined ? test.output : test.expected;
        if (typeof expected === 'string') {
          try { expected = JSON.parse(expected); } catch(e) {}
        }
        
        const passed = JSON.stringify(result) === JSON.stringify(expected);
        return { index, passed, actual: result, duration };
      } catch (err) {
        return { index, passed: false, error: err.message || String(err) };
      }
    });

    self.postMessage({ results });
  } catch (err) {
    self.postMessage({ error: err.message || String(err) });
  }
};
`;

export function normalizeCodingOutput(output: any): string {
  if (output === undefined) return "undefined";
  if (output === null) return "null";
  if (typeof output === "string") return '"' + output + '"';
  if (Array.isArray(output) || typeof output === "object") return JSON.stringify(output);
  return String(output);
}
