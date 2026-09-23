# Study Mode
- **Owner** Bhavjot Jhutty
- **Status** writing up
- **Raised** 2026-09-21
- **Owning team** TBD, whoever owns the student Content and Assignments experience
## Problem
Students open course materials or assignments knowing what they need to do, but can struggle to get started and stay focused. Using a separate timer or study app adds another place to manage the task, disconnected from the material they are working on.
## Evidence
- [Pomofocus](https://pomofocus.io/) offers customizable study timers and task tracking, showing an existing external workflow
- The group raised this from the student perspective, but demand for a Brightspace version is not yet validated
**To gather before team review.** Ask students how they structure study sessions, test whether an integrated timer improves their workflow, and check community requests and the internal roadmap.
## Who it affects
Students reading content or working on assignments in Brightspace on the web, across subjects. Particularly relevant to students who already use timers or want help structuring their study time.
## What exists today
- Brightspace's [Work To Do widget](https://community.d2l.com/brightspace/kb/articles/5174-about-the-work-to-do-widget) shows upcoming and overdue work
- Quiz timers control assessment timing, which is separate from a personal study session
- [D2L Lumi](https://www.d2l.com/lumi/) already offers study support; this proposal does not add AI tutoring
- Students can use phone timers or external tools such as Pomofocus
## Proposed change
Add an optional **Start study session** button on Content and Assignment detail pages. A collapsible panel helps students structure their work without changing course organization or submission workflows.
**Example.** A student opens an assignment, sets the goal "Finish questions 1 to 3," and starts a 25-minute work period. They consult lecture notes while the timer continues, take a break, then return to the assignment through the session's link.
**Two initial techniques**
- **Pomodoro.** Alternate work periods and breaks. Start with 25 minutes of work, five-minute short breaks, and a longer break after four rounds. Students can customize durations and rounds.
- **Timeboxing.** Set a goal and one time limit, such as 45 minutes to draft an introduction. Finish, extend, or stop when the time ends.
**Controls**
- Optional session goal and link to the original course item
- Start, pause, resume, end, extend, and skip break
- Compact timer that stays available across supported pages in the same tab
- A prompt at each phase end, with the student choosing when to continue
**Later techniques.** Active recall could prompt students to write what they remember and compare it with the material. The Feynman technique could guide a simple explanation and revision. Spaced repetition could connect to a separate notes and cue-card feature.
**Student benefit.** Less setup and switching between tools, with a practical way to start work and maintain a study routine beside the actual coursework.
## Scope
- **In** web, Pomodoro and timeboxing, adjustable timing, session goal, source link, same-tab navigation and refresh recovery
- **Out** quiz attempts, native mobile apps, AI, instructor monitoring, cross-device sync, session history, rewards, notes and cue-card storage
Other study techniques are follow-ups, not part of v1.
## Technical approach
- Client-side timer and session state, with no writes to grades or submissions
- Read the course item title and link from the current page
- Use timestamps rather than counting timer ticks so background tabs do not cause drift
- Keep active state in tab-scoped storage, separated by user and organization and cleared on sign-out
- Existing design-system components, behind a feature flag
- Confirm a shared integration point with the owning team; cross-page persistence must not become a platform redesign
## Acceptance criteria
1. Both techniques launch from supported pages with editable timing and an optional goal
2. Pause, resume, extend, skip, and end behave correctly; invalid timing values are rejected
3. Navigation and refresh in the same tab preserve the active session when storage is available
4. Returning from a background tab shows the correct remaining time or completion prompt, without inventing completed rounds
5. Study Mode never changes assessment timing, submissions, grades, or official completion status
6. Controls are keyboard accessible, phase changes are screen-reader announced, and the panel does not obscure essential actions
7. Signing out clears the session; another user cannot see the previous user's goal
## Risks and objections
- **A timer may not belong in an LMS.** Free tools already work well. Validate whether course context adds enough value.
- **Integration could outweigh the feature.** Narrow the supported surface if persistence requires major changes.
- **Fixed intervals can interrupt concentration.** Keep timing adjustable and participation optional.
- **Scope creep.** Notes, flashcards, and review scheduling need separate scope decisions.
- **May already be planned.** Check first.
## Open questions
- Would students choose this over their current workflow?
- Who are the owning PM and engineering lead?
- Does this overlap existing plans, and can the panel persist across supported pages?
## Effort and owner
Bhavjot owns the proposal; build contributors are TBD.
One co-op for a small prototype over two to three weeks at the group's two-to-four-hour weekly allowance. Estimate production work with the owning team after confirming navigation and accessibility requirements. Reduce scope or hand off the proposal if it does not fit the term.
