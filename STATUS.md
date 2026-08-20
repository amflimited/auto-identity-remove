# Broker integration status

**Reviewed:** 2026-08-20

`brokers.js` contains 44 hand-written definitions for the upstream development engine. That is a
catalog, not Protect Indiana's supported customer coverage. None of those definitions has passed a
current end-to-end deletion test, and several current public workflows no longer match the stored
URL, selectors, or method.

Protect Indiana's paid runtime is separately bounded by
`data/protectindiana-boundaries.json`. It fails closed while that file is pending owner approval,
if the approved list is empty, or if a listed broker disappears from the catalog. The generic
PersProtect directory is development/reference data only and is never a customer submission lane.

## 2026-08-20 interface review and authorized owner test

The owner authorized a real test with the owner's existing identity and confirmation inbox. Test
evidence is redacted and does not make either workflow supported customer automation. “Loaded”
means only that the public interface was inspected from S1; it does not mean a request or deletion
was end-to-end verified.

| Broker/workflow | Observation from S1 | Protect Indiana disposition |
|---|---|---|
| FastPeopleSearch | Opt-out start supports subject and authorized-agent paths. The agent path exposes separate agent/subject fields, certification, Turnstile, an emailed link, a second identity form, and a final receipt. Turnstile did not issue a token to the automated test session, so nothing was submitted. | Old automation disabled. Owner-assisted/manual only unless the complete authorized-agent flow is implemented and verified. Never bypass Turnstile. |
| CheckPeople | Suppression start takes the requestor email, requires terms/transactional-email consent, and continues through email. Authorized browser submissions of the start step were attempted, but the sessions exposed neither a reliable POST nor final on-page receipt; one or more verification emails may have been generated. | Old direct-form automation disabled. Current outcome is `owner review`; if the email arrived, it becomes `confirmation needed`, never `removed`. Not eligible for approval until the rest of the workflow is reviewed. |
| SearchPeopleFree | Form loaded, but its checkbox asks the submitter to certify they are the person associated with the email. | Self-service customer instruction; Protect Indiana should not make that attestation. |
| Spokeo | Non-S1 fetch showed the opt-out form, but S1 search and opt-out requests returned 403. | Not proposed for automation from S1. |
| WhitePages | Current suppression UI expects a profile URL; S1 received a bot challenge. | Not proposed until listing discovery and the full workflow can be validated. |
| InfoTracer | Visible form is a record-search step. | Not a verified removal submission. |
| SocialCatfish | Third-party request UI exists but requires a profile URL and additional assertions. | Not proposed until listing resolution and exact attestations are implemented. |
| PrivateRecords | Visible form is a CAPTCHA-backed record-search step. | Not a verified removal submission. |
| BeenVerified, Radaris, MyLife, Nuwber | Direct lookup received bot challenges or an IP/country block from S1. | Not reliable for S1 direct discovery. |
| PeopleSmart | Stored opt-out URL redirects to a general help page. | Current integration unsupported. |
| Clearbit | Stored opt-out URL returns 404; Clearbit is now part of HubSpot. | Current integration unsupported. |
| Epsilon, Equifax marketing, ZoomInfo | Stored target returned 404 in this review. | Current integration unsupported. |
| Oracle Data Cloud | Stored target redirects to an Oracle contracts page. | Current integration unsupported. |
| Experian marketing, Data Axle | Stored pages loaded as informational/privacy pages, not the scripted direct form. | Current integration unsupported. |
| California DROP | The official consumer service is live for California residents. | Manual external resource; Indiana residents are not eligible. |

## Free and Guided exposure checks

Direct broker lookups from S1 were not reliable. Protect Indiana therefore uses a read-only public
search-engine query for possible results from broker domains, alongside the separately disclosed
breach and password-stealer sources. A broker-domain search result is a `possible match` until the
person confirms the profile. No returned result is never called proof that no listing exists, and
an unavailable source is never called clean.

## Exact outcome ceiling

- `submitted`: the site accepted or appeared to accept a request; deletion is not yet verified.
- `confirmation needed`: the customer must act on an email or other site step.
- `verified removed`: a later supported check found an explicit removal signal.
- `possible match`, `no listing found`, `blocked`, `owner review`, and `error` remain distinct.

The supported customer list can expand only after the public workflow, authorization/attestation,
submitted fields, success signal, confirmation behavior, and later verification method have each
been reviewed and recorded.

Redacted test evidence: `docs/protectindiana/broker-validation-2026-08-20.md`.
