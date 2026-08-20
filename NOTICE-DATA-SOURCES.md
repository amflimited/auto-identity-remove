# Data sources & attribution

Protect Indiana's data-broker removal engine and exposure checks build on open data and
open-source tooling. Attribution is provided here as required by the respective licenses.

## Broker registry (`data/permissive-brokers.json`)
Derived — merged, de-duplicated, reformatted — from:
- **PersProtect / data-broker-opt-out-list** — © PersProtect, licensed **CC BY 4.0**.
  https://github.com/Persprotect/data-broker-opt-out-list
- **digisamroc/eraser** broker dataset — licensed **MIT**.
  https://github.com/digisamroc/eraser

Both licenses permit commercial use with attribution. This file is our derivative; errors
are ours, not the upstream maintainers'.

## Removal engine
- **stephenlthorn/auto-identity-remove** — MIT. Our sweep-engine is a fork.

## Exposure checks
- **XposedOrNot** breach index — MIT API. https://github.com/XposedOrNot/XposedOrNot-API
- **Hudson Rock** Cavalier community infostealer API.
- **Have I Been Pwned** — breach catalogue (CC BY 4.0) and Pwned Passwords k-anonymity API.
- **WebBreacher/WhatsMyName** username dataset — **CC BY-SA 4.0** (any redistributed
  derivative of the site list stays CC BY-SA).

## Cited, never embedded (non-commercial licenses — links only, data not bundled)
- **Big-Ass Data Broker Opt-Out List** (Yael Grauer) — CC BY-NC-SA.
- **Optery** public data-broker directory — non-commercial.
- **The Markup** data-broker dataset — non-commercial; retained only as a de-dup fallback
  pending license review, superseded by the permissive registry above.
