# Dark mode, research notes

**Not a proposal.** Dark mode is already in implementation at D2L. The group is not building it and should not pitch it as a new idea.

This doc keeps the outside view, in case any of it is useful to the team doing the work. Ask them first. Unsolicited research on someone's in flight project lands badly.

## Public evidence

- Universities publish help articles telling students to use a Chrome browser flag as a workaround, and explicitly call it a hack
- One institution reported years of requests, filed feature requests, and launched a parody called Darkspace to make the point
- At least six browser extensions across Chrome and Firefox exist solely to dark theme Brightspace
- Third party study apps use the absence of dark mode as a reason to use them instead

## The breakage that matters

Blanket inversion extensions are reported to break quiz timers, rich text editors, and file upload buttons. Students are choosing a workaround that breaks assessment workflows because the default is uncomfortable to use. That is a live support and integrity issue, not just a comfort one.

## The known hard part

Instructors author their own HTML with their own colours, images, and inline styles. Inverting it is unpredictable and can destroy meaning in things like colour coded diagrams. Third party LTI tools in iframes cannot be themed at all.

The approach that avoids this is not inverting content. Theme the application shell and render instructor content on a light surface inside it, the way mail clients handle untrusted HTML. Not uniformly dark, but it removes the risk that has blocked every workaround.

## Other things worth knowing

- Dark mode is not automatically an accessibility win. Contrast needs verifying in both themes and some users are worse off in dark.
- Partial coverage is worse than none if a student can wander onto an unthemed page
- Every new component from then on needs dark variants and dual theme tests. It is a permanent cost, not a one off project.

## Research still available if wanted

- Install counts and review text across the existing extensions, which is a free read on what students complain about
- A catalogue of the specific breakages users report, since those surfaces are the most likely to have the same problem in a real implementation
- Community forum feature request threads and vote counts
