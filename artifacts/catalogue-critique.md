# Fluent catalogue: baseline critique and implementation backlog

Method: independent dual-agent review (A: catalogue_design_assessment; B: catalogue_detector_assessment). Assessed the incumbent 30 foundation and 18 pattern previews before this expansion. A inspected all 48 default previews in a fresh background tab at 1280px, dark/purple. B independently ran the CLI detector and browser geometry checks. Mobile observations in this baseline are source-based; final implementation validation covers rendered mobile states.

## Design health: 29/40 — Good

| Heuristic | Score | Finding |
|---|---:|---|
| System status | 3 | Counts, draft and save feedback generally communicate state. |
| Match with real world | 3 | Familiar workspace language; some actions only return text. |
| Control and freedom | 3 | Cancel, Reset, Escape and Undo are widespread. |
| Consistency and standards | 3 | Fluent identity is coherent; broad layout selectors distort some rows. |
| Error prevention | 3 | Bounded values, validation and review steps are useful. |
| Recognition over recall | 3 | Labels and notes explain examples; finding a family is slower than necessary. |
| Efficiency | 3 | Search, shortcuts and bulk actions work; catalogue ordering hinders comparison. |
| Aesthetic/minimalist design | 2 | Excess stage space and malformed row alignment weaken otherwise restrained layouts. |
| Error recovery | 3 | Specific validation, retry and Undo examples; recovery coverage varies. |
| Contextual help | 3 | Guidance is present but occasionally duplicates body copy or misstates the action. |

Design specificity: the gallery reads as a Fluent enterprise system through Segoe typography, neutral surfaces, workspace/member/resource content, and retained drafts. Useful content and native interaction provide its character. Additional decoration would not improve it.

The detector returned zero findings (exit 0). No browser overlay was injected: the available evaluate API is read-only. No detector live server was started. Both assessment tabs were closed. The project ignore list was absent. A preliminary claim of 12px captions was withdrawn: the local theme overrides Base100/Base200 to14px/20px, and direct computed checks confirmed14px captions. The corrected score is29/40, not a post-polish rescore.

## Priorities

1. **P1 — Shared row layout:** prevent `.pattern-item > div` from flexing Badge/Avatar roots; stretch attachment/inbox column content and keep status labels intrinsic.
2. **P2 — Catalogue:** use independently named official families, alphabetical rendering and scoped search; preserve edits and expire overlays.
3. **P2 — Preview sizing:** remove the blanket340px pattern minimum; bound long feed examples while keeping all content available.
4. **P2 — Action meaning:** give local actions observable outcomes or label simulation scope clearly. Add visible labels and align captions with actual affordances.

## Complete per-preview matrix

| Preview | Baseline finding / action |
|---|---|
| Command search | Pass; retain distinct resources/actions and scoped shortcut. |
| Folder explorer | Pass; keep destination context clear in the stacked layout. |
| Filter builder | P1: status Badge roots stretch into large pills; keep intrinsic width. |
| Member picker & sharing | Pass; clarify viewer/editor capabilities near access controls. |
| Attachment manager | P1 manifestation: stretch column rows and align file, failure and actions. |
| Notification inbox | P1 manifestation: stretch identity, time, status and dismissal rows. |
| Creation wizard | P2: remove excessive empty launch-stage height; preserve retained drafts. |
| Record editing drawer | Pass; avoid duplicate guidance and retain validation/drafts. |
| Application navigation | P2: state workspace-context behavior accurately or vary fixture content. |
| Resource browser | Pass; make selection/inspection wording explicit. |
| Activity feed | P2: contain the long feed without hiding actor/time context. |
| Bulk selection list | Pass; keep sample-state scope and recovery clear. |
| Inline editing panel | Pass; remove stage-height inflation below read mode. |
| Confirmation & recovery | Pass; retain safe default, named removal, and latest-removal Undo. |
| Priority task list | P2: distinguish primary inspection from the contextual Ask action. |
| Recent record list | Pass; mark the selected record and keep summary feedback clear. |
| Queue summary | P2: align wrapped labels/count baselines; reduce excess stage space. |
| Contextual assistant panel | Pass; validate nested scroll/composer at mobile sizes. |
| Button & icon button | Pass; broaden native variants and preserve created fixture outcomes. |
| Input & search | P2: add a visible label and split independent input/search families. |
| Textarea | P2: add a visible description label and associated limit guidance. |
| Field & validation | P2: use an actionable email example in errors. |
| Dropdown | Pass; retain labelled selection and readable options. |
| Checkbox | Pass; explain fixed security state and pluralize the count. |
| Radio group | Pass; use official family name and consistent sample terminology. |
| Switch | Pass; the text already communicates state, making the dot unnecessary. |
| Card | P2: say Open button, expose expansion semantics, broaden card anatomy. |
| Badge | P2: distinguish appearance comparison from the mutable record status. |
| Avatar & persona | P2: split families and provide visible presence text. |
| Tabs | P2: keep panel badges intrinsic and give repeated instances unique IDs. |
| Dialog | Pass; use a concrete creation title. |
| Menu | P2: update sample data when renaming/duplicating/archiving. |
| Tooltip | Pass; preserve focusable help and keep essential content outside tooltip. |
| Table / DataGrid | P2: existing Table is not a DataGrid; separate native families and label scrolling. |
| Feedback & toast | P2: split inline/notification families and connect feedback to an action. |
| Empty state | Pass; remove the duplicate inner reset. |
| Accordion | Pass; make multiple-expansion switch wording precise. |
| Breadcrumb | Pass; retain path/content update and readable wrapping. |
| Combobox | Pass; distinguish Clear search from Clear selection. |
| TagPicker | Pass; retain useful input width when tags wrap. |
| Tag / TagGroup | P2: make tag recovery symmetric; broaden interactive variants. |
| Tree | Pass; keep selection independent from expansion. |
| Toolbar | Pass; retain visibly applied formatting and disabled action help. |
| Popover | Pass; remove repeated body guidance below the useful fixture. |
| Drawer | P2: make draft dismissal behavior clear and consistent. |
| ProgressBar / Spinner | Pass; split families and distinguish manual restart from outer reset. |
| Skeleton | Pass; maintain matching content/placeholder structure. |
| Slider / SpinButton | P2: split families and explain clamping/rounding after committed numeric edits. |

Strengths: working enterprise compositions, synthetic fixtures, resets, specific guidance, retained edits, and native Fluent behavior. Cognitive burden comes from finding an example among many equally framed previews. First-time users need concrete action outcomes; experienced builders need truthful family naming; keyboard/mobile reviewers need contained overflow, visible focus and adequate targets.

Questions skipped: the user has approved the complete expansion and polish plan. No further scope decision is required.
