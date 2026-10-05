RAMU — AI AGENT REFACTOR INSTRUCTION
====================================
Version: 3.0
Purpose: Refactor the existing RAMU project without rebuilding it blindly.

IMPORTANT
---------
This document is the primary instruction for the AI coding agent.
The goal is NOT to add more features. The goal is to make RAMU much clearer,
more focused, more objective, and more strongly aligned with Collaborative Economy.

Read the existing repository first. Do not start changing code before auditing
what already exists.

============================================================
1. FINAL PRODUCT DIRECTION
============================================================

RAMU is NOT primarily:
- a freelance marketplace
- an AI opportunity generator
- a booking website
- a portfolio website
- a social network
- a legal contract platform

RAMU IS:

"A collaborative economy platform for creative MSMEs that connects
complementary resources, checks collaboration feasibility deterministically,
and helps actors form, execute, and measure collaborative business projects."

Core product idea:

RESOURCE → NEED → COMPATIBILITY → FEASIBILITY → COLLABORATION → OUTCOME

This flow must become the dominant product experience.

The fundamental unit of RAMU is NOT a freelancer.
The fundamental unit is a COLLABORATIVE PROJECT formed by combining
complementary resources.

============================================================
2. THE BIGGEST CHANGE REQUIRED
============================================================

The current RAMU documentation and implementation are too broad.
There are many strong features, but they compete with the central story.

Do NOT delete the whole project.
Do NOT rewrite the entire database.
Do NOT rebuild from zero.

Instead:
- preserve useful existing infrastructure
- refactor terminology
- simplify navigation
- move secondary features out of the spotlight
- strengthen Resource → Need → Compatibility → Collaboration → Outcome
- reuse existing services/components/models whenever practical

The final application should feel like ONE coherent product, not ten products
inside one dashboard.

============================================================
3. TARGET ECOSYSTEM
============================================================

For MVP, keep RAMU focused on the Fashion + Visual Creative ecosystem.

Official actor roles:
1. Fashion Brand / UMKM
2. Fashion Designer
3. Photographer
4. Model / Talent
5. MUA / Stylist
6. Studio

Do not expand the MVP into unrelated creative industries.
Do not add musicians, film crews, event organizers, game studios, etc.

Reason:
The six roles naturally form a closed collaborative ecosystem where resources
are complementary and easy to demonstrate.

Example:

Fashion Brand
HAS: products, budget, brand
NEEDS: studio, photographer, model, MUA

Studio
HAS: space, lighting

Photographer
HAS: camera, photography skill

Model
HAS: talent

MUA/Stylist
HAS: makeup, styling skill

Designer
HAS: design skill, wardrobe/collection

============================================================
4. PRODUCT TERMINOLOGY — MANDATORY
============================================================

Change user-facing terminology where appropriate.
Internal technical names may remain if changing them creates unnecessary risk.

Avoid:
- Creative Opportunity Engine
- AI Opportunity
- Opportunity Generator
- AI Recommendation
- Smart Opportunity
- Hire Freelancer
- Book Creator
- Legal Protection System
- Full Legal Protection

Prefer:
- Collaboration Match
- Resource Compatibility
- Compatibility Result
- Matching Engine
- Compatible Collaboration
- Collaborate
- Invite to Collaboration
- Collaboration Agreement
- Why This Match?
- Feasibility Check
- Outcome

The term "Opportunity" should no longer be the main user-facing concept.
Existing routes such as /opportunities may be retained temporarily if necessary,
but should be de-emphasized, redirected, or repurposed.

============================================================
5. CORE NAVIGATION
============================================================

Simplify primary navigation to:

MAIN
- Dashboard
- Collaborate
- Projects
- Resources
- Messages

SECONDARY
- Directory
- Showcase / Portfolio
- Settings

Do not make Booking the primary navigation.
Do not make Opportunities the primary navigation.
Do not make Engine Insights the primary navigation.

The application should make Collaborate the main action.

============================================================
6. CORE FEATURE #1 — RESOURCES
============================================================

Route concept: /resources

Users must clearly understand:
"What do I have that can contribute to another collaboration?"

Resource categories should be understandable and structured:
- Product
- Skill
- Equipment
- Space
- Talent
- Audience

Each resource can have:
- name
- category
- description
- availability
- capacity
- location
- status
- usage constraints
- optional commercial value

IMPORTANT DIFFERENTIATOR:
RESOURCE IDLE CAPACITY

Example:
Studio capacity: 8 days/month
Used: 5 days
Idle: 3 days

The system should make underused resources visible.

Do not make this merely an analytics gimmick.
It should support the collaborative economy story:

IDLE RESOURCE → COMPATIBLE NEED → COLLABORATION → ECONOMIC ACTIVITY

============================================================
7. CORE FEATURE #2 — NEEDS
============================================================

Users must explicitly define what they need.

Example:

Project Need:
Editorial Lookbook

Required:
- Photographer
- Studio
- Model
- MUA

Location:
Bandung

Date:
15 October 2026

Budget:
Rp 5.000.000

CRITICAL RULE:
The system must NEVER invent hidden needs.

Only structured user-provided needs may be used by the matching engine.

============================================================
8. CORE FEATURE #3 — DETERMINISTIC COMPATIBILITY
============================================================

This is the core technical differentiator.

Do NOT use an LLM or generative AI for matching.
Do NOT generate arbitrary business opportunities.
Do NOT say "AI thinks this is a good collaboration."

Use deterministic, explainable rules based on structured data.

Recommended MVP score:

RESOURCE FIT          40%
NEED COVERAGE         25%
FEASIBILITY           20%
READINESS             15%
TOTAL                100%

Every score must be traceable to data/rules.

RESOURCE FIT — 40%
Checks whether available resources correspond to explicit needs.

NEED COVERAGE — 25%
Checks how many explicit needs can be satisfied.

Example:
Photography ✓
Studio ✓
Model ✓
MUA ✗

Coverage = 3/4 = 75%

FEASIBILITY — 20%
Check objective constraints such as:
- location
- availability/date
- capacity
- budget compatibility

READINESS — 15%
Check whether the actor/resource has enough structured information to act:
- profile completeness
- resource details
- availability
- commercial/rate information when relevant

Do NOT use vague psychological or aesthetic assumptions as core scoring.

============================================================
9. "WHY THIS MATCH?" — MANDATORY UX
============================================================

Never show only:
"92% Match"

Always explain the reason.

Example:

92% Compatible

WHY THIS MATCH?
✓ Studio satisfies the studio requirement
✓ Photographer satisfies the photography requirement
✓ Model is available on the project date
✓ Same working area
✓ Budget is compatible
✓ 3 of 3 primary resource requirements covered

The user and judge must be able to understand the result without reading
technical documentation.

The explanation is more important than the number.

============================================================
10. AVOID SUBJECTIVE MATCHING
============================================================

Do not make the engine depend heavily on:
- "aesthetic similarity" unless represented by explicit structured tags
- guessed personality compatibility
- predicted profitability
- AI-generated business ideas
- subjective statements about who would "work well together"

If aesthetic tags already exist, they may be used as a transparent filter or
secondary signal, but they must never become an unexplained black box.

============================================================
11. CORE FEATURE #4 — COLLABORATION PLAN
============================================================

When compatible actors are selected, users should form a structured
collaboration plan.

The plan must answer:

WHO contributes WHAT?
WHO performs WHICH ROLE?
WHEN?
WHERE?
FOR HOW MUCH?
WHAT IS THE DELIVERABLE?
WHAT ARE THE USAGE RIGHTS?

Example:

Nala The Label
→ Product + Campaign Budget

Studio Imaji
→ Studio + Lighting

Photographer
→ Camera + Photography Skill

Model
→ Talent

MUA/Stylist
→ Makeup + Styling

This is the point where "matching" becomes "collaborative economy."

============================================================
12. CORE FEATURE #5 — PROJECT WORKSPACE
============================================================

Existing collaboration/project functionality should be reused.

A project workspace may contain:
- overview
- participants
- contributions
- roles
- milestones
- schedule
- budget
- agreement
- messages
- deliverables

Do not turn the project workspace into an oversized project-management SaaS.
Keep it focused on executing the collaboration.

============================================================
13. CORE FEATURE #6 — OUTCOME
============================================================

Outcome is important and should be strengthened.

A completed collaboration should record, where available:
- participants
- resources used
- production duration
- project value
- optional revenue generated
- deliverables
- business/sales result when applicable

Example:

COLLABORATION COMPLETED

Participants: 5
Resources Activated: 8
Production Days: 2
Project Value: Rp 8.500.000

Activated Resources:
✓ Studio — 2 days
✓ Camera — 2 days
✓ Model — 1 project
✓ MUA — 1 project
✓ Wardrobe — 8 looks

This proves that RAMU creates economic activity instead of only producing
recommendations.

============================================================
14. COLLABORATION TEMPLATES
============================================================

Reduce the existing 15 Opportunity Patterns.

Use approximately five simple collaboration templates:

1. Product Campaign
2. Editorial / Lookbook
3. Content Production
4. Cross-Brand Collaboration
5. Shared Creative Resource

Call them "Collaboration Templates", not "Opportunity Patterns".

They are structures for collaboration, NOT generated business ideas.

============================================================
15. SECONDARY FEATURES
============================================================

Keep useful existing features, but make their role clear.

DIRECTORY
Secondary discovery mechanism.
Show:
- role
- resources
- capabilities
- availability
- location
- collaboration interests

Do NOT make it behave like a cheap freelancer marketplace.
Avoid making price ranking the central experience.

PORTFOLIO / SHOWCASE
Supporting proof that an actor actually possesses a capability/resource.

BOOKING
Keep it, but position it after collaboration intent.
Correct flow:

Match → Collaboration → Agreement → Scheduling/Booking

Not:

Directory → Book Freelancer

MESSAGING
Keep it for project coordination and negotiation.
It supports the project; it is not the product itself.

NOTIFICATIONS
Keep as infrastructure.

USAGE RIGHTS
Keep because they are relevant to commercial collaboration.

COLLABORATION AGREEMENT
Keep as a structured agreement/draft feature.

============================================================
16. LEGAL LANGUAGE — IMPORTANT
============================================================

Do NOT make unverified legal claims.

Avoid:
- "Full Legal Protection"
- "Automatically legally binding"
- "Guaranteed enforceability"
- "Automatically valid in court"

Use:
"Collaboration Agreement"
"Structured draft agreement"

Use an appropriate disclaimer that the generated document may require review
and adjustment by the relevant parties/professionals.

Digital signature UI may be retained, but do not claim it automatically has
the same legal status as a certified electronic signature.

============================================================
17. USAGE RIGHTS AND ANTI-AI
============================================================

Usage Rights may remain:
- Organic Social
- Paid Digital Ads
- Commercial / OOH
- Exclusive / Buyout where applicable

AI-training permission may remain as an OPTIONAL usage-right parameter.

Do NOT make Anti-AI Protection a core identity of RAMU.

RAMU is a collaborative economy platform first.

============================================================
18. DASHBOARD REDESIGN
============================================================

The dashboard should answer five questions immediately:

1. What do I have?
2. What do I need?
3. Who can complement me?
4. What collaborations are active?
5. What economic activity has been created?

Suggested structure:

RAMU

Good afternoon, Nala.

YOUR RESOURCES
12 resources
5 available
3 idle

ACTIVE NEEDS
2 open needs

COLLABORATION MATCHES

92% Compatible
Editorial Lookbook
3/3 needs covered
Bandung
Within budget
[VIEW WHY THIS MATCH]
[START COLLABORATION]

ACTIVE COLLABORATIONS
Summer Collection Campaign
4 participants
67% complete

RESOURCE IMPACT
8 resources activated
2 collaborations completed
Rp 12.500.000 project value

Do not overload the dashboard with unrelated metrics.

============================================================
19. COLLABORATION CARD
============================================================

Primary card format:

EDITORIAL LOOKBOOK

92% Compatible

YOUR NEED
Photography
Studio
Model

AVAILABLE RESOURCES
✓ Studio Imaji
✓ Arka Photography
✓ Maya Model

WHY?
3/3 primary needs covered
Same location
Available on selected date
Budget compatible

[VIEW WHY THIS MATCH]
[START COLLABORATION]

Primary CTA:
START COLLABORATION

Not:
BOOK
HIRE
BUY

============================================================
20. LANDING PAGE
============================================================

Landing page must explain the concept within about 30 seconds.

Recommended hero:

TURN WHAT YOU HAVE INTO WHAT YOU CAN CREATE TOGETHER.

Subtitle:
RAMU connects complementary resources owned by creative MSMEs and turns them
into feasible collaborative projects.

How It Works:
1. Add Resources
2. Define Needs
3. Find Compatible Partners
4. Build Together
5. Measure the Outcome

Three strongest value pillars:

RESOURCE
Know what each actor can contribute.

COMPATIBILITY
Understand why resources fit.

COLLABORATION
Turn the match into real economic activity.

Outcome section:
- Resources Activated
- Collaborations Completed
- Project Value

============================================================
21. GOLDEN DEMO SCENARIO
============================================================

Keep the existing demo actors if useful.

Main scenario:
Nala The Label needs to execute a fashion campaign.

NALA HAS:
- fashion collection
- campaign budget
- brand identity/audience

NALA NEEDS:
- studio
- photographer
- model
- MUA/stylist

AVAILABLE RESOURCES:
Studio Imaji
→ studio + lighting

Lensa Kreatif
→ camera + photography

Go Young Jung / model account
→ editorial talent

Glow & Form
→ MUA + styling

Atelier Nara
→ design capability if needed

RAMU then:
1. reads explicit needs
2. finds compatible resources
3. checks feasibility
4. explains why the match exists
5. forms collaboration
6. creates project
7. records outcome

The demo should visibly show this complete chain.

============================================================
22. TECHNICAL REFACTOR RULES
============================================================

Preserve existing stack unless there is a strong reason not to:
- Next.js App Router
- React
- TypeScript strict
- Tailwind CSS
- Prisma
- PostgreSQL/Supabase
- Supabase Auth
- Server Actions

Do not introduce unnecessary dependencies.

Do not replace the database architecture without necessity.

Do not blindly rename every internal model.
For example, an internal Opportunity model can remain if migration cost is high,
while its UI can be presented as Collaboration Match.

============================================================
23. REPOSITORY AUDIT — FIRST STEP
============================================================

BEFORE CODING:

1. Inspect the repository structure.
2. Inspect package.json.
3. Inspect Prisma schema.
4. Inspect existing engine logic.
5. Inspect existing routes.
6. Inspect existing components.
7. Inspect seed/demo data.
8. Identify what already works.
9. Map current features to this document.
10. Identify duplicate/overlapping functionality.

Then produce a short internal implementation plan.

Do not destroy working functionality before understanding it.

============================================================
24. REQUIRED REFACTOR ORDER
============================================================

PHASE 1 — PRODUCT STRUCTURE
- simplify navigation
- update terminology
- establish Resources / Needs / Collaborate / Projects / Outcome flow
- update landing page messaging

PHASE 2 — RESOURCES
- verify resource model
- improve resource creation/editing
- support availability/status
- make idle/available resource state visible

PHASE 3 — MATCHING
- refactor deterministic engine
- reduce scoring to four dimensions
- make rules explicit
- implement Why This Match
- remove AI/opportunity language from user-facing UI

PHASE 4 — COLLABORATION
- collaboration creation
- participants
- contributions
- roles
- project plan

PHASE 5 — EXECUTION
- milestones
- agreement
- scheduling/booking
- messaging
- deliverables

PHASE 6 — OUTCOME
- completed project
- resources activated
- project value
- collaboration metrics

PHASE 7 — POLISH
- responsive UI
- loading states
- empty states
- error states
- demo data
- competition demo flow

============================================================
25. WHAT THE AGENT MUST NOT DO
============================================================

NEVER:
- add ChatGPT/Gemini to the matching engine
- generate arbitrary business ideas
- create opaque compatibility scores
- make AI the reason a collaboration exists
- turn RAMU into Fiverr/Upwork clone behavior
- make booking the core product
- expand to unrelated creative sectors
- add dozens of new features
- rewrite the whole Prisma schema unnecessarily
- delete working features without mapping them first
- claim legal validity without verification
- build payment gateway before the core loop works
- build advanced analytics before Outcome works
- overdesign the dashboard
- create unnecessary technical complexity

============================================================
26. FEATURE PRIORITY
============================================================

P0 — MUST WORK
- Authentication
- Profile
- Resources
- Needs
- Deterministic Compatibility
- Why This Match
- Collaboration Plan
- Project Workspace
- Basic Collaboration Agreement
- Outcome

P1 — SUPPORTING
- Directory
- Portfolio
- Booking
- Messaging
- Notifications
- Usage Rights

P2 — FUTURE
- Direct Payment Gateway
- Payment Gateway
- e-Meterai integration
- PWA
- Advanced watermarking
- Advanced analytics

Do not spend significant MVP time on P2.

============================================================
27. ACCEPTANCE CRITERIA
============================================================

The refactor is successful when a new user can understand the product quickly.

Within approximately 30 seconds, the user should understand:

1. RAMU is for creative MSMEs.
2. Users register resources they have.
3. Users define resources/needs required for a project.
4. RAMU checks compatibility deterministically.
5. RAMU explains why the match exists.
6. Compatible actors can form a collaboration.
7. The collaboration can become a real project.
8. The completed project records economic/resource outcomes.

A judge should be able to answer:

WHAT is shared?
WHO collaborates?
WHY are they compatible?
HOW is compatibility calculated?
WHAT happens after matching?
WHAT economic activity results?

If these questions are difficult to answer from the UI, the refactor is not finished.

============================================================
28. DEFINITION OF DONE
============================================================

For every major refactor phase:

- application still builds
- TypeScript errors are resolved
- existing critical functionality remains usable
- no unnecessary dependency added
- user-facing terminology follows this document
- core flow remains coherent
- empty/loading/error states are handled
- demo data still works

After implementation, the agent should report:

1. What changed
2. Which files changed
3. Which existing features were reused
4. Which features were de-emphasized
5. Any schema migration performed
6. Any known limitation
7. How to test the new core flow

============================================================
29. FINAL PRODUCT STORY
============================================================

The entire product should communicate this story:

A creative MSME has valuable resources.
Those resources are often fragmented or underused.
Another actor has a need that those resources can satisfy.
RAMU checks whether the resources actually fit.
RAMU explains the compatibility.
The actors agree on who contributes what.
They execute a collaborative project.
The project creates measurable economic activity.

The core narrative is:

WHAT YOU HAVE
      +
WHAT OTHERS NEED
      ↓
RESOURCE COMPATIBILITY
      ↓
FEASIBLE COLLABORATION
      ↓
SHARED ECONOMIC ACTIVITY

============================================================
30. FINAL INSTRUCTION TO THE AI AGENT
============================================================

Do not optimize RAMU for feature count.
Optimize RAMU for clarity of the Collaborative Economy mechanism.

When forced to choose between:

A. adding another feature
OR
B. making Resource → Need → Compatibility → Collaboration → Outcome clearer

ALWAYS choose B.

Do not rebuild blindly.
Do not invent features.
Do not add AI.
Do not turn RAMU into a generic marketplace.

Use the existing RAMU codebase as the foundation and refactor it toward the
product direction defined in this document.

FINAL PRODUCT DEFINITION:

"RAMU is a deterministic collaborative economy platform for creative MSMEs
that identifies complementary resources, checks whether collaboration is
feasible, structures the collaboration, supports execution, and records the
economic activity created from those resources."

FINAL PRODUCT PRINCIPLE:

"You don't need to own everything.
You can combine what you have with what others have to create economic value together."

END OF INSTRUCTION
