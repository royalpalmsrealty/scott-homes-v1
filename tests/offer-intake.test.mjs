import assert from "node:assert/strict";
import test from "node:test";
import { acceptOfferSuggestion, applyAgentIntakePatch, applyIntakePatch, canBeginOffer, emptyIntake, getIntakeFields, getOfferNextQuestion, getOfferSessionDetails, getOfferDraftContext, getOfferGuidance, IntakeSchema, IntakeSubmissionSchema, representationChoices, StoredIntakeSchema, parseIntakePatch, validateIntakeField } from "../src/lib/offerIntake.ts";

const valid = {
  propertyReference: "123 Example Street, Unit 4, Key West, FL",
  buyerName: "Example Buyer", buyerEmail: "buyer@example.com", buyerPhone: "3055550100",
  offerPrice: "1250000.50", financing: "Cash", deposit: "10%, timing to discuss",
  inspection: "15 days", closingDate: "Within 60 days", conditions: "Discuss furnishings",
  titleInsurance: "Seller pays title insurance", closingCompany: "Discuss with Scott", financingContingency: "",
  representation: representationChoices.transactionBroker,
};
const submission = { draft: valid, confirmed: true, requestId: "6b3768a4-b583-4ca0-8406-72df85b00dc3" };

test("requires an explicit buyer confirmation and a valid retry identifier", () => {
  assert.equal(IntakeSubmissionSchema.safeParse(submission).success, true);
  assert.equal(IntakeSubmissionSchema.safeParse({ ...submission, confirmed: false }).success, false);
  assert.equal(IntakeSubmissionSchema.safeParse({ ...submission, requestId: "another-buyer" }).success, false);
});
test("asks about another agent before address, price and escrow, with no defaults selected", () => {
  const draft = { ...emptyIntake };
  assert.deepEqual(getIntakeFields(draft).slice(0, 4).map(field => field.key), ["representation", "propertyReference", "offerPrice", "deposit"]);
  for (const field of getIntakeFields(draft)) getOfferGuidance(field.key, draft);
  assert.ok(Object.values(draft).every(value => value === ""));
  assert.deepEqual(acceptOfferSuggestion("deposit", draft), { deposit: "20%" });
  assert.equal(draft.deposit, "");
});
test("another-agent status must be resolved before the interview or submission", () => {
  for (const representation of ["", representationChoices.otherAgent, representationChoices.unsure, "Self-represented"]) {
    assert.equal(canBeginOffer(representation), false);
    assert.equal(IntakeSchema.safeParse({ ...valid, representation }).success, false);
    const draft = { ...emptyIntake, representation };
    assert.deepEqual(applyAgentIntakePatch(draft, { offerPrice: "1000000" }), draft);
  }
  assert.equal(canBeginOffer(representationChoices.transactionBroker), true);
});
test("AI cannot relabel no-other-agent as self-representation, and a newly reported agent pauses intake", () => {
  const draft = applyAgentIntakePatch(valid, { representation: "Self-represented", offerPrice: "1100000" });
  assert.equal(draft.representation, representationChoices.transactionBroker);
  assert.equal(draft.offerPrice, "1100000");
  const paused = applyAgentIntakePatch(valid, { representation: representationChoices.otherAgent, offerPrice: "1100000" });
  assert.equal(paused.representation, representationChoices.otherAgent);
  assert.equal(paused.offerPrice, valid.offerPrice);
  assert.equal(StoredIntakeSchema.safeParse({ ...valid, representation: "No current agent" }).success, true);
});
test("cash and financed requests keep their distinct timing and contingency requirements", () => {
  assert.equal(getIntakeFields(valid).some(field => field.key === "financingContingency"), false);
  assert.match(getOfferGuidance("closingDate", valid).answer, /20 days.*no title issues/);
  const financed = { ...valid, financing: "Financing" };
  assert.equal(getIntakeFields(financed).some(field => field.key === "financingContingency"), true);
  assert.equal(IntakeSchema.safeParse(financed).success, false);
  assert.ok(validateIntakeField("financingContingency", financed));
  assert.equal(IntakeSchema.safeParse({ ...financed, financingContingency: "30 days" }).success, true);
  assert.equal(IntakeSchema.safeParse({ ...valid, financingContingency: "30 days" }).success, false);
  assert.equal(getOfferGuidance("financingContingency", financed).answer, "30 days");
  assert.match(getOfferGuidance("closingDate", financed).answer, /15 additional days after/);
  assert.equal(getOfferGuidance("closingDate", { financing: "Discuss with Scott" }), undefined);
});
test("changing payment method clears stale timing but preserves explicitly supplied replacements", () => {
  const financed = applyIntakePatch(valid, { financing: "Financing" });
  assert.equal(financed.closingDate, "");
  assert.equal(financed.financingContingency, "");
  assert.equal(financed.deposit, valid.deposit);
  const custom = applyIntakePatch(valid, { financing: "Financing", financingContingency: "35 days", closingDate: "20 days after financing" });
  assert.equal(custom.financingContingency, "35 days");
  assert.equal(custom.closingDate, "20 days after financing");
  assert.equal(applyIntakePatch(custom, { financing: "Cash" }).financingContingency, "");
});
test("the permit suggestion preserves other requests and does not duplicate itself", () => {
  const patch = acceptOfferSuggestion("conditions", valid);
  assert.match(patch.conditions, /^Discuss furnishings\n/);
  assert.match(patch.conditions, /all open permits, including tree permits, prior to closing at the seller’s expense/);
  assert.deepEqual(acceptOfferSuggestion("conditions", { ...valid, ...patch }), patch);
  assert.doesNotMatch(acceptOfferSuggestion("conditions", { ...valid, conditions: "None" }).conditions, /None/);
});
test("new terms remain explicit and old saved requests can still be reviewed", () => {
  const { titleInsurance, closingCompany, financingContingency, ...legacy } = valid;
  assert.equal(StoredIntakeSchema.safeParse(legacy).success, true);
  assert.equal(IntakeSchema.safeParse(legacy).success, false);
  assert.deepEqual(parseIntakePatch({ titleInsurance, closingCompany, financingContingency: "30 days" }), { titleInsurance, closingCompany, financingContingency: "30 days" });
  assert.match(acceptOfferSuggestion("closingCompany", valid).closingCompany, /Greg Oropeza.*title-insurance payer’s choice/);
});
test("rejects impossible or ambiguous purchase amounts", () => {
  for (const offerPrice of ["0", "-1", "1e6", "1250000.501", "NaN", "500000001", "1,250,000"]) {
    assert.equal(IntakeSchema.safeParse({ ...valid, offerPrice }).success, false, offerPrice);
  }
});
test("does not accept caller claims of verified property or completed delivery", () => {
  assert.equal(IntakeSubmissionSchema.safeParse({ ...submission, propertyVerified: true }).success, false);
  assert.equal(IntakeSchema.safeParse({ ...valid, status: "approved" }).success, false);
});
test("voice tools can update known draft fields but cannot submit or approve", () => {
  assert.deepEqual(parseIntakePatch({ deposit: "  Discuss with Scott  " }), { deposit: "Discuss with Scott" });
  for (const patch of [{ confirmed: "true" }, { status: "submitted" }, { buyerEmail: 12 }, [], null, { conditions: "x".repeat(4001) }]) {
    assert.equal(parseIntakePatch(patch), null);
  }
});
test("blank tool values cannot silently erase buyer answers", () => {
  assert.deepEqual(parseIntakePatch({ buyerName: "  ", deposit: "5%" }), { deposit: "5%" });
});
test("requires contact details and bounded, explicit terms for broker review", () => {
  for (const patch of [{ buyerEmail: "invalid" }, { buyerPhone: "1" }, { conditions: "" }, { financing: "assumed cash" }, { propertyReference: "x".repeat(501) }]) {
    assert.equal(IntakeSchema.safeParse({ ...valid, ...patch }).success, false);
  }
});


test("resumed conversations start at the next unanswered question without an agency recap", () => {
  const partial = { ...emptyIntake, representation: representationChoices.transactionBroker, propertyReference: valid.propertyReference, offerPrice: valid.offerPrice };
  const session = getOfferSessionDetails(partial);
  assert.match(session.firstMessage, /20%.*10%.*deposit/s);
  assert.doesNotMatch(session.firstMessage, /another.*agent|property.*address|transaction broker/i);
  assert.match(session.context, /123 Example Street/);
  assert.doesNotMatch(getOfferSessionDetails(valid).firstMessage, /escrow|address|agent/i);
});


test("address corrections replace the prior address and preserve the buyer's other terms", () => {
  const corrected = applyAgentIntakePatch(valid, { propertyReference: "456 Corrected Example Lane, Unit 8, Key West, FL" });
  assert.equal(corrected.propertyReference, "456 Corrected Example Lane, Unit 8, Key West, FL");
  for (const key of Object.keys(valid).filter(key => key !== "propertyReference")) assert.equal(corrected[key], valid[key]);
  const context = getOfferDraftContext(corrected);
  assert.match(context, /456 Corrected Example Lane, Unit 8/);
  assert.ok(!context.includes(valid.propertyReference), 'Old address is not resent in the current draft');
  const cleared = applyIntakePatch(corrected, { financing: "Financing" });
  const data = JSON.parse(getOfferDraftContext(cleared).split("\n").at(-1));
  assert.equal(data.closingDate, "", 'Cleared timing supersedes the earlier answer too');
});


test("the spoken opening records an explicit answer and rejects premature offer terms", () => {
  const draft = { ...emptyIntake };
  assert.match(getOfferSessionDetails(draft).firstMessage, /working with another real estate agent/);
  assert.deepEqual(applyAgentIntakePatch(draft, { propertyReference: valid.propertyReference }), draft);
  for (const answer of [representationChoices.otherAgent, representationChoices.unsure]) {
    const paused = applyAgentIntakePatch(draft, { representation: answer, propertyReference: valid.propertyReference });
    assert.equal(paused.representation, answer);
    assert.equal(paused.propertyReference, "");
    assert.match(getOfferSessionDetails(paused).firstMessage, /pause/);
  }
  const accepted = applyAgentIntakePatch(draft, { representation: representationChoices.transactionBroker });
  assert.equal(accepted.representation, representationChoices.transactionBroker);
  assert.match(getOfferSessionDetails(accepted).firstMessage, /address/);
  const correction = applyAgentIntakePatch({ ...draft, representation: representationChoices.otherAgent }, { representation: representationChoices.transactionBroker });
  assert.equal(canBeginOffer(correction.representation), true);
});

test("saving the opening address with No advances the tool context to price, then escrow", () => {
  const draft = applyAgentIntakePatch({ ...emptyIntake }, { representation: representationChoices.transactionBroker, propertyReference: valid.propertyReference });
  assert.match(getOfferNextQuestion(draft), /purchase price/);
  assert.match(getOfferDraftContext(draft), /Current next question[^\n]*purchase price/);
  const priced = applyAgentIntakePatch(draft, { offerPrice: valid.offerPrice });
  assert.match(getOfferNextQuestion(priced), /20%.*10%.*escrow deposit/s);
  assert.equal(priced.propertyReference, valid.propertyReference);
});
