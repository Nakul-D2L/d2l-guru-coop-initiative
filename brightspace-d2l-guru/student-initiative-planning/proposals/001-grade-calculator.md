# Grade calculator sandbox

- **Owner** Nakul Patel
- **Status** writing up
- **Raised** Fall 2026
- **Owning team** TBD, whoever owns Grades

## Problem

Students want to know what their final grade will be, and what they need on what is left to hit a target. Brightspace holds every grade and weight already but answers neither, so students retype their marks into spreadsheets and third party sites.

## Evidence

- Chrome extensions exist purely to calculate current and potential grades in D2L courses
- Third party study apps market grade projection as a reason to use them alongside Brightspace
- The workaround is manual re-entry of data we already have

**To gather before team review.** Extension install counts and reviews, community forum threads, support tickets, and a short poll of students on a campus.

## Who it affects

Any student in a weighted grade book with ungraded items still outstanding, which is most students for most of a term. Value peaks around exams and withdrawal deadlines, when a student is deciding whether a low mark is survivable or exactly what they need to pass.

## What exists today

- The grades page shows a running current grade across items already scored. Whether it also projects a final total while weighted items remain ungraded, and what the "ungraded items" calculation setting does to that number, needs confirming with the owning team.
- Item weights appear to already be visible to students in the grade book, not just scores, but this should be confirmed rather than assumed.
- The weight and score data the calculator needs is very likely already loaded on the grades page. If it is not, the existing grades API should cover it without a new endpoint.
- No existing view lets a student edit a hypothetical score or reverse-solve for a target grade. That gap is real, not a rebuild of something that already exists.
- Mobile app parity is unknown and untested.

## How it works

**Locked vs editable.** This is the core of the design.

- Items the instructor has scored are **locked**. Cannot be edited.
- Items with a weight but no score yet are **editable**. Student types a hypothetical.
- Final grade recalculates live.
- Nothing saves, nothing is visible to the instructor, reset restores the real state.

A hypothetical can never be mistaken for a real mark, and the tool stays anchored to real data.

**Two directions**

1. Forward. Enter scores, see the resulting final grade.
2. Reverse. Enter a target, get what is needed on remaining items. With several outstanding it solves for an equal percentage, and students can pin individual items and re-solve the rest.

**Presentation**

- Sandbox values visually distinct from real ones, and not by colour alone
- Banner stating these are estimates and the instructor cannot see them
- Opt in, not the default view

## Scope

- **In** weighted grade books, student view, forward and reverse, client side, no persistence, web
- **Out** points based and formula grade books, saving scenarios, mobile, instructor visibility, any write to the grade book

Points based is the fast follow if v1 lands.

## Technical approach

- **No execution, no writes, no new storage.** Calculation is entirely client side. Keeps the security review small.
- Use the existing design system components so it inherits accessibility and theming
- Read from whatever the grades page already loads. If that is not enough, use the existing grades API rather than adding an endpoint.
- **Calculation lives in a pure module, unit tested separately from the UI.** The math is the risky part and must be testable on its own.
- Feature flagged so it can ship dark

**Calculation cases that must each have defined behaviour and a test**

- Weighted categories containing multiple items
- Dropped lowest score in a category
- Bonus and extra credit, which can push a category above its weight
- Exempt items, excluded rather than zeroed
- Items with a weight but no possible points set
- Grade books where weights do not sum to 100

Where a configuration is not fully supported, show nothing rather than guessing.

## Acceptance criteria

1. With no edits, the sandbox matches the real grades page exactly
2. A scored item cannot be edited by any route in the UI
3. An unscored weighted item is editable and the total updates on change
4. Reverse mode returns what is needed, or says clearly the target is unreachable
5. Reset restores the real state
6. Nothing persists across reload, nothing is retrievable by the instructor
7. Every calculation case above has a passing test against a worked example
8. Keyboard operable, screen reader distinguishes hypothetical from real
9. Sandbox values distinguishable without colour

## Risks

- **Wrong math is worse than no feature.** A student could make a withdrawal decision on it. Mitigated by the tested pure module and refusing to display unsupported configurations.
- **Institutions dislike the platform appearing to promise a grade.** Mitigated by estimate wording, opt in, and an org level setting to disable.
- **A student misreads a hypothetical as real.** The main design risk. Worth usability testing with students.
- **May already be planned.** Check first.

## Open questions

- Who owns the student grades page, and who is the PM
- Is an org level config variable needed to disable this per institution
- What is the accessibility review process here

## Effort

Nakul plus one co-op on the calculation module and tests.

Assuming the data is already client side, roughly two weeks on calculation and tests, two on UI, two on review and iteration. If server side work is needed it does not fit the term and v1 drops to forward mode only.
