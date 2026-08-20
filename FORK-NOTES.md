# Fork notes - AMF / Protect Indiana

This is a fork of [`stephenlthorn/auto-identity-remove`](https://github.com/stephenlthorn/auto-identity-remove)
(MIT), used as the engine behind Protect Indiana's **Sweep** - filing people-search
opt-outs for a customer who has authorized removal of their own information.

## What this fork changes

**Captcha solving uses 2Captcha instead of CapSolver.** 2Captcha's JSON API
(`api.2captcha.com/createTask` + `/getTaskResult`) is Anti-Captcha/CapSolver
compatible, so the change is small and centralized in `lib/captcha.js`:

- `SOLVER_BASE` - the provider base URL, default `https://api.2captcha.com`,
  overridable with the `CAPTCHA_API_BASE` env var (point it back at
  `https://api.capsolver.com` to switch providers, no code change).
- `TASK_TYPE` - maps CapSolver task-type names to 2Captcha's (`ReCaptchaV2TaskProxyless`
  → `RecaptchaV2TaskProxyless`, `AntiTurnstileTaskProxyLess` → `TurnstileTaskProxyless`,
  etc.). Unknown types pass through unchanged.
- `createTask()` - one helper all five solvers call; applies the mapping and posts
  to `${SOLVER_BASE}/createTask`.
- Poll loop treats a non-zero `errorId` (2Captcha's failure shape) as failure, in
  addition to the original `status:'failed'`.
- Each solver reads the solved token defensively (`gRecaptchaResponse || token`, and
  `token || gRecaptchaResponse` for hCaptcha/Turnstile) because 2Captcha and CapSolver
  put the token in different fields per captcha type.
- AWS WAF has no 2Captcha equivalent; it degrades to `captcha_failed` (rare on
  people-search brokers).

**The solver key is read from the environment.** `lib/config.js` gained
`applyEnvOverrides()`, applied to every `loadConfig()` return: if
`TWOCAPTCHA_API_KEY` (or legacy `CAPSOLVER_API_KEY`) is set, it overrides
`config.capsolver.apiKey`. This keeps the key out of `config.json`. On the AMF
fleet the key lives in `/root/.config/secrets/2captcha.env` (mode 600).

**Upstream bug fixed:** `test/no-em-dashes.test.js` defined its `EM_DASH`/`EN_DASH`
constants as literal characters, so the test tripped its own rule and failed on a
clean checkout. Now built via `String.fromCharCode`. (Candidate to send upstream.)

## Running it

```sh
set -a; . /root/.config/secrets/2captcha.env; set +a   # loads TWOCAPTCHA_API_KEY
node bin/aidr.js doctor        # health check (config, solver reachability, state)
node bin/aidr.js --help        # subcommands: run, score, verify, report, freeze, ...
```

A real Sweep run operates on **one consenting customer's own data** (name, address,
email in `config.json`'s `person`). Never run it against fabricated identities or
without the customer's authorization.

## Tests

`node --test test/*.test.js dashboard/validate.test.js dashboard/config-status.test.js`
- full suite green. Fork-specific coverage in `test/twocaptcha-provider.test.js`.
