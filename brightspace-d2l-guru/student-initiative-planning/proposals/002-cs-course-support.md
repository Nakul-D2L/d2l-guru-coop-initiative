# Code aware assignments

Better support for courses that teach programming.

- **Owner** Nakul Patel
- **Status** writing up
- **Raised** Fall 2026
- **Owning team** TBD, Assignments plus integrations

## Problem

Brightspace treats a code submission like any other file. Students upload source files or a zip, and the instructor gets downloads with no syntax highlighting, no project structure, and no way to comment on line 42. Code feedback happens outside the LMS or not at all.

## Evidence

- Codio and zyBooks both integrate with Brightspace and handle account creation and grade passback, because instructors move programming courses onto them
- The seams leak. zyBooks and Brightspace do not exchange due dates, so instructors set them twice and sync by hand.
- On older LTI versions, students must click each link individually or scores do not pass back
- Grade item mapping has known sharp edges, including multiple assignments writing to one grade item

**To gather.** Ask CS instructors directly, search tickets for code submission and passback issues, and find out whether D2L has partnerships with these vendors. That last one changes the strategy.

## Who it affects

Students and instructors in courses with code submissions, concentrated in CS and related programs but not limited to them, since any course that assigns a script or config file has the same problem. Actual enrolment scale is one of the numbers to gather before team review.

## What exists today

Inside Brightspace, a code submission is a generic dropbox file: downloaded, opened in a local editor or diff tool, no highlighting, no project structure, no way to comment on a specific line. Outside it, Codio and zyBooks plug that exact gap through LTI, which is why instructors move courses onto them instead of using the LMS as is. As far as we can tell there is no first party viewer in Brightspace today, but confirm with the owning team before building rather than assume.

## Why not a built in IDE

Worth stating plainly, because it is the first thing anyone suggests.

- Running student code means an execution sandbox, resource limits, abuse protection, toolchain versioning, and per institution cost
- Security review far beyond what this group should attempt
- Competes directly with partners who already integrate

Flowchart tooling has the same shape of problem. Diagramming is generic, third party tools already embed, and building one means owning a canvas editor forever.

Both are parked in the backlog with reasons. **Brightspace does not need to run code. It needs to stop treating code like a generic attachment.**

## Proposed change

- Source files render with syntax highlighting instead of downloading
- Multi file submissions show a file tree, so a project reads as a project
- Instructors leave inline comments on specific lines
- Later, diff between attempts and notebook rendering

No execution, no new infrastructure. A viewer and annotation layer over submissions we already store.

## Scope

- **In** highlighting for common languages, file tree, instructor inline line comments, student view of them
- **Out** any code execution, auto grading, diff view, notebooks, similarity checking

Diff and notebooks are the fast follows.

## Technical approach

- **Rendering only.** Files are already stored, so nothing in the submission pipeline changes.
- Client side highlighting with an established library, language by file extension with a manual override
- **Inline comments extend the existing assignment feedback model** with a file path and line reference. Do not build a parallel comment system.
- Size threshold for inline rendering, with download fallback for large or binary files
- Existing design system components for accessibility and theming

## Acceptance criteria

1. A supported source file renders highlighted in browser, no download
2. A multi file submission shows a navigable tree
3. An instructor comment attaches to a line and the student sees it there
4. Unsupported and binary files fall back to current download behaviour, no regression
5. Large files do not degrade the page, with a defined threshold
6. Screen reader readable, keyboard navigable, highlighting never carries meaning by colour alone
7. No change to how submissions are stored or retrieved

## Risks

- **Narrow audience.** Counter is that it generalises to any text submission and CS enrolment is large. Get numbers.
- **Partner conflict.** Chosen deliberately to complement rather than compete, but confirm the partnership picture first.
- **Scope creep toward execution.** The first review question will be whether it runs the code. The answer is no, and that line needs defending.
- **May already be planned.** Check.

## Also worth raising, not proposing

The integration seams, especially due date sync between tool and platform. Higher value than this proposal and only an LMS can fix it, but it involves the LTI spec and partner behaviour. Take it to the integrations team as a question, not a build.

## Open questions

- Who owns Assignments and the submission viewer, and who is the PM
- Does D2L have a formal partnership or agreement with Codio, zyBooks, or similar vendors
- What file size and type limits currently apply to dropbox submissions
- Is there already an internal proposal or roadmap item for a code viewer

## Effort

Two co-ops, one term, if highlighting and file tree come first and inline comments follow. Comments are the larger half because they touch the feedback data model.
