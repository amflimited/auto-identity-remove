# Protect Indiana broker validation - 2026-08-20

This record contains no raw owner identity. The adult owner authorized use of the existing private owner record for
one production-path validation. The two temporary identity configuration files were securely deleted after the run;
the non-sensitive state and audit outcomes remain.

## Test environment

- Runtime: S1 using the production Protect Indiana worker and the approved boundary file.
- Outbound mail: S1 Postfix `gmailapi:` transport to the Protect Indiana Google Workspace Gmail API sender on S2.
- Company sender and Reply-To: `contact@protectindiana.org`.
- Boundary status: approved 2026-08-20 by Adam Michael Ferree, owner.
- Safety rule: challenges, CAPTCHA, Turnstile, inbox confirmation, ambiguous responses, and unsupported DOM states
  fail closed to manual/owner review. Nothing attempts a bypass.

## Spokeo (email)

- Lane: recorded email privacy request.
- Owner validation: the privacy request email was submitted successfully after the explicit localhost TLS setting was
  corrected for the S1 mail handoff.
- Mail evidence: Postfix/Gmail API accepted the company message.
- Outcome vocabulary: `submitted`, not `removed` or `verified removed`.
- Customer boundary: approved only for the recorded email lane. A later verification signal is required before the
  result may be called verified removed.

## Pipl

- Lane: recorded email privacy request.
- Owner validation: the privacy request email was submitted successfully.
- Mail evidence: Postfix/Gmail API accepted the company message.
- Outcome vocabulary: `submitted`, not `removed` or `verified removed`.
- Customer boundary: approved only for the recorded email lane. A later verification signal is required before the
  result may be called verified removed.

## FastPeopleSearch

- Official start URL: `https://www.fastpeoplesearch.com/optout`.
- Observed path: separate subject/authorized-agent choices and identity fields, certification, Cloudflare Turnstile,
  an emailed continuation, a second form, and a final receipt.
- Owner validation: Turnstile did not issue a token to the automated session, so automation stopped without bypassing
  it. The production run recorded an owner-review/manual outcome.
- Customer boundary: approved supervised exception only. No automated success claim is allowed. The owner or customer
  must complete any permitted challenge/inbox step, and ambiguous state remains owner review.

## CheckPeople

- Official start URL: `https://checkpeople.com/opt-out`.
- Observed path: requestor email, terms/privacy acknowledgement, transactional-email consent, and an emailed
  continuation.
- Owner validation: the browser did not expose evidence sufficient to call the later request submitted. The production
  run recorded an owner-review/manual outcome.
- Customer boundary: approved supervised exception only. An email-start action or delivered verification message is
  never a deletion claim; the later fields, authorization, receipt, and verification evidence must be reviewed.

## Approval consequence

The exact launch set is Spokeo (email), Pipl, FastPeopleSearch supervised exception, and CheckPeople supervised
exception. All other catalog entries remain outside the customer-removal boundary. The free search-result check is
read-only and does not submit to brokers.

The owner validation finished with two privacy-email submissions, two supervised/manual outcomes, and no errors.
The engine and customer-facing reports distinguish submitted, confirmation needed, manual/owner review, blocked,
no listing returned, and verified removed.
