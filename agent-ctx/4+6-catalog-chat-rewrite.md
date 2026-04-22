# Task 4+6: Rewrite Catalog and Chat Section Components

## Agent: catalog-chat-rewrite

## Summary
Production-quality rewrite of two section components fixing RTL issues, message alignment, and code quality.

## Catalog Section (`catalog-section.tsx`)
### Key Fixes
1. **`start-2`/`end-2` → conditional `left-2`/`right-2`**: Tailwind v4 may not support `start-`/`end-` utilities. Replaced with `cn("absolute top-2", rtl ? "right-2" : "left-2")` for availability badge and `cn("absolute top-2", rtl ? "left-2" : "right-2")` for category badge.
2. **Category pills**: Removed `flex-row-reverse justify-end` hack. Now uses simple `flex flex-wrap gap-2` with `dir` attribute on parent.
3. **Card actions, Add button, price row, dialog footer**: Removed all `flex-row-reverse` — direction handled by `dir` attribute on root div.
4. **Makeup pill colors**: Changed from `orange-*` to `terracotta-*` to match project theme.
5. **Added `dir={rtl ? "rtl" : "ltr"}`** on root div for comprehensive RTL support.
6. **Numeric/URL inputs**: Added `dir="ltr"` for correct display of numbers and URLs.

## Chat Section (`chat-section.tsx`)
### Key Fixes
1. **Message alignment**: Replaced broken `getSenderAlignment()` (confusing `justify-start`/`justify-end` with RTL logic) with margin-auto approach:
   - User: `ms-auto` (aligns to END — right in LTR, left in RTL)
   - Bot: `me-auto` (aligns to START — left in LTR, right in RTL)
   - Agent: `mx-auto` (centered)
   - **NO `flex-row-reverse`** used for message alignment
2. **Sender labels**: Added `getLabelAlignment()` helper matching bubble alignment — labels sit above bubbles.
3. **Distinct bubble styles**: User=sage, Bot=primary, Agent=terracotta with border
4. **Conversation list**: Removed `flex-row-reverse` — `dir` attribute handles RTL
5. **Added message count badge** in chat header
6. **Fixed border direction**: `border-l` in RTL, `border-r` in LTR for conversation list
7. **Simplified channel label**: Direct config lookup instead of complex i18n key path

## Verification
- Lint: 0 errors, 1 pre-existing warning
- Dev server: compiles and serves successfully (HTTP 200)
