# Investor DNA Onboarding

## Goal

Design a 3-5 minute conversational onboarding flow that helps Portfolio Copilot build an Investor DNA profile.

The profile should be strong enough to personalize future investment decisions without pretending to know the future.

The onboarding should feel like a calm financial conversation, not a questionnaire.

## Core Promise

After onboarding, Portfolio Copilot should understand:

- What the investor is trying to achieve
- How much risk they can actually tolerate
- How they behave under market stress
- What kind of decisions they need help with
- What tone and level of explanation will help them act wisely

## Conversation Style

The tone should be:

- Calm
- Practical
- Non-judgmental
- Plain-language
- Decision-focused

Avoid:

- Financial jargon without explanation
- Asking for exact net worth too early
- Making users feel tested
- Suggesting there is one correct investing personality
- Turning onboarding into a compliance form

## Conversation Script

### Opening

**Copilot:**  
Before I help with investment decisions, I need to understand how you think about money, risk, and time.

This takes about 3-5 minutes. I will not try to predict markets or tell you what to buy. I will use your answers to personalize future decisions.

**Question 1:**  
What are you mainly investing for?

**Options:**

- Building long-term wealth
- Buying something important in the next few years
- Generating income
- Preserving what I already have
- Learning and experimenting
- Not sure yet

**Extracts:**

- Primary goal
- Planning horizon clue
- Risk framing
- Whether the user is still forming intent

### Goal Clarity

**Question 2:**  
When would you ideally want this money to become useful?

**Options:**

- Less than 1 year
- 1-3 years
- 3-7 years
- 7-15 years
- 15+ years
- I do not know

**Extracts:**

- Time horizon
- Liquidity need
- Ability to tolerate volatility
- Whether short-term losses matter heavily

### Financial Context

**Question 3:**  
How important is this invested money to your day-to-day life?

**Options:**

- I may need it soon
- It matters, but I have some cushion
- I do not need it for regular expenses
- This is extra money I can leave invested

**Extracts:**

- Financial dependency
- Liquidity risk
- Emergency buffer assumption
- Suitability for aggressive recommendations

### Income Stability

**Question 4:**  
How stable is your income right now?

**Options:**

- Very stable
- Mostly stable
- Variable but manageable
- Unstable or uncertain
- I prefer not to say

**Extracts:**

- Income stability
- Risk capacity
- Need for cash buffer
- Sensitivity to drawdowns

### Risk Feeling

**Question 5:**  
Imagine your investment drops 20% in a month. What would you most likely feel?

**Options:**

- I would panic and want out
- I would be worried and need guidance
- I would wait, but check often
- I would probably see it as normal volatility
- I might look for an opportunity to add

**Extracts:**

- Emotional risk tolerance
- Drawdown behavior
- Need for calming explanation
- Risk of panic selling

### Past Behavior

**Question 6:**  
Have you ever sold an investment mainly because the price fell?

**Options:**

- Yes, and I regretted it
- Yes, and it was the right decision
- No, but I have been tempted
- No, I usually stay patient
- I have not invested enough to know

**Extracts:**

- Behavioral pattern
- Panic response history
- Experience level
- Need for behavioral guardrails

### Decision Style

**Question 7:**  
When making financial decisions, what helps you most?

**Options:**

- A simple recommendation
- A short explanation
- Numbers and tradeoffs
- A detailed breakdown
- A second opinion before I act

**Extracts:**

- Explanation depth
- Preferred decision format
- Need for education
- Whether UI should be concise or analytical

### Investing Experience

**Question 8:**  
How would you describe your investing experience?

**Options:**

- Beginner
- I know the basics
- Comfortable with stocks and ETFs
- Experienced and analytical
- Very active or speculative

**Extracts:**

- Knowledge level
- Jargon tolerance
- Need for education
- Risk of overconfidence

### Strategy Preference

**Question 9:**  
Which style sounds most like you?

**Options:**

- Slow and steady growth
- High growth, even with big swings
- Reliable income
- Buying strong companies at fair prices
- Preserving capital
- Opportunistic and aggressive
- I am not sure

**Extracts:**

- Investment style
- Growth/value/income/conservative/aggressive leaning
- Risk appetite
- Portfolio personality

### Concentration Comfort

**Question 10:**  
How comfortable are you with one investment becoming a large part of your portfolio?

**Options:**

- Not comfortable
- Slightly comfortable if I understand the risk
- Comfortable for strong conviction ideas
- Very comfortable
- I am not sure

**Extracts:**

- Concentration tolerance
- Diversification preference
- Position sizing guidance
- Need for concentration warnings

### Decision Frequency

**Question 11:**  
How often do you want to make investment decisions?

**Options:**

- Rarely
- Monthly
- Weekly
- Whenever something important changes
- I like to watch closely

**Extracts:**

- Desired intervention frequency
- Notification cadence
- Risk of overtrading
- Morning/evening brief intensity

### Closing Confirmation

**Copilot:**  
Thanks. I will use this to personalize how I explain decisions, how cautious I should be, and when I should tell you to pause, review, or act.

**Question 12:**  
Which statement should I optimize for?

**Options:**

- Help me avoid bad decisions
- Help me find better opportunities
- Help me stay calm and consistent
- Help me understand what is happening
- Help me balance risk and reward

**Extracts:**

- Primary product job
- Behavioral priority
- Tone of recommendations
- Decision Engine weighting preference

## Decision Tree

### Step 1: Determine Time Horizon

If horizon is less than 3 years:

- Increase liquidity sensitivity
- Lower tolerance for volatility
- Prefer caution for high-risk assets

If horizon is 7+ years:

- Allow more volatility
- Focus on long-term decision quality
- Reduce urgency from daily price moves

If unknown:

- Mark goal clarity as low
- Ask follow-up later
- Avoid strong recommendations

### Step 2: Determine Risk Capacity

Risk capacity is based on:

- Financial dependency on invested money
- Income stability
- Time horizon

Low capacity:

- Money needed soon
- Unstable income
- Short time horizon

High capacity:

- Long horizon
- Stable income
- Money not needed for expenses

### Step 3: Determine Risk Tolerance

Risk tolerance is based on:

- Reaction to 20% drop
- History of panic selling
- Comfort with concentration

Low tolerance:

- Panic response
- Regretted selling
- Low concentration comfort

High tolerance:

- Accepts volatility
- Can wait through drawdowns
- Understands concentration risk

### Step 4: Detect Behavior Risk

Behavior risk increases when:

- User checks frequently
- User has sold from fear
- User wants frequent decisions
- User is aggressive but inexperienced
- User has low risk tolerance but high-risk positions

Behavior risk reduces when:

- User has long horizon
- User prefers consistency
- User has patient history
- User wants review before action

### Step 5: Classify Investor Archetype

Possible primary archetypes:

- Beginner
- Growth
- Value
- Income
- Aggressive
- Conservative

The system can store secondary traits:

- Anxious
- Analytical
- Opportunistic
- Patient
- Overconfident
- Learning

### Step 6: Personalize Decision Output

If beginner:

- Explain terms
- Use fewer metrics
- Give simple next step

If analytical:

- Show factor scores
- Show tradeoffs
- Include assumptions

If anxious:

- Lead with whether action is needed
- Explain why not reacting may be reasonable
- Reduce noisy alerts

If aggressive:

- Add risk guardrails
- Highlight concentration
- Warn about overconfidence

If income-focused:

- Emphasize cash flow, stability, and yield risk
- Reduce focus on daily price movement

## Information Extracted By Question

| Question | Extracted Information |
|---|---|
| Main investing goal | Goal, intent, strategy anchor |
| When money is needed | Time horizon, liquidity need |
| Importance to daily life | Financial dependency, risk capacity |
| Income stability | Financial resilience, cash-flow risk |
| Reaction to 20% drop | Emotional risk tolerance |
| Sold because price fell | Past behavior, panic risk |
| Decision help preference | Explanation depth, UI style |
| Investing experience | Knowledge level, education need |
| Preferred style | Investor archetype |
| Concentration comfort | Diversification preference |
| Decision frequency | Intervention cadence, overtrading risk |
| Optimization statement | Product job, behavioral priority |

## Investor DNA Model

```ts
interface InvestorDna {
  userId: string;
  displayName: string;
  profileVersion: number;
  createdAt: string;
  updatedAt: string;

  goals: {
    primaryGoal:
      | "long_term_wealth"
      | "near_term_purchase"
      | "income"
      | "capital_preservation"
      | "learning"
      | "unknown";
    optimizationPriority:
      | "avoid_bad_decisions"
      | "find_opportunities"
      | "stay_calm"
      | "understand_market"
      | "balance_risk_reward";
    timeHorizon:
      | "under_1_year"
      | "1_to_3_years"
      | "3_to_7_years"
      | "7_to_15_years"
      | "15_plus_years"
      | "unknown";
  };

  financialSituation: {
    moneyDependency:
      | "may_need_soon"
      | "matters_with_cushion"
      | "not_needed_for_expenses"
      | "extra_long_term_capital";
    incomeStability:
      | "very_stable"
      | "mostly_stable"
      | "variable_manageable"
      | "unstable"
      | "unknown";
    riskCapacity: "low" | "medium" | "high";
  };

  risk: {
    emotionalTolerance: "low" | "medium" | "high";
    concentrationComfort: "low" | "medium" | "high" | "unknown";
    drawdownResponse:
      | "panic"
      | "needs_guidance"
      | "waits_but_checks"
      | "accepts_volatility"
      | "adds_on_weakness";
    behaviorRisk: "low" | "medium" | "high";
  };

  behavior: {
    hasPanicSold: boolean | null;
    decisionFrequency:
      | "rarely"
      | "monthly"
      | "weekly"
      | "important_changes"
      | "closely";
    likelyBiases: Array<
      | "loss_aversion"
      | "overconfidence"
      | "recency_bias"
      | "confirmation_bias"
      | "overtrading"
      | "analysis_paralysis"
    >;
  };

  knowledge: {
    experienceLevel:
      | "beginner"
      | "basic"
      | "comfortable"
      | "experienced"
      | "active_speculative";
    explanationPreference:
      | "simple_recommendation"
      | "short_explanation"
      | "numbers_and_tradeoffs"
      | "detailed_breakdown"
      | "second_opinion";
    jargonTolerance: "low" | "medium" | "high";
  };

  style: {
    primaryArchetype:
      | "beginner"
      | "growth"
      | "value"
      | "income"
      | "aggressive"
      | "conservative";
    secondaryTraits: Array<
      | "anxious"
      | "analytical"
      | "patient"
      | "opportunistic"
      | "overconfident"
      | "learning"
    >;
  };

  personalization: {
    briefTone: "calm" | "direct" | "educational" | "analytical";
    defaultDecisionMode: "protect" | "balanced" | "opportunity";
    alertSensitivity: "low" | "medium" | "high";
    explanationDepth: "low" | "medium" | "high";
  };

  confidence: {
    overall: number;
    missingInputs: string[];
  };
}
```

## How The Profile Evolves Over Time

Investor DNA should not be static. It should evolve from observed behavior and explicit user feedback.

### Explicit Updates

The user can change:

- Goal
- Time horizon
- Risk comfort
- Income stability
- Decision frequency
- Explanation preference

### Behavioral Updates

The system can observe:

- Does the user check during volatility?
- Does the user ignore recommendations?
- Does the user repeatedly ask whether to sell?
- Does the user react more strongly to losses than gains?
- Does the user follow through on review recommendations?

### Feedback Loops

After important recommendations:

**Copilot:**  
Was this recommendation helpful?

Options:

- Yes, it helped me stay calm
- Yes, it helped me act
- It was too cautious
- It was too aggressive
- I needed more explanation

### Profile Drift Rules

Increase behavior risk if:

- User repeatedly seeks action during normal volatility
- User overrides calm recommendations impulsively
- User checks frequently after losses

Decrease behavior risk if:

- User stays consistent through volatility
- User follows review process before acting
- User prefers fewer alerts over time

Increase explanation depth if:

- User expands details often
- User asks why repeatedly
- User chooses numbers and tradeoffs

Decrease explanation depth if:

- User dismisses detailed sections
- User chooses simple recommendation
- User responds better to short briefs

### Confidence Score

Profile confidence should start moderate after onboarding.

It increases when:

- User answers more questions
- Behavior matches stated preferences
- User gives feedback

It decreases when:

- Behavior contradicts stated profile
- Financial situation changes
- Goals become unclear
- User adds new asset types or strategy

## Investor Personality Examples

### Beginner Investor

Profile:

- Goal: long-term wealth
- Experience: beginner
- Risk tolerance: medium-low
- Behavior risk: medium
- Explanation preference: short explanation
- Archetype: beginner
- Traits: learning, anxious

Copilot behavior:

- Avoid jargon
- Explain why a recommendation exists
- Lead with "Should I do anything?"
- Use simple language
- Provide one educational insight per brief

Example output:

**Should I do anything?**  
No action.

**Why:**  
The daily move is normal, and your long-term plan does not require a reaction.

### Growth Investor

Profile:

- Goal: long-term wealth
- Horizon: 7-15 years
- Risk tolerance: high
- Risk capacity: medium-high
- Archetype: growth
- Traits: patient, opportunistic

Copilot behavior:

- Tolerate volatility
- Emphasize trend, earnings, and position sizing
- Warn only when risk becomes concentrated
- Avoid overreacting to daily price moves

Example output:

**Should I do anything?**  
Review.

**Why:**  
Momentum is positive, but the position is large enough to revisit target allocation.

### Value Investor

Profile:

- Goal: long-term wealth
- Style: buying strong companies at fair prices
- Risk tolerance: medium
- Explanation preference: numbers and tradeoffs
- Archetype: value
- Traits: analytical, patient

Copilot behavior:

- Emphasize valuation, margin of safety, and thesis changes
- Separate price movement from business quality
- Ask whether the reason for owning changed

Example output:

**Should I do anything?**  
No action.

**Why:**  
Price moved, but there is no clear evidence that the investment thesis changed.

### Income Investor

Profile:

- Goal: income
- Horizon: medium-long
- Risk tolerance: low-medium
- Archetype: income
- Traits: conservative, consistency-focused

Copilot behavior:

- Focus on income stability
- Highlight dividend risk
- Reduce emphasis on daily price movement
- Warn about yield traps

Example output:

**Should I do anything?**  
Review.

**Why:**  
The price move is less important than whether the income stream remains reliable.

### Aggressive Investor

Profile:

- Goal: high growth
- Risk tolerance: high
- Risk capacity: medium
- Concentration comfort: high
- Archetype: aggressive
- Traits: opportunistic, overconfident

Copilot behavior:

- Keep upside visible
- Add guardrails
- Highlight concentration and downside
- Warn against doubling down without a thesis

Example output:

**Should I do anything?**  
Caution.

**Why:**  
The opportunity may be real, but position size and volatility make the next decision risky.

### Conservative Investor

Profile:

- Goal: capital preservation
- Risk tolerance: low
- Risk capacity: low-medium
- Archetype: conservative
- Traits: anxious, protective

Copilot behavior:

- Lead with risk
- Keep recommendations calm
- Prefer review over action
- Warn early when volatility conflicts with goals

Example output:

**Should I do anything?**  
Review.

**Why:**  
This position may be more volatile than your comfort level and time horizon support.

## Design Rules

1. The onboarding must feel conversational.
2. The user should never feel judged for being cautious or aggressive.
3. Every answer should improve future decisions.
4. The system should distinguish risk tolerance from risk capacity.
5. The system should learn behavior, not only preferences.
6. AI may explain the profile, but deterministic logic should define it.
7. The profile must remain editable.
8. The user should understand why their profile affects recommendations.

## Final Product Test

At the end of onboarding, the system should be able to answer:

- What kind of investor is this person?
- What mistakes are they most likely to make?
- What kind of explanation helps them make better decisions?
- How much volatility can they handle emotionally?
- How much volatility can they handle financially?
- When should Portfolio Copilot interrupt them?
- When should Portfolio Copilot tell them to do nothing?

If the onboarding cannot answer these, it is not complete.
