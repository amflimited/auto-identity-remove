# Data sources & attribution

Protect Indiana's data-broker removal engine and exposure checks build on open data and
open-source tooling. Attribution is provided here as required by the respective licenses.

## Broker registry (`data/permissive-brokers.json`)
Derived - merged, de-duplicated, reformatted - from:
- **PersProtect / data-broker-opt-out-list** - © PersProtect, licensed **CC BY 4.0**.
  https://github.com/Persprotect/data-broker-opt-out-list

CC BY 4.0 permits commercial use with attribution. This file is our derivative; errors are
ours, not the upstream maintainer's. An earlier build merged records from
`digisamroc/eraser`, but that repository did not publish a license file. All Eraser-only
records and Eraser-derived fields were removed on 2026-08-20; its dataset is not distributed
or used at runtime.

## Removal engine
- **stephenlthorn/auto-identity-remove** - MIT. Our sweep-engine is a fork.

## Exposure checks
- **XposedOrNot** breach index - MIT API. https://github.com/XposedOrNot/XposedOrNot-API
- **Hudson Rock** Cavalier community infostealer API.
- **Have I Been Pwned** - optional breached-account API and breach catalogue (CC BY 4.0).
- **WebBreacher/WhatsMyName** username dataset - **CC BY-SA 4.0** (any redistributed
  derivative of the site list stays CC BY-SA).

## Cited, never embedded (non-commercial licenses - links only, data not bundled)
- **Big-Ass Data Broker Opt-Out List** (Yael Grauer) - CC BY-NC-SA.
- **Optery** public data-broker directory - non-commercial.
- **The Markup** data-broker dataset - not enabled in Protect Indiana's commercial runtime.
  A legacy copy inherited from the upstream removal engine is retained only for development
  provenance and must not be enabled without documented commercial-use permission.
