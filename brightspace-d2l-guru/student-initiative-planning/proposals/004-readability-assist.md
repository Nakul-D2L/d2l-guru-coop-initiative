# Readability assist

- **Owner** Unassigned
- **Status** writing up
- **Raised** Fall 2026
- **Owning team** TBD, likely whoever owns the HTML content editor and the Ally integration

## Problem

Instructors write course content in whatever register comes naturally to them, and Brightspace never flags when that content is dense, jargon heavy, or reading well above the level of the course. Students who are second language speakers, have a reading disability, or are new to the subject get no signal that a page is hard to read and no way to see it simplified.

## Evidence

- WCAG 2.1 has a dedicated success criterion for reading level (3.1.5), which exists because plain language is a recognised accessibility need, not a nice to have
- Universal Design for Learning, the framework D2L's own accessibility material references, explicitly calls for multiple means of representation, including varying language complexity, not just alternative file formats
- Students commonly paste dense instructions into outside tools, readability checkers, Hemingway style editors, or a chat tool, to get a simpler version, the same re-entry pattern seen with grades
- International and first generation students are a growing share of enrolment at most institutions and are the group most likely to already be quietly working around this

**To gather before team review.** Whether Ally or any other existing tool already scores readability rather than just technical markup, examples of especially dense content types such as long syllabi or policy heavy pages, and a couple of instructors willing to have their content scored as a pilot.

## Who it affects

Any student reading instructor authored HTML content, which is most students in most courses. Highest value for English language learners, students with dyslexia or other reading disabilities, and anyone dropped into an unfamiliar subject's vocabulary for the first time.

## What exists today

Ally checks technical accessibility markup: alt text, heading structure, colour contrast, tagged PDFs, and offers alternate file formats like audio and e-braille. It does not, as far as we can tell, score or flag reading level or sentence complexity, which is a different problem from technical markup. This needs confirming directly with the team that owns Ally before writing more, since if it already does this, there is no proposal left.

## Proposed change

Two sides of the same tool.

1. **Author side.** While editing HTML content, an instructor sees a plain readability indicator, a grade level and a short list of what is driving it such as long sentences, passive voice, or jargon, similar in spirit to a spell checker rather than a gate that blocks publishing.
2. **Student side.** A per page toggle that shows a simplified rendering, shorter sentences, plainer synonyms for jargon, generated from the instructor's own text rather than a rewrite the instructor never sees. Off by default, opt in per student, original always one click away.

Nothing is auto published without the instructor seeing it first, and nothing changes the source content, a student can always get back to the original.

## Scope

- **In** readability scoring for HTML content items, author side indicator, student side simplified toggle for text content
- **Out** PDFs and other file types, audio or alternate file format generation, which is Ally's job, discussion posts and other user generated content, any content rewrite that happens without the instructor seeing the original score first

## Technical approach

- **No execution, no new authoring workflow.** Scoring is client side text analysis over content already in the editor, the same low risk shape as the grade calculator's pure calculation module.
- Established readability formulas, Flesch-Kincaid or similar, computed client side, no new backend service for the scoring itself
- The simplified rendering is the harder half. Worth scoping v1 to the score and indicator only, with simplified text as a fast follow once it is clear what generates it responsibly
- Existing design system components for the indicator so it inherits accessibility and theming

## Acceptance criteria

1. An instructor editing an HTML content item sees a readability score without leaving the editor
2. The score updates as the text changes and does not require a save to refresh
3. A student can toggle a simplified view of a content item and toggle back to the original in one action
4. The original content is never modified by the simplified view
5. The indicator is never colour only, and is screen reader readable
6. No content is auto published or auto simplified without the instructor having seen the score first

## Risks

- **May already exist inside Ally.** The most likely outcome of the first conversation with that team. Check before writing more.
- **A generated simplification could get something wrong.** Meaning drift in a simplified version is worse than no simplification. Mitigated by opt in, original always available, and scoping v1 to scoring only until simplification is proven safe.
- **Instructors could read a low score as criticism of their teaching rather than their writing.** Framing matters, this should read like a spell checker, not a grade.
- **Narrow enthusiasm.** Reading level tools are easy to nod at and hard to get instructors to actually act on. Worth confirming with a few instructors before committing effort.

## Open questions

- Does Ally or any other existing tool already do this, confirm with the Ally owning team
- Who owns the HTML content editor, and who is the PM
- Is there an institution level policy question about whether simplified content needs its own accessibility review
- What is the accessibility review process for a new indicator like this

## Effort

One co-op on the readability scoring and author side indicator first, since that is the smaller and lower risk half. The student side simplified toggle depends on what generates the simplified text and does not fit this term unless v1 stays to scoring only.
