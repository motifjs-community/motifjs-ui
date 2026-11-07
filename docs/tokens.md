# Design tokens

> Get started · @motifx-community/ui 0.1.0-beta.5

The token system has five layers. The first four (primitives, design language scales, semantic tokens per theme, and density) come from `@motifx-community/design-system` and are listed here for reference. The fifth layer, component tokens, belongs to this kit: each component has its own tokens, written in `@layer mx.components`, and each one references a design system token. Every design language provides its own value for each component token.

## Component ({componentDocs.length})

Source: `tokens/schema/*.json` for names and types, and `tokens/languages/<language>/*.json` for values (Tactile values are listed here). Override a component token after `styles.css` to restyle every instance of that component, or override the design system token it references to restyle everything that uses it.

| Token | CSS variable | References | Value |
| --- | --- | --- | --- |
| `access-key.underline-style` | `--mx-access-key-underline-style` | `` | `solid` |
| `access-key.underline-color` | `--mx-access-key-underline-color` | `` | `currentcolor` |
| `access-key.underline-thickness` | `--mx-access-key-underline-thickness` | `` | `auto` |
| `access-key.underline-offset` | `--mx-access-key-underline-offset` | `` | `auto` |
| `access-key.key.shown.text-decoration` | `--mx-access-key-key-shown-text-decoration` | `` | `underline` |
| `accordion.font-size.sm` | `--mx-accordion-font-size-sm` | `font.size.caption` | `0.75rem` |
| `accordion.font-size.md` | `--mx-accordion-font-size-md` | `font.size.body` | `0.875rem` |
| `accordion.font-size.lg` | `--mx-accordion-font-size-lg` | `font.size.body-large` | `1.125rem` |
| `accordion.line-height.sm` | `--mx-accordion-line-height-sm` | `font.line.caption` | `1rem` |
| `accordion.line-height.md` | `--mx-accordion-line-height-md` | `font.line.body` | `1.25rem` |
| `accordion.line-height.lg` | `--mx-accordion-line-height-lg` | `font.line.body-large` | `1.5rem` |
| `accordion.height.sm` | `--mx-accordion-height-sm` | `control.height.sm` | `1.5rem` |
| `accordion.height.md` | `--mx-accordion-height-md` | `control.height.md` | `2rem` |
| `accordion.height.lg` | `--mx-accordion-height-lg` | `control.height.lg` | `2.5rem` |
| `accordion.padding.sm` | `--mx-accordion-padding-sm` | `control.padding.sm` | `0.5rem` |
| `accordion.padding.md` | `--mx-accordion-padding-md` | `control.padding.md` | `0.6875rem` |
| `accordion.padding.lg` | `--mx-accordion-padding-lg` | `control.padding.lg` | `1rem` |
| `accordion.body-padding-inline.sm` | `--mx-accordion-body-padding-inline-sm` | `control.padding.sm` | `0.5rem` |
| `accordion.body-padding-inline.md` | `--mx-accordion-body-padding-inline-md` | `control.padding.md` | `0.6875rem` |
| `accordion.body-padding-inline.lg` | `--mx-accordion-body-padding-inline-lg` | `control.padding.lg` | `1rem` |
| `accordion.chevron-size` | `--mx-accordion-chevron-size` | `icon.size.sm` | `0.75rem` |
| `accordion.chevron-plate-size` | `--mx-accordion-chevron-plate-size` | `icon.size.sm` | `0.75rem` |
| `accordion.content-padding` | `--mx-accordion-content-padding` | `space.4` | `1rem` |
| `accordion.container.color` | `--mx-accordion-container-color` | `color.fg.primary` | `#1d1c1a` |
| `accordion.container.list.bg` | `--mx-accordion-container-list-bg` | `color.bg.card` | `#f5f4f0` |
| `accordion.container.list.border-width` | `--mx-accordion-container-list-border-width` | `border.width.1` | `1px` |
| `accordion.container.list.border-color` | `--mx-accordion-container-list-border-color` | `color.stroke.card` | `rgb(0 0 0 / 0.08)` |
| `accordion.container.list.radius` | `--mx-accordion-container-list-radius` | `radius.lg` | `0.625rem` |
| `accordion.container.separated.gap` | `--mx-accordion-container-separated-gap` | `space.2` | `0.5rem` |
| `accordion.item.list-next.border-top-width` | `--mx-accordion-item-list-next-border-top-width` | `border.width.1` | `1px` |
| `accordion.item.list-next.border-top-color` | `--mx-accordion-item-list-next-border-top-color` | `color.stroke.card` | `rgb(0 0 0 / 0.08)` |
| `accordion.item.separated.bg` | `--mx-accordion-item-separated-bg` | `color.bg.card` | `#f5f4f0` |
| `accordion.item.separated.border-width` | `--mx-accordion-item-separated-border-width` | `border.width.1` | `1px` |
| `accordion.item.separated.border-color` | `--mx-accordion-item-separated-border-color` | `color.stroke.card` | `rgb(0 0 0 / 0.08)` |
| `accordion.item.separated.radius` | `--mx-accordion-item-separated-radius` | `radius.lg` | `0.625rem` |
| `accordion.item.flush.border-bottom-width` | `--mx-accordion-item-flush-border-bottom-width` | `border.width.1` | `1px` |
| `accordion.item.flush.border-bottom-color` | `--mx-accordion-item-flush-border-bottom-color` | `color.stroke.card` | `rgb(0 0 0 / 0.08)` |
| `accordion.header.gap` | `--mx-accordion-header-gap` | `control.gap` | `0.5rem` |
| `accordion.header.color` | `--mx-accordion-header-color` | `color.fg.primary` | `#1d1c1a` |
| `accordion.header.font-weight` | `--mx-accordion-header-font-weight` | `font.weight.semibold` | `600` |
| `accordion.header.hover.bg` | `--mx-accordion-header-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `accordion.header.pressed.bg` | `--mx-accordion-header-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `accordion.header.disabled.color` | `--mx-accordion-header-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `accordion.header.focus.glow` | `--mx-accordion-header-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `accordion.header.focus.outline-width` | `--mx-accordion-header-focus-outline-width` | `focus.ring.width` | `2px` |
| `accordion.header.focus.outline-color` | `--mx-accordion-header-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `accordion.header.focus.outline-offset` | `--mx-accordion-header-focus-outline-offset` | `` | `calc(2px * -1)` |
| `accordion.icon.size` | `--mx-accordion-icon-size` | `icon.size.md` | `1rem` |
| `accordion.chevron.color` | `--mx-accordion-chevron-color` | `color.fg.secondary` | `#5e5c55` |
| `accordion.chevron.icon` | `--mx-accordion-chevron-icon` | `` | `var(--mx-icon-chevron-down)` |
| `accordion.chevron.open.rotate` | `--mx-accordion-chevron-open-rotate` | `` | `180deg` |
| `accordion.body.bg` | `--mx-accordion-body-bg` | `` | `initial` |
| `actionsheet.sheet.body.padding` | `--mx-actionsheet-sheet-body-padding` | `space.2` | `0.5rem` |
| `actionsheet.menu.item-height` | `--mx-actionsheet-menu-item-height` | `control.height.lg` | `2.5rem` |
| `actionsheet.menu.item-white-space` | `--mx-actionsheet-menu-item-white-space` | `` | `normal` |
| `actionsheet.menu.item.padding-inline` | `--mx-actionsheet-menu-item-padding-inline` | `space.4` | `1rem` |
| `actionsheet.menu.item.gap` | `--mx-actionsheet-menu-item-gap` | `space.3` | `0.75rem` |
| `actionsheet.menu.item.font-size` | `--mx-actionsheet-menu-item-font-size` | `font.size.body-large` | `1.125rem` |
| `actionsheet.menu.item.line-height` | `--mx-actionsheet-menu-item-line-height` | `font.line.body-large` | `1.5rem` |
| `actionsheet.menu.item.radius` | `--mx-actionsheet-menu-item-radius` | `radius.md` | `0.375rem` |
| `actionsheet.menu.item.first.radius-top` | `--mx-actionsheet-menu-item-first-radius-top` | `radius.md` | `0.375rem` |
| `actionsheet.menu.item.last.radius-bottom` | `--mx-actionsheet-menu-item-last-radius-bottom` | `radius.md` | `0.375rem` |
| `actionsheet.menu.shortcut.display` | `--mx-actionsheet-menu-shortcut-display` | `` | `none` |
| `actionsheet.cancel-button.variant` | `--mx-actionsheet-cancel-button-variant` | `` | `outline` |
| `actionsheet.cancel-button.tone` | `--mx-actionsheet-cancel-button-tone` | `` | `standard` |
| `actionsheet.cancel-button.size` | `--mx-actionsheet-cancel-button-size` | `` | `lg` |
| `actionsheet.cancel-button.height.lg` | `--mx-actionsheet-cancel-button-height-lg` | `control.height.lg` | `2.5rem` |
| `actionsheet.cancel-button.font-size.lg` | `--mx-actionsheet-cancel-button-font-size-lg` | `font.size.body-large` | `1.125rem` |
| `actionsheet.cancel-button.face.font-weight` | `--mx-actionsheet-cancel-button-face-font-weight` | `font.weight.semibold` | `600` |
| `actionsheet.message.padding-top` | `--mx-actionsheet-message-padding-top` | `` | `0px` |
| `actionsheet.message.padding` | `--mx-actionsheet-message-padding` | `space.4` | `1rem` |
| `actionsheet.message.padding-bottom` | `--mx-actionsheet-message-padding-bottom` | `space.2` | `0.5rem` |
| `actionsheet.message.color` | `--mx-actionsheet-message-color` | `color.fg.secondary` | `#5e5c55` |
| `actionsheet.message.font-size` | `--mx-actionsheet-message-font-size` | `font.size.body` | `0.875rem` |
| `actionsheet.message.line-height` | `--mx-actionsheet-message-line-height` | `font.line.body` | `1.25rem` |
| `actionsheet.back.rotate` | `--mx-actionsheet-back-rotate` | `` | `90deg` |
| `actionsheet.back.icon` | `--mx-actionsheet-back-icon` | `` | `var(--mx-icon-chevron-down)` |
| `actionsheet.back.rtl.rotate` | `--mx-actionsheet-back-rtl-rotate` | `` | `-90deg` |
| `actionsheet.cancel.padding` | `--mx-actionsheet-cancel-padding` | `space.2` | `0.5rem` |
| `actionsheet.cancel.border-top-width` | `--mx-actionsheet-cancel-border-top-width` | `border.width.1` | `1px` |
| `actionsheet.cancel.border-top-color` | `--mx-actionsheet-cancel-border-top-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `app-bar.title-least` | `--mx-app-bar-title-least` | `` | `96px` |
| `app-bar.bar.bg` | `--mx-app-bar-bar-bg` | `color.bg.bar` | `#ebeae5` |
| `app-bar.bar.color` | `--mx-app-bar-bar-color` | `color.fg.primary` | `#1d1c1a` |
| `app-bar.bar.border-bottom-width` | `--mx-app-bar-bar-border-bottom-width` | `control.edge.width` | `2px` |
| `app-bar.bar.border-color` | `--mx-app-bar-bar-border-color` | `color.stroke.control.edge` | `rgb(0 0 0 / 0.3)` |
| `app-bar.bar.shadow` | `--mx-app-bar-bar-shadow` | `` | `0 0 #0000` |
| `app-bar.bar.lifted.bg` | `--mx-app-bar-bar-lifted-bg` | `color.bg.bar` | `#ebeae5` |
| `app-bar.bar.lifted.shadow` | `--mx-app-bar-bar-lifted-shadow` | `shadow.4` | `0px 2px 4px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `app-bar.bar.accent.bg` | `--mx-app-bar-bar-accent-bg` | `color.accent.solid` | `#c24523` |
| `app-bar.bar.accent.color` | `--mx-app-bar-bar-accent-color` | `color.accent.on-solid` | `#ffffff` |
| `app-bar.bar.accent.border-color` | `--mx-app-bar-bar-accent-border-color` | `` | `rgb(0 0 0 / 0)` |
| `app-bar.row.min-height` | `--mx-app-bar-row-min-height` | `` | `56px` |
| `app-bar.row.padding-inline` | `--mx-app-bar-row-padding-inline` | `space.3` | `0.75rem` |
| `app-bar.row.gap` | `--mx-app-bar-row-gap` | `space.2` | `0.5rem` |
| `app-bar.row.prominent.padding-block` | `--mx-app-bar-row-prominent-padding-block` | `space.2` | `0.5rem` |
| `app-bar.start.gap` | `--mx-app-bar-start-gap` | `space.1` | `0.25rem` |
| `app-bar.logo.size` | `--mx-app-bar-logo-size` | `` | `28px` |
| `app-bar.titles.gap` | `--mx-app-bar-titles-gap` | `space.0` | `0px` |
| `app-bar.titles.prominent.padding-inline` | `--mx-app-bar-titles-prominent-padding-inline` | `space.2` | `0.5rem` |
| `app-bar.titles.alone.padding-start` | `--mx-app-bar-titles-alone-padding-start` | `` | `initial` |
| `app-bar.title.font-size` | `--mx-app-bar-title-font-size` | `font.size.body-large` | `1.125rem` |
| `app-bar.title.font-weight` | `--mx-app-bar-title-font-weight` | `font.weight.semibold` | `600` |
| `app-bar.title.line-height` | `--mx-app-bar-title-line-height` | `font.line.body-large` | `1.5rem` |
| `app-bar.title.letter-spacing` | `--mx-app-bar-title-letter-spacing` | `` | `0px` |
| `app-bar.title.prominent.font-size` | `--mx-app-bar-title-prominent-font-size` | `font.size.title` | `1.75rem` |
| `app-bar.title.prominent.line-height` | `--mx-app-bar-title-prominent-line-height` | `font.line.title` | `2.25rem` |
| `app-bar.title.accent.color` | `--mx-app-bar-title-accent-color` | `color.accent.on-solid` | `#ffffff` |
| `app-bar.subtitle.font-size` | `--mx-app-bar-subtitle-font-size` | `font.size.caption` | `0.75rem` |
| `app-bar.subtitle.line-height` | `--mx-app-bar-subtitle-line-height` | `font.line.caption` | `1rem` |
| `app-bar.subtitle.color` | `--mx-app-bar-subtitle-color` | `color.fg.secondary` | `#5e5c55` |
| `app-bar.subtitle.accent.color` | `--mx-app-bar-subtitle-accent-color` | `color.accent.on-solid` | `#ffffff` |
| `app-bar.content.padding-inline` | `--mx-app-bar-content-padding-inline` | `space.2` | `0.5rem` |
| `app-bar.toolbar.bar.bg` | `--mx-app-bar-toolbar-bar-bg` | `` | `rgb(0 0 0 / 0)` |
| `app-bar.toolbar.bar.padding-block` | `--mx-app-bar-toolbar-bar-padding-block` | `space.0` | `0px` |
| `app-bar.toolbar.bar.padding-inline` | `--mx-app-bar-toolbar-bar-padding-inline` | `space.0` | `0px` |
| `app-bar.button.face.ghost.color` | `--mx-app-bar-button-face-ghost-color` | `color.accent.on-solid` | `#ffffff` |
| `app-bar.button.face.ghost-hover.bg` | `--mx-app-bar-button-face-ghost-hover-bg` | `` | `rgb(255 255 255 / 0.14)` |
| `app-bar.button.face.ghost-pressed.bg` | `--mx-app-bar-button-face-ghost-pressed-bg` | `` | `rgb(255 255 255 / 0.22)` |
| `avatar-group.layout` | `--mx-avatar-group-layout` | `` | `stack` |
| `avatar-group.overlap.xs` | `--mx-avatar-group-overlap-xs` | `` | `0.25rem` |
| `avatar-group.overlap.sm` | `--mx-avatar-group-overlap-sm` | `` | `0.25rem` |
| `avatar-group.overlap.md` | `--mx-avatar-group-overlap-md` | `` | `0.375rem` |
| `avatar-group.overlap.lg` | `--mx-avatar-group-overlap-lg` | `` | `0.5rem` |
| `avatar-group.overlap.xl` | `--mx-avatar-group-overlap-xl` | `` | `0.75rem` |
| `avatar-group.gap.xs` | `--mx-avatar-group-gap-xs` | `space.1` | `0.25rem` |
| `avatar-group.gap.sm` | `--mx-avatar-group-gap-sm` | `space.1` | `0.25rem` |
| `avatar-group.gap.md` | `--mx-avatar-group-gap-md` | `space.2` | `0.5rem` |
| `avatar-group.gap.lg` | `--mx-avatar-group-gap-lg` | `space.2` | `0.5rem` |
| `avatar-group.gap.xl` | `--mx-avatar-group-gap-xl` | `space.3` | `0.75rem` |
| `avatar-group.stacked.outline-width` | `--mx-avatar-group-stacked-outline-width` | `border.width.2` | `2px` |
| `avatar-group.stacked.outline-color` | `--mx-avatar-group-stacked-outline-color` | `color.bg.surface` | `#f8f7f3` |
| `avatar.tone` | `--mx-avatar-tone` | `` | `standard` |
| `avatar.shape` | `--mx-avatar-shape` | `` | `circle` |
| `avatar.size.xs` | `--mx-avatar-size-xs` | `` | `1.5rem` |
| `avatar.size.sm` | `--mx-avatar-size-sm` | `` | `2rem` |
| `avatar.size.md` | `--mx-avatar-size-md` | `` | `2.5rem` |
| `avatar.size.lg` | `--mx-avatar-size-lg` | `` | `3.5rem` |
| `avatar.size.xl` | `--mx-avatar-size-xl` | `` | `4.5rem` |
| `avatar.font-size.xs` | `--mx-avatar-font-size-xs` | `` | `0.625rem` |
| `avatar.font-size.sm` | `--mx-avatar-font-size-sm` | `` | `0.75rem` |
| `avatar.font-size.md` | `--mx-avatar-font-size-md` | `` | `0.875rem` |
| `avatar.font-size.lg` | `--mx-avatar-font-size-lg` | `` | `1.25rem` |
| `avatar.font-size.xl` | `--mx-avatar-font-size-xl` | `` | `1.625rem` |
| `avatar.icon-size.xs` | `--mx-avatar-icon-size-xs` | `` | `0.875rem` |
| `avatar.icon-size.sm` | `--mx-avatar-icon-size-sm` | `` | `1.125rem` |
| `avatar.icon-size.md` | `--mx-avatar-icon-size-md` | `` | `1.375rem` |
| `avatar.icon-size.lg` | `--mx-avatar-icon-size-lg` | `` | `2rem` |
| `avatar.icon-size.xl` | `--mx-avatar-icon-size-xl` | `` | `2.5rem` |
| `avatar.status-size.xs` | `--mx-avatar-status-size-xs` | `` | `0.5rem` |
| `avatar.status-size.sm` | `--mx-avatar-status-size-sm` | `` | `0.625rem` |
| `avatar.status-size.md` | `--mx-avatar-status-size-md` | `` | `0.75rem` |
| `avatar.status-size.lg` | `--mx-avatar-status-size-lg` | `` | `1rem` |
| `avatar.status-size.xl` | `--mx-avatar-status-size-xl` | `` | `1.25rem` |
| `avatar.square-radius.xs` | `--mx-avatar-square-radius-xs` | `radius.xs` | `0.25rem` |
| `avatar.square-radius.sm` | `--mx-avatar-square-radius-sm` | `radius.sm` | `0.25rem` |
| `avatar.square-radius.md` | `--mx-avatar-square-radius-md` | `radius.md` | `0.375rem` |
| `avatar.square-radius.lg` | `--mx-avatar-square-radius-lg` | `radius.lg` | `0.625rem` |
| `avatar.square-radius.xl` | `--mx-avatar-square-radius-xl` | `radius.xl` | `0.875rem` |
| `avatar.avatar.bg` | `--mx-avatar-avatar-bg` | `color.fill.neutral` | `#ebeae5` |
| `avatar.avatar.color` | `--mx-avatar-avatar-color` | `color.fg.secondary` | `#5e5c55` |
| `avatar.avatar.font-weight` | `--mx-avatar-avatar-font-weight` | `font.weight.semibold` | `600` |
| `avatar.avatar.accent.bg` | `--mx-avatar-avatar-accent-bg` | `color.accent.subtle` | `#fbe6de` |
| `avatar.avatar.accent.color` | `--mx-avatar-avatar-accent-color` | `color.accent.on-subtle` | `#983318` |
| `avatar.avatar.success.bg` | `--mx-avatar-avatar-success-bg` | `color.success.subtle` | `#dff6dd` |
| `avatar.avatar.success.color` | `--mx-avatar-avatar-success-color` | `color.success.fg` | `#006402` |
| `avatar.avatar.caution.bg` | `--mx-avatar-avatar-caution-bg` | `color.caution.subtle` | `#fff4ce` |
| `avatar.avatar.caution.color` | `--mx-avatar-avatar-caution-color` | `color.caution.fg` | `#754702` |
| `avatar.avatar.danger.bg` | `--mx-avatar-avatar-danger-bg` | `color.danger.subtle` | `#fde7e9` |
| `avatar.avatar.danger.color` | `--mx-avatar-avatar-danger-color` | `color.danger.fg` | `#b03659` |
| `avatar.avatar.info.bg` | `--mx-avatar-avatar-info-bg` | `` | `initial` |
| `avatar.avatar.info.color` | `--mx-avatar-avatar-info-color` | `` | `initial` |
| `avatar.status.radius` | `--mx-avatar-status-radius` | `radius.full` | `9999px` |
| `avatar.status.border-width` | `--mx-avatar-status-border-width` | `border.width.2` | `2px` |
| `avatar.status.border-color` | `--mx-avatar-status-border-color` | `color.bg.surface` | `#f8f7f3` |
| `avatar.status.online.bg` | `--mx-avatar-status-online-bg` | `color.success.solid` | `#006402` |
| `avatar.status.away.bg` | `--mx-avatar-status-away-bg` | `color.caution.solid` | `#754702` |
| `avatar.status.busy.bg` | `--mx-avatar-status-busy-bg` | `color.danger.solid` | `#b03659` |
| `avatar.status.offline.bg` | `--mx-avatar-status-offline-bg` | `color.fg.tertiary` | `#8c8a82` |
| `avatar.status.offline.border-color` | `--mx-avatar-status-offline-border-color` | `` | `initial` |
| `avatar.status-icon.online.display` | `--mx-avatar-status-icon-online-display` | `` | `initial` |
| `avatar.status-icon.online.icon` | `--mx-avatar-status-icon-online-icon` | `` | `initial` |
| `avatar.status-icon.online.bg` | `--mx-avatar-status-icon-online-bg` | `` | `initial` |
| `avatar.status-icon.away.display` | `--mx-avatar-status-icon-away-display` | `` | `initial` |
| `avatar.status-icon.away.icon` | `--mx-avatar-status-icon-away-icon` | `` | `initial` |
| `avatar.status-icon.away.bg` | `--mx-avatar-status-icon-away-bg` | `` | `initial` |
| `avatar.status-icon.offline.display` | `--mx-avatar-status-icon-offline-display` | `` | `initial` |
| `avatar.status-icon.offline.icon` | `--mx-avatar-status-icon-offline-icon` | `` | `initial` |
| `avatar.status-icon.offline.bg` | `--mx-avatar-status-icon-offline-bg` | `` | `initial` |
| `avatar.status-icon.tiny.display` | `--mx-avatar-status-icon-tiny-display` | `` | `initial` |
| `badge.tone` | `--mx-badge-tone` | `` | `accent` |
| `badge.variant` | `--mx-badge-variant` | `` | `solid` |
| `badge.offset` | `--mx-badge-offset` | `space.0` | `0px` |
| `badge.height.sm` | `--mx-badge-height-sm` | `` | `1rem` |
| `badge.height.md` | `--mx-badge-height-md` | `` | `1.25rem` |
| `badge.height.lg` | `--mx-badge-height-lg` | `` | `1.5rem` |
| `badge.dot-size.sm` | `--mx-badge-dot-size-sm` | `` | `0.375rem` |
| `badge.dot-size.md` | `--mx-badge-dot-size-md` | `` | `0.5rem` |
| `badge.dot-size.lg` | `--mx-badge-dot-size-lg` | `` | `0.625rem` |
| `badge.font-size.sm` | `--mx-badge-font-size-sm` | `font.size.caption` | `0.75rem` |
| `badge.font-size.md` | `--mx-badge-font-size-md` | `font.size.caption` | `0.75rem` |
| `badge.font-size.lg` | `--mx-badge-font-size-lg` | `font.size.body` | `0.875rem` |
| `badge.padding.sm` | `--mx-badge-padding-sm` | `` | `0.25rem` |
| `badge.padding.md` | `--mx-badge-padding-md` | `` | `0.375rem` |
| `badge.padding.lg` | `--mx-badge-padding-lg` | `` | `0.5rem` |
| `badge.badge.bg` | `--mx-badge-badge-bg` | `color.fg.secondary` | `#5e5c55` |
| `badge.badge.color` | `--mx-badge-badge-color` | `color.bg.canvas` | `#e1e0da` |
| `badge.badge.radius` | `--mx-badge-badge-radius` | `radius.full` | `9999px` |
| `badge.badge.font-weight` | `--mx-badge-badge-font-weight` | `font.weight.semibold` | `600` |
| `badge.badge.line-height` | `--mx-badge-badge-line-height` | `` | `1rem` |
| `badge.badge.accent.bg` | `--mx-badge-badge-accent-bg` | `color.accent.solid` | `#c24523` |
| `badge.badge.accent.color` | `--mx-badge-badge-accent-color` | `color.accent.on-solid` | `#ffffff` |
| `badge.badge.info.bg` | `--mx-badge-badge-info-bg` | `color.info.solid` | `#5e5c55` |
| `badge.badge.info.color` | `--mx-badge-badge-info-color` | `color.info.on-solid` | `#e1e0da` |
| `badge.badge.success.bg` | `--mx-badge-badge-success-bg` | `color.success.solid` | `#006402` |
| `badge.badge.success.color` | `--mx-badge-badge-success-color` | `color.success.on-solid` | `#ffffff` |
| `badge.badge.caution.bg` | `--mx-badge-badge-caution-bg` | `color.caution.solid` | `#754702` |
| `badge.badge.caution.color` | `--mx-badge-badge-caution-color` | `color.caution.on-solid` | `#ffffff` |
| `badge.badge.danger.bg` | `--mx-badge-badge-danger-bg` | `color.danger.solid` | `#b03659` |
| `badge.badge.danger.color` | `--mx-badge-badge-danger-color` | `color.danger.on-solid` | `#ffffff` |
| `badge.badge.subtle.bg` | `--mx-badge-badge-subtle-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `badge.badge.subtle.color` | `--mx-badge-badge-subtle-color` | `color.fg.primary` | `#1d1c1a` |
| `badge.badge.subtle-accent.bg` | `--mx-badge-badge-subtle-accent-bg` | `color.accent.subtle` | `#fbe6de` |
| `badge.badge.subtle-accent.color` | `--mx-badge-badge-subtle-accent-color` | `color.accent.on-subtle` | `#983318` |
| `badge.badge.subtle-info.bg` | `--mx-badge-badge-subtle-info-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `badge.badge.subtle-info.color` | `--mx-badge-badge-subtle-info-color` | `color.fg.primary` | `#1d1c1a` |
| `badge.badge.subtle-success.bg` | `--mx-badge-badge-subtle-success-bg` | `color.success.subtle` | `#dff6dd` |
| `badge.badge.subtle-success.color` | `--mx-badge-badge-subtle-success-color` | `color.success.fg` | `#006402` |
| `badge.badge.subtle-caution.bg` | `--mx-badge-badge-subtle-caution-bg` | `color.caution.subtle` | `#fff4ce` |
| `badge.badge.subtle-caution.color` | `--mx-badge-badge-subtle-caution-color` | `color.caution.fg` | `#754702` |
| `badge.badge.subtle-danger.bg` | `--mx-badge-badge-subtle-danger-bg` | `color.danger.subtle` | `#fde7e9` |
| `badge.badge.subtle-danger.color` | `--mx-badge-badge-subtle-danger-color` | `color.danger.fg` | `#b03659` |
| `badge.badge.outline.bg` | `--mx-badge-badge-outline-bg` | `` | `rgb(0 0 0 / 0)` |
| `badge.badge.outline.color` | `--mx-badge-badge-outline-color` | `color.fg.secondary` | `#5e5c55` |
| `badge.badge.outline.border-width` | `--mx-badge-badge-outline-border-width` | `border.width.1` | `1px` |
| `badge.badge.outline.border-color` | `--mx-badge-badge-outline-border-color` | `color.fg.secondary` | `#5e5c55` |
| `badge.badge.outline-accent.color` | `--mx-badge-badge-outline-accent-color` | `color.accent.fg` | `#983318` |
| `badge.badge.outline-accent.border-color` | `--mx-badge-badge-outline-accent-border-color` | `color.accent.fg` | `#983318` |
| `badge.badge.outline-info.color` | `--mx-badge-badge-outline-info-color` | `color.fg.secondary` | `#5e5c55` |
| `badge.badge.outline-info.border-color` | `--mx-badge-badge-outline-info-border-color` | `color.fg.secondary` | `#5e5c55` |
| `badge.badge.outline-success.color` | `--mx-badge-badge-outline-success-color` | `color.success.fg` | `#006402` |
| `badge.badge.outline-success.border-color` | `--mx-badge-badge-outline-success-border-color` | `color.success.fg` | `#006402` |
| `badge.badge.outline-caution.color` | `--mx-badge-badge-outline-caution-color` | `color.caution.fg` | `#754702` |
| `badge.badge.outline-caution.border-color` | `--mx-badge-badge-outline-caution-border-color` | `color.caution.fg` | `#754702` |
| `badge.badge.outline-danger.color` | `--mx-badge-badge-outline-danger-color` | `color.danger.fg` | `#b03659` |
| `badge.badge.outline-danger.border-color` | `--mx-badge-badge-outline-danger-border-color` | `color.danger.fg` | `#b03659` |
| `badge.badge.dot.padding-inline` | `--mx-badge-badge-dot-padding-inline` | `space.0` | `0px` |
| `barcode.height` | `--mx-barcode-height` | `` | `64px` |
| `barcode.sheet.bg` | `--mx-barcode-sheet-bg` | `` | `#ffffff` |
| `barcode.sheet.color` | `--mx-barcode-sheet-color` | `` | `#000000` |
| `barcode.sheet.radius` | `--mx-barcode-sheet-radius` | `radius.md` | `0.375rem` |
| `barcode.sheet.padding-block` | `--mx-barcode-sheet-padding-block` | `space.2` | `0.5rem` |
| `barcode.text.color` | `--mx-barcode-text-color` | `` | `#000000` |
| `barcode.text.font-size` | `--mx-barcode-text-font-size` | `font.size.caption` | `0.75rem` |
| `barcode.text.padding-top` | `--mx-barcode-text-padding-top` | `space.1` | `0.25rem` |
| `barcode.text.letter-spacing` | `--mx-barcode-text-letter-spacing` | `` | `1px` |
| `bottom-navigation.bar.bg` | `--mx-bottom-navigation-bar-bg` | `color.bg.bar` | `#ebeae5` |
| `bottom-navigation.bar.border-top-width` | `--mx-bottom-navigation-bar-border-top-width` | `control.edge.width` | `2px` |
| `bottom-navigation.bar.border-color` | `--mx-bottom-navigation-bar-border-color` | `color.stroke.control.edge` | `rgb(0 0 0 / 0.3)` |
| `bottom-navigation.bar.shadow` | `--mx-bottom-navigation-bar-shadow` | `` | `0 0 #0000` |
| `bottom-navigation.list.min-height` | `--mx-bottom-navigation-list-min-height` | `` | `60px` |
| `bottom-navigation.list.padding-block` | `--mx-bottom-navigation-list-padding-block` | `space.1` | `0.25rem` |
| `bottom-navigation.list.padding-inline` | `--mx-bottom-navigation-list-padding-inline` | `space.1` | `0.25rem` |
| `bottom-navigation.list.gap` | `--mx-bottom-navigation-list-gap` | `space.1` | `0.25rem` |
| `bottom-navigation.item.color` | `--mx-bottom-navigation-item-color` | `color.fg.secondary` | `#5e5c55` |
| `bottom-navigation.item.gap` | `--mx-bottom-navigation-item-gap` | `space.1` | `0.25rem` |
| `bottom-navigation.item.radius` | `--mx-bottom-navigation-item-radius` | `radius.md` | `0.375rem` |
| `bottom-navigation.item.padding-block` | `--mx-bottom-navigation-item-padding-block` | `space.1` | `0.25rem` |
| `bottom-navigation.item.hover.color` | `--mx-bottom-navigation-item-hover-color` | `color.fg.primary` | `#1d1c1a` |
| `bottom-navigation.item.focus.glow` | `--mx-bottom-navigation-item-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `bottom-navigation.item.focus.outline-width` | `--mx-bottom-navigation-item-focus-outline-width` | `focus.ring.width` | `2px` |
| `bottom-navigation.item.focus.outline-color` | `--mx-bottom-navigation-item-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `bottom-navigation.item.focus.outline-offset` | `--mx-bottom-navigation-item-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `bottom-navigation.item.selected.color` | `--mx-bottom-navigation-item-selected-color` | `color.accent.fg` | `#983318` |
| `bottom-navigation.item.disabled.color` | `--mx-bottom-navigation-item-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `bottom-navigation.indicator.width` | `--mx-bottom-navigation-indicator-width` | `` | `0px` |
| `bottom-navigation.indicator.height` | `--mx-bottom-navigation-indicator-height` | `` | `0px` |
| `bottom-navigation.indicator.radius` | `--mx-bottom-navigation-indicator-radius` | `radius.none` | `0px` |
| `bottom-navigation.indicator.bg` | `--mx-bottom-navigation-indicator-bg` | `` | `rgb(0 0 0 / 0)` |
| `bottom-navigation.indicator.margin-top` | `--mx-bottom-navigation-indicator-margin-top` | `` | `0px` |
| `bottom-navigation.indicator.selected.opacity` | `--mx-bottom-navigation-indicator-selected-opacity` | `` | `1` |
| `bottom-navigation.icon-host.size` | `--mx-bottom-navigation-icon-host-size` | `` | `22px` |
| `bottom-navigation.label.font-size` | `--mx-bottom-navigation-label-font-size` | `font.size.caption` | `0.75rem` |
| `bottom-navigation.label.font-weight` | `--mx-bottom-navigation-label-font-weight` | `font.weight.medium` | `500` |
| `bottom-navigation.label.line-height` | `--mx-bottom-navigation-label-line-height` | `font.line.caption` | `1rem` |
| `bottom-navigation.label.letter-spacing` | `--mx-bottom-navigation-label-letter-spacing` | `` | `0px` |
| `bottom-navigation.label.selected.font-weight` | `--mx-bottom-navigation-label-selected-font-weight` | `font.weight.semibold` | `600` |
| `breadcrumb.font-size.sm` | `--mx-breadcrumb-font-size-sm` | `font.size.caption` | `0.75rem` |
| `breadcrumb.font-size.md` | `--mx-breadcrumb-font-size-md` | `font.size.body` | `0.875rem` |
| `breadcrumb.font-size.lg` | `--mx-breadcrumb-font-size-lg` | `` | `1rem` |
| `breadcrumb.padding.sm` | `--mx-breadcrumb-padding-sm` | `` | `0.25rem` |
| `breadcrumb.padding.md` | `--mx-breadcrumb-padding-md` | `` | `0.375rem` |
| `breadcrumb.padding.lg` | `--mx-breadcrumb-padding-lg` | `` | `0.5rem` |
| `breadcrumb.height.sm` | `--mx-breadcrumb-height-sm` | `` | `1.5rem` |
| `breadcrumb.height.md` | `--mx-breadcrumb-height-md` | `` | `1.75rem` |
| `breadcrumb.height.lg` | `--mx-breadcrumb-height-lg` | `` | `2.25rem` |
| `breadcrumb.gap` | `--mx-breadcrumb-gap` | `space.1` | `0.25rem` |
| `breadcrumb.divider-size` | `--mx-breadcrumb-divider-size` | `` | `0.75rem` |
| `breadcrumb.link.color` | `--mx-breadcrumb-link-color` | `color.fg.secondary` | `#5e5c55` |
| `breadcrumb.link.radius` | `--mx-breadcrumb-link-radius` | `radius.sm` | `0.25rem` |
| `breadcrumb.link.cursor` | `--mx-breadcrumb-link-cursor` | `` | `pointer` |
| `breadcrumb.link.hover.bg` | `--mx-breadcrumb-link-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `breadcrumb.link.hover.color` | `--mx-breadcrumb-link-hover-color` | `color.fg.primary` | `#1d1c1a` |
| `breadcrumb.link.pressed.bg` | `--mx-breadcrumb-link-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `breadcrumb.link.focus.glow` | `--mx-breadcrumb-link-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `breadcrumb.link.focus.outline-width` | `--mx-breadcrumb-link-focus-outline-width` | `focus.ring.width` | `2px` |
| `breadcrumb.link.focus.outline-color` | `--mx-breadcrumb-link-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `breadcrumb.link.focus.outline-offset` | `--mx-breadcrumb-link-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `breadcrumb.link.disabled.color` | `--mx-breadcrumb-link-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `breadcrumb.link.disabled.cursor` | `--mx-breadcrumb-link-disabled-cursor` | `` | `default` |
| `breadcrumb.current.color` | `--mx-breadcrumb-current-color` | `color.fg.primary` | `#1d1c1a` |
| `breadcrumb.current.font-weight` | `--mx-breadcrumb-current-font-weight` | `font.weight.semibold` | `600` |
| `breadcrumb.divider.icon` | `--mx-breadcrumb-divider-icon` | `` | `var(--mx-icon-chevron-end)` |
| `breadcrumb.divider.bg` | `--mx-breadcrumb-divider-bg` | `color.fg.tertiary` | `#8c8a82` |
| `breadcrumb.more.chevron.display` | `--mx-breadcrumb-more-chevron-display` | `` | `none` |
| `button-group.attached` | `--mx-button-group-attached` | `` | `true` |
| `button-group.gap` | `--mx-button-group-gap` | `space.2` | `0.5rem` |
| `button-group.item.variant` | `--mx-button-group-item-variant` | `` | `outline` |
| `button-group.item.face.toggled.bg` | `--mx-button-group-item-face-toggled-bg` | `color.accent.subtle` | `#fbe6de` |
| `button-group.item.face.toggled.color` | `--mx-button-group-item-face-toggled-color` | `color.accent.on-subtle` | `#983318` |
| `button-group.item.face.toggled-hover.bg` | `--mx-button-group-item-face-toggled-hover-bg` | `color.accent.subtle` | `#fbe6de` |
| `button-group.item.face.outline-toggled.bg` | `--mx-button-group-item-face-outline-toggled-bg` | `color.accent.subtle` | `#fbe6de` |
| `button-group.item.face.outline-toggled.color` | `--mx-button-group-item-face-outline-toggled-color` | `color.accent.on-subtle` | `#983318` |
| `button-group.item.face.outline-toggled.border-color` | `--mx-button-group-item-face-outline-toggled-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `button-group.item.face.outline-toggled-hover.bg` | `--mx-button-group-item-face-outline-toggled-hover-bg` | `color.accent.subtle` | `#fbe6de` |
| `button-group.item.face.ghost-toggled.bg` | `--mx-button-group-item-face-ghost-toggled-bg` | `color.accent.subtle` | `#fbe6de` |
| `button-group.item.face.ghost-toggled.color` | `--mx-button-group-item-face-ghost-toggled-color` | `color.accent.on-subtle` | `#983318` |
| `button-group.item.face.ghost-toggled-hover.bg` | `--mx-button-group-item-face-ghost-toggled-hover-bg` | `color.accent.subtle` | `#fbe6de` |
| `button-group.inner-start.face.radius-start` | `--mx-button-group-inner-start-face-radius-start` | `radius.none` | `0px` |
| `button-group.inner-end.face.radius-end` | `--mx-button-group-inner-end-face-radius-end` | `radius.none` | `0px` |
| `button.variant` | `--mx-button-variant` | `` | `solid` |
| `button.tone` | `--mx-button-tone` | `` | `standard` |
| `button.size` | `--mx-button-size` | `` | `md` |
| `button.press-offset` | `--mx-button-press-offset` | `control.press.offset` | `1px` |
| `button.icon-only-square` | `--mx-button-icon-only-square` | `` | `0` |
| `button.spinner-duration` | `--mx-button-spinner-duration` | `` | `750ms` |
| `button.font-size.sm` | `--mx-button-font-size-sm` | `font.size.caption` | `0.75rem` |
| `button.font-size.md` | `--mx-button-font-size-md` | `font.size.body` | `0.875rem` |
| `button.font-size.lg` | `--mx-button-font-size-lg` | `font.size.body` | `0.875rem` |
| `button.line-height.sm` | `--mx-button-line-height-sm` | `font.line.caption` | `1rem` |
| `button.line-height.md` | `--mx-button-line-height-md` | `font.line.body` | `1.25rem` |
| `button.line-height.lg` | `--mx-button-line-height-lg` | `font.line.body` | `1.25rem` |
| `button.text-box` | `--mx-button-text-box` | `` | `normal` |
| `button.height.sm` | `--mx-button-height-sm` | `control.height.sm` | `1.5rem` |
| `button.height.md` | `--mx-button-height-md` | `control.height.md` | `2rem` |
| `button.height.lg` | `--mx-button-height-lg` | `control.height.lg` | `2.5rem` |
| `button.padding.sm` | `--mx-button-padding-sm` | `control.padding.sm` | `0.5rem` |
| `button.padding.md` | `--mx-button-padding-md` | `control.padding.md` | `0.6875rem` |
| `button.padding.lg` | `--mx-button-padding-lg` | `control.padding.lg` | `1rem` |
| `button.face.gap` | `--mx-button-face-gap` | `control.gap` | `0.5rem` |
| `button.face.bg` | `--mx-button-face-bg` | `color.fill.control.default` | `#f5f4f0` |
| `button.face.border-width` | `--mx-button-face-border-width` | `border.width.1` | `1px` |
| `button.face.border-bottom-width` | `--mx-button-face-border-bottom-width` | `control.edge.width` | `2px` |
| `button.face.border-color` | `--mx-button-face-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `button.face.border-bottom-color` | `--mx-button-face-border-bottom-color` | `color.stroke.control.edge` | `rgb(0 0 0 / 0.3)` |
| `button.face.radius` | `--mx-button-face-radius` | `radius.md` | `0.375rem` |
| `button.face.shadow` | `--mx-button-face-shadow` | `effect.control` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7)` |
| `button.face.color` | `--mx-button-face-color` | `color.fg.primary` | `#1d1c1a` |
| `button.face.font-weight` | `--mx-button-face-font-weight` | `font.weight.medium` | `500` |
| `button.face.accent.bg` | `--mx-button-face-accent-bg` | `color.accent.solid` | `#c24523` |
| `button.face.accent.border-color` | `--mx-button-face-accent-border-color` | `color.accent.solid` | `#c24523` |
| `button.face.accent.border-bottom-color` | `--mx-button-face-accent-border-bottom-color` | `color.stroke.on-accent-bottom` | `rgb(0 0 0 / 0.4)` |
| `button.face.accent.color` | `--mx-button-face-accent-color` | `color.accent.on-solid` | `#ffffff` |
| `button.face.danger.bg` | `--mx-button-face-danger-bg` | `color.danger.solid` | `#b03659` |
| `button.face.danger.border-color` | `--mx-button-face-danger-border-color` | `color.danger.solid` | `#b03659` |
| `button.face.danger.border-bottom-color` | `--mx-button-face-danger-border-bottom-color` | `color.stroke.on-accent-bottom` | `rgb(0 0 0 / 0.4)` |
| `button.face.danger.color` | `--mx-button-face-danger-color` | `color.danger.on-solid` | `#ffffff` |
| `button.face.outline.bg` | `--mx-button-face-outline-bg` | `` | `rgb(0 0 0 / 0)` |
| `button.face.outline.border-bottom-width` | `--mx-button-face-outline-border-bottom-width` | `border.width.1` | `1px` |
| `button.face.outline.border-color` | `--mx-button-face-outline-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `button.face.outline.shadow` | `--mx-button-face-outline-shadow` | `` | `0 0 #0000` |
| `button.face.outline.color` | `--mx-button-face-outline-color` | `color.fg.primary` | `#1d1c1a` |
| `button.face.outline-accent.color` | `--mx-button-face-outline-accent-color` | `color.accent.fg` | `#983318` |
| `button.face.outline-danger.color` | `--mx-button-face-outline-danger-color` | `color.danger.fg` | `#b03659` |
| `button.face.ghost.bg` | `--mx-button-face-ghost-bg` | `` | `rgb(0 0 0 / 0)` |
| `button.face.ghost.border-bottom-width` | `--mx-button-face-ghost-border-bottom-width` | `border.width.1` | `1px` |
| `button.face.ghost.border-color` | `--mx-button-face-ghost-border-color` | `` | `rgb(0 0 0 / 0)` |
| `button.face.ghost.border-bottom-color` | `--mx-button-face-ghost-border-bottom-color` | `` | `rgb(0 0 0 / 0)` |
| `button.face.ghost.shadow` | `--mx-button-face-ghost-shadow` | `` | `0 0 #0000` |
| `button.face.ghost.color` | `--mx-button-face-ghost-color` | `color.fg.primary` | `#1d1c1a` |
| `button.face.ghost-accent.color` | `--mx-button-face-ghost-accent-color` | `color.accent.fg` | `#983318` |
| `button.face.ghost-danger.color` | `--mx-button-face-ghost-danger-color` | `color.danger.fg` | `#b03659` |
| `button.face.hover.bg` | `--mx-button-face-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `button.face.hover.border-bottom-color` | `--mx-button-face-hover-border-bottom-color` | `color.stroke.control.edge` | `rgb(0 0 0 / 0.3)` |
| `button.face.hover.image` | `--mx-button-face-hover-image` | `` | `initial` |
| `button.face.hover.color` | `--mx-button-face-hover-color` | `` | `initial` |
| `button.face.accent-hover.bg` | `--mx-button-face-accent-hover-bg` | `color.accent.solid-hover` | `#b43f20` |
| `button.face.accent-hover.border-bottom-color` | `--mx-button-face-accent-hover-border-bottom-color` | `color.stroke.on-accent-bottom` | `rgb(0 0 0 / 0.4)` |
| `button.face.accent-hover.color` | `--mx-button-face-accent-hover-color` | `color.accent.on-solid` | `#ffffff` |
| `button.face.danger-hover.bg` | `--mx-button-face-danger-hover-bg` | `color.danger.solid-hover` | `#c13b61` |
| `button.face.danger-hover.border-bottom-color` | `--mx-button-face-danger-hover-border-bottom-color` | `color.stroke.on-accent-bottom` | `rgb(0 0 0 / 0.4)` |
| `button.face.danger-hover.color` | `--mx-button-face-danger-hover-color` | `color.danger.on-solid` | `#ffffff` |
| `button.face.outline-hover.bg` | `--mx-button-face-outline-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `button.face.outline-hover.border-color` | `--mx-button-face-outline-hover-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `button.face.outline-hover.color` | `--mx-button-face-outline-hover-color` | `` | `initial` |
| `button.face.outline-accent-hover.color` | `--mx-button-face-outline-accent-hover-color` | `color.accent.fg` | `#983318` |
| `button.face.outline-danger-hover.color` | `--mx-button-face-outline-danger-hover-color` | `color.danger.fg` | `#b03659` |
| `button.face.ghost-hover.bg` | `--mx-button-face-ghost-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `button.face.ghost-hover.border-color` | `--mx-button-face-ghost-hover-border-color` | `` | `rgb(0 0 0 / 0)` |
| `button.face.ghost-hover.color` | `--mx-button-face-ghost-hover-color` | `` | `initial` |
| `button.face.ghost-accent-hover.color` | `--mx-button-face-ghost-accent-hover-color` | `color.accent.fg` | `#983318` |
| `button.face.ghost-danger-hover.color` | `--mx-button-face-ghost-danger-hover-color` | `color.danger.fg` | `#b03659` |
| `button.face.toggled-hover.bg` | `--mx-button-face-toggled-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `button.face.accent-toggled-hover.bg` | `--mx-button-face-accent-toggled-hover-bg` | `color.accent.solid-hover` | `#b43f20` |
| `button.face.danger-toggled-hover.bg` | `--mx-button-face-danger-toggled-hover-bg` | `color.danger.solid-hover` | `#c13b61` |
| `button.face.outline-toggled-hover.bg` | `--mx-button-face-outline-toggled-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `button.face.outline-toggled-hover.color` | `--mx-button-face-outline-toggled-hover-color` | `` | `initial` |
| `button.face.outline-accent-toggled-hover.color` | `--mx-button-face-outline-accent-toggled-hover-color` | `color.accent.fg` | `#983318` |
| `button.face.outline-danger-toggled-hover.color` | `--mx-button-face-outline-danger-toggled-hover-color` | `color.danger.fg` | `#b03659` |
| `button.face.ghost-toggled-hover.bg` | `--mx-button-face-ghost-toggled-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `button.face.ghost-toggled-hover.color` | `--mx-button-face-ghost-toggled-hover-color` | `` | `initial` |
| `button.face.ghost-accent-toggled-hover.color` | `--mx-button-face-ghost-accent-toggled-hover-color` | `color.accent.fg` | `#983318` |
| `button.face.ghost-danger-toggled-hover.color` | `--mx-button-face-ghost-danger-toggled-hover-color` | `color.danger.fg` | `#b03659` |
| `button.face.pressed.bg` | `--mx-button-face-pressed-bg` | `color.fill.control.tertiary` | `#e1e0da` |
| `button.face.pressed.border-bottom-color` | `--mx-button-face-pressed-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `button.face.pressed.shadow` | `--mx-button-face-pressed-shadow` | `` | `0 0 #0000` |
| `button.face.pressed.color` | `--mx-button-face-pressed-color` | `color.fg.primary` | `#1d1c1a` |
| `button.face.pressed.image` | `--mx-button-face-pressed-image` | `` | `initial` |
| `button.face.accent-pressed.bg` | `--mx-button-face-accent-pressed-bg` | `color.accent.solid-pressed` | `#a1381c` |
| `button.face.accent-pressed.border-bottom-color` | `--mx-button-face-accent-pressed-border-bottom-color` | `color.accent.solid` | `#c24523` |
| `button.face.accent-pressed.color` | `--mx-button-face-accent-pressed-color` | `color.accent.on-solid` | `#ffffff` |
| `button.face.danger-pressed.bg` | `--mx-button-face-danger-pressed-bg` | `color.danger.solid-hover` | `#c13b61` |
| `button.face.danger-pressed.border-bottom-color` | `--mx-button-face-danger-pressed-border-bottom-color` | `color.danger.solid` | `#b03659` |
| `button.face.danger-pressed.color` | `--mx-button-face-danger-pressed-color` | `color.danger.on-solid` | `#ffffff` |
| `button.face.outline-pressed.bg` | `--mx-button-face-outline-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `button.face.outline-pressed.border-color` | `--mx-button-face-outline-pressed-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `button.face.outline-pressed.color` | `--mx-button-face-outline-pressed-color` | `` | `initial` |
| `button.face.outline-accent-pressed.color` | `--mx-button-face-outline-accent-pressed-color` | `color.accent.fg` | `#983318` |
| `button.face.outline-danger-pressed.color` | `--mx-button-face-outline-danger-pressed-color` | `color.danger.fg` | `#b03659` |
| `button.face.ghost-pressed.bg` | `--mx-button-face-ghost-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `button.face.ghost-pressed.border-color` | `--mx-button-face-ghost-pressed-border-color` | `` | `rgb(0 0 0 / 0)` |
| `button.face.ghost-pressed.color` | `--mx-button-face-ghost-pressed-color` | `` | `initial` |
| `button.face.ghost-accent-pressed.color` | `--mx-button-face-ghost-accent-pressed-color` | `color.accent.fg` | `#983318` |
| `button.face.ghost-danger-pressed.color` | `--mx-button-face-ghost-danger-pressed-color` | `color.danger.fg` | `#b03659` |
| `button.face.focus.glow` | `--mx-button-face-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `button.face.focus.outline-width` | `--mx-button-face-focus-outline-width` | `focus.ring.width` | `2px` |
| `button.face.focus.outline-color` | `--mx-button-face-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `button.face.focus.outline-offset` | `--mx-button-face-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `button.face.focus.image` | `--mx-button-face-focus-image` | `` | `initial` |
| `button.face.outline-focus.glow` | `--mx-button-face-outline-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `button.face.ghost-focus.glow` | `--mx-button-face-ghost-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `button.face.toggled.bg` | `--mx-button-face-toggled-bg` | `color.fill.control.tertiary` | `#e1e0da` |
| `button.face.toggled.border-bottom-color` | `--mx-button-face-toggled-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `button.face.toggled.shadow` | `--mx-button-face-toggled-shadow` | `` | `0 0 #0000` |
| `button.face.toggled.color` | `--mx-button-face-toggled-color` | `` | `initial` |
| `button.face.accent-toggled.bg` | `--mx-button-face-accent-toggled-bg` | `color.accent.solid-pressed` | `#a1381c` |
| `button.face.accent-toggled.border-bottom-color` | `--mx-button-face-accent-toggled-border-bottom-color` | `color.accent.solid` | `#c24523` |
| `button.face.accent-toggled.color` | `--mx-button-face-accent-toggled-color` | `color.accent.on-solid` | `#ffffff` |
| `button.face.danger-toggled.bg` | `--mx-button-face-danger-toggled-bg` | `color.danger.solid-hover` | `#c13b61` |
| `button.face.danger-toggled.border-bottom-color` | `--mx-button-face-danger-toggled-border-bottom-color` | `color.danger.solid` | `#b03659` |
| `button.face.danger-toggled.color` | `--mx-button-face-danger-toggled-color` | `color.danger.on-solid` | `#ffffff` |
| `button.face.outline-toggled.bg` | `--mx-button-face-outline-toggled-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `button.face.outline-toggled.border-color` | `--mx-button-face-outline-toggled-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `button.face.outline-toggled.color` | `--mx-button-face-outline-toggled-color` | `` | `initial` |
| `button.face.outline-accent-toggled.color` | `--mx-button-face-outline-accent-toggled-color` | `color.accent.fg` | `#983318` |
| `button.face.outline-danger-toggled.color` | `--mx-button-face-outline-danger-toggled-color` | `color.danger.fg` | `#b03659` |
| `button.face.ghost-toggled.bg` | `--mx-button-face-ghost-toggled-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `button.face.ghost-toggled.border-color` | `--mx-button-face-ghost-toggled-border-color` | `` | `rgb(0 0 0 / 0)` |
| `button.face.ghost-toggled.color` | `--mx-button-face-ghost-toggled-color` | `` | `initial` |
| `button.face.ghost-accent-toggled.color` | `--mx-button-face-ghost-accent-toggled-color` | `color.accent.fg` | `#983318` |
| `button.face.ghost-danger-toggled.color` | `--mx-button-face-ghost-danger-toggled-color` | `color.danger.fg` | `#b03659` |
| `button.face.disabled.bg` | `--mx-button-face-disabled-bg` | `color.fill.control.disabled` | `#ebeae5` |
| `button.face.disabled.border-color` | `--mx-button-face-disabled-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `button.face.disabled.border-bottom-color` | `--mx-button-face-disabled-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `button.face.disabled.shadow` | `--mx-button-face-disabled-shadow` | `` | `0 0 #0000` |
| `button.face.disabled.color` | `--mx-button-face-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `button.face.disabled.image` | `--mx-button-face-disabled-image` | `` | `initial` |
| `button.face.accent-disabled.bg` | `--mx-button-face-accent-disabled-bg` | `color.fill.accent-disabled` | `rgb(0 0 0 / 0.2169)` |
| `button.face.accent-disabled.border-color` | `--mx-button-face-accent-disabled-border-color` | `` | `rgb(0 0 0 / 0)` |
| `button.face.accent-disabled.color` | `--mx-button-face-accent-disabled-color` | `color.fg.on-accent-disabled` | `#ffffff` |
| `button.face.danger-disabled.bg` | `--mx-button-face-danger-disabled-bg` | `color.fill.accent-disabled` | `rgb(0 0 0 / 0.2169)` |
| `button.face.danger-disabled.border-color` | `--mx-button-face-danger-disabled-border-color` | `` | `rgb(0 0 0 / 0)` |
| `button.face.danger-disabled.color` | `--mx-button-face-danger-disabled-color` | `color.fg.on-accent-disabled` | `#ffffff` |
| `button.face.outline-disabled.bg` | `--mx-button-face-outline-disabled-bg` | `` | `rgb(0 0 0 / 0)` |
| `button.face.ghost-disabled.bg` | `--mx-button-face-ghost-disabled-bg` | `` | `rgb(0 0 0 / 0)` |
| `button.face.ghost-disabled.border-color` | `--mx-button-face-ghost-disabled-border-color` | `` | `rgb(0 0 0 / 0)` |
| `button.face.busy.color` | `--mx-button-face-busy-color` | `` | `rgb(0 0 0 / 0)` |
| `button.face.main.border-end-width` | `--mx-button-face-main-border-end-width` | `` | `0px` |
| `button.face.main.radius-end` | `--mx-button-face-main-radius-end` | `` | `0px` |
| `button.face.arrow.padding-inline` | `--mx-button-face-arrow-padding-inline` | `control.padding.sm` | `0.5rem` |
| `button.face.arrow.border-start-width` | `--mx-button-face-arrow-border-start-width` | `border.width.1` | `1px` |
| `button.face.arrow.border-start-color` | `--mx-button-face-arrow-border-start-color` | `` | `rgb(0 0 0 / 0)` |
| `button.face.arrow.radius-start` | `--mx-button-face-arrow-radius-start` | `` | `0px` |
| `button.face.radius-start` | `--mx-button-face-radius-start` | `` | `initial` |
| `button.face.radius-end` | `--mx-button-face-radius-end` | `` | `initial` |
| `button.face.min-width` | `--mx-button-face-min-width` | `` | `initial` |
| `button.face.padding-inline` | `--mx-button-face-padding-inline` | `` | `initial` |
| `button.icon.size` | `--mx-button-icon-size` | `icon.size.md` | `1rem` |
| `button.chevron.size` | `--mx-button-chevron-size` | `icon.size.sm` | `0.75rem` |
| `button.chevron.icon` | `--mx-button-chevron-icon` | `` | `var(--mx-icon-chevron-down)` |
| `button.chevron.display` | `--mx-button-chevron-display` | `` | `initial` |
| `button.spinner.border-width` | `--mx-button-spinner-border-width` | `border.width.2` | `2px` |
| `button.spinner.border-end-color` | `--mx-button-spinner-border-end-color` | `` | `rgb(0 0 0 / 0)` |
| `button.spinner.radius` | `--mx-button-spinner-radius` | `radius.full` | `9999px` |
| `button.spinner.color` | `--mx-button-spinner-color` | `color.fg.primary` | `#1d1c1a` |
| `button.spinner.accent.color` | `--mx-button-spinner-accent-color` | `color.accent.on-solid` | `#ffffff` |
| `button.spinner.danger.color` | `--mx-button-spinner-danger-color` | `color.danger.on-solid` | `#ffffff` |
| `button.spinner.outline.color` | `--mx-button-spinner-outline-color` | `color.fg.primary` | `#1d1c1a` |
| `button.spinner.outline-accent.color` | `--mx-button-spinner-outline-accent-color` | `color.accent.fg` | `#983318` |
| `button.spinner.outline-danger.color` | `--mx-button-spinner-outline-danger-color` | `color.danger.fg` | `#b03659` |
| `button.spinner.ghost.color` | `--mx-button-spinner-ghost-color` | `color.fg.primary` | `#1d1c1a` |
| `button.spinner.ghost-accent.color` | `--mx-button-spinner-ghost-accent-color` | `color.accent.fg` | `#983318` |
| `button.spinner.ghost-danger.color` | `--mx-button-spinner-ghost-danger-color` | `color.danger.fg` | `#b03659` |
| `button.divider.width` | `--mx-button-divider-width` | `border.width.1` | `1px` |
| `button.divider.bg` | `--mx-button-divider-bg` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `button.divider.accent.bg` | `--mx-button-divider-accent-bg` | `color.stroke.on-accent-bottom` | `rgb(0 0 0 / 0.4)` |
| `button.divider.danger.bg` | `--mx-button-divider-danger-bg` | `color.stroke.on-accent-bottom` | `rgb(0 0 0 / 0.4)` |
| `button.divider.outline.bg` | `--mx-button-divider-outline-bg` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `button.divider.ghost.bg` | `--mx-button-divider-ghost-bg` | `` | `rgb(0 0 0 / 0)` |
| `button.spinner-shape.display` | `--mx-button-spinner-shape-display` | `` | `initial` |
| `calendar.day-size` | `--mx-calendar-day-size` | `control.height.md` | `2rem` |
| `calendar.view-cell-width-scale` | `--mx-calendar-view-cell-width-scale` | `` | `1.75` |
| `calendar.view-cell-height-scale` | `--mx-calendar-view-cell-height-scale` | `` | `1.5` |
| `calendar.previous-rotate` | `--mx-calendar-previous-rotate` | `` | `0.25turn` |
| `calendar.next-rotate` | `--mx-calendar-next-rotate` | `` | `-0.25turn` |
| `calendar.container.padding` | `--mx-calendar-container-padding` | `space.2` | `0.5rem` |
| `calendar.container.gap` | `--mx-calendar-container-gap` | `space.2` | `0.5rem` |
| `calendar.container.color` | `--mx-calendar-container-color` | `color.fg.primary` | `#1d1c1a` |
| `calendar.container.disabled.color` | `--mx-calendar-container-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `calendar.header.gap` | `--mx-calendar-header-gap` | `space.1` | `0.25rem` |
| `calendar.title.padding-inline` | `--mx-calendar-title-padding-inline` | `space.2` | `0.5rem` |
| `calendar.title.radius` | `--mx-calendar-title-radius` | `radius.md` | `0.375rem` |
| `calendar.title.font-weight` | `--mx-calendar-title-font-weight` | `font.weight.semibold` | `600` |
| `calendar.title.hover.bg` | `--mx-calendar-title-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `calendar.title.pressed.bg` | `--mx-calendar-title-pressed-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `calendar.title.focus.glow` | `--mx-calendar-title-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `calendar.title.focus.outline-width` | `--mx-calendar-title-focus-outline-width` | `focus.ring.width` | `2px` |
| `calendar.title.focus.outline-color` | `--mx-calendar-title-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `calendar.title.focus.outline-offset` | `--mx-calendar-title-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `calendar.nav.radius` | `--mx-calendar-nav-radius` | `radius.md` | `0.375rem` |
| `calendar.nav.color` | `--mx-calendar-nav-color` | `color.fg.secondary` | `#5e5c55` |
| `calendar.nav.hover.bg` | `--mx-calendar-nav-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `calendar.nav.pressed.bg` | `--mx-calendar-nav-pressed-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `calendar.nav.focus.glow` | `--mx-calendar-nav-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `calendar.nav.focus.outline-width` | `--mx-calendar-nav-focus-outline-width` | `focus.ring.width` | `2px` |
| `calendar.nav.focus.outline-color` | `--mx-calendar-nav-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `calendar.nav.focus.outline-offset` | `--mx-calendar-nav-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `calendar.nav.disabled.color` | `--mx-calendar-nav-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `calendar.nav-icon.icon` | `--mx-calendar-nav-icon-icon` | `` | `var(--mx-icon-chevron-down)` |
| `calendar.weekday.color` | `--mx-calendar-weekday-color` | `color.fg.secondary` | `#5e5c55` |
| `calendar.weekday.font-size` | `--mx-calendar-weekday-font-size` | `font.size.caption` | `0.75rem` |
| `calendar.weekday.font-weight` | `--mx-calendar-weekday-font-weight` | `font.weight.regular` | `400` |
| `calendar.cell.radius` | `--mx-calendar-cell-radius` | `radius.full` | `9999px` |
| `calendar.cell.block.radius` | `--mx-calendar-cell-block-radius` | `radius.md` | `0.375rem` |
| `calendar.cell.hover.bg` | `--mx-calendar-cell-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `calendar.cell.pressed.bg` | `--mx-calendar-cell-pressed-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `calendar.cell.focus.glow` | `--mx-calendar-cell-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `calendar.cell.focus.outline-width` | `--mx-calendar-cell-focus-outline-width` | `focus.ring.width` | `2px` |
| `calendar.cell.focus.outline-color` | `--mx-calendar-cell-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `calendar.cell.focus.outline-offset` | `--mx-calendar-cell-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `calendar.cell.outside.color` | `--mx-calendar-cell-outside-color` | `color.fg.secondary` | `#5e5c55` |
| `calendar.cell.today.shadow` | `--mx-calendar-cell-today-shadow` | `` | `inset 0px 0px 0px 1px #983318` |
| `calendar.cell.today.color` | `--mx-calendar-cell-today-color` | `color.accent.fg` | `#983318` |
| `calendar.cell.today.font-weight` | `--mx-calendar-cell-today-font-weight` | `font.weight.semibold` | `600` |
| `calendar.cell.selected.bg` | `--mx-calendar-cell-selected-bg` | `color.accent.solid` | `#c24523` |
| `calendar.cell.selected.color` | `--mx-calendar-cell-selected-color` | `color.accent.on-solid` | `#ffffff` |
| `calendar.cell.selected.shadow` | `--mx-calendar-cell-selected-shadow` | `` | `initial` |
| `calendar.cell.selected-hover.bg` | `--mx-calendar-cell-selected-hover-bg` | `color.accent.solid` | `#c24523` |
| `calendar.cell.range-start.bg` | `--mx-calendar-cell-range-start-bg` | `color.accent.solid` | `#c24523` |
| `calendar.cell.range-start.color` | `--mx-calendar-cell-range-start-color` | `color.accent.on-solid` | `#ffffff` |
| `calendar.cell.range-end.bg` | `--mx-calendar-cell-range-end-bg` | `color.accent.solid` | `#c24523` |
| `calendar.cell.range-end.color` | `--mx-calendar-cell-range-end-color` | `color.accent.on-solid` | `#ffffff` |
| `calendar.cell.range-single.bg` | `--mx-calendar-cell-range-single-bg` | `color.accent.solid` | `#c24523` |
| `calendar.cell.range-single.color` | `--mx-calendar-cell-range-single-color` | `color.accent.on-solid` | `#ffffff` |
| `calendar.cell.range-in.bg` | `--mx-calendar-cell-range-in-bg` | `color.accent.subtle` | `#fbe6de` |
| `calendar.cell.range-in.color` | `--mx-calendar-cell-range-in-color` | `color.accent.on-subtle` | `#983318` |
| `calendar.cell.range-in.radius` | `--mx-calendar-cell-range-in-radius` | `radius.none` | `0px` |
| `calendar.cell.disabled.color` | `--mx-calendar-cell-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `calendar.today.padding-block` | `--mx-calendar-today-padding-block` | `space.1` | `0.25rem` |
| `calendar.today.padding-inline` | `--mx-calendar-today-padding-inline` | `space.3` | `0.75rem` |
| `calendar.today.radius` | `--mx-calendar-today-radius` | `radius.md` | `0.375rem` |
| `calendar.today.color` | `--mx-calendar-today-color` | `color.accent.fg` | `#983318` |
| `calendar.today.hover.bg` | `--mx-calendar-today-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `calendar.today.pressed.bg` | `--mx-calendar-today-pressed-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `calendar.today.focus.glow` | `--mx-calendar-today-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `calendar.today.focus.outline-width` | `--mx-calendar-today-focus-outline-width` | `focus.ring.width` | `2px` |
| `calendar.today.focus.outline-color` | `--mx-calendar-today-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `calendar.today.focus.outline-offset` | `--mx-calendar-today-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `card.variant` | `--mx-card-variant` | `` | `elevated` |
| `card.footer-align` | `--mx-card-footer-align` | `` | `end` |
| `card.padding.sm` | `--mx-card-padding-sm` | `` | `0.75rem` |
| `card.padding.md` | `--mx-card-padding-md` | `` | `1rem` |
| `card.padding.lg` | `--mx-card-padding-lg` | `` | `1.25rem` |
| `card.gap.sm` | `--mx-card-gap-sm` | `` | `0.5rem` |
| `card.gap.md` | `--mx-card-gap-md` | `` | `0.75rem` |
| `card.gap.lg` | `--mx-card-gap-lg` | `` | `1rem` |
| `card.header-gap` | `--mx-card-header-gap` | `` | `0.75rem` |
| `card.footer-gap` | `--mx-card-footer-gap` | `` | `0.5rem` |
| `card.media-width` | `--mx-card-media-width` | `` | `8rem` |
| `card.card.color` | `--mx-card-card-color` | `color.fg.primary` | `#1d1c1a` |
| `card.card.radius` | `--mx-card-card-radius` | `radius.lg` | `0.625rem` |
| `card.card.border-width` | `--mx-card-card-border-width` | `border.width.1` | `1px` |
| `card.card.border-color` | `--mx-card-card-border-color` | `` | `rgb(0 0 0 / 0)` |
| `card.card.elevated.bg` | `--mx-card-card-elevated-bg` | `color.bg.card` | `#f5f4f0` |
| `card.card.elevated.shadow` | `--mx-card-card-elevated-shadow` | `elevation.card` | `0px 1px 2px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `card.card.elevated.border-color` | `--mx-card-card-elevated-border-color` | `color.stroke.card` | `rgb(0 0 0 / 0.08)` |
| `card.card.filled.bg` | `--mx-card-card-filled-bg` | `color.fill.neutral` | `#ebeae5` |
| `card.card.outline.bg` | `--mx-card-card-outline-bg` | `color.bg.surface` | `#f8f7f3` |
| `card.card.outline.border-color` | `--mx-card-card-outline-border-color` | `color.stroke.card` | `rgb(0 0 0 / 0.08)` |
| `card.card.selected.border-color` | `--mx-card-card-selected-border-color` | `color.accent.solid` | `#c24523` |
| `card.card.selected.bg` | `--mx-card-card-selected-bg` | `` | `initial` |
| `card.card.hover.image` | `--mx-card-card-hover-image` | `` | `linear-gradient(color-mix(in srgb, currentcolor 4%, transparent), color-mix(in srgb, currentcolor 4%, transparent))` |
| `card.card.pressed.image` | `--mx-card-card-pressed-image` | `` | `linear-gradient(color-mix(in srgb, currentcolor 8%, transparent), color-mix(in srgb, currentcolor 8%, transparent))` |
| `card.card.focus.glow` | `--mx-card-card-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `card.card.focus.outline-width` | `--mx-card-card-focus-outline-width` | `focus.ring.width` | `2px` |
| `card.card.focus.outline-color` | `--mx-card-card-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `card.card.focus.outline-offset` | `--mx-card-card-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `card.card.focus.image` | `--mx-card-card-focus-image` | `` | `linear-gradient(color-mix(in srgb, currentcolor 4%, transparent), color-mix(in srgb, currentcolor 4%, transparent))` |
| `card.card.disabled.opacity` | `--mx-card-card-disabled-opacity` | `opacity.disabled` | `0.5` |
| `card.title.font-size` | `--mx-card-title-font-size` | `font.size.body-large` | `1.125rem` |
| `card.title.font-weight` | `--mx-card-title-font-weight` | `font.weight.semibold` | `600` |
| `card.title.line-height` | `--mx-card-title-line-height` | `font.line.body-large` | `1.5rem` |
| `card.title.color` | `--mx-card-title-color` | `color.fg.primary` | `#1d1c1a` |
| `card.subtitle.font-size` | `--mx-card-subtitle-font-size` | `font.size.body` | `0.875rem` |
| `card.subtitle.line-height` | `--mx-card-subtitle-line-height` | `font.line.body` | `1.25rem` |
| `card.subtitle.color` | `--mx-card-subtitle-color` | `color.fg.secondary` | `#5e5c55` |
| `card.content.font-size` | `--mx-card-content-font-size` | `font.size.body` | `0.875rem` |
| `card.content.line-height` | `--mx-card-content-line-height` | `font.line.body` | `1.25rem` |
| `card.content.color` | `--mx-card-content-color` | `color.fg.primary` | `#1d1c1a` |
| `chart.height` | `--mx-chart-height` | `` | `20rem` |
| `chart.series-1` | `--mx-chart-series-1` | `color.chart.series-1` | `#c24523` |
| `chart.series-2` | `--mx-chart-series-2` | `color.chart.series-2` | `#853c70` |
| `chart.series-3` | `--mx-chart-series-3` | `color.chart.series-3` | `#008c80` |
| `chart.series-4` | `--mx-chart-series-4` | `color.chart.series-4` | `#7d5800` |
| `chart.series-5` | `--mx-chart-series-5` | `color.chart.series-5` | `#6f6bb3` |
| `chart.series-6` | `--mx-chart-series-6` | `color.chart.series-6` | `#587a30` |
| `chart.series-7` | `--mx-chart-series-7` | `color.chart.series-7` | `#3b80b6` |
| `chart.series-8` | `--mx-chart-series-8` | `color.chart.series-8` | `#a44247` |
| `chart.bar-width` | `--mx-chart-bar-width` | `` | `24px` |
| `chart.bar-radius` | `--mx-chart-bar-radius` | `` | `4px` |
| `chart.bar-gap` | `--mx-chart-bar-gap` | `` | `2px` |
| `chart.line-width` | `--mx-chart-line-width` | `` | `2px` |
| `chart.marker-size` | `--mx-chart-marker-size` | `` | `8px` |
| `chart.marker-ring` | `--mx-chart-marker-ring` | `` | `2px` |
| `chart.area-opacity` | `--mx-chart-area-opacity` | `` | `0.14` |
| `chart.bubble-min` | `--mx-chart-bubble-min` | `` | `5px` |
| `chart.bubble-max` | `--mx-chart-bubble-max` | `` | `28px` |
| `chart.bubble-opacity` | `--mx-chart-bubble-opacity` | `` | `0.72` |
| `chart.hit-size` | `--mx-chart-hit-size` | `` | `24px` |
| `chart.tick-gap` | `--mx-chart-tick-gap` | `` | `44px` |
| `chart.tick-pad` | `--mx-chart-tick-pad` | `space.2` | `0.5rem` |
| `chart.grid-width` | `--mx-chart-grid-width` | `border.width.1` | `1px` |
| `chart.axis-width` | `--mx-chart-axis-width` | `border.width.1` | `1px` |
| `chart.crosshair-width` | `--mx-chart-crosshair-width` | `border.width.1` | `1px` |
| `chart.active-opacity` | `--mx-chart-active-opacity` | `` | `0.2` |
| `chart.loading-opacity` | `--mx-chart-loading-opacity` | `` | `0.45` |
| `chart.root.color` | `--mx-chart-root-color` | `color.fg.primary` | `#1d1c1a` |
| `chart.root.font-size` | `--mx-chart-root-font-size` | `font.size.body` | `0.875rem` |
| `chart.root.gap` | `--mx-chart-root-gap` | `space.2` | `0.5rem` |
| `chart.head.margin-bottom` | `--mx-chart-head-margin-bottom` | `space.2` | `0.5rem` |
| `chart.head.gap` | `--mx-chart-head-gap` | `space.2` | `0.5rem` |
| `chart.title.color` | `--mx-chart-title-color` | `color.fg.primary` | `#1d1c1a` |
| `chart.title.font-size` | `--mx-chart-title-font-size` | `font.size.subtitle` | `1.25rem` |
| `chart.title.font-weight` | `--mx-chart-title-font-weight` | `font.weight.semibold` | `600` |
| `chart.title.line-height` | `--mx-chart-title-line-height` | `font.line.subtitle` | `1.75rem` |
| `chart.subtitle.color` | `--mx-chart-subtitle-color` | `color.fg.secondary` | `#5e5c55` |
| `chart.subtitle.font-size` | `--mx-chart-subtitle-font-size` | `font.size.caption` | `0.75rem` |
| `chart.subtitle.line-height` | `--mx-chart-subtitle-line-height` | `font.line.caption` | `1rem` |
| `chart.plot.radius` | `--mx-chart-plot-radius` | `radius.sm` | `0.25rem` |
| `chart.plot.focus.glow` | `--mx-chart-plot-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `chart.plot.focus.outline-width` | `--mx-chart-plot-focus-outline-width` | `focus.ring.width` | `2px` |
| `chart.plot.focus.outline-color` | `--mx-chart-plot-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `chart.plot.focus.outline-offset` | `--mx-chart-plot-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `chart.grid.color` | `--mx-chart-grid-color` | `color.chart.grid` | `rgb(0 0 0 / 0.1)` |
| `chart.axis.color` | `--mx-chart-axis-color` | `color.fg.tertiary` | `#8c8a82` |
| `chart.ticks.color` | `--mx-chart-ticks-color` | `color.fg.secondary` | `#5e5c55` |
| `chart.ticks.font-size` | `--mx-chart-ticks-font-size` | `font.size.caption` | `0.75rem` |
| `chart.axis-title.color` | `--mx-chart-axis-title-color` | `color.fg.secondary` | `#5e5c55` |
| `chart.axis-title.font-size` | `--mx-chart-axis-title-font-size` | `font.size.caption` | `0.75rem` |
| `chart.labels.color` | `--mx-chart-labels-color` | `color.fg.primary` | `#1d1c1a` |
| `chart.labels.font-size` | `--mx-chart-labels-font-size` | `font.size.caption` | `0.75rem` |
| `chart.labels.font-weight` | `--mx-chart-labels-font-weight` | `font.weight.medium` | `500` |
| `chart.crosshair.color` | `--mx-chart-crosshair-color` | `color.fg.tertiary` | `#8c8a82` |
| `chart.active-bar.color` | `--mx-chart-active-bar-color` | `color.fg.primary` | `#1d1c1a` |
| `chart.message.color` | `--mx-chart-message-color` | `color.fg.secondary` | `#5e5c55` |
| `chart.message.font-size` | `--mx-chart-message-font-size` | `font.size.body` | `0.875rem` |
| `chart.tooltip.max-width` | `--mx-chart-tooltip-max-width` | `` | `20rem` |
| `chart.tooltip.padding-block` | `--mx-chart-tooltip-padding-block` | `space.2` | `0.5rem` |
| `chart.tooltip.padding-inline` | `--mx-chart-tooltip-padding-inline` | `space.3` | `0.75rem` |
| `chart.tooltip.bg` | `--mx-chart-tooltip-bg` | `color.bg.surface` | `#f8f7f3` |
| `chart.tooltip.radius` | `--mx-chart-tooltip-radius` | `radius.md` | `0.375rem` |
| `chart.tooltip.color` | `--mx-chart-tooltip-color` | `color.fg.primary` | `#1d1c1a` |
| `chart.tooltip.font-size` | `--mx-chart-tooltip-font-size` | `font.size.caption` | `0.75rem` |
| `chart.tooltip.line-height` | `--mx-chart-tooltip-line-height` | `font.line.caption` | `1rem` |
| `chart.tooltip.border-width` | `--mx-chart-tooltip-border-width` | `border.width.1` | `1px` |
| `chart.tooltip.border-color` | `--mx-chart-tooltip-border-color` | `color.stroke.surface` | `rgb(117 117 117 / 0.4)` |
| `chart.tooltip.shadow` | `--mx-chart-tooltip-shadow` | `elevation.tooltip` | `0px 4px 8px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `chart.tooltip-title.color` | `--mx-chart-tooltip-title-color` | `color.fg.secondary` | `#5e5c55` |
| `chart.tooltip-title.margin-bottom` | `--mx-chart-tooltip-title-margin-bottom` | `space.1` | `0.25rem` |
| `chart.tooltip-row.gap` | `--mx-chart-tooltip-row-gap` | `space.2` | `0.5rem` |
| `chart.tooltip-row.active.font-weight` | `--mx-chart-tooltip-row-active-font-weight` | `font.weight.semibold` | `600` |
| `chart.tooltip-key.width` | `--mx-chart-tooltip-key-width` | `` | `12px` |
| `chart.tooltip-key.height` | `--mx-chart-tooltip-key-height` | `` | `3px` |
| `chart.tooltip-key.radius` | `--mx-chart-tooltip-key-radius` | `radius.xs` | `0.25rem` |
| `chart.tooltip-value.color` | `--mx-chart-tooltip-value-color` | `color.fg.primary` | `#1d1c1a` |
| `chart.tooltip-value.font-weight` | `--mx-chart-tooltip-value-font-weight` | `font.weight.semibold` | `600` |
| `chart.tooltip-name.color` | `--mx-chart-tooltip-name-color` | `color.fg.secondary` | `#5e5c55` |
| `chart.legend.gap` | `--mx-chart-legend-gap` | `space.4` | `1rem` |
| `chart.legend.padding-top` | `--mx-chart-legend-padding-top` | `space.1` | `0.25rem` |
| `chart.legend-item.color` | `--mx-chart-legend-item-color` | `color.fg.secondary` | `#5e5c55` |
| `chart.legend-item.gap` | `--mx-chart-legend-item-gap` | `space.2` | `0.5rem` |
| `chart.legend-item.padding-block` | `--mx-chart-legend-item-padding-block` | `space.1` | `0.25rem` |
| `chart.legend-item.radius` | `--mx-chart-legend-item-radius` | `radius.sm` | `0.25rem` |
| `chart.legend-item.font-size` | `--mx-chart-legend-item-font-size` | `font.size.caption` | `0.75rem` |
| `chart.legend-item.line-height` | `--mx-chart-legend-item-line-height` | `font.line.caption` | `1rem` |
| `chart.legend-item.hover.color` | `--mx-chart-legend-item-hover-color` | `color.fg.primary` | `#1d1c1a` |
| `chart.legend-item.focus.glow` | `--mx-chart-legend-item-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `chart.legend-item.focus.outline-width` | `--mx-chart-legend-item-focus-outline-width` | `focus.ring.width` | `2px` |
| `chart.legend-item.focus.outline-color` | `--mx-chart-legend-item-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `chart.legend-item.focus.outline-offset` | `--mx-chart-legend-item-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `chart.legend-item.off.color` | `--mx-chart-legend-item-off-color` | `color.fg.disabled` | `#a2a098` |
| `chart.legend-key.width` | `--mx-chart-legend-key-width` | `` | `12px` |
| `chart.legend-key.height` | `--mx-chart-legend-key-height` | `` | `12px` |
| `chart.legend-key.radius` | `--mx-chart-legend-key-radius` | `radius.xs` | `0.25rem` |
| `chart.table.radius` | `--mx-chart-table-radius` | `radius.sm` | `0.25rem` |
| `chart.table.font-size` | `--mx-chart-table-font-size` | `font.size.caption` | `0.75rem` |
| `chart.table-head.color` | `--mx-chart-table-head-color` | `color.fg.secondary` | `#5e5c55` |
| `chart.table-head.font-weight` | `--mx-chart-table-head-font-weight` | `font.weight.medium` | `500` |
| `chart.table-head.padding-block` | `--mx-chart-table-head-padding-block` | `space.2` | `0.5rem` |
| `chart.table-head.padding-inline` | `--mx-chart-table-head-padding-inline` | `space.3` | `0.75rem` |
| `chart.table-head.border-bottom-width` | `--mx-chart-table-head-border-bottom-width` | `border.width.1` | `1px` |
| `chart.table-head.border-bottom-color` | `--mx-chart-table-head-border-bottom-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `chart.table-cell.color` | `--mx-chart-table-cell-color` | `color.fg.primary` | `#1d1c1a` |
| `chart.table-cell.padding-block` | `--mx-chart-table-cell-padding-block` | `space.2` | `0.5rem` |
| `chart.table-cell.padding-inline` | `--mx-chart-table-cell-padding-inline` | `space.3` | `0.75rem` |
| `chart.table-cell.border-bottom-width` | `--mx-chart-table-cell-border-bottom-width` | `border.width.1` | `1px` |
| `chart.table-cell.border-bottom-color` | `--mx-chart-table-cell-border-bottom-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `chart.rise` | `--mx-chart-rise` | `color.success.fg` | `#006402` |
| `chart.fall` | `--mx-chart-fall` | `color.danger.fg` | `#b03659` |
| `chart.connector` | `--mx-chart-connector` | `color.chart.grid` | `rgb(0 0 0 / 0.1)` |
| `chart.wick-width` | `--mx-chart-wick-width` | `border.width.1` | `1px` |
| `chart.scale-low` | `--mx-chart-scale-low` | `color.chart.scale-low` | `#fbe6e0` |
| `chart.scale-high` | `--mx-chart-scale-high` | `color.chart.scale-high` | `#781d00` |
| `chart.scale-negative` | `--mx-chart-scale-negative` | `color.chart.scale-negative` | `#ab3511` |
| `chart.scale-middle` | `--mx-chart-scale-middle` | `color.chart.scale-middle` | `#eae7e6` |
| `chart.scale-positive` | `--mx-chart-scale-positive` | `color.chart.scale-positive` | `#0465af` |
| `chart.cell-radius` | `--mx-chart-cell-radius` | `` | `2px` |
| `chart.slice-lift` | `--mx-chart-slice-lift` | `` | `6px` |
| `chart.donut-hole` | `--mx-chart-donut-hole` | `` | `0.6` |
| `chart.center-value.color` | `--mx-chart-center-value-color` | `color.fg.primary` | `#1d1c1a` |
| `chart.center-value.font-size` | `--mx-chart-center-value-font-size` | `font.size.title` | `1.75rem` |
| `chart.center-value.font-weight` | `--mx-chart-center-value-font-weight` | `font.weight.semibold` | `600` |
| `chart.center-label.color` | `--mx-chart-center-label-color` | `color.fg.secondary` | `#5e5c55` |
| `chart.center-label.font-size` | `--mx-chart-center-label-font-size` | `font.size.caption` | `0.75rem` |
| `checkbox.gap` | `--mx-checkbox-gap` | `space.2` | `0.5rem` |
| `checkbox.size.sm` | `--mx-checkbox-size-sm` | `` | `0.875rem` |
| `checkbox.size.md` | `--mx-checkbox-size-md` | `icon.size.md` | `1rem` |
| `checkbox.size.lg` | `--mx-checkbox-size-lg` | `icon.size.lg` | `1.25rem` |
| `checkbox.mark-size.sm` | `--mx-checkbox-mark-size-sm` | `icon.size.sm` | `0.75rem` |
| `checkbox.mark-size.md` | `--mx-checkbox-mark-size-md` | `icon.size.sm` | `0.75rem` |
| `checkbox.mark-size.lg` | `--mx-checkbox-mark-size-lg` | `icon.size.md` | `1rem` |
| `checkbox.height.sm` | `--mx-checkbox-height-sm` | `control.height.sm` | `1.5rem` |
| `checkbox.height.md` | `--mx-checkbox-height-md` | `control.height.md` | `2rem` |
| `checkbox.height.lg` | `--mx-checkbox-height-lg` | `control.height.lg` | `2.5rem` |
| `checkbox.font-size.sm` | `--mx-checkbox-font-size-sm` | `font.size.caption` | `0.75rem` |
| `checkbox.font-size.md` | `--mx-checkbox-font-size-md` | `font.size.body` | `0.875rem` |
| `checkbox.font-size.lg` | `--mx-checkbox-font-size-lg` | `font.size.body-large` | `1.125rem` |
| `checkbox.press-offset` | `--mx-checkbox-press-offset` | `control.press.offset` | `1px` |
| `checkbox.focus-scope` | `--mx-checkbox-focus-scope` | `` | `box` |
| `checkbox.field.label-mode` | `--mx-checkbox-field-label-mode` | `` | `top` |
| `checkbox.field.variant` | `--mx-checkbox-field-variant` | `` | `outline` |
| `checkbox.field.padding.sm` | `--mx-checkbox-field-padding-sm` | `` | `0px` |
| `checkbox.field.padding.md` | `--mx-checkbox-field-padding-md` | `` | `0px` |
| `checkbox.field.padding.lg` | `--mx-checkbox-field-padding-lg` | `` | `0px` |
| `checkbox.field.border-width` | `--mx-checkbox-field-border-width` | `` | `0px` |
| `checkbox.field.padding-start.sm` | `--mx-checkbox-field-padding-start-sm` | `` | `0px` |
| `checkbox.field.padding-start.md` | `--mx-checkbox-field-padding-start-md` | `` | `0px` |
| `checkbox.field.padding-start.lg` | `--mx-checkbox-field-padding-start-lg` | `` | `0px` |
| `checkbox.field.padding-end.sm` | `--mx-checkbox-field-padding-end-sm` | `` | `0px` |
| `checkbox.field.padding-end.md` | `--mx-checkbox-field-padding-end-md` | `` | `0px` |
| `checkbox.field.padding-end.lg` | `--mx-checkbox-field-padding-end-lg` | `` | `0px` |
| `checkbox.field.box.bg` | `--mx-checkbox-field-box-bg` | `` | `rgb(0 0 0 / 0)` |
| `checkbox.field.box.hover.bg` | `--mx-checkbox-field-box-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `checkbox.field.box.focus.bg` | `--mx-checkbox-field-box-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `checkbox.field.box.focus.shadow` | `--mx-checkbox-field-box-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `checkbox.field.box.radius` | `--mx-checkbox-field-box-radius` | `` | `0px` |
| `checkbox.field.box.shadow` | `--mx-checkbox-field-box-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `checkbox.field.box.cursor` | `--mx-checkbox-field-box-cursor` | `` | `default` |
| `checkbox.field.box.disabled.bg` | `--mx-checkbox-field-box-disabled-bg` | `` | `rgb(0 0 0 / 0)` |
| `checkbox.field.box.disabled.shadow` | `--mx-checkbox-field-box-disabled-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `checkbox.field.box.invalid-hover.bg` | `--mx-checkbox-field-box-invalid-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `checkbox.field.box.invalid-focus.bg` | `--mx-checkbox-field-box-invalid-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `checkbox.field.box.invalid-focus.shadow` | `--mx-checkbox-field-box-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `checkbox.field.box.readonly-focus.shadow` | `--mx-checkbox-field-box-readonly-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `checkbox.field.box.readonly-invalid-focus.shadow` | `--mx-checkbox-field-box-readonly-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `checkbox.field.frame.display` | `--mx-checkbox-field-frame-display` | `` | `none` |
| `checkbox.field.indicator.display` | `--mx-checkbox-field-indicator-display` | `` | `none` |
| `checkbox.label.font-weight` | `--mx-checkbox-label-font-weight` | `font.weight.regular` | `400` |
| `checkbox.label.color` | `--mx-checkbox-label-color` | `color.fg.primary` | `#1d1c1a` |
| `checkbox.label.disabled.color` | `--mx-checkbox-label-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `checkbox.box.bg` | `--mx-checkbox-box-bg` | `color.fill.control.default` | `#f5f4f0` |
| `checkbox.box.border-width` | `--mx-checkbox-box-border-width` | `border.width.1` | `1px` |
| `checkbox.box.border-color` | `--mx-checkbox-box-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `checkbox.box.radius` | `--mx-checkbox-box-radius` | `radius.xs` | `0.25rem` |
| `checkbox.box.shadow` | `--mx-checkbox-box-shadow` | `` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0 1px 0 rgb(0 0 0 / 0.3)` |
| `checkbox.box.checked.bg` | `--mx-checkbox-box-checked-bg` | `color.accent.solid` | `#c24523` |
| `checkbox.box.checked.border-color` | `--mx-checkbox-box-checked-border-color` | `color.accent.solid` | `#c24523` |
| `checkbox.box.checked.shadow` | `--mx-checkbox-box-checked-shadow` | `` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0 1px 0 rgb(0 0 0 / 0.4)` |
| `checkbox.box.mixed.bg` | `--mx-checkbox-box-mixed-bg` | `color.accent.solid` | `#c24523` |
| `checkbox.box.mixed.border-color` | `--mx-checkbox-box-mixed-border-color` | `color.accent.solid` | `#c24523` |
| `checkbox.box.mixed.shadow` | `--mx-checkbox-box-mixed-shadow` | `` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0 1px 0 rgb(0 0 0 / 0.4)` |
| `checkbox.box.invalid.border-color` | `--mx-checkbox-box-invalid-border-color` | `color.danger.solid` | `#b03659` |
| `checkbox.box.invalid.shadow` | `--mx-checkbox-box-invalid-shadow` | `` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0 1px 0 #b03659` |
| `checkbox.box.hover.bg` | `--mx-checkbox-box-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `checkbox.box.hover.border-color` | `--mx-checkbox-box-hover-border-color` | `` | `initial` |
| `checkbox.box.checked-hover.bg` | `--mx-checkbox-box-checked-hover-bg` | `color.accent.solid-hover` | `#b43f20` |
| `checkbox.box.checked-hover.border-color` | `--mx-checkbox-box-checked-hover-border-color` | `` | `initial` |
| `checkbox.box.mixed-hover.bg` | `--mx-checkbox-box-mixed-hover-bg` | `color.accent.solid-hover` | `#b43f20` |
| `checkbox.box.mixed-hover.border-color` | `--mx-checkbox-box-mixed-hover-border-color` | `` | `initial` |
| `checkbox.box.invalid-hover.border-color` | `--mx-checkbox-box-invalid-hover-border-color` | `color.danger.solid` | `#b03659` |
| `checkbox.box.pressed.bg` | `--mx-checkbox-box-pressed-bg` | `color.fill.control.tertiary` | `#e1e0da` |
| `checkbox.box.pressed.border-color` | `--mx-checkbox-box-pressed-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `checkbox.box.pressed.shadow` | `--mx-checkbox-box-pressed-shadow` | `` | `0 0 #0000` |
| `checkbox.box.checked-pressed.bg` | `--mx-checkbox-box-checked-pressed-bg` | `color.accent.solid-pressed` | `#a1381c` |
| `checkbox.box.checked-pressed.border-color` | `--mx-checkbox-box-checked-pressed-border-color` | `color.accent.solid` | `#c24523` |
| `checkbox.box.checked-pressed.shadow` | `--mx-checkbox-box-checked-pressed-shadow` | `` | `0 0 #0000` |
| `checkbox.box.mixed-pressed.bg` | `--mx-checkbox-box-mixed-pressed-bg` | `color.accent.solid-pressed` | `#a1381c` |
| `checkbox.box.mixed-pressed.border-color` | `--mx-checkbox-box-mixed-pressed-border-color` | `color.accent.solid` | `#c24523` |
| `checkbox.box.mixed-pressed.shadow` | `--mx-checkbox-box-mixed-pressed-shadow` | `` | `0 0 #0000` |
| `checkbox.box.invalid-pressed.border-color` | `--mx-checkbox-box-invalid-pressed-border-color` | `color.danger.solid` | `#b03659` |
| `checkbox.box.focus.outline-width` | `--mx-checkbox-box-focus-outline-width` | `focus.ring.width` | `2px` |
| `checkbox.box.focus.outline-color` | `--mx-checkbox-box-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `checkbox.box.focus.outline-offset` | `--mx-checkbox-box-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `checkbox.box.focus.glow` | `--mx-checkbox-box-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `checkbox.box.checked-focus.glow` | `--mx-checkbox-box-checked-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `checkbox.box.mixed-focus.glow` | `--mx-checkbox-box-mixed-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `checkbox.box.invalid-focus.glow` | `--mx-checkbox-box-invalid-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `checkbox.box.pressed-focus.glow` | `--mx-checkbox-box-pressed-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `checkbox.box.pressed-focus.shadow` | `--mx-checkbox-box-pressed-focus-shadow` | `` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0 1px 0 rgb(0 0 0 / 0.3)` |
| `checkbox.box.checked-pressed-focus.glow` | `--mx-checkbox-box-checked-pressed-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `checkbox.box.checked-pressed-focus.shadow` | `--mx-checkbox-box-checked-pressed-focus-shadow` | `` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0 1px 0 rgb(0 0 0 / 0.4)` |
| `checkbox.box.mixed-pressed-focus.glow` | `--mx-checkbox-box-mixed-pressed-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `checkbox.box.mixed-pressed-focus.shadow` | `--mx-checkbox-box-mixed-pressed-focus-shadow` | `` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0 1px 0 rgb(0 0 0 / 0.4)` |
| `checkbox.box.invalid-pressed-focus.glow` | `--mx-checkbox-box-invalid-pressed-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `checkbox.box.invalid-pressed-focus.shadow` | `--mx-checkbox-box-invalid-pressed-focus-shadow` | `` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0 1px 0 #b03659` |
| `checkbox.box.disabled.bg` | `--mx-checkbox-box-disabled-bg` | `color.fill.control.disabled` | `#ebeae5` |
| `checkbox.box.disabled.border-color` | `--mx-checkbox-box-disabled-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `checkbox.box.disabled.shadow` | `--mx-checkbox-box-disabled-shadow` | `` | `0 0 #0000` |
| `checkbox.box.checked-disabled.bg` | `--mx-checkbox-box-checked-disabled-bg` | `color.fill.accent-disabled` | `rgb(0 0 0 / 0.2169)` |
| `checkbox.box.checked-disabled.border-color` | `--mx-checkbox-box-checked-disabled-border-color` | `` | `rgb(0 0 0 / 0)` |
| `checkbox.box.checked-disabled.shadow` | `--mx-checkbox-box-checked-disabled-shadow` | `` | `0 0 #0000` |
| `checkbox.overlay.color` | `--mx-checkbox-overlay-color` | `color.accent.on-solid` | `#ffffff` |
| `checkbox.overlay.disabled.color` | `--mx-checkbox-overlay-disabled-color` | `color.fg.on-accent-disabled` | `#ffffff` |
| `checkbox.mark.icon` | `--mx-checkbox-mark-icon` | `` | `var(--mx-icon-check)` |
| `checkbox.dash.icon` | `--mx-checkbox-dash-icon` | `` | `var(--mx-icon-dash)` |
| `chip-group.gap` | `--mx-chip-group-gap` | `space.2` | `0.5rem` |
| `chip.variant` | `--mx-chip-variant` | `` | `filled` |
| `chip.check` | `--mx-chip-check` | `` | `none` |
| `chip.height.sm` | `--mx-chip-height-sm` | `` | `1.5rem` |
| `chip.height.md` | `--mx-chip-height-md` | `` | `2rem` |
| `chip.height.lg` | `--mx-chip-height-lg` | `` | `2.5rem` |
| `chip.font-size.sm` | `--mx-chip-font-size-sm` | `font.size.caption` | `0.75rem` |
| `chip.font-size.md` | `--mx-chip-font-size-md` | `font.size.body` | `0.875rem` |
| `chip.font-size.lg` | `--mx-chip-font-size-lg` | `` | `1rem` |
| `chip.padding.sm` | `--mx-chip-padding-sm` | `` | `0.625rem` |
| `chip.padding.md` | `--mx-chip-padding-md` | `` | `0.75rem` |
| `chip.padding.lg` | `--mx-chip-padding-lg` | `` | `1rem` |
| `chip.icon-inset.sm` | `--mx-chip-icon-inset-sm` | `` | `0.375rem` |
| `chip.icon-inset.md` | `--mx-chip-icon-inset-md` | `` | `0.5rem` |
| `chip.icon-inset.lg` | `--mx-chip-icon-inset-lg` | `` | `0.625rem` |
| `chip.gap.sm` | `--mx-chip-gap-sm` | `` | `0.25rem` |
| `chip.gap.md` | `--mx-chip-gap-md` | `` | `0.375rem` |
| `chip.gap.lg` | `--mx-chip-gap-lg` | `` | `0.5rem` |
| `chip.icon-size.sm` | `--mx-chip-icon-size-sm` | `` | `0.875rem` |
| `chip.icon-size.md` | `--mx-chip-icon-size-md` | `` | `1.125rem` |
| `chip.icon-size.lg` | `--mx-chip-icon-size-lg` | `` | `1.25rem` |
| `chip.avatar-size.sm` | `--mx-chip-avatar-size-sm` | `` | `1rem` |
| `chip.avatar-size.md` | `--mx-chip-avatar-size-md` | `` | `1.5rem` |
| `chip.avatar-size.lg` | `--mx-chip-avatar-size-lg` | `` | `1.75rem` |
| `chip.remove-size.sm` | `--mx-chip-remove-size-sm` | `` | `1rem` |
| `chip.remove-size.md` | `--mx-chip-remove-size-md` | `` | `1.25rem` |
| `chip.remove-size.lg` | `--mx-chip-remove-size-lg` | `` | `1.5rem` |
| `chip.chip.bg` | `--mx-chip-chip-bg` | `color.fill.neutral` | `#ebeae5` |
| `chip.chip.color` | `--mx-chip-chip-color` | `color.fg.primary` | `#1d1c1a` |
| `chip.chip.radius` | `--mx-chip-chip-radius` | `radius.full` | `9999px` |
| `chip.chip.font-weight` | `--mx-chip-chip-font-weight` | `font.weight.medium` | `500` |
| `chip.chip.border-width` | `--mx-chip-chip-border-width` | `border.width.1` | `1px` |
| `chip.chip.border-color` | `--mx-chip-chip-border-color` | `` | `rgb(0 0 0 / 0)` |
| `chip.chip.outline.bg` | `--mx-chip-chip-outline-bg` | `` | `rgb(0 0 0 / 0)` |
| `chip.chip.outline.border-color` | `--mx-chip-chip-outline-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `chip.chip.accent.bg` | `--mx-chip-chip-accent-bg` | `color.accent.subtle` | `#fbe6de` |
| `chip.chip.accent.color` | `--mx-chip-chip-accent-color` | `color.accent.on-subtle` | `#983318` |
| `chip.chip.outline-accent.color` | `--mx-chip-chip-outline-accent-color` | `color.accent.fg` | `#983318` |
| `chip.chip.outline-accent.border-color` | `--mx-chip-chip-outline-accent-border-color` | `color.accent.fg` | `#983318` |
| `chip.chip.success.bg` | `--mx-chip-chip-success-bg` | `color.success.subtle` | `#dff6dd` |
| `chip.chip.success.color` | `--mx-chip-chip-success-color` | `color.success.fg` | `#006402` |
| `chip.chip.outline-success.color` | `--mx-chip-chip-outline-success-color` | `color.success.fg` | `#006402` |
| `chip.chip.outline-success.border-color` | `--mx-chip-chip-outline-success-border-color` | `color.success.fg` | `#006402` |
| `chip.chip.caution.bg` | `--mx-chip-chip-caution-bg` | `color.caution.subtle` | `#fff4ce` |
| `chip.chip.caution.color` | `--mx-chip-chip-caution-color` | `color.caution.fg` | `#754702` |
| `chip.chip.outline-caution.color` | `--mx-chip-chip-outline-caution-color` | `color.caution.fg` | `#754702` |
| `chip.chip.outline-caution.border-color` | `--mx-chip-chip-outline-caution-border-color` | `color.caution.fg` | `#754702` |
| `chip.chip.danger.bg` | `--mx-chip-chip-danger-bg` | `color.danger.subtle` | `#fde7e9` |
| `chip.chip.danger.color` | `--mx-chip-chip-danger-color` | `color.danger.fg` | `#b03659` |
| `chip.chip.outline-danger.color` | `--mx-chip-chip-outline-danger-color` | `color.danger.fg` | `#b03659` |
| `chip.chip.outline-danger.border-color` | `--mx-chip-chip-outline-danger-border-color` | `color.danger.fg` | `#b03659` |
| `chip.chip.selected.bg` | `--mx-chip-chip-selected-bg` | `color.accent.subtle` | `#fbe6de` |
| `chip.chip.selected.color` | `--mx-chip-chip-selected-color` | `color.accent.on-subtle` | `#983318` |
| `chip.chip.selected.border-color` | `--mx-chip-chip-selected-border-color` | `` | `rgb(0 0 0 / 0)` |
| `chip.chip.hover.image` | `--mx-chip-chip-hover-image` | `` | `linear-gradient(color-mix(in srgb, currentcolor 6%, transparent), color-mix(in srgb, currentcolor 6%, transparent))` |
| `chip.chip.pressed.image` | `--mx-chip-chip-pressed-image` | `` | `linear-gradient(color-mix(in srgb, currentcolor 10%, transparent), color-mix(in srgb, currentcolor 10%, transparent))` |
| `chip.chip.focus.glow` | `--mx-chip-chip-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `chip.chip.focus.outline-width` | `--mx-chip-chip-focus-outline-width` | `focus.ring.width` | `2px` |
| `chip.chip.focus.outline-color` | `--mx-chip-chip-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `chip.chip.focus.outline-offset` | `--mx-chip-chip-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `chip.chip.focus.image` | `--mx-chip-chip-focus-image` | `` | `initial` |
| `chip.chip.disabled.opacity` | `--mx-chip-chip-disabled-opacity` | `opacity.disabled` | `0.5` |
| `chip.chip.info.bg` | `--mx-chip-chip-info-bg` | `` | `initial` |
| `chip.chip.info.color` | `--mx-chip-chip-info-color` | `` | `initial` |
| `chip.chip.outline-info.color` | `--mx-chip-chip-outline-info-color` | `` | `initial` |
| `chip.chip.outline-info.border-color` | `--mx-chip-chip-outline-info-border-color` | `` | `initial` |
| `chip.avatar.bg` | `--mx-chip-avatar-bg` | `color.bg.surface` | `#f8f7f3` |
| `chip.remove.radius` | `--mx-chip-remove-radius` | `radius.full` | `9999px` |
| `chip.remove.color` | `--mx-chip-remove-color` | `color.fg.secondary` | `#5e5c55` |
| `chip.remove.hover.image` | `--mx-chip-remove-hover-image` | `` | `linear-gradient(color-mix(in srgb, currentcolor 12%, transparent), color-mix(in srgb, currentcolor 12%, transparent))` |
| `chip.remove.pressed.image` | `--mx-chip-remove-pressed-image` | `` | `linear-gradient(color-mix(in srgb, currentcolor 18%, transparent), color-mix(in srgb, currentcolor 18%, transparent))` |
| `color-box.swatch-size` | `--mx-color-box-swatch-size` | `` | `1.25rem` |
| `color-box.popup-gap` | `--mx-color-box-popup-gap` | `space.3` | `0.75rem` |
| `color-box.checker-size` | `--mx-color-box-checker-size` | `` | `0.25rem` |
| `color-box.checker-light` | `--mx-color-box-checker-light` | `` | `#ffffff` |
| `color-box.checker-dark` | `--mx-color-box-checker-dark` | `` | `#cccccc` |
| `color-box.swatch.radius` | `--mx-color-box-swatch-radius` | `radius.sm` | `0.25rem` |
| `color-box.swatch.border-width` | `--mx-color-box-swatch-border-width` | `border.width.1` | `1px` |
| `color-box.swatch.border-color` | `--mx-color-box-swatch-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `color-picker.width` | `--mx-color-picker-width` | `` | `15rem` |
| `color-picker.gap` | `--mx-color-picker-gap` | `space.3` | `0.75rem` |
| `color-picker.area-height` | `--mx-color-picker-area-height` | `` | `9.5rem` |
| `color-picker.strip-height` | `--mx-color-picker-strip-height` | `` | `0.75rem` |
| `color-picker.thumb-size` | `--mx-color-picker-thumb-size` | `` | `1.125rem` |
| `color-picker.preview-size` | `--mx-color-picker-preview-size` | `` | `2rem` |
| `color-picker.swatch-size` | `--mx-color-picker-swatch-size` | `` | `1.5rem` |
| `color-picker.swatch-gap` | `--mx-color-picker-swatch-gap` | `space.2` | `0.5rem` |
| `color-picker.checker-size` | `--mx-color-picker-checker-size` | `` | `0.375rem` |
| `color-picker.checker-light` | `--mx-color-picker-checker-light` | `` | `#ffffff` |
| `color-picker.checker-dark` | `--mx-color-picker-checker-dark` | `` | `#cccccc` |
| `color-picker.area.radius` | `--mx-color-picker-area-radius` | `radius.md` | `0.375rem` |
| `color-picker.strip.radius` | `--mx-color-picker-strip-radius` | `radius.full` | `9999px` |
| `color-picker.thumb.radius` | `--mx-color-picker-thumb-radius` | `radius.full` | `9999px` |
| `color-picker.thumb.border-width` | `--mx-color-picker-thumb-border-width` | `border.width.2` | `2px` |
| `color-picker.thumb.border-color` | `--mx-color-picker-thumb-border-color` | `` | `#ffffff` |
| `color-picker.thumb.shadow` | `--mx-color-picker-thumb-shadow` | `elevation.card` | `0px 1px 2px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `color-picker.thumb.focus.glow` | `--mx-color-picker-thumb-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `color-picker.thumb.focus.outline-width` | `--mx-color-picker-thumb-focus-outline-width` | `focus.ring.width` | `2px` |
| `color-picker.thumb.focus.outline-color` | `--mx-color-picker-thumb-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `color-picker.thumb.focus.outline-offset` | `--mx-color-picker-thumb-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `color-picker.preview.radius` | `--mx-color-picker-preview-radius` | `radius.sm` | `0.25rem` |
| `color-picker.preview.border-width` | `--mx-color-picker-preview-border-width` | `border.width.1` | `1px` |
| `color-picker.preview.border-color` | `--mx-color-picker-preview-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `color-picker.swatch.radius` | `--mx-color-picker-swatch-radius` | `radius.sm` | `0.25rem` |
| `color-picker.swatch.border-width` | `--mx-color-picker-swatch-border-width` | `border.width.1` | `1px` |
| `color-picker.swatch.border-color` | `--mx-color-picker-swatch-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `color-picker.swatch.cursor` | `--mx-color-picker-swatch-cursor` | `` | `pointer` |
| `color-picker.swatch.hover.scale` | `--mx-color-picker-swatch-hover-scale` | `` | `[object Object]` |
| `color-picker.swatch.selected.outline-width` | `--mx-color-picker-swatch-selected-outline-width` | `border.width.2` | `2px` |
| `color-picker.swatch.selected.outline-color` | `--mx-color-picker-swatch-selected-outline-color` | `color.accent.solid` | `#c24523` |
| `color-picker.swatch.selected.outline-offset` | `--mx-color-picker-swatch-selected-outline-offset` | `border.width.1` | `1px` |
| `color-picker.swatch.focus.glow` | `--mx-color-picker-swatch-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `color-picker.swatch.focus.outline-width` | `--mx-color-picker-swatch-focus-outline-width` | `focus.ring.width` | `2px` |
| `color-picker.swatch.focus.outline-color` | `--mx-color-picker-swatch-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `color-picker.swatch.focus.outline-offset` | `--mx-color-picker-swatch-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `combo-box.field.variant` | `--mx-combo-box-field-variant` | `` | `outline` |
| `combo-box.field.box.bg` | `--mx-combo-box-field-box-bg` | `color.fill.control.default` | `#f5f4f0` |
| `combo-box.field.box.hover.bg` | `--mx-combo-box-field-box-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `combo-box.field.box.focus.bg` | `--mx-combo-box-field-box-focus-bg` | `color.bg.surface` | `#f8f7f3` |
| `combo-box.field.box.focus.shadow` | `--mx-combo-box-field-box-focus-shadow` | `` | `inset 0px 1px 2px 0px rgb(0 0 0 / 0.12)` |
| `combo-box.field.box.radius` | `--mx-combo-box-field-box-radius` | `radius.md` | `0.375rem` |
| `combo-box.field.box.shadow` | `--mx-combo-box-field-box-shadow` | `` | `inset 0px 1px 2px 0px rgb(0 0 0 / 0.12)` |
| `combo-box.field.frame.border-color` | `--mx-combo-box-field-frame-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `combo-box.field.frame.hover.border-color` | `--mx-combo-box-field-frame-hover-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `combo-box.field.frame.hover.border-bottom-color` | `--mx-combo-box-field-frame-hover-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `combo-box.field.frame.focus.border-color` | `--mx-combo-box-field-frame-focus-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `combo-box.field.frame.focus.border-bottom-color` | `--mx-combo-box-field-frame-focus-border-bottom-color` | `color.accent.solid` | `#c24523` |
| `combo-box.field.frame.focus.border-width` | `--mx-combo-box-field-frame-focus-border-width` | `border.width.1` | `1px` |
| `combo-box.field.frame.border-bottom-color` | `--mx-combo-box-field-frame-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `combo-box.arrow-glyph.icon` | `--mx-combo-box-arrow-glyph-icon` | `` | `var(--mx-icon-chevron-down)` |
| `combo-box.arrow-glyph.open.rotate` | `--mx-combo-box-arrow-glyph-open-rotate` | `` | `0.5turn` |
| `combo-box.loading.color` | `--mx-combo-box-loading-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.record-height` | `--mx-datagrid-record-height` | `control.height.md` | `2rem` |
| `datagrid.row-space` | `--mx-datagrid-row-space` | `space.1` | `0.25rem` |
| `datagrid.cell-inset` | `--mx-datagrid-cell-inset` | `control.padding.sm` | `0.5rem` |
| `datagrid.icon-size` | `--mx-datagrid-icon-size` | `icon.size.sm` | `0.75rem` |
| `datagrid.button-size` | `--mx-datagrid-button-size` | `control.height.sm` | `1.5rem` |
| `datagrid.resize-hit-width` | `--mx-datagrid-resize-hit-width` | `space.2` | `0.5rem` |
| `datagrid.group-indent` | `--mx-datagrid-group-indent` | `space.5` | `1.25rem` |
| `datagrid.chip-spacing` | `--mx-datagrid-chip-spacing` | `space.1` | `0.25rem` |
| `datagrid.adaptive-gap` | `--mx-datagrid-adaptive-gap` | `space.2` | `0.5rem` |
| `datagrid.adaptive-label-column` | `--mx-datagrid-adaptive-label-column` | `` | `8rem` |
| `datagrid.values-window-width` | `--mx-datagrid-values-window-width` | `` | `16rem` |
| `datagrid.values-row-height` | `--mx-datagrid-values-row-height` | `control.height.sm` | `1.5rem` |
| `datagrid.page-number-width` | `--mx-datagrid-page-number-width` | `` | `4rem` |
| `datagrid.page-size-width` | `--mx-datagrid-page-size-width` | `` | `5.5rem` |
| `datagrid.export-max-width` | `--mx-datagrid-export-max-width` | `` | `22rem` |
| `datagrid.export-inset` | `--mx-datagrid-export-inset` | `space.3` | `0.75rem` |
| `datagrid.loading-inset` | `--mx-datagrid-loading-inset` | `control.padding.sm` | `0.5rem` |
| `datagrid.loading-inset-block` | `--mx-datagrid-loading-inset-block` | `` | `35%` |
| `datagrid.row-line-width` | `--mx-datagrid-row-line-width` | `border.width.1` | `1px` |
| `datagrid.hover-tint` | `--mx-datagrid-hover-tint` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `datagrid.stripe-tint` | `--mx-datagrid-stripe-tint` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `datagrid.active-tint` | `--mx-datagrid-active-tint` | `color.accent.subtle` | `#fbe6de` |
| `datagrid.new-tint` | `--mx-datagrid-new-tint` | `color.success.subtle` | `#dff6dd` |
| `datagrid.pinned-edge-width` | `--mx-datagrid-pinned-edge-width` | `border.width.1` | `1px` |
| `datagrid.pinned-edge-color` | `--mx-datagrid-pinned-edge-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `datagrid.range-fill` | `--mx-datagrid-range-fill` | `color.accent.solid` | `#c24523` |
| `datagrid.range-fill-opacity` | `--mx-datagrid-range-fill-opacity` | `` | `0.14` |
| `datagrid.range-selected-fill` | `--mx-datagrid-range-selected-fill` | `color.accent.subtle` | `#fbe6de` |
| `datagrid.range-border-color` | `--mx-datagrid-range-border-color` | `color.accent.solid` | `#c24523` |
| `datagrid.range-border-width` | `--mx-datagrid-range-border-width` | `border.width.2` | `2px` |
| `datagrid.range-anchor-fill` | `--mx-datagrid-range-anchor-fill` | `color.bg.surface` | `#f8f7f3` |
| `datagrid.row-run-border-color` | `--mx-datagrid-row-run-border-color` | `color.accent.solid` | `#c24523` |
| `datagrid.row-run-border-width` | `--mx-datagrid-row-run-border-width` | `border.width.2` | `2px` |
| `datagrid.search-mark-line` | `--mx-datagrid-search-mark-line` | `color.caution.fg` | `#754702` |
| `datagrid.search-mark-thickness` | `--mx-datagrid-search-mark-thickness` | `border.width.2` | `2px` |
| `datagrid.search-mark-offset` | `--mx-datagrid-search-mark-offset` | `border.width.2` | `2px` |
| `datagrid.filter-text-underline-width` | `--mx-datagrid-filter-text-underline-width` | `border.width.1` | `1px` |
| `datagrid.filter-text-underline-offset` | `--mx-datagrid-filter-text-underline-offset` | `space.1` | `0.25rem` |
| `datagrid.status-new-mark` | `--mx-datagrid-status-new-mark` | `` | `'+'` |
| `datagrid.status-changed-mark` | `--mx-datagrid-status-changed-mark` | `` | `'\270E'` |
| `datagrid.status-removed-mark` | `--mx-datagrid-status-removed-mark` | `` | `'\2212'` |
| `datagrid.status-saving-mark` | `--mx-datagrid-status-saving-mark` | `` | `'\2026'` |
| `datagrid.status-failed-mark` | `--mx-datagrid-status-failed-mark` | `` | `'!'` |
| `datagrid.group-toggle-rotate-open` | `--mx-datagrid-group-toggle-rotate-open` | `` | `90deg` |
| `datagrid.expand-rotate-open` | `--mx-datagrid-expand-rotate-open` | `` | `90deg` |
| `datagrid.step-back-rotate` | `--mx-datagrid-step-back-rotate` | `` | `90deg` |
| `datagrid.step-forward-rotate` | `--mx-datagrid-step-forward-rotate` | `` | `-90deg` |
| `datagrid.pager-button-size` | `--mx-datagrid-pager-button-size` | `` | `sm` |
| `datagrid.pager-step-variant` | `--mx-datagrid-pager-step-variant` | `` | `ghost` |
| `datagrid.pager-page-variant` | `--mx-datagrid-pager-page-variant` | `` | `ghost` |
| `datagrid.pager-page-tone` | `--mx-datagrid-pager-page-tone` | `` | `standard` |
| `datagrid.pager-current-variant` | `--mx-datagrid-pager-current-variant` | `` | `solid` |
| `datagrid.pager-current-tone` | `--mx-datagrid-pager-current-tone` | `` | `accent` |
| `datagrid.filter-editor.variant` | `--mx-datagrid-filter-editor-variant` | `` | `outline` |
| `datagrid.filter-editor.foot.display` | `--mx-datagrid-filter-editor-foot-display` | `` | `none` |
| `datagrid.cell-editor.variant` | `--mx-datagrid-cell-editor-variant` | `` | `outline` |
| `datagrid.cell-editor.padding.sm` | `--mx-datagrid-cell-editor-padding-sm` | `control.padding.sm` | `0.5rem` |
| `datagrid.cell-editor.padding.md` | `--mx-datagrid-cell-editor-padding-md` | `control.padding.sm` | `0.5rem` |
| `datagrid.cell-editor.padding.lg` | `--mx-datagrid-cell-editor-padding-lg` | `control.padding.sm` | `0.5rem` |
| `datagrid.cell-editor.border-width` | `--mx-datagrid-cell-editor-border-width` | `` | `0px` |
| `datagrid.cell-editor.padding-start.sm` | `--mx-datagrid-cell-editor-padding-start-sm` | `control.padding.sm` | `0.5rem` |
| `datagrid.cell-editor.padding-start.md` | `--mx-datagrid-cell-editor-padding-start-md` | `control.padding.sm` | `0.5rem` |
| `datagrid.cell-editor.padding-start.lg` | `--mx-datagrid-cell-editor-padding-start-lg` | `control.padding.sm` | `0.5rem` |
| `datagrid.cell-editor.padding-end.sm` | `--mx-datagrid-cell-editor-padding-end-sm` | `control.padding.sm` | `0.5rem` |
| `datagrid.cell-editor.padding-end.md` | `--mx-datagrid-cell-editor-padding-end-md` | `control.padding.sm` | `0.5rem` |
| `datagrid.cell-editor.padding-end.lg` | `--mx-datagrid-cell-editor-padding-end-lg` | `control.padding.sm` | `0.5rem` |
| `datagrid.cell-editor.box.bg` | `--mx-datagrid-cell-editor-box-bg` | `` | `rgb(0 0 0 / 0)` |
| `datagrid.cell-editor.box.hover.bg` | `--mx-datagrid-cell-editor-box-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `datagrid.cell-editor.box.focus.bg` | `--mx-datagrid-cell-editor-box-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `datagrid.cell-editor.box.focus.shadow` | `--mx-datagrid-cell-editor-box-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `datagrid.cell-editor.box.pressed.bg` | `--mx-datagrid-cell-editor-box-pressed-bg` | `` | `rgb(0 0 0 / 0)` |
| `datagrid.cell-editor.box.radius` | `--mx-datagrid-cell-editor-box-radius` | `` | `0px` |
| `datagrid.cell-editor.box.shadow` | `--mx-datagrid-cell-editor-box-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `datagrid.cell-editor.box.invalid-hover.bg` | `--mx-datagrid-cell-editor-box-invalid-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `datagrid.cell-editor.box.invalid-focus.bg` | `--mx-datagrid-cell-editor-box-invalid-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `datagrid.cell-editor.box.invalid-focus.shadow` | `--mx-datagrid-cell-editor-box-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `datagrid.cell-editor.box.readonly-focus.shadow` | `--mx-datagrid-cell-editor-box-readonly-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `datagrid.cell-editor.box.disabled.shadow` | `--mx-datagrid-cell-editor-box-disabled-shadow` | `` | `inset 0px 1px 2px 0px rgb(0 0 0 / 0.12)` |
| `datagrid.cell-editor.box.underline-focus.shadow` | `--mx-datagrid-cell-editor-box-underline-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `datagrid.cell-editor.box.underline-invalid-focus.shadow` | `--mx-datagrid-cell-editor-box-underline-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `datagrid.cell-editor.box.underline-readonly-focus.shadow` | `--mx-datagrid-cell-editor-box-underline-readonly-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `datagrid.cell-editor.box.underline-disabled.shadow` | `--mx-datagrid-cell-editor-box-underline-disabled-shadow` | `` | `inset 0px 1px 2px 0px rgb(0 0 0 / 0.12)` |
| `datagrid.cell-editor.box.readonly-invalid-focus.shadow` | `--mx-datagrid-cell-editor-box-readonly-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `datagrid.cell-editor.box.underline-readonly-invalid-focus.shadow` | `--mx-datagrid-cell-editor-box-underline-readonly-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `datagrid.cell-editor.frame.display` | `--mx-datagrid-cell-editor-frame-display` | `` | `none` |
| `datagrid.cell-editor.indicator.display` | `--mx-datagrid-cell-editor-indicator-display` | `` | `none` |
| `datagrid.cell-editor.foot.display` | `--mx-datagrid-cell-editor-foot-display` | `` | `none` |
| `datagrid.pager-field.foot.display` | `--mx-datagrid-pager-field-foot-display` | `` | `none` |
| `datagrid.header-filter-list.box.bg` | `--mx-datagrid-header-filter-list-box-bg` | `` | `rgb(0 0 0 / 0)` |
| `datagrid.header-filter-list.box.hover.bg` | `--mx-datagrid-header-filter-list-box-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `datagrid.header-filter-list.box.focus.bg` | `--mx-datagrid-header-filter-list-box-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `datagrid.header-filter-list.box.focus.shadow` | `--mx-datagrid-header-filter-list-box-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `datagrid.header-filter-list.box.radius` | `--mx-datagrid-header-filter-list-box-radius` | `radius.md` | `0.375rem` |
| `datagrid.header-filter-list.box.shadow` | `--mx-datagrid-header-filter-list-box-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `datagrid.header-filter-list.box.invalid-hover.bg` | `--mx-datagrid-header-filter-list-box-invalid-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `datagrid.header-filter-list.box.invalid-focus.bg` | `--mx-datagrid-header-filter-list-box-invalid-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `datagrid.header-filter-list.box.invalid-focus.shadow` | `--mx-datagrid-header-filter-list-box-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `datagrid.header-filter-list.box.readonly-focus.shadow` | `--mx-datagrid-header-filter-list-box-readonly-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `datagrid.header-filter-list.box.disabled.shadow` | `--mx-datagrid-header-filter-list-box-disabled-shadow` | `` | `inset 0px 1px 2px 0px rgb(0 0 0 / 0.12)` |
| `datagrid.header-filter-list.box.readonly-invalid-focus.shadow` | `--mx-datagrid-header-filter-list-box-readonly-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `datagrid.header-filter-list.frame.border-color` | `--mx-datagrid-header-filter-list-frame-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `datagrid.header-filter-list.frame.hover.border-color` | `--mx-datagrid-header-filter-list-frame-hover-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `datagrid.header-filter-list.frame.hover.border-bottom-color` | `--mx-datagrid-header-filter-list-frame-hover-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `datagrid.header-filter-list.frame.focus.border-color` | `--mx-datagrid-header-filter-list-frame-focus-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `datagrid.header-filter-list.frame.focus.border-bottom-color` | `--mx-datagrid-header-filter-list-frame-focus-border-bottom-color` | `color.accent.solid` | `#c24523` |
| `datagrid.header-filter-list.frame.border-bottom-color` | `--mx-datagrid-header-filter-list-frame-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `datagrid.header-filter-list.frame.display` | `--mx-datagrid-header-filter-list-frame-display` | `` | `none` |
| `datagrid.header-filter-list.indicator.display` | `--mx-datagrid-header-filter-list-indicator-display` | `` | `none` |
| `datagrid.values-apply.variant` | `--mx-datagrid-values-apply-variant` | `` | `solid` |
| `datagrid.values-apply.size` | `--mx-datagrid-values-apply-size` | `` | `sm` |
| `datagrid.values-dismiss.variant` | `--mx-datagrid-values-dismiss-variant` | `` | `outline` |
| `datagrid.values-dismiss.size` | `--mx-datagrid-values-dismiss-size` | `` | `sm` |
| `datagrid.form-apply.variant` | `--mx-datagrid-form-apply-variant` | `` | `solid` |
| `datagrid.form-apply.size` | `--mx-datagrid-form-apply-size` | `` | `md` |
| `datagrid.form-dismiss.variant` | `--mx-datagrid-form-dismiss-variant` | `` | `outline` |
| `datagrid.form-dismiss.size` | `--mx-datagrid-form-dismiss-size` | `` | `md` |
| `datagrid.builder-apply.variant` | `--mx-datagrid-builder-apply-variant` | `` | `solid` |
| `datagrid.builder-apply.size` | `--mx-datagrid-builder-apply-size` | `` | `md` |
| `datagrid.builder-dismiss.variant` | `--mx-datagrid-builder-dismiss-variant` | `` | `outline` |
| `datagrid.builder-dismiss.size` | `--mx-datagrid-builder-dismiss-size` | `` | `md` |
| `datagrid.state-button.variant` | `--mx-datagrid-state-button-variant` | `` | `outline` |
| `datagrid.state-button.size` | `--mx-datagrid-state-button-size` | `` | `sm` |
| `datagrid.note-button.variant` | `--mx-datagrid-note-button-variant` | `` | `ghost` |
| `datagrid.note-button.size` | `--mx-datagrid-note-button-size` | `` | `sm` |
| `datagrid.filter-clear.variant` | `--mx-datagrid-filter-clear-variant` | `` | `ghost` |
| `datagrid.filter-clear.tone` | `--mx-datagrid-filter-clear-tone` | `` | `accent` |
| `datagrid.filter-clear.size` | `--mx-datagrid-filter-clear-size` | `` | `sm` |
| `datagrid.values-popup.surface.padding-block` | `--mx-datagrid-values-popup-surface-padding-block` | `space.2` | `0.5rem` |
| `datagrid.values-popup.surface.padding-inline` | `--mx-datagrid-values-popup-surface-padding-inline` | `space.2` | `0.5rem` |
| `datagrid.grid.bg` | `--mx-datagrid-grid-bg` | `color.bg.surface` | `#f8f7f3` |
| `datagrid.grid.border-width` | `--mx-datagrid-grid-border-width` | `border.width.1` | `1px` |
| `datagrid.grid.border-color` | `--mx-datagrid-grid-border-color` | `color.stroke.card` | `rgb(0 0 0 / 0.08)` |
| `datagrid.grid.radius` | `--mx-datagrid-grid-radius` | `radius.md` | `0.375rem` |
| `datagrid.grid.color` | `--mx-datagrid-grid-color` | `color.fg.primary` | `#1d1c1a` |
| `datagrid.grid.font-size` | `--mx-datagrid-grid-font-size` | `font.size.body` | `0.875rem` |
| `datagrid.row.bg` | `--mx-datagrid-row-bg` | `color.bg.surface` | `#f8f7f3` |
| `datagrid.row.header.bg` | `--mx-datagrid-row-header-bg` | `color.bg.bar` | `#ebeae5` |
| `datagrid.row.header.border-bottom-width` | `--mx-datagrid-row-header-border-bottom-width` | `border.width.1` | `1px` |
| `datagrid.row.header.border-bottom-color` | `--mx-datagrid-row-header-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `datagrid.row.header.color` | `--mx-datagrid-row-header-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.row.header.font-weight` | `--mx-datagrid-row-header-font-weight` | `font.weight.medium` | `500` |
| `datagrid.row.band.border-bottom-width` | `--mx-datagrid-row-band-border-bottom-width` | `` | `0px` |
| `datagrid.row.header-drop.image` | `--mx-datagrid-row-header-drop-image` | `` | `linear-gradient(#fbe6de, #fbe6de)` |
| `datagrid.row.filter.bg` | `--mx-datagrid-row-filter-bg` | `color.bg.bar` | `#ebeae5` |
| `datagrid.row.filter.border-bottom-width` | `--mx-datagrid-row-filter-border-bottom-width` | `border.width.1` | `1px` |
| `datagrid.row.filter.border-bottom-color` | `--mx-datagrid-row-filter-border-bottom-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `datagrid.row.total.bg` | `--mx-datagrid-row-total-bg` | `color.bg.bar` | `#ebeae5` |
| `datagrid.row.total.border-top-width` | `--mx-datagrid-row-total-border-top-width` | `border.width.1` | `1px` |
| `datagrid.row.total.border-top-color` | `--mx-datagrid-row-total-border-top-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `datagrid.row.total.color` | `--mx-datagrid-row-total-color` | `color.fg.primary` | `#1d1c1a` |
| `datagrid.row.total.font-weight` | `--mx-datagrid-row-total-font-weight` | `font.weight.medium` | `500` |
| `datagrid.row.total-focus.shadow` | `--mx-datagrid-row-total-focus-shadow` | `` | `inset 0px 0px 0px 2px #1d1c1a` |
| `datagrid.row.total-loading.color` | `--mx-datagrid-row-total-loading-color` | `color.fg.tertiary` | `#8c8a82` |
| `datagrid.row.body.border-bottom-width` | `--mx-datagrid-row-body-border-bottom-width` | `border.width.1` | `1px` |
| `datagrid.row.body.border-bottom-color` | `--mx-datagrid-row-body-border-bottom-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `datagrid.row.group.bg` | `--mx-datagrid-row-group-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `datagrid.row.group-footer.bg` | `--mx-datagrid-row-group-footer-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `datagrid.row.group-footer-focus.shadow` | `--mx-datagrid-row-group-footer-focus-shadow` | `` | `inset 0px 0px 0px 2px #1d1c1a` |
| `datagrid.row.selected.bg` | `--mx-datagrid-row-selected-bg` | `color.selection.bg` | `#f5f4f0` |
| `datagrid.row.selected.color` | `--mx-datagrid-row-selected-color` | `color.selection.fg` | `#1d1c1a` |
| `datagrid.row.drag-indicate.opacity` | `--mx-datagrid-row-drag-indicate-opacity` | `opacity.disabled` | `0.5` |
| `datagrid.row.drag-push.bg` | `--mx-datagrid-row-drag-push-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `datagrid.row.drag-push.outline-style` | `--mx-datagrid-row-drag-push-outline-style` | `` | `dashed` |
| `datagrid.row.drag-push.outline-width` | `--mx-datagrid-row-drag-push-outline-width` | `border.width.2` | `2px` |
| `datagrid.row.drag-push.outline-color` | `--mx-datagrid-row-drag-push-outline-color` | `color.accent.solid` | `#c24523` |
| `datagrid.row.drag-push.outline-offset` | `--mx-datagrid-row-drag-push-outline-offset` | `` | `calc(2px * -1)` |
| `datagrid.row.drop-target.outline-width` | `--mx-datagrid-row-drop-target-outline-width` | `border.width.2` | `2px` |
| `datagrid.row.drop-target.outline-color` | `--mx-datagrid-row-drop-target-outline-color` | `color.accent.solid` | `#c24523` |
| `datagrid.row.drop-target.outline-offset` | `--mx-datagrid-row-drop-target-outline-offset` | `` | `calc(2px * -1)` |
| `datagrid.row.drop-target.outline-style` | `--mx-datagrid-row-drop-target-outline-style` | `` | `initial` |
| `datagrid.selection.shadow` | `--mx-datagrid-selection-shadow` | `effect.selection` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0px 1px 0px 0px rgb(0 0 0 / 0.3)` |
| `datagrid.selection.glow` | `--mx-datagrid-selection-glow` | `` | `inset 0px 0px 0px 1px rgb(0 0 0 / 0.12)` |
| `datagrid.indicator.width` | `--mx-datagrid-indicator-width` | `indicator.thickness` | `0px` |
| `datagrid.indicator.height` | `--mx-datagrid-indicator-height` | `indicator.length` | `0rem` |
| `datagrid.indicator.margin-end` | `--mx-datagrid-indicator-margin-end` | `` | `auto` |
| `datagrid.indicator.bg` | `--mx-datagrid-indicator-bg` | `color.selection.indicator` | `rgb(0 0 0 / 0)` |
| `datagrid.indicator.radius` | `--mx-datagrid-indicator-radius` | `indicator.radius` | `0px` |
| `datagrid.indicator.margin-start` | `--mx-datagrid-indicator-margin-start` | `` | `initial` |
| `datagrid.cell.padding-inline` | `--mx-datagrid-cell-padding-inline` | `control.padding.sm` | `0.5rem` |
| `datagrid.cell.focus.glow` | `--mx-datagrid-cell-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `datagrid.cell.focus.outline-width` | `--mx-datagrid-cell-focus-outline-width` | `focus.ring.width` | `2px` |
| `datagrid.cell.focus.outline-color` | `--mx-datagrid-cell-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `datagrid.cell.focus.outline-offset` | `--mx-datagrid-cell-focus-outline-offset` | `` | `calc(2px * -1)` |
| `datagrid.cell.bare.padding-inline` | `--mx-datagrid-cell-bare-padding-inline` | `` | `0px` |
| `datagrid.cell.actions.gap` | `--mx-datagrid-cell-actions-gap` | `space.1` | `0.25rem` |
| `datagrid.cell.group-summary.font-weight` | `--mx-datagrid-cell-group-summary-font-weight` | `font.weight.regular` | `400` |
| `datagrid.cell.range-selected.color` | `--mx-datagrid-cell-range-selected-color` | `color.fg.primary` | `#1d1c1a` |
| `datagrid.cell.range-anchor.color` | `--mx-datagrid-cell-range-anchor-color` | `color.fg.primary` | `#1d1c1a` |
| `datagrid.cell.missing.color` | `--mx-datagrid-cell-missing-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.cell.missing.text-decoration` | `--mx-datagrid-cell-missing-text-decoration` | `` | `underline` |
| `datagrid.cell.removed.color` | `--mx-datagrid-cell-removed-color` | `color.fg.tertiary` | `#8c8a82` |
| `datagrid.cell.removed.text-decoration` | `--mx-datagrid-cell-removed-text-decoration` | `` | `line-through` |
| `datagrid.cell.saving.color` | `--mx-datagrid-cell-saving-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.changed.border-width` | `--mx-datagrid-changed-border-width` | `space.2` | `0.5rem` |
| `datagrid.changed.border-bottom-width` | `--mx-datagrid-changed-border-bottom-width` | `` | `0px` |
| `datagrid.changed.border-start-width` | `--mx-datagrid-changed-border-start-width` | `` | `0px` |
| `datagrid.changed.border-top-color` | `--mx-datagrid-changed-border-top-color` | `color.accent.solid` | `#c24523` |
| `datagrid.changed.border-color` | `--mx-datagrid-changed-border-color` | `` | `rgb(0 0 0 / 0)` |
| `datagrid.invalid.border-width` | `--mx-datagrid-invalid-border-width` | `border.width.2` | `2px` |
| `datagrid.invalid.border-color` | `--mx-datagrid-invalid-border-color` | `color.danger.solid` | `#b03659` |
| `datagrid.placeholder.bg` | `--mx-datagrid-placeholder-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `datagrid.placeholder.radius` | `--mx-datagrid-placeholder-radius` | `radius.sm` | `0.25rem` |
| `datagrid.header-cell.padding-inline` | `--mx-datagrid-header-cell-padding-inline` | `control.padding.sm` | `0.5rem` |
| `datagrid.header-cell.gap` | `--mx-datagrid-header-cell-gap` | `space.1` | `0.25rem` |
| `datagrid.header-cell.sortable.cursor` | `--mx-datagrid-header-cell-sortable-cursor` | `` | `pointer` |
| `datagrid.header-cell.hover.image` | `--mx-datagrid-header-cell-hover-image` | `` | `linear-gradient(rgb(0 0 0 / 0.0373), rgb(0 0 0 / 0.0373))` |
| `datagrid.header-cell.dragging.opacity` | `--mx-datagrid-header-cell-dragging-opacity` | `opacity.disabled` | `0.5` |
| `datagrid.header-cell.focus.glow` | `--mx-datagrid-header-cell-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `datagrid.header-cell.focus.outline-width` | `--mx-datagrid-header-cell-focus-outline-width` | `focus.ring.width` | `2px` |
| `datagrid.header-cell.focus.outline-color` | `--mx-datagrid-header-cell-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `datagrid.header-cell.focus.outline-offset` | `--mx-datagrid-header-cell-focus-outline-offset` | `` | `calc(2px * -1)` |
| `datagrid.header-cell.band.border-end-width` | `--mx-datagrid-header-cell-band-border-end-width` | `border.width.1` | `1px` |
| `datagrid.header-cell.band.border-bottom-width` | `--mx-datagrid-header-cell-band-border-bottom-width` | `border.width.1` | `1px` |
| `datagrid.header-cell.band.border-end-color` | `--mx-datagrid-header-cell-band-border-end-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `datagrid.header-cell.band.border-bottom-color` | `--mx-datagrid-header-cell-band-border-bottom-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `datagrid.header-cell.bare.padding-inline` | `--mx-datagrid-header-cell-bare-padding-inline` | `` | `0px` |
| `datagrid.sort.gap` | `--mx-datagrid-sort-gap` | `space.1` | `0.25rem` |
| `datagrid.sort.color` | `--mx-datagrid-sort-color` | `color.accent.fg` | `#983318` |
| `datagrid.sort.font-size` | `--mx-datagrid-sort-font-size` | `font.size.caption` | `0.75rem` |
| `datagrid.head-button.radius` | `--mx-datagrid-head-button-radius` | `radius.sm` | `0.25rem` |
| `datagrid.head-button.opacity` | `--mx-datagrid-head-button-opacity` | `` | `0` |
| `datagrid.head-button.hover.bg` | `--mx-datagrid-head-button-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `datagrid.head-button.shown.opacity` | `--mx-datagrid-head-button-shown-opacity` | `` | `1` |
| `datagrid.head-button.active.opacity` | `--mx-datagrid-head-button-active-opacity` | `` | `1` |
| `datagrid.head-button.active.color` | `--mx-datagrid-head-button-active-color` | `color.accent.fg` | `#983318` |
| `datagrid.resize.width` | `--mx-datagrid-resize-width` | `border.width.1` | `1px` |
| `datagrid.resize.bg` | `--mx-datagrid-resize-bg` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `datagrid.resize.active.width` | `--mx-datagrid-resize-active-width` | `border.width.2` | `2px` |
| `datagrid.resize.active.bg` | `--mx-datagrid-resize-active-bg` | `color.accent.solid` | `#c24523` |
| `datagrid.column-drop.width` | `--mx-datagrid-column-drop-width` | `border.width.2` | `2px` |
| `datagrid.column-drop.bg` | `--mx-datagrid-column-drop-bg` | `color.accent.solid` | `#c24523` |
| `datagrid.filter-cell.padding-inline` | `--mx-datagrid-filter-cell-padding-inline` | `space.1` | `0.25rem` |
| `datagrid.filter-cell.focus.glow` | `--mx-datagrid-filter-cell-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `datagrid.filter-cell.focus.outline-width` | `--mx-datagrid-filter-cell-focus-outline-width` | `focus.ring.width` | `2px` |
| `datagrid.filter-cell.focus.outline-color` | `--mx-datagrid-filter-cell-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `datagrid.filter-cell.focus.outline-offset` | `--mx-datagrid-filter-cell-focus-outline-offset` | `` | `calc(2px * -1)` |
| `datagrid.filter.gap` | `--mx-datagrid-filter-gap` | `space.1` | `0.25rem` |
| `datagrid.condition.set.color` | `--mx-datagrid-condition-set-color` | `color.accent.fg` | `#983318` |
| `datagrid.group-cell.focus.glow` | `--mx-datagrid-group-cell-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `datagrid.group-cell.focus.outline-width` | `--mx-datagrid-group-cell-focus-outline-width` | `focus.ring.width` | `2px` |
| `datagrid.group-cell.focus.outline-color` | `--mx-datagrid-group-cell-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `datagrid.group-cell.focus.outline-offset` | `--mx-datagrid-group-cell-focus-outline-offset` | `` | `calc(2px * -1)` |
| `datagrid.group-content.gap` | `--mx-datagrid-group-content-gap` | `space.1` | `0.25rem` |
| `datagrid.group-content.font-weight` | `--mx-datagrid-group-content-font-weight` | `font.weight.medium` | `500` |
| `datagrid.group-count.color` | `--mx-datagrid-group-count-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.group-count.font-weight` | `--mx-datagrid-group-count-font-weight` | `font.weight.regular` | `400` |
| `datagrid.group-summary.color` | `--mx-datagrid-group-summary-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.group-summary.font-weight` | `--mx-datagrid-group-summary-font-weight` | `font.weight.regular` | `400` |
| `datagrid.group-toggle.margin-start` | `--mx-datagrid-group-toggle-margin-start` | `` | `calc(0.25rem * -1)` |
| `datagrid.group-toggle.radius` | `--mx-datagrid-group-toggle-radius` | `radius.sm` | `0.25rem` |
| `datagrid.group-toggle.color` | `--mx-datagrid-group-toggle-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.group-toggle.hover.bg` | `--mx-datagrid-group-toggle-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `datagrid.group-toggle.locked.cursor` | `--mx-datagrid-group-toggle-locked-cursor` | `` | `default` |
| `datagrid.group-panel.padding-inline` | `--mx-datagrid-group-panel-padding-inline` | `space.1` | `0.25rem` |
| `datagrid.group-panel.radius` | `--mx-datagrid-group-panel-radius` | `radius.sm` | `0.25rem` |
| `datagrid.group-panel.drop.image` | `--mx-datagrid-group-panel-drop-image` | `` | `linear-gradient(#fbe6de, #fbe6de)` |
| `datagrid.group-empty.color` | `--mx-datagrid-group-empty-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.chip.padding-inline` | `--mx-datagrid-chip-padding-inline` | `control.padding.sm` | `0.5rem` |
| `datagrid.chip.bg` | `--mx-datagrid-chip-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `datagrid.chip.border-width` | `--mx-datagrid-chip-border-width` | `border.width.1` | `1px` |
| `datagrid.chip.border-color` | `--mx-datagrid-chip-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `datagrid.chip.radius` | `--mx-datagrid-chip-radius` | `radius.sm` | `0.25rem` |
| `datagrid.chip.color` | `--mx-datagrid-chip-color` | `color.fg.primary` | `#1d1c1a` |
| `datagrid.chip.hover.bg` | `--mx-datagrid-chip-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `datagrid.chip.dragging.opacity` | `--mx-datagrid-chip-dragging-opacity` | `opacity.disabled` | `0.5` |
| `datagrid.chip-sort.color` | `--mx-datagrid-chip-sort-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.chip-drop.width` | `--mx-datagrid-chip-drop-width` | `border.width.2` | `2px` |
| `datagrid.chip-drop.bg` | `--mx-datagrid-chip-drop-bg` | `color.accent.solid` | `#c24523` |
| `datagrid.toolbar.border-bottom-width` | `--mx-datagrid-toolbar-border-bottom-width` | `border.width.1` | `1px` |
| `datagrid.toolbar.border-color` | `--mx-datagrid-toolbar-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `datagrid.toolbar.drop-ready.outline-style` | `--mx-datagrid-toolbar-drop-ready-outline-style` | `` | `dashed` |
| `datagrid.toolbar.drop-ready.outline-width` | `--mx-datagrid-toolbar-drop-ready-outline-width` | `border.width.1` | `1px` |
| `datagrid.toolbar.drop-ready.outline-color` | `--mx-datagrid-toolbar-drop-ready-outline-color` | `color.accent.solid` | `#c24523` |
| `datagrid.toolbar.drop-ready.outline-offset` | `--mx-datagrid-toolbar-drop-ready-outline-offset` | `` | `calc(1px * -1)` |
| `datagrid.toolbar.drop.image` | `--mx-datagrid-toolbar-drop-image` | `` | `linear-gradient(#fbe6de, #fbe6de)` |
| `datagrid.ghost.radius` | `--mx-datagrid-ghost-radius` | `radius.sm` | `0.25rem` |
| `datagrid.ghost.shadow` | `--mx-datagrid-ghost-shadow` | `elevation.popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `datagrid.ghost.header.bg` | `--mx-datagrid-ghost-header-bg` | `color.bg.bar` | `#ebeae5` |
| `datagrid.ghost.header.border-width` | `--mx-datagrid-ghost-header-border-width` | `border.width.1` | `1px` |
| `datagrid.ghost.header.border-color` | `--mx-datagrid-ghost-header-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `datagrid.ghost.header.color` | `--mx-datagrid-ghost-header-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.ghost.header.font-weight` | `--mx-datagrid-ghost-header-font-weight` | `font.weight.medium` | `500` |
| `datagrid.ghost.row.border-width` | `--mx-datagrid-ghost-row-border-width` | `border.width.1` | `1px` |
| `datagrid.ghost.row.border-color` | `--mx-datagrid-ghost-row-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `datagrid.ghost.target.outline-width` | `--mx-datagrid-ghost-target-outline-width` | `border.width.2` | `2px` |
| `datagrid.ghost.target.outline-color` | `--mx-datagrid-ghost-target-outline-color` | `color.accent.solid` | `#c24523` |
| `datagrid.ghost-rows.bg` | `--mx-datagrid-ghost-rows-bg` | `color.bg.surface` | `#f8f7f3` |
| `datagrid.status-mark.font-size` | `--mx-datagrid-status-mark-font-size` | `font.size.caption` | `0.75rem` |
| `datagrid.status-mark.font-weight` | `--mx-datagrid-status-mark-font-weight` | `font.weight.bold` | `700` |
| `datagrid.status-symbol.new.color` | `--mx-datagrid-status-symbol-new-color` | `color.success.fg` | `#006402` |
| `datagrid.status-symbol.changed.color` | `--mx-datagrid-status-symbol-changed-color` | `color.accent.fg` | `#983318` |
| `datagrid.status-symbol.removed.color` | `--mx-datagrid-status-symbol-removed-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.status-symbol.saving.color` | `--mx-datagrid-status-symbol-saving-color` | `color.accent.fg` | `#983318` |
| `datagrid.status-symbol.failed.color` | `--mx-datagrid-status-symbol-failed-color` | `color.danger.fg` | `#b03659` |
| `datagrid.check.size` | `--mx-datagrid-check-size` | `` | `0.875rem` |
| `datagrid.check.bg` | `--mx-datagrid-check-bg` | `color.fill.control.default` | `#f5f4f0` |
| `datagrid.check.border-width` | `--mx-datagrid-check-border-width` | `border.width.1` | `1px` |
| `datagrid.check.border-color` | `--mx-datagrid-check-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `datagrid.check.radius` | `--mx-datagrid-check-radius` | `radius.xs` | `0.25rem` |
| `datagrid.check.shadow` | `--mx-datagrid-check-shadow` | `` | `0px 1px 0px 0px rgb(0 0 0 / 0.3)` |
| `datagrid.check.glow` | `--mx-datagrid-check-glow` | `effect.control` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7)` |
| `datagrid.check.color` | `--mx-datagrid-check-color` | `color.accent.on-solid` | `#ffffff` |
| `datagrid.check.checked.bg` | `--mx-datagrid-check-checked-bg` | `color.accent.solid` | `#c24523` |
| `datagrid.check.checked.border-color` | `--mx-datagrid-check-checked-border-color` | `color.accent.solid` | `#c24523` |
| `datagrid.check.checked.shadow` | `--mx-datagrid-check-checked-shadow` | `` | `0px 1px 0px 0px rgb(0 0 0 / 0.4)` |
| `datagrid.check.disabled.opacity` | `--mx-datagrid-check-disabled-opacity` | `opacity.disabled` | `0.5` |
| `datagrid.check-mark.size` | `--mx-datagrid-check-mark-size` | `icon.size.sm` | `0.75rem` |
| `datagrid.editor.bg` | `--mx-datagrid-editor-bg` | `color.bg.surface` | `#f8f7f3` |
| `datagrid.editor.shadow` | `--mx-datagrid-editor-shadow` | `` | `inset 0px 0px 0px 2px #c24523` |
| `datagrid.editor.in-form.bg` | `--mx-datagrid-editor-in-form-bg` | `` | `rgb(0 0 0 / 0)` |
| `datagrid.editor.in-form.shadow` | `--mx-datagrid-editor-in-form-shadow` | `` | `0 0 #0000` |
| `datagrid.expand.radius` | `--mx-datagrid-expand-radius` | `radius.sm` | `0.25rem` |
| `datagrid.expand.color` | `--mx-datagrid-expand-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.expand.hover.bg` | `--mx-datagrid-expand-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `datagrid.drag-handle.radius` | `--mx-datagrid-drag-handle-radius` | `radius.sm` | `0.25rem` |
| `datagrid.drag-handle.color` | `--mx-datagrid-drag-handle-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.drag-handle.hover.bg` | `--mx-datagrid-drag-handle-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `datagrid.row-drop.height` | `--mx-datagrid-row-drop-height` | `indicator.thickness` | `0px` |
| `datagrid.row-drop.bg` | `--mx-datagrid-row-drop-bg` | `color.accent.solid` | `#c24523` |
| `datagrid.detail-row.bg` | `--mx-datagrid-detail-row-bg` | `color.bg.bar` | `#ebeae5` |
| `datagrid.detail-row.border-bottom-width` | `--mx-datagrid-detail-row-border-bottom-width` | `border.width.1` | `1px` |
| `datagrid.detail-row.border-color` | `--mx-datagrid-detail-row-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `datagrid.detail-row.adaptive.bg` | `--mx-datagrid-detail-row-adaptive-bg` | `color.bg.surface` | `#f8f7f3` |
| `datagrid.detail-cell.padding` | `--mx-datagrid-detail-cell-padding` | `space.3` | `0.75rem` |
| `datagrid.detail-cell.focus.glow` | `--mx-datagrid-detail-cell-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `datagrid.detail-cell.focus.outline-width` | `--mx-datagrid-detail-cell-focus-outline-width` | `focus.ring.width` | `2px` |
| `datagrid.detail-cell.focus.outline-color` | `--mx-datagrid-detail-cell-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `datagrid.detail-cell.focus.outline-offset` | `--mx-datagrid-detail-cell-focus-outline-offset` | `` | `calc(2px * -1)` |
| `datagrid.adaptive-button.radius` | `--mx-datagrid-adaptive-button-radius` | `radius.sm` | `0.25rem` |
| `datagrid.adaptive-button.color` | `--mx-datagrid-adaptive-button-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.adaptive-button.hover.bg` | `--mx-datagrid-adaptive-button-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `datagrid.adaptive-button.open.bg` | `--mx-datagrid-adaptive-button-open-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `datagrid.adaptive-label.color` | `--mx-datagrid-adaptive-label-color` | `color.fg.primary` | `#1d1c1a` |
| `datagrid.adaptive-label.font-weight` | `--mx-datagrid-adaptive-label-font-weight` | `font.weight.medium` | `500` |
| `datagrid.form-row.bg` | `--mx-datagrid-form-row-bg` | `color.bg.surface` | `#f8f7f3` |
| `datagrid.form-row.border-bottom-width` | `--mx-datagrid-form-row-border-bottom-width` | `border.width.1` | `1px` |
| `datagrid.form-row.border-color` | `--mx-datagrid-form-row-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `datagrid.form-cell.focus.glow` | `--mx-datagrid-form-cell-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `datagrid.form-cell.focus.outline-width` | `--mx-datagrid-form-cell-focus-outline-width` | `focus.ring.width` | `2px` |
| `datagrid.form-cell.focus.outline-color` | `--mx-datagrid-form-cell-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `datagrid.form-cell.focus.outline-offset` | `--mx-datagrid-form-cell-focus-outline-offset` | `` | `calc(2px * -1)` |
| `datagrid.form.padding` | `--mx-datagrid-form-padding` | `space.3` | `0.75rem` |
| `datagrid.form.gap` | `--mx-datagrid-form-gap` | `space.3` | `0.75rem` |
| `datagrid.form.popup.padding` | `--mx-datagrid-form-popup-padding` | `` | `0px` |
| `datagrid.form-message.color` | `--mx-datagrid-form-message-color` | `color.danger.fg` | `#b03659` |
| `datagrid.form-buttons.gap` | `--mx-datagrid-form-buttons-gap` | `space.3` | `0.75rem` |
| `datagrid.form-label.color` | `--mx-datagrid-form-label-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.form-label.font-size` | `--mx-datagrid-form-label-font-size` | `font.size.caption` | `0.75rem` |
| `datagrid.values.gap` | `--mx-datagrid-values-gap` | `space.2` | `0.5rem` |
| `datagrid.values-list.gap` | `--mx-datagrid-values-list-gap` | `space.2` | `0.5rem` |
| `datagrid.values-note.color` | `--mx-datagrid-values-note-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.values-bar.gap` | `--mx-datagrid-values-bar-gap` | `space.2` | `0.5rem` |
| `datagrid.value-count.padding-start` | `--mx-datagrid-value-count-padding-start` | `space.2` | `0.5rem` |
| `datagrid.value-count.color` | `--mx-datagrid-value-count-color` | `color.fg.tertiary` | `#8c8a82` |
| `datagrid.state.padding-block` | `--mx-datagrid-state-padding-block` | `space.2` | `0.5rem` |
| `datagrid.state.padding-inline` | `--mx-datagrid-state-padding-inline` | `space.3` | `0.75rem` |
| `datagrid.state.gap` | `--mx-datagrid-state-gap` | `space.2` | `0.5rem` |
| `datagrid.state.color` | `--mx-datagrid-state-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.state.danger.color` | `--mx-datagrid-state-danger-color` | `color.danger.fg` | `#b03659` |
| `datagrid.note.gap` | `--mx-datagrid-note-gap` | `space.2` | `0.5rem` |
| `datagrid.note.danger.color` | `--mx-datagrid-note-danger-color` | `color.danger.fg` | `#b03659` |
| `datagrid.load-more.margin-bottom` | `--mx-datagrid-load-more-margin-bottom` | `space.2` | `0.5rem` |
| `datagrid.load-more.padding-block` | `--mx-datagrid-load-more-padding-block` | `space.1` | `0.25rem` |
| `datagrid.load-more.padding-inline` | `--mx-datagrid-load-more-padding-inline` | `space.3` | `0.75rem` |
| `datagrid.load-more.gap` | `--mx-datagrid-load-more-gap` | `space.2` | `0.5rem` |
| `datagrid.load-more.bg` | `--mx-datagrid-load-more-bg` | `color.bg.surface` | `#f8f7f3` |
| `datagrid.load-more.border-width` | `--mx-datagrid-load-more-border-width` | `border.width.1` | `1px` |
| `datagrid.load-more.border-color` | `--mx-datagrid-load-more-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `datagrid.load-more.radius` | `--mx-datagrid-load-more-radius` | `radius.sm` | `0.25rem` |
| `datagrid.load-more.shadow` | `--mx-datagrid-load-more-shadow` | `elevation.popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `datagrid.load-more.color` | `--mx-datagrid-load-more-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.load-more.failed.color` | `--mx-datagrid-load-more-failed-color` | `color.danger.fg` | `#b03659` |
| `datagrid.export-panel.padding` | `--mx-datagrid-export-panel-padding` | `space.3` | `0.75rem` |
| `datagrid.export-panel.gap` | `--mx-datagrid-export-panel-gap` | `space.3` | `0.75rem` |
| `datagrid.export-panel.bg` | `--mx-datagrid-export-panel-bg` | `color.bg.surface` | `#f8f7f3` |
| `datagrid.export-panel.border-width` | `--mx-datagrid-export-panel-border-width` | `border.width.1` | `1px` |
| `datagrid.export-panel.border-color` | `--mx-datagrid-export-panel-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `datagrid.export-panel.radius` | `--mx-datagrid-export-panel-radius` | `radius.sm` | `0.25rem` |
| `datagrid.export-panel.shadow` | `--mx-datagrid-export-panel-shadow` | `elevation.popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `datagrid.mark.bg` | `--mx-datagrid-mark-bg` | `color.caution.subtle` | `#fff4ce` |
| `datagrid.mark.radius` | `--mx-datagrid-mark-radius` | `radius.sm` | `0.25rem` |
| `datagrid.mark.color` | `--mx-datagrid-mark-color` | `color.fg.primary` | `#1d1c1a` |
| `datagrid.mark.text-decoration` | `--mx-datagrid-mark-text-decoration` | `` | `underline` |
| `datagrid.filter-panel.padding-inline` | `--mx-datagrid-filter-panel-padding-inline` | `space.2` | `0.5rem` |
| `datagrid.filter-panel.gap` | `--mx-datagrid-filter-panel-gap` | `space.2` | `0.5rem` |
| `datagrid.filter-panel.bg` | `--mx-datagrid-filter-panel-bg` | `color.bg.bar` | `#ebeae5` |
| `datagrid.filter-panel.border-top-width` | `--mx-datagrid-filter-panel-border-top-width` | `border.width.1` | `1px` |
| `datagrid.filter-panel.border-color` | `--mx-datagrid-filter-panel-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `datagrid.filter-panel.color` | `--mx-datagrid-filter-panel-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.filter-panel.font-size` | `--mx-datagrid-filter-panel-font-size` | `font.size.caption` | `0.75rem` |
| `datagrid.filter-icon.size` | `--mx-datagrid-filter-icon-size` | `icon.size.sm` | `0.75rem` |
| `datagrid.filter-text.padding` | `--mx-datagrid-filter-text-padding` | `space.1` | `0.25rem` |
| `datagrid.filter-text.radius` | `--mx-datagrid-filter-text-radius` | `radius.sm` | `0.25rem` |
| `datagrid.filter-text.color` | `--mx-datagrid-filter-text-color` | `color.accent.fg` | `#983318` |
| `datagrid.filter-text.hover.text-decoration` | `--mx-datagrid-filter-text-hover-text-decoration` | `` | `underline` |
| `datagrid.filter-text.focus.glow` | `--mx-datagrid-filter-text-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `datagrid.filter-text.focus.outline-width` | `--mx-datagrid-filter-text-focus-outline-width` | `focus.ring.width` | `2px` |
| `datagrid.filter-text.focus.outline-color` | `--mx-datagrid-filter-text-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `datagrid.filter-text.focus.outline-offset` | `--mx-datagrid-filter-text-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `datagrid.filter-text.off.color` | `--mx-datagrid-filter-text-off-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.filter-text.off.text-decoration` | `--mx-datagrid-filter-text-off-text-decoration` | `` | `line-through` |
| `datagrid.filter-builder-buttons.gap` | `--mx-datagrid-filter-builder-buttons-gap` | `space.2` | `0.5rem` |
| `datagrid.bar.padding-inline` | `--mx-datagrid-bar-padding-inline` | `space.2` | `0.5rem` |
| `datagrid.bar.gap` | `--mx-datagrid-bar-gap` | `space.3` | `0.75rem` |
| `datagrid.bar.bg` | `--mx-datagrid-bar-bg` | `color.bg.bar` | `#ebeae5` |
| `datagrid.bar.border-top-width` | `--mx-datagrid-bar-border-top-width` | `border.width.1` | `1px` |
| `datagrid.bar.border-color` | `--mx-datagrid-bar-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `datagrid.bar.color` | `--mx-datagrid-bar-color` | `color.fg.secondary` | `#5e5c55` |
| `datagrid.bar.font-size` | `--mx-datagrid-bar-font-size` | `font.size.caption` | `0.75rem` |
| `datagrid.pager.gap` | `--mx-datagrid-pager-gap` | `space.1` | `0.25rem` |
| `datagrid.pager-group.gap` | `--mx-datagrid-pager-group-gap` | `space.1` | `0.25rem` |
| `datagrid.page-sizes.margin-end` | `--mx-datagrid-page-sizes-margin-end` | `space.2` | `0.5rem` |
| `datagrid.page-gap.padding-inline` | `--mx-datagrid-page-gap-padding-inline` | `space.1` | `0.25rem` |
| `datagrid.page-info.margin-end` | `--mx-datagrid-page-info-margin-end` | `space.2` | `0.5rem` |
| `datagrid.tip.error.border-color` | `--mx-datagrid-tip-error-border-color` | `color.danger.solid` | `#b03659` |
| `datagrid.tip.error.color` | `--mx-datagrid-tip-error-color` | `color.danger.fg` | `#b03659` |
| `date-box.popup-gap` | `--mx-date-box-popup-gap` | `space.1` | `0.25rem` |
| `date-box.calendar.container.padding` | `--mx-date-box-calendar-container-padding` | `space.2` | `0.5rem` |
| `date-box.times.min-width` | `--mx-date-box-times-min-width` | `` | `6rem` |
| `date-box.times.max-height` | `--mx-date-box-times-max-height` | `` | `18rem` |
| `date-box.times.focus.outline-width` | `--mx-date-box-times-focus-outline-width` | `focus.ring.width` | `2px` |
| `date-box.times.focus.outline-color` | `--mx-date-box-times-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `date-box.times.focus.outline-offset` | `--mx-date-box-times-focus-outline-offset` | `` | `calc(-1 * 2px)` |
| `date-box.times.focus.glow` | `--mx-date-box-times-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `date-box.times.beside.padding-start` | `--mx-date-box-times-beside-padding-start` | `space.1` | `0.25rem` |
| `date-box.times.beside.border-start-width` | `--mx-date-box-times-beside-border-start-width` | `border.width.1` | `1px` |
| `date-box.times.beside.border-start-color` | `--mx-date-box-times-beside-border-start-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `date-range-box.popup-gap` | `--mx-date-range-box-popup-gap` | `space.1` | `0.25rem` |
| `date-range-box.field.width` | `--mx-date-range-box-field-width` | `` | `20rem` |
| `date-range-box.calendar.container.padding` | `--mx-date-range-box-calendar-container-padding` | `space.2` | `0.5rem` |
| `date-range-box.separator.icon` | `--mx-date-range-box-separator-icon` | `` | `var(--mx-icon-dash)` |
| `date-range-box.separator.bg` | `--mx-date-range-box-separator-bg` | `color.fg.tertiary` | `#8c8a82` |
| `date-range-box.separator.size` | `--mx-date-range-box-separator-size` | `` | `1rem` |
| `date-range-box.separator.margin-inline` | `--mx-date-range-box-separator-margin-inline` | `space.1` | `0.25rem` |
| `date-range-box.presets.min-width` | `--mx-date-range-box-presets-min-width` | `` | `9rem` |
| `date-range-box.presets.max-height` | `--mx-date-range-box-presets-max-height` | `` | `18rem` |
| `date-range-box.presets.focus.outline-width` | `--mx-date-range-box-presets-focus-outline-width` | `focus.ring.width` | `2px` |
| `date-range-box.presets.focus.outline-color` | `--mx-date-range-box-presets-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `date-range-box.presets.focus.outline-offset` | `--mx-date-range-box-presets-focus-outline-offset` | `` | `calc(-1 * 2px)` |
| `date-range-box.presets.focus.glow` | `--mx-date-range-box-presets-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `date-range-box.presets.beside.padding-start` | `--mx-date-range-box-presets-beside-padding-start` | `space.1` | `0.25rem` |
| `date-range-box.presets.beside.border-start-width` | `--mx-date-range-box-presets-beside-border-start-width` | `border.width.1` | `1px` |
| `date-range-box.presets.beside.border-start-color` | `--mx-date-range-box-presets-beside-border-start-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `disabled.element.color` | `--mx-disabled-element-color` | `color.fg.disabled` | `#a2a098` |
| `draggable.box.draggable.cursor` | `--mx-draggable-box-draggable-cursor` | `` | `grab` |
| `draggable.box.dragging.cursor` | `--mx-draggable-box-dragging-cursor` | `` | `grabbing` |
| `draggable.box.dragging.shadow` | `--mx-draggable-box-dragging-shadow` | `elevation.popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `draggable.box.focus.glow` | `--mx-draggable-box-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `draggable.box.focus.outline-width` | `--mx-draggable-box-focus-outline-width` | `focus.ring.width` | `2px` |
| `draggable.box.focus.outline-color` | `--mx-draggable-box-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `draggable.box.focus.outline-offset` | `--mx-draggable-box-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `draggable.handle.cursor` | `--mx-draggable-handle-cursor` | `` | `grab` |
| `draggable.handle.hover.bg` | `--mx-draggable-handle-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `draggable.handle.focus.glow` | `--mx-draggable-handle-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `draggable.handle.focus.outline-width` | `--mx-draggable-handle-focus-outline-width` | `focus.ring.width` | `2px` |
| `draggable.handle.focus.outline-color` | `--mx-draggable-handle-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `draggable.handle.focus.outline-offset` | `--mx-draggable-handle-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `draggable.ghost.radius` | `--mx-draggable-ghost-radius` | `radius.md` | `0.375rem` |
| `draggable.ghost.shadow` | `--mx-draggable-ghost-shadow` | `elevation.popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `draggable.ghost.opacity` | `--mx-draggable-ghost-opacity` | `` | `0.9` |
| `drawer.font-family` | `--mx-drawer-font-family` | `font.family.sans` | `Archivo, system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif` |
| `drawer.size` | `--mx-drawer-size` | `` | `20rem` |
| `drawer.inset` | `--mx-drawer-inset` | `` | `0px` |
| `drawer.max-size` | `--mx-drawer-max-size` | `` | `85%` |
| `drawer.close-button.variant` | `--mx-drawer-close-button-variant` | `` | `ghost` |
| `drawer.close-button.tone` | `--mx-drawer-close-button-tone` | `` | `standard` |
| `drawer.close-button.size` | `--mx-drawer-close-button-size` | `` | `sm` |
| `drawer.list-box.width` | `--mx-drawer-list-box-width` | `` | `16rem` |
| `drawer.list-box.box.bg` | `--mx-drawer-list-box-box-bg` | `` | `rgb(0 0 0 / 0)` |
| `drawer.list-box.box.hover.bg` | `--mx-drawer-list-box-box-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `drawer.list-box.box.focus.bg` | `--mx-drawer-list-box-box-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `drawer.list-box.box.focus.shadow` | `--mx-drawer-list-box-box-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `drawer.list-box.box.shadow` | `--mx-drawer-list-box-box-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `drawer.list-box.box.invalid-hover.bg` | `--mx-drawer-list-box-box-invalid-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `drawer.list-box.box.invalid-focus.bg` | `--mx-drawer-list-box-box-invalid-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `drawer.list-box.box.invalid-focus.shadow` | `--mx-drawer-list-box-box-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `drawer.list-box.box.readonly-focus.shadow` | `--mx-drawer-list-box-box-readonly-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `drawer.list-box.box.disabled.shadow` | `--mx-drawer-list-box-box-disabled-shadow` | `` | `inset 0px 1px 2px 0px rgb(0 0 0 / 0.12)` |
| `drawer.list-box.box.readonly-invalid-focus.shadow` | `--mx-drawer-list-box-box-readonly-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `drawer.list-box.frame.display` | `--mx-drawer-list-box-frame-display` | `` | `none` |
| `drawer.list-box.indicator.display` | `--mx-drawer-list-box-indicator-display` | `` | `none` |
| `drawer.scrim.bg` | `--mx-drawer-scrim-bg` | `color.bg.smoke` | `rgb(0 0 0 / 0.3)` |
| `drawer.panel.bg` | `--mx-drawer-panel-bg` | `color.bg.surface` | `#f8f7f3` |
| `drawer.panel.border-color` | `--mx-drawer-panel-border-color` | `color.stroke.surface` | `rgb(117 117 117 / 0.4)` |
| `drawer.panel.shadow` | `--mx-drawer-panel-shadow` | `elevation.dialog` | `0px 32px 64px 0px rgb(0 0 0 / 0.24), 0px 0px 8px 0px rgb(0 0 0 / 0.2)` |
| `drawer.panel.color` | `--mx-drawer-panel-color` | `color.fg.primary` | `#1d1c1a` |
| `drawer.panel.font-size` | `--mx-drawer-panel-font-size` | `font.size.body` | `0.875rem` |
| `drawer.panel.line-height` | `--mx-drawer-panel-line-height` | `font.line.body` | `1.25rem` |
| `drawer.panel.push.shadow` | `--mx-drawer-panel-push-shadow` | `elevation.card` | `0px 1px 2px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `drawer.panel.start.border-end-width` | `--mx-drawer-panel-start-border-end-width` | `border.width.1` | `1px` |
| `drawer.panel.start.radius-end` | `--mx-drawer-panel-start-radius-end` | `radius.none` | `0px` |
| `drawer.panel.end.border-start-width` | `--mx-drawer-panel-end-border-start-width` | `border.width.1` | `1px` |
| `drawer.panel.end.radius-start` | `--mx-drawer-panel-end-radius-start` | `radius.none` | `0px` |
| `drawer.panel.top.border-bottom-width` | `--mx-drawer-panel-top-border-bottom-width` | `border.width.1` | `1px` |
| `drawer.panel.top.radius-bottom` | `--mx-drawer-panel-top-radius-bottom` | `radius.none` | `0px` |
| `drawer.panel.bottom.border-top-width` | `--mx-drawer-panel-bottom-border-top-width` | `border.width.1` | `1px` |
| `drawer.panel.bottom.radius-top` | `--mx-drawer-panel-bottom-radius-top` | `radius.none` | `0px` |
| `drawer.header.padding-block` | `--mx-drawer-header-padding-block` | `space.3` | `0.75rem` |
| `drawer.header.padding-inline` | `--mx-drawer-header-padding-inline` | `space.4` | `1rem` |
| `drawer.header.gap` | `--mx-drawer-header-gap` | `space.2` | `0.5rem` |
| `drawer.header.border-bottom-width` | `--mx-drawer-header-border-bottom-width` | `border.width.1` | `1px` |
| `drawer.header.border-bottom-color` | `--mx-drawer-header-border-bottom-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `drawer.header.padding` | `--mx-drawer-header-padding` | `` | `initial` |
| `drawer.title.font-size` | `--mx-drawer-title-font-size` | `font.size.subtitle` | `1.25rem` |
| `drawer.title.font-weight` | `--mx-drawer-title-font-weight` | `font.weight.semibold` | `600` |
| `drawer.title.line-height` | `--mx-drawer-title-line-height` | `font.line.subtitle` | `1.75rem` |
| `drawer.body.padding` | `--mx-drawer-body-padding` | `space.4` | `1rem` |
| `drawer.body.focus.outline-width` | `--mx-drawer-body-focus-outline-width` | `focus.ring.width` | `2px` |
| `drawer.body.focus.outline-color` | `--mx-drawer-body-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `drawer.body.focus.outline-offset` | `--mx-drawer-body-focus-outline-offset` | `` | `calc(2px * -1)` |
| `drawer.body.focus.glow` | `--mx-drawer-body-focus-glow` | `` | `0 0 #0000` |
| `drawer.footer.padding` | `--mx-drawer-footer-padding` | `space.3` | `0.75rem` |
| `drawer.footer.gap` | `--mx-drawer-footer-gap` | `space.2` | `0.5rem` |
| `drawer.footer.border-top-width` | `--mx-drawer-footer-border-top-width` | `border.width.1` | `1px` |
| `drawer.footer.border-top-color` | `--mx-drawer-footer-border-top-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `drop-down.popup-gap` | `--mx-drop-down-popup-gap` | `space.1` | `0.25rem` |
| `drop-down.field.variant` | `--mx-drop-down-field-variant` | `` | `outline` |
| `drop-down.field.box.bg` | `--mx-drop-down-field-box-bg` | `color.fill.control.default` | `#f5f4f0` |
| `drop-down.field.box.hover.bg` | `--mx-drop-down-field-box-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `drop-down.field.box.focus.bg` | `--mx-drop-down-field-box-focus-bg` | `color.bg.surface` | `#f8f7f3` |
| `drop-down.field.box.focus.shadow` | `--mx-drop-down-field-box-focus-shadow` | `` | `inset 0px 1px 2px 0px rgb(0 0 0 / 0.12)` |
| `drop-down.field.box.pressed.bg` | `--mx-drop-down-field-box-pressed-bg` | `color.bg.surface` | `#f8f7f3` |
| `drop-down.field.box.pressed.color` | `--mx-drop-down-field-box-pressed-color` | `color.fg.primary` | `#1d1c1a` |
| `drop-down.field.box.radius` | `--mx-drop-down-field-box-radius` | `radius.md` | `0.375rem` |
| `drop-down.field.box.shadow` | `--mx-drop-down-field-box-shadow` | `` | `inset 0px 1px 2px 0px rgb(0 0 0 / 0.12)` |
| `drop-down.field.box.cursor` | `--mx-drop-down-field-box-cursor` | `` | `default` |
| `drop-down.field.frame.border-color` | `--mx-drop-down-field-frame-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `drop-down.field.frame.hover.border-color` | `--mx-drop-down-field-frame-hover-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `drop-down.field.frame.hover.border-bottom-color` | `--mx-drop-down-field-frame-hover-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `drop-down.field.frame.focus.border-color` | `--mx-drop-down-field-frame-focus-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `drop-down.field.frame.focus.border-bottom-color` | `--mx-drop-down-field-frame-focus-border-bottom-color` | `color.accent.solid` | `#c24523` |
| `drop-down.field.frame.focus.border-width` | `--mx-drop-down-field-frame-focus-border-width` | `border.width.1` | `1px` |
| `drop-down.field.frame.border-bottom-color` | `--mx-drop-down-field-frame-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `drop-down.search.variant` | `--mx-drop-down-search-variant` | `` | `outline` |
| `drop-down.search.size` | `--mx-drop-down-search-size` | `` | `sm` |
| `drop-down.value.placeholder.color` | `--mx-drop-down-value-placeholder-color` | `color.fg.secondary` | `#5e5c55` |
| `drop-down.value.missing.color` | `--mx-drop-down-value-missing-color` | `color.fg.secondary` | `#5e5c55` |
| `drop-down.value.missing.text-decoration` | `--mx-drop-down-value-missing-text-decoration` | `` | `underline` |
| `drop-down.chevron.size` | `--mx-drop-down-chevron-size` | `icon.size.sm` | `0.75rem` |
| `drop-down.chevron.color` | `--mx-drop-down-chevron-color` | `color.fg.secondary` | `#5e5c55` |
| `drop-down.chevron.icon` | `--mx-drop-down-chevron-icon` | `` | `var(--mx-icon-chevron-down)` |
| `drop-down.chevron.open.rotate` | `--mx-drop-down-chevron-open-rotate` | `` | `0.5turn` |
| `drop-down.chevron.disabled.color` | `--mx-drop-down-chevron-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `drop-down.spinner.size` | `--mx-drop-down-spinner-size` | `icon.size.sm` | `0.75rem` |
| `drop-down.spinner.border-width` | `--mx-drop-down-spinner-border-width` | `border.width.2` | `2px` |
| `drop-down.spinner.border-end-color` | `--mx-drop-down-spinner-border-end-color` | `` | `rgb(0 0 0 / 0)` |
| `drop-down.spinner.radius` | `--mx-drop-down-spinner-radius` | `radius.full` | `9999px` |
| `drop-down.spinner.color` | `--mx-drop-down-spinner-color` | `color.fg.secondary` | `#5e5c55` |
| `drop-down.spinner-shape.display` | `--mx-drop-down-spinner-shape-display` | `` | `initial` |
| `drop-target.target.radius` | `--mx-drop-target-target-radius` | `radius.md` | `0.375rem` |
| `drop-target.target.active.outline-style` | `--mx-drop-target-target-active-outline-style` | `` | `dashed` |
| `drop-target.target.active.outline-width` | `--mx-drop-target-target-active-outline-width` | `border.width.2` | `2px` |
| `drop-target.target.active.outline-color` | `--mx-drop-target-target-active-outline-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `drop-target.target.active.outline-offset` | `--mx-drop-target-target-active-outline-offset` | `` | `-2px` |
| `drop-target.target.over.outline-style` | `--mx-drop-target-target-over-outline-style` | `` | `solid` |
| `drop-target.target.over.outline-width` | `--mx-drop-target-target-over-outline-width` | `border.width.2` | `2px` |
| `drop-target.target.over.outline-color` | `--mx-drop-target-target-over-outline-color` | `color.accent.solid` | `#c24523` |
| `drop-target.target.over.outline-offset` | `--mx-drop-target-target-over-outline-offset` | `` | `-2px` |
| `drop-target.target.over.bg` | `--mx-drop-target-target-over-bg` | `color.accent.subtle` | `#fbe6de` |
| `drop-target.target.refused.outline-style` | `--mx-drop-target-target-refused-outline-style` | `` | `solid` |
| `drop-target.target.refused.outline-width` | `--mx-drop-target-target-refused-outline-width` | `border.width.2` | `2px` |
| `drop-target.target.refused.outline-color` | `--mx-drop-target-target-refused-outline-color` | `color.danger.solid` | `#b03659` |
| `drop-target.target.refused.outline-offset` | `--mx-drop-target-target-refused-outline-offset` | `` | `-2px` |
| `drop-target.target.refused.bg` | `--mx-drop-target-target-refused-bg` | `color.danger.subtle` | `#fde7e9` |
| `field.width` | `--mx-field-width` | `` | `16rem` |
| `field.variant` | `--mx-field-variant` | `` | `outline` |
| `field.label-mode` | `--mx-field-label-mode` | `` | `top` |
| `field.notch` | `--mx-field-notch` | `` | `none` |
| `field.size` | `--mx-field-size` | `` | `md` |
| `field.border-width` | `--mx-field-border-width` | `border.width.1` | `1px` |
| `field.gap` | `--mx-field-gap` | `space.2` | `0.5rem` |
| `field.label-gap` | `--mx-field-label-gap` | `space.1` | `0.25rem` |
| `field.label-width` | `--mx-field-label-width` | `` | `8rem` |
| `field.label-font-weight` | `--mx-field-label-font-weight` | `font.weight.medium` | `500` |
| `field.label-font-size` | `--mx-field-label-font-size` | `` | `1em` |
| `field.icon-size` | `--mx-field-icon-size` | `icon.size.md` | `1rem` |
| `field.button-inset` | `--mx-field-button-inset` | `space.1` | `0.25rem` |
| `field.floating-height` | `--mx-field-floating-height` | `` | `3rem` |
| `field.floating-font-size` | `--mx-field-floating-font-size` | `font.size.caption` | `0.75rem` |
| `field.floating-label-inset` | `--mx-field-floating-label-inset` | `` | `0px` |
| `field.floating-label-height` | `--mx-field-floating-label-height` | `` | `calc(3rem / 2)` |
| `field.floating-label-font-weight` | `--mx-field-floating-label-font-weight` | `font.weight.regular` | `400` |
| `field.floating-padding` | `--mx-field-floating-padding` | `space.2` | `0.5rem` |
| `field.notch-gap` | `--mx-field-notch-gap` | `space.1` | `0.25rem` |
| `field.font-size.sm` | `--mx-field-font-size-sm` | `font.size.caption` | `0.75rem` |
| `field.font-size.md` | `--mx-field-font-size-md` | `font.size.body` | `0.875rem` |
| `field.font-size.lg` | `--mx-field-font-size-lg` | `font.size.body-large` | `1.125rem` |
| `field.height.sm` | `--mx-field-height-sm` | `control.height.sm` | `1.5rem` |
| `field.height.md` | `--mx-field-height-md` | `control.height.md` | `2rem` |
| `field.height.lg` | `--mx-field-height-lg` | `control.height.lg` | `2.5rem` |
| `field.padding.sm` | `--mx-field-padding-sm` | `control.padding.sm` | `0.5rem` |
| `field.padding.md` | `--mx-field-padding-md` | `control.padding.md` | `0.6875rem` |
| `field.padding.lg` | `--mx-field-padding-lg` | `control.padding.lg` | `1rem` |
| `field.padding-start.sm` | `--mx-field-padding-start-sm` | `control.padding.sm` | `0.5rem` |
| `field.padding-start.md` | `--mx-field-padding-start-md` | `control.padding.md` | `0.6875rem` |
| `field.padding-start.lg` | `--mx-field-padding-start-lg` | `control.padding.lg` | `1rem` |
| `field.padding-end.sm` | `--mx-field-padding-end-sm` | `control.padding.sm` | `0.5rem` |
| `field.padding-end.md` | `--mx-field-padding-end-md` | `control.padding.md` | `0.6875rem` |
| `field.padding-end.lg` | `--mx-field-padding-end-lg` | `control.padding.lg` | `1rem` |
| `field.box.bg` | `--mx-field-box-bg` | `color.fill.control.default` | `#f5f4f0` |
| `field.box.color` | `--mx-field-box-color` | `color.fg.primary` | `#1d1c1a` |
| `field.box.shadow` | `--mx-field-box-shadow` | `` | `inset 0px 1px 2px 0px rgb(0 0 0 / 0.12)` |
| `field.box.cursor` | `--mx-field-box-cursor` | `` | `text` |
| `field.box.radius` | `--mx-field-box-radius` | `radius.md` | `0.375rem` |
| `field.box.hover.bg` | `--mx-field-box-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `field.box.focus.bg` | `--mx-field-box-focus-bg` | `color.bg.surface` | `#f8f7f3` |
| `field.box.focus.shadow` | `--mx-field-box-focus-shadow` | `` | `initial` |
| `field.box.invalid-hover.bg` | `--mx-field-box-invalid-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `field.box.invalid-focus.bg` | `--mx-field-box-invalid-focus-bg` | `color.bg.surface` | `#f8f7f3` |
| `field.box.invalid-focus.shadow` | `--mx-field-box-invalid-focus-shadow` | `` | `initial` |
| `field.box.disabled.bg` | `--mx-field-box-disabled-bg` | `color.fill.control.disabled` | `#ebeae5` |
| `field.box.disabled.color` | `--mx-field-box-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `field.box.disabled.cursor` | `--mx-field-box-disabled-cursor` | `` | `default` |
| `field.box.disabled.shadow` | `--mx-field-box-disabled-shadow` | `` | `initial` |
| `field.box.filled.bg` | `--mx-field-box-filled-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `field.box.filled.radius-top` | `--mx-field-box-filled-radius-top` | `` | `initial` |
| `field.box.filled.radius-bottom` | `--mx-field-box-filled-radius-bottom` | `` | `initial` |
| `field.box.filled-hover.bg` | `--mx-field-box-filled-hover-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `field.box.filled-focus.bg` | `--mx-field-box-filled-focus-bg` | `color.bg.surface` | `#f8f7f3` |
| `field.box.filled-focus.shadow` | `--mx-field-box-filled-focus-shadow` | `` | `initial` |
| `field.box.filled-invalid-hover.bg` | `--mx-field-box-filled-invalid-hover-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `field.box.filled-invalid-focus.bg` | `--mx-field-box-filled-invalid-focus-bg` | `color.bg.surface` | `#f8f7f3` |
| `field.box.filled-invalid-focus.shadow` | `--mx-field-box-filled-invalid-focus-shadow` | `` | `initial` |
| `field.box.filled-disabled.bg` | `--mx-field-box-filled-disabled-bg` | `color.fill.control.disabled` | `#ebeae5` |
| `field.box.filled-disabled.color` | `--mx-field-box-filled-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `field.box.filled-disabled.cursor` | `--mx-field-box-filled-disabled-cursor` | `` | `default` |
| `field.box.underline.bg` | `--mx-field-box-underline-bg` | `` | `rgb(0 0 0 / 0)` |
| `field.box.underline.radius` | `--mx-field-box-underline-radius` | `` | `0px` |
| `field.box.underline-disabled.bg` | `--mx-field-box-underline-disabled-bg` | `color.fill.control.disabled` | `#ebeae5` |
| `field.box.underline-disabled.color` | `--mx-field-box-underline-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `field.box.underline-disabled.cursor` | `--mx-field-box-underline-disabled-cursor` | `` | `default` |
| `field.box.underline-disabled.shadow` | `--mx-field-box-underline-disabled-shadow` | `` | `initial` |
| `field.box.readonly-focus.shadow` | `--mx-field-box-readonly-focus-shadow` | `` | `initial` |
| `field.box.filled-readonly-focus.shadow` | `--mx-field-box-filled-readonly-focus-shadow` | `` | `initial` |
| `field.box.underline-focus.shadow` | `--mx-field-box-underline-focus-shadow` | `` | `initial` |
| `field.box.underline-invalid-focus.shadow` | `--mx-field-box-underline-invalid-focus-shadow` | `` | `initial` |
| `field.box.underline-readonly-focus.shadow` | `--mx-field-box-underline-readonly-focus-shadow` | `` | `initial` |
| `field.box.readonly-invalid-focus.shadow` | `--mx-field-box-readonly-invalid-focus-shadow` | `` | `initial` |
| `field.box.filled-readonly-invalid-focus.shadow` | `--mx-field-box-filled-readonly-invalid-focus-shadow` | `` | `initial` |
| `field.box.underline-readonly-invalid-focus.shadow` | `--mx-field-box-underline-readonly-invalid-focus-shadow` | `` | `initial` |
| `field.box.pressed.bg` | `--mx-field-box-pressed-bg` | `` | `initial` |
| `field.box.pressed.color` | `--mx-field-box-pressed-color` | `` | `initial` |
| `field.box.border-style` | `--mx-field-box-border-style` | `` | `initial` |
| `field.box.border-color` | `--mx-field-box-border-color` | `` | `initial` |
| `field.frame.border-color` | `--mx-field-frame-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `field.frame.focus.border-bottom-color` | `--mx-field-frame-focus-border-bottom-color` | `color.accent.solid` | `#c24523` |
| `field.frame.focus.border-color` | `--mx-field-frame-focus-border-color` | `` | `initial` |
| `field.frame.focus.border-width` | `--mx-field-frame-focus-border-width` | `` | `initial` |
| `field.frame.invalid.border-color` | `--mx-field-frame-invalid-border-color` | `color.danger.solid` | `#b03659` |
| `field.frame.readonly-focus.border-bottom-color` | `--mx-field-frame-readonly-focus-border-bottom-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `field.frame.readonly-focus.border-width` | `--mx-field-frame-readonly-focus-border-width` | `` | `initial` |
| `field.frame.filled.border-color` | `--mx-field-frame-filled-border-color` | `` | `rgb(0 0 0 / 0)` |
| `field.frame.filled.border-bottom-color` | `--mx-field-frame-filled-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `field.frame.filled-focus.border-bottom-color` | `--mx-field-frame-filled-focus-border-bottom-color` | `color.accent.solid` | `#c24523` |
| `field.frame.filled-focus.border-color` | `--mx-field-frame-filled-focus-border-color` | `` | `initial` |
| `field.frame.filled-focus.border-width` | `--mx-field-frame-filled-focus-border-width` | `` | `initial` |
| `field.frame.filled-invalid.border-color` | `--mx-field-frame-filled-invalid-border-color` | `color.danger.solid` | `#b03659` |
| `field.frame.filled-readonly-focus.border-bottom-color` | `--mx-field-frame-filled-readonly-focus-border-bottom-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `field.frame.filled-readonly-focus.border-width` | `--mx-field-frame-filled-readonly-focus-border-width` | `` | `initial` |
| `field.frame.filled-disabled.border-color` | `--mx-field-frame-filled-disabled-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `field.frame.underline.border-color` | `--mx-field-frame-underline-border-color` | `` | `rgb(0 0 0 / 0)` |
| `field.frame.underline.border-bottom-color` | `--mx-field-frame-underline-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `field.frame.underline-focus.border-bottom-color` | `--mx-field-frame-underline-focus-border-bottom-color` | `color.accent.solid` | `#c24523` |
| `field.frame.underline-focus.border-width` | `--mx-field-frame-underline-focus-border-width` | `` | `initial` |
| `field.frame.underline-invalid.border-bottom-color` | `--mx-field-frame-underline-invalid-border-bottom-color` | `color.danger.solid` | `#b03659` |
| `field.frame.underline-readonly-focus.border-bottom-color` | `--mx-field-frame-underline-readonly-focus-border-bottom-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `field.frame.underline-readonly-focus.border-width` | `--mx-field-frame-underline-readonly-focus-border-width` | `` | `initial` |
| `field.frame.underline-disabled.border-color` | `--mx-field-frame-underline-disabled-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `field.frame.readonly-invalid.border-bottom-color` | `--mx-field-frame-readonly-invalid-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `field.frame.readonly-invalid-focus.border-bottom-color` | `--mx-field-frame-readonly-invalid-focus-border-bottom-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `field.frame.readonly-invalid-focus.border-width` | `--mx-field-frame-readonly-invalid-focus-border-width` | `` | `initial` |
| `field.frame.filled-readonly-invalid.border-bottom-color` | `--mx-field-frame-filled-readonly-invalid-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `field.frame.filled-readonly-invalid-focus.border-bottom-color` | `--mx-field-frame-filled-readonly-invalid-focus-border-bottom-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `field.frame.filled-readonly-invalid-focus.border-width` | `--mx-field-frame-filled-readonly-invalid-focus-border-width` | `` | `initial` |
| `field.frame.underline-readonly-invalid.border-bottom-color` | `--mx-field-frame-underline-readonly-invalid-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `field.frame.underline-readonly-invalid-focus.border-bottom-color` | `--mx-field-frame-underline-readonly-invalid-focus-border-bottom-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `field.frame.underline-readonly-invalid-focus.border-width` | `--mx-field-frame-underline-readonly-invalid-focus-border-width` | `` | `initial` |
| `field.frame.border-bottom-color` | `--mx-field-frame-border-bottom-color` | `` | `initial` |
| `field.frame.readonly.border-bottom-color` | `--mx-field-frame-readonly-border-bottom-color` | `` | `initial` |
| `field.frame.disabled.border-bottom-color` | `--mx-field-frame-disabled-border-bottom-color` | `` | `initial` |
| `field.frame.disabled.border-color` | `--mx-field-frame-disabled-border-color` | `` | `initial` |
| `field.frame.filled-readonly.border-bottom-color` | `--mx-field-frame-filled-readonly-border-bottom-color` | `` | `initial` |
| `field.frame.underline-readonly.border-bottom-color` | `--mx-field-frame-underline-readonly-border-bottom-color` | `` | `initial` |
| `field.frame.invalid-focus.border-width` | `--mx-field-frame-invalid-focus-border-width` | `` | `initial` |
| `field.frame.filled-invalid-focus.border-width` | `--mx-field-frame-filled-invalid-focus-border-width` | `` | `initial` |
| `field.frame.underline-invalid-focus.border-width` | `--mx-field-frame-underline-invalid-focus-border-width` | `` | `initial` |
| `field.frame.hover.border-color` | `--mx-field-frame-hover-border-color` | `` | `initial` |
| `field.frame.hover.border-bottom-color` | `--mx-field-frame-hover-border-bottom-color` | `` | `initial` |
| `field.frame.filled-hover.border-bottom-color` | `--mx-field-frame-filled-hover-border-bottom-color` | `` | `initial` |
| `field.frame.underline-hover.border-bottom-color` | `--mx-field-frame-underline-hover-border-bottom-color` | `` | `initial` |
| `field.frame.display` | `--mx-field-frame-display` | `` | `initial` |
| `field.indicator.radius` | `--mx-field-indicator-radius` | `` | `calc(0.375rem - 1px)` |
| `field.indicator.focus.shadow` | `--mx-field-indicator-focus-shadow` | `` | `inset 0 -1px 0 0 #c24523` |
| `field.indicator.invalid-focus.shadow` | `--mx-field-indicator-invalid-focus-shadow` | `` | `inset 0 -1px 0 0 #b03659` |
| `field.indicator.readonly-focus.shadow` | `--mx-field-indicator-readonly-focus-shadow` | `` | `inset 0 -1px 0 0 rgb(0 0 0 / 0.4458)` |
| `field.indicator.filled-focus.shadow` | `--mx-field-indicator-filled-focus-shadow` | `` | `inset 0 -1px 0 0 #c24523` |
| `field.indicator.filled-invalid-focus.shadow` | `--mx-field-indicator-filled-invalid-focus-shadow` | `` | `inset 0 -1px 0 0 #b03659` |
| `field.indicator.filled-readonly-focus.shadow` | `--mx-field-indicator-filled-readonly-focus-shadow` | `` | `inset 0 -1px 0 0 rgb(0 0 0 / 0.4458)` |
| `field.indicator.underline.radius` | `--mx-field-indicator-underline-radius` | `` | `0px` |
| `field.indicator.underline-focus.shadow` | `--mx-field-indicator-underline-focus-shadow` | `` | `inset 0 -1px 0 0 #c24523` |
| `field.indicator.underline-invalid-focus.shadow` | `--mx-field-indicator-underline-invalid-focus-shadow` | `` | `inset 0 -1px 0 0 #b03659` |
| `field.indicator.underline-readonly-focus.shadow` | `--mx-field-indicator-underline-readonly-focus-shadow` | `` | `inset 0 -1px 0 0 rgb(0 0 0 / 0.4458)` |
| `field.indicator.readonly-invalid-focus.shadow` | `--mx-field-indicator-readonly-invalid-focus-shadow` | `` | `inset 0 -1px 0 0 rgb(0 0 0 / 0.4458)` |
| `field.indicator.filled-readonly-invalid-focus.shadow` | `--mx-field-indicator-filled-readonly-invalid-focus-shadow` | `` | `inset 0 -1px 0 0 rgb(0 0 0 / 0.4458)` |
| `field.indicator.underline-readonly-invalid-focus.shadow` | `--mx-field-indicator-underline-readonly-invalid-focus-shadow` | `` | `inset 0 -1px 0 0 rgb(0 0 0 / 0.4458)` |
| `field.indicator.filled.radius` | `--mx-field-indicator-filled-radius` | `` | `initial` |
| `field.indicator.display` | `--mx-field-indicator-display` | `` | `initial` |
| `field.label.color` | `--mx-field-label-color` | `color.fg.primary` | `#1d1c1a` |
| `field.label.disabled.color` | `--mx-field-label-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `field.label.floating.color` | `--mx-field-label-floating-color` | `color.fg.secondary` | `#5e5c55` |
| `field.label.floating-disabled.color` | `--mx-field-label-floating-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `field.label.focus.color` | `--mx-field-label-focus-color` | `` | `initial` |
| `field.label.invalid.color` | `--mx-field-label-invalid-color` | `` | `initial` |
| `field.label.floating-focus.color` | `--mx-field-label-floating-focus-color` | `` | `initial` |
| `field.label.floating-invalid.color` | `--mx-field-label-floating-invalid-color` | `` | `initial` |
| `field.required.margin-start` | `--mx-field-required-margin-start` | `space.1` | `0.25rem` |
| `field.required.color` | `--mx-field-required-color` | `color.danger.fg` | `#b03659` |
| `field.icon.color` | `--mx-field-icon-color` | `color.fg.secondary` | `#5e5c55` |
| `field.prefix.color` | `--mx-field-prefix-color` | `color.fg.secondary` | `#5e5c55` |
| `field.suffix.color` | `--mx-field-suffix-color` | `color.fg.secondary` | `#5e5c55` |
| `field.placeholder.color` | `--mx-field-placeholder-color` | `color.fg.secondary` | `#5e5c55` |
| `field.slot.gap` | `--mx-field-slot-gap` | `space.1` | `0.25rem` |
| `field.button.padding-inline` | `--mx-field-button-padding-inline` | `space.1` | `0.25rem` |
| `field.button.gap` | `--mx-field-button-gap` | `space.1` | `0.25rem` |
| `field.button.radius` | `--mx-field-button-radius` | `radius.sm` | `0.25rem` |
| `field.button.color` | `--mx-field-button-color` | `color.fg.secondary` | `#5e5c55` |
| `field.button.hover.color` | `--mx-field-button-hover-color` | `color.fg.primary` | `#1d1c1a` |
| `field.button.hover.bg` | `--mx-field-button-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `field.button.pressed.color` | `--mx-field-button-pressed-color` | `color.fg.primary` | `#1d1c1a` |
| `field.button.pressed.bg` | `--mx-field-button-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `field.button.focus.outline-width` | `--mx-field-button-focus-outline-width` | `focus.ring.width` | `2px` |
| `field.button.focus.outline-color` | `--mx-field-button-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `field.button.focus.outline-offset` | `--mx-field-button-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `field.button.focus.glow` | `--mx-field-button-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `field.button.disabled.color` | `--mx-field-button-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `field.glyph.size` | `--mx-field-glyph-size` | `icon.size.sm` | `0.75rem` |
| `field.foot.font-size` | `--mx-field-foot-font-size` | `font.size.caption` | `0.75rem` |
| `field.foot.line-height` | `--mx-field-foot-line-height` | `font.line.caption` | `1rem` |
| `field.foot.color` | `--mx-field-foot-color` | `color.fg.secondary` | `#5e5c55` |
| `field.foot.shown.padding-top` | `--mx-field-foot-shown-padding-top` | `space.1` | `0.25rem` |
| `field.foot.display` | `--mx-field-foot-display` | `` | `initial` |
| `field.message.invalid.color` | `--mx-field-message-invalid-color` | `color.danger.fg` | `#b03659` |
| `field.frame-start.focus.border-block-width` | `--mx-field-frame-start-focus-border-block-width` | `` | `initial` |
| `field.frame-start.focus.border-start-width` | `--mx-field-frame-start-focus-border-start-width` | `` | `initial` |
| `field.frame-start.invalid-focus.border-block-width` | `--mx-field-frame-start-invalid-focus-border-block-width` | `` | `initial` |
| `field.frame-start.invalid-focus.border-start-width` | `--mx-field-frame-start-invalid-focus-border-start-width` | `` | `initial` |
| `field.frame-start.readonly-focus.border-block-width` | `--mx-field-frame-start-readonly-focus-border-block-width` | `` | `initial` |
| `field.frame-start.readonly-focus.border-start-width` | `--mx-field-frame-start-readonly-focus-border-start-width` | `` | `initial` |
| `field.frame-start.readonly-invalid-focus.border-block-width` | `--mx-field-frame-start-readonly-invalid-focus-border-block-width` | `` | `initial` |
| `field.frame-start.readonly-invalid-focus.border-start-width` | `--mx-field-frame-start-readonly-invalid-focus-border-start-width` | `` | `initial` |
| `field.frame-notch.focus.border-bottom-width` | `--mx-field-frame-notch-focus-border-bottom-width` | `` | `initial` |
| `field.frame-notch.invalid-focus.border-bottom-width` | `--mx-field-frame-notch-invalid-focus-border-bottom-width` | `` | `initial` |
| `field.frame-notch.readonly-focus.border-bottom-width` | `--mx-field-frame-notch-readonly-focus-border-bottom-width` | `` | `initial` |
| `field.frame-notch.readonly-invalid-focus.border-bottom-width` | `--mx-field-frame-notch-readonly-invalid-focus-border-bottom-width` | `` | `initial` |
| `field.frame-end.focus.border-block-width` | `--mx-field-frame-end-focus-border-block-width` | `` | `initial` |
| `field.frame-end.focus.border-end-width` | `--mx-field-frame-end-focus-border-end-width` | `` | `initial` |
| `field.frame-end.invalid-focus.border-block-width` | `--mx-field-frame-end-invalid-focus-border-block-width` | `` | `initial` |
| `field.frame-end.invalid-focus.border-end-width` | `--mx-field-frame-end-invalid-focus-border-end-width` | `` | `initial` |
| `field.frame-end.readonly-focus.border-block-width` | `--mx-field-frame-end-readonly-focus-border-block-width` | `` | `initial` |
| `field.frame-end.readonly-focus.border-end-width` | `--mx-field-frame-end-readonly-focus-border-end-width` | `` | `initial` |
| `field.frame-end.readonly-invalid-focus.border-block-width` | `--mx-field-frame-end-readonly-invalid-focus-border-block-width` | `` | `initial` |
| `field.frame-end.readonly-invalid-focus.border-end-width` | `--mx-field-frame-end-readonly-invalid-focus-border-end-width` | `` | `initial` |
| `file-uploader.box-gap` | `--mx-file-uploader-box-gap` | `space.3` | `0.75rem` |
| `file-uploader.button-gap` | `--mx-file-uploader-button-gap` | `space.2` | `0.5rem` |
| `file-uploader.item-gap` | `--mx-file-uploader-item-gap` | `space.2` | `0.5rem` |
| `file-uploader.zone-padding` | `--mx-file-uploader-zone-padding` | `space.2` | `0.5rem` |
| `file-uploader.field.label-mode` | `--mx-file-uploader-field-label-mode` | `` | `top` |
| `file-uploader.field.width` | `--mx-file-uploader-field-width` | `` | `26rem` |
| `file-uploader.field.box.border-style` | `--mx-file-uploader-field-box-border-style` | `` | `dashed` |
| `file-uploader.field.box.border-color` | `--mx-file-uploader-field-box-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `file-uploader.field.box.radius` | `--mx-file-uploader-field-box-radius` | `radius.lg` | `0.625rem` |
| `file-uploader.field.box.hover.bg` | `--mx-file-uploader-field-box-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `file-uploader.field.border-width` | `--mx-file-uploader-field-border-width` | `border.width.1` | `1px` |
| `file-uploader.action.variant` | `--mx-file-uploader-action-variant` | `` | `ghost` |
| `file-uploader.over.bg` | `--mx-file-uploader-over-bg` | `color.accent.subtle` | `#fbe6de` |
| `file-uploader.over.border-color` | `--mx-file-uploader-over-border-color` | `color.accent.solid` | `#c24523` |
| `file-uploader.select.padding-block` | `--mx-file-uploader-select-padding-block` | `space.1` | `0.25rem` |
| `file-uploader.select.padding-inline` | `--mx-file-uploader-select-padding-inline` | `space.3` | `0.75rem` |
| `file-uploader.select.radius` | `--mx-file-uploader-select-radius` | `radius.sm` | `0.25rem` |
| `file-uploader.select.color` | `--mx-file-uploader-select-color` | `color.fg.primary` | `#1d1c1a` |
| `file-uploader.select.font-weight` | `--mx-file-uploader-select-font-weight` | `font.weight.semibold` | `600` |
| `file-uploader.select.bg` | `--mx-file-uploader-select-bg` | `color.fill.control.default` | `#f5f4f0` |
| `file-uploader.select.border-width` | `--mx-file-uploader-select-border-width` | `border.width.1` | `1px` |
| `file-uploader.select.border-color` | `--mx-file-uploader-select-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `file-uploader.select.hover.bg` | `--mx-file-uploader-select-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `file-uploader.select.hover.cursor` | `--mx-file-uploader-select-hover-cursor` | `` | `pointer` |
| `file-uploader.select.pressed.bg` | `--mx-file-uploader-select-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `file-uploader.select.focus.glow` | `--mx-file-uploader-select-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `file-uploader.select.focus.outline-width` | `--mx-file-uploader-select-focus-outline-width` | `focus.ring.width` | `2px` |
| `file-uploader.select.focus.outline-color` | `--mx-file-uploader-select-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `file-uploader.select.focus.outline-offset` | `--mx-file-uploader-select-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `file-uploader.select.disabled.color` | `--mx-file-uploader-select-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `file-uploader.select.disabled.border-color` | `--mx-file-uploader-select-disabled-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `file-uploader.upload.padding-block` | `--mx-file-uploader-upload-padding-block` | `space.1` | `0.25rem` |
| `file-uploader.upload.padding-inline` | `--mx-file-uploader-upload-padding-inline` | `space.3` | `0.75rem` |
| `file-uploader.upload.radius` | `--mx-file-uploader-upload-radius` | `radius.sm` | `0.25rem` |
| `file-uploader.upload.color` | `--mx-file-uploader-upload-color` | `color.accent.on-solid` | `#ffffff` |
| `file-uploader.upload.font-weight` | `--mx-file-uploader-upload-font-weight` | `font.weight.semibold` | `600` |
| `file-uploader.upload.bg` | `--mx-file-uploader-upload-bg` | `color.accent.solid` | `#c24523` |
| `file-uploader.upload.border-width` | `--mx-file-uploader-upload-border-width` | `border.width.1` | `1px` |
| `file-uploader.upload.border-color` | `--mx-file-uploader-upload-border-color` | `color.accent.solid` | `#c24523` |
| `file-uploader.upload.hover.bg` | `--mx-file-uploader-upload-hover-bg` | `color.accent.solid-hover` | `#b43f20` |
| `file-uploader.upload.hover.cursor` | `--mx-file-uploader-upload-hover-cursor` | `` | `pointer` |
| `file-uploader.upload.pressed.bg` | `--mx-file-uploader-upload-pressed-bg` | `color.accent.solid-hover` | `#b43f20` |
| `file-uploader.upload.focus.glow` | `--mx-file-uploader-upload-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `file-uploader.upload.focus.outline-width` | `--mx-file-uploader-upload-focus-outline-width` | `focus.ring.width` | `2px` |
| `file-uploader.upload.focus.outline-color` | `--mx-file-uploader-upload-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `file-uploader.upload.focus.outline-offset` | `--mx-file-uploader-upload-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `file-uploader.hint.color` | `--mx-file-uploader-hint-color` | `color.fg.secondary` | `#5e5c55` |
| `file-uploader.list.margin-top` | `--mx-file-uploader-list-margin-top` | `space.2` | `0.5rem` |
| `file-uploader.list.gap` | `--mx-file-uploader-list-gap` | `space.1` | `0.25rem` |
| `file-uploader.item.padding-block` | `--mx-file-uploader-item-padding-block` | `space.1` | `0.25rem` |
| `file-uploader.item.padding-inline` | `--mx-file-uploader-item-padding-inline` | `space.2` | `0.5rem` |
| `file-uploader.item.radius` | `--mx-file-uploader-item-radius` | `radius.sm` | `0.25rem` |
| `file-uploader.item.error.bg` | `--mx-file-uploader-item-error-bg` | `color.danger.subtle` | `#fde7e9` |
| `file-uploader.item.invalid.bg` | `--mx-file-uploader-item-invalid-bg` | `color.danger.subtle` | `#fde7e9` |
| `file-uploader.icon.icon` | `--mx-file-uploader-icon-icon` | `` | `var(--mx-icon-file)` |
| `file-uploader.icon.bg` | `--mx-file-uploader-icon-bg` | `color.fg.secondary` | `#5e5c55` |
| `file-uploader.icon.size` | `--mx-file-uploader-icon-size` | `` | `1.25rem` |
| `file-uploader.name.color` | `--mx-file-uploader-name-color` | `color.fg.primary` | `#1d1c1a` |
| `file-uploader.size.color` | `--mx-file-uploader-size-color` | `color.fg.secondary` | `#5e5c55` |
| `file-uploader.size.font-size` | `--mx-file-uploader-size-font-size` | `font.size.caption` | `0.75rem` |
| `file-uploader.state.color` | `--mx-file-uploader-state-color` | `color.fg.secondary` | `#5e5c55` |
| `file-uploader.state.font-size` | `--mx-file-uploader-state-font-size` | `font.size.caption` | `0.75rem` |
| `file-uploader.state.done.color` | `--mx-file-uploader-state-done-color` | `color.success.fg` | `#006402` |
| `file-uploader.state.error.color` | `--mx-file-uploader-state-error-color` | `color.danger.fg` | `#b03659` |
| `filterbuilder.indent` | `--mx-filterbuilder-indent` | `space.6` | `1.5rem` |
| `filterbuilder.line-width` | `--mx-filterbuilder-line-width` | `border.width.1` | `1px` |
| `filterbuilder.line-color` | `--mx-filterbuilder-line-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `filterbuilder.line-offset` | `--mx-filterbuilder-line-offset` | `space.3` | `0.75rem` |
| `filterbuilder.elbow-length` | `--mx-filterbuilder-elbow-length` | `` | `0px` |
| `filterbuilder.elbow-color` | `--mx-filterbuilder-elbow-color` | `` | `rgb(0 0 0 / 0)` |
| `filterbuilder.value-width` | `--mx-filterbuilder-value-width` | `` | `12rem` |
| `filterbuilder.field-button.variant` | `--mx-filterbuilder-field-button-variant` | `` | `ghost` |
| `filterbuilder.field-button.tone` | `--mx-filterbuilder-field-button-tone` | `` | `accent` |
| `filterbuilder.field-button.size` | `--mx-filterbuilder-field-button-size` | `` | `sm` |
| `filterbuilder.operation-button.variant` | `--mx-filterbuilder-operation-button-variant` | `` | `ghost` |
| `filterbuilder.operation-button.tone` | `--mx-filterbuilder-operation-button-tone` | `` | `standard` |
| `filterbuilder.operation-button.size` | `--mx-filterbuilder-operation-button-size` | `` | `sm` |
| `filterbuilder.value-button.variant` | `--mx-filterbuilder-value-button-variant` | `` | `ghost` |
| `filterbuilder.value-button.tone` | `--mx-filterbuilder-value-button-tone` | `` | `standard` |
| `filterbuilder.value-button.size` | `--mx-filterbuilder-value-button-size` | `` | `sm` |
| `filterbuilder.group-button.variant` | `--mx-filterbuilder-group-button-variant` | `` | `ghost` |
| `filterbuilder.group-button.tone` | `--mx-filterbuilder-group-button-tone` | `` | `accent` |
| `filterbuilder.group-button.size` | `--mx-filterbuilder-group-button-size` | `` | `sm` |
| `filterbuilder.add-button.variant` | `--mx-filterbuilder-add-button-variant` | `` | `ghost` |
| `filterbuilder.add-button.tone` | `--mx-filterbuilder-add-button-tone` | `` | `standard` |
| `filterbuilder.add-button.size` | `--mx-filterbuilder-add-button-size` | `` | `sm` |
| `filterbuilder.remove-button.variant` | `--mx-filterbuilder-remove-button-variant` | `` | `ghost` |
| `filterbuilder.remove-button.tone` | `--mx-filterbuilder-remove-button-tone` | `` | `standard` |
| `filterbuilder.remove-button.size` | `--mx-filterbuilder-remove-button-size` | `` | `sm` |
| `filterbuilder.container.color` | `--mx-filterbuilder-container-color` | `color.fg.primary` | `#1d1c1a` |
| `filterbuilder.container.font-size` | `--mx-filterbuilder-container-font-size` | `font.size.body` | `0.875rem` |
| `filterbuilder.tree.gap` | `--mx-filterbuilder-tree-gap` | `space.1` | `0.25rem` |
| `filterbuilder.row.gap` | `--mx-filterbuilder-row-gap` | `space.1` | `0.25rem` |
| `filterbuilder.editor.gap` | `--mx-filterbuilder-editor-gap` | `space.1` | `0.25rem` |
| `form-layout.row-gap` | `--mx-form-layout-row-gap` | `space.4` | `1rem` |
| `form-layout.column-gap` | `--mx-form-layout-column-gap` | `space.4` | `1rem` |
| `form-layout.caption-float` | `--mx-form-layout-caption-float` | `` | `none` |
| `form-layout.field.label-width` | `--mx-form-layout-field-label-width` | `` | `8rem` |
| `form-layout.group.padding` | `--mx-form-layout-group-padding` | `space.4` | `1rem` |
| `form-layout.group.border-width` | `--mx-form-layout-group-border-width` | `border.width.1` | `1px` |
| `form-layout.group.border-color` | `--mx-form-layout-group-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `form-layout.group.radius` | `--mx-form-layout-group-radius` | `radius.lg` | `0.625rem` |
| `form-layout.group.bg` | `--mx-form-layout-group-bg` | `` | `initial` |
| `form-layout.caption.padding-inline` | `--mx-form-layout-caption-padding-inline` | `space.1` | `0.25rem` |
| `form-layout.caption.font-size` | `--mx-form-layout-caption-font-size` | `` | `1em` |
| `form-layout.caption.font-weight` | `--mx-form-layout-caption-font-weight` | `font.weight.semibold` | `600` |
| `gallery.gap` | `--mx-gallery-gap` | `space.2` | `0.5rem` |
| `gallery.nav-inset` | `--mx-gallery-nav-inset` | `space.2` | `0.5rem` |
| `gallery.bar-inset` | `--mx-gallery-bar-inset` | `space.2` | `0.5rem` |
| `gallery.indicator-gap` | `--mx-gallery-indicator-gap` | `space.2` | `0.5rem` |
| `gallery.caption-padding` | `--mx-gallery-caption-padding` | `space.3` | `0.75rem` |
| `gallery.frame.radius` | `--mx-gallery-frame-radius` | `radius.md` | `0.375rem` |
| `gallery.frame.bg` | `--mx-gallery-frame-bg` | `color.bg.layer` | `#ebeae5` |
| `gallery.frame.focus.glow` | `--mx-gallery-frame-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `gallery.frame.focus.outline-width` | `--mx-gallery-frame-focus-outline-width` | `focus.ring.width` | `2px` |
| `gallery.frame.focus.outline-color` | `--mx-gallery-frame-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `gallery.frame.focus.outline-offset` | `--mx-gallery-frame-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `gallery.frame.swipeable.cursor` | `--mx-gallery-frame-swipeable-cursor` | `` | `grab` |
| `gallery.frame.dragging.cursor` | `--mx-gallery-frame-dragging-cursor` | `` | `grabbing` |
| `gallery.frame.border-width` | `--mx-gallery-frame-border-width` | `` | `initial` |
| `gallery.frame.border-color` | `--mx-gallery-frame-border-color` | `` | `initial` |
| `gallery.caption.bg` | `--mx-gallery-caption-bg` | `color.bg.glass` | `rgb(248 247 243 / 0.78)` |
| `gallery.caption.color` | `--mx-gallery-caption-color` | `color.fg.primary` | `#1d1c1a` |
| `gallery.caption.font-size` | `--mx-gallery-caption-font-size` | `font.size.body` | `0.875rem` |
| `gallery.title.font-weight` | `--mx-gallery-title-font-weight` | `font.weight.semibold` | `600` |
| `gallery.description.color` | `--mx-gallery-description-color` | `color.fg.secondary` | `#5e5c55` |
| `gallery.description.font-size` | `--mx-gallery-description-font-size` | `font.size.caption` | `0.75rem` |
| `gallery.nav.size` | `--mx-gallery-nav-size` | `` | `2rem` |
| `gallery.nav.radius` | `--mx-gallery-nav-radius` | `radius.full` | `9999px` |
| `gallery.nav.bg` | `--mx-gallery-nav-bg` | `color.fill.control.default` | `#f5f4f0` |
| `gallery.nav.color` | `--mx-gallery-nav-color` | `color.fg.primary` | `#1d1c1a` |
| `gallery.nav.border-width` | `--mx-gallery-nav-border-width` | `border.width.1` | `1px` |
| `gallery.nav.border-color` | `--mx-gallery-nav-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `gallery.nav.shadow` | `--mx-gallery-nav-shadow` | `shadow.4` | `0px 2px 4px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `gallery.nav.hover.bg` | `--mx-gallery-nav-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `gallery.nav.hover.cursor` | `--mx-gallery-nav-hover-cursor` | `` | `pointer` |
| `gallery.nav.pressed.bg` | `--mx-gallery-nav-pressed-bg` | `color.fill.control.tertiary` | `#e1e0da` |
| `gallery.nav.focus.glow` | `--mx-gallery-nav-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `gallery.nav.focus.outline-width` | `--mx-gallery-nav-focus-outline-width` | `focus.ring.width` | `2px` |
| `gallery.nav.focus.outline-color` | `--mx-gallery-nav-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `gallery.nav.focus.outline-offset` | `--mx-gallery-nav-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `gallery.nav.disabled.opacity` | `--mx-gallery-nav-disabled-opacity` | `opacity.disabled` | `0.5` |
| `gallery.arrow.size` | `--mx-gallery-arrow-size` | `` | `1rem` |
| `gallery.arrow.bg` | `--mx-gallery-arrow-bg` | `color.fg.primary` | `#1d1c1a` |
| `gallery.arrow.previous.icon` | `--mx-gallery-arrow-previous-icon` | `` | `var(--mx-icon-chevron-start)` |
| `gallery.arrow.next.icon` | `--mx-gallery-arrow-next-icon` | `` | `var(--mx-icon-chevron-end)` |
| `gallery.dot.size` | `--mx-gallery-dot-size` | `` | `0.5rem` |
| `gallery.dot.radius` | `--mx-gallery-dot-radius` | `radius.full` | `9999px` |
| `gallery.dot.bg` | `--mx-gallery-dot-bg` | `color.fill.control.default` | `#f5f4f0` |
| `gallery.dot.color` | `--mx-gallery-dot-color` | `color.fg.primary` | `#1d1c1a` |
| `gallery.dot.border-width` | `--mx-gallery-dot-border-width` | `border.width.1` | `1px` |
| `gallery.dot.border-color` | `--mx-gallery-dot-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `gallery.dot.hover.bg` | `--mx-gallery-dot-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `gallery.dot.hover.cursor` | `--mx-gallery-dot-hover-cursor` | `` | `pointer` |
| `gallery.dot.pressed.bg` | `--mx-gallery-dot-pressed-bg` | `color.fill.control.tertiary` | `#e1e0da` |
| `gallery.dot.focus.glow` | `--mx-gallery-dot-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `gallery.dot.focus.outline-width` | `--mx-gallery-dot-focus-outline-width` | `focus.ring.width` | `2px` |
| `gallery.dot.focus.outline-color` | `--mx-gallery-dot-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `gallery.dot.focus.outline-offset` | `--mx-gallery-dot-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `gallery.dot.current.bg` | `--mx-gallery-dot-current-bg` | `color.accent.solid` | `#c24523` |
| `gallery.dot.current.border-color` | `--mx-gallery-dot-current-border-color` | `color.accent.solid` | `#c24523` |
| `gallery.dot.current.width` | `--mx-gallery-dot-current-width` | `` | `initial` |
| `gallery.dot.current.size` | `--mx-gallery-dot-current-size` | `` | `initial` |
| `gallery.play.size` | `--mx-gallery-play-size` | `` | `1.75rem` |
| `gallery.play.radius` | `--mx-gallery-play-radius` | `radius.full` | `9999px` |
| `gallery.play.bg` | `--mx-gallery-play-bg` | `color.fill.control.default` | `#f5f4f0` |
| `gallery.play.color` | `--mx-gallery-play-color` | `color.fg.primary` | `#1d1c1a` |
| `gallery.play.border-width` | `--mx-gallery-play-border-width` | `border.width.1` | `1px` |
| `gallery.play.border-color` | `--mx-gallery-play-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `gallery.play.shadow` | `--mx-gallery-play-shadow` | `shadow.4` | `0px 2px 4px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `gallery.play.hover.bg` | `--mx-gallery-play-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `gallery.play.hover.cursor` | `--mx-gallery-play-hover-cursor` | `` | `pointer` |
| `gallery.play.pressed.bg` | `--mx-gallery-play-pressed-bg` | `color.fill.control.tertiary` | `#e1e0da` |
| `gallery.play.focus.glow` | `--mx-gallery-play-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `gallery.play.focus.outline-width` | `--mx-gallery-play-focus-outline-width` | `focus.ring.width` | `2px` |
| `gallery.play.focus.outline-color` | `--mx-gallery-play-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `gallery.play.focus.outline-offset` | `--mx-gallery-play-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `gallery.play-glyph.size` | `--mx-gallery-play-glyph-size` | `` | `0.75rem` |
| `gallery.play-glyph.bg` | `--mx-gallery-play-glyph-bg` | `color.fg.primary` | `#1d1c1a` |
| `gallery.play-glyph.icon` | `--mx-gallery-play-glyph-icon` | `` | `var(--mx-icon-play)` |
| `gallery.play-glyph.playing.icon` | `--mx-gallery-play-glyph-playing-icon` | `` | `var(--mx-icon-pause)` |
| `gallery.item.radius` | `--mx-gallery-item-radius` | `` | `initial` |
| `glyph.size` | `--mx-glyph-size` | `icon.size.sm` | `0.75rem` |
| `layout.space.xxs` | `--mx-layout-space-xxs` | `space.1` | `0.25rem` |
| `layout.space.xs` | `--mx-layout-space-xs` | `space.2` | `0.5rem` |
| `layout.space.sm` | `--mx-layout-space-sm` | `space.3` | `0.75rem` |
| `layout.space.md` | `--mx-layout-space-md` | `space.4` | `1rem` |
| `layout.space.lg` | `--mx-layout-space-lg` | `space.6` | `1.5rem` |
| `layout.space.xl` | `--mx-layout-space-xl` | `space.8` | `2rem` |
| `layout.space.xxl` | `--mx-layout-space-xxl` | `space.12` | `3rem` |
| `layout.gap` | `--mx-layout-gap` | `space.2` | `0.5rem` |
| `layout.group-box.gap` | `--mx-layout-group-box-gap` | `space.3` | `0.75rem` |
| `layout.group-box.legend-float` | `--mx-layout-group-box-legend-float` | `` | `none` |
| `layout.splitter.size` | `--mx-layout-splitter-size` | `space.2` | `0.5rem` |
| `layout.splitter.line-width` | `--mx-layout-splitter-line-width` | `border.width.1` | `1px` |
| `layout.splitter.active-width` | `--mx-layout-splitter-active-width` | `border.width.2` | `2px` |
| `layout.splitter.grip-length` | `--mx-layout-splitter-grip-length` | `space.6` | `1.5rem` |
| `layout.splitter.grip-thickness` | `--mx-layout-splitter-grip-thickness` | `space.1` | `0.25rem` |
| `layout.panel.outline.border-width` | `--mx-layout-panel-outline-border-width` | `border.width.1` | `1px` |
| `layout.panel.outline.border-color` | `--mx-layout-panel-outline-border-color` | `color.stroke.card` | `rgb(0 0 0 / 0.08)` |
| `layout.panel.outline.radius` | `--mx-layout-panel-outline-radius` | `radius.lg` | `0.625rem` |
| `layout.panel.card.bg` | `--mx-layout-panel-card-bg` | `color.bg.card` | `#f5f4f0` |
| `layout.panel.card.border-width` | `--mx-layout-panel-card-border-width` | `border.width.1` | `1px` |
| `layout.panel.card.border-color` | `--mx-layout-panel-card-border-color` | `color.stroke.card` | `rgb(0 0 0 / 0.08)` |
| `layout.panel.card.radius` | `--mx-layout-panel-card-radius` | `radius.lg` | `0.625rem` |
| `layout.panel.card.shadow` | `--mx-layout-panel-card-shadow` | `elevation.card` | `0px 1px 2px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `layout.group.padding` | `--mx-layout-group-padding` | `space.4` | `1rem` |
| `layout.group.border-width` | `--mx-layout-group-border-width` | `border.width.1` | `1px` |
| `layout.group.border-color` | `--mx-layout-group-border-color` | `color.stroke.card` | `rgb(0 0 0 / 0.08)` |
| `layout.group.radius` | `--mx-layout-group-radius` | `radius.lg` | `0.625rem` |
| `layout.group.color` | `--mx-layout-group-color` | `color.fg.primary` | `#1d1c1a` |
| `layout.group.plain.padding` | `--mx-layout-group-plain-padding` | `` | `0px` |
| `layout.group.plain.border-color` | `--mx-layout-group-plain-border-color` | `` | `rgb(0 0 0 / 0)` |
| `layout.group.collapsed.padding-bottom` | `--mx-layout-group-collapsed-padding-bottom` | `` | `0px` |
| `layout.group-caption.padding-inline` | `--mx-layout-group-caption-padding-inline` | `space.1` | `0.25rem` |
| `layout.group-caption.font-size` | `--mx-layout-group-caption-font-size` | `font.size.body` | `0.875rem` |
| `layout.group-caption.font-weight` | `--mx-layout-group-caption-font-weight` | `font.weight.semibold` | `600` |
| `layout.group-caption.line-height` | `--mx-layout-group-caption-line-height` | `font.line.body` | `1.25rem` |
| `layout.group-caption.plain.padding-inline` | `--mx-layout-group-caption-plain-padding-inline` | `` | `0px` |
| `layout.group-caption.disabled.color` | `--mx-layout-group-caption-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `layout.group-toggle.margin-inline` | `--mx-layout-group-toggle-margin-inline` | `` | `calc(0.25rem * -1)` |
| `layout.group-toggle.padding-inline` | `--mx-layout-group-toggle-padding-inline` | `space.1` | `0.25rem` |
| `layout.group-toggle.gap` | `--mx-layout-group-toggle-gap` | `control.gap` | `0.5rem` |
| `layout.group-toggle.radius` | `--mx-layout-group-toggle-radius` | `radius.sm` | `0.25rem` |
| `layout.group-toggle.hover.bg` | `--mx-layout-group-toggle-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `layout.group-toggle.pressed.bg` | `--mx-layout-group-toggle-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `layout.group-toggle.focus.glow` | `--mx-layout-group-toggle-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `layout.group-toggle.focus.outline-width` | `--mx-layout-group-toggle-focus-outline-width` | `focus.ring.width` | `2px` |
| `layout.group-toggle.focus.outline-color` | `--mx-layout-group-toggle-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `layout.group-toggle.focus.outline-offset` | `--mx-layout-group-toggle-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `layout.group-chevron.color` | `--mx-layout-group-chevron-color` | `color.fg.secondary` | `#5e5c55` |
| `layout.group-chevron.icon` | `--mx-layout-group-chevron-icon` | `` | `var(--mx-icon-chevron-down)` |
| `layout.group-chevron.collapsed.rotate` | `--mx-layout-group-chevron-collapsed-rotate` | `` | `-90deg` |
| `layout.group-chevron.collapsed-rtl.rotate` | `--mx-layout-group-chevron-collapsed-rtl-rotate` | `` | `90deg` |
| `layout.splitter-handle.focus.glow` | `--mx-layout-splitter-handle-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `layout.splitter-handle.focus.outline-width` | `--mx-layout-splitter-handle-focus-outline-width` | `focus.ring.width` | `2px` |
| `layout.splitter-handle.focus.outline-color` | `--mx-layout-splitter-handle-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `layout.splitter-handle.focus.outline-offset` | `--mx-layout-splitter-handle-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `layout.splitter-line.bg` | `--mx-layout-splitter-line-bg` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `layout.splitter-line.active.bg` | `--mx-layout-splitter-line-active-bg` | `color.accent.solid` | `#c24523` |
| `layout.splitter-grip.bg` | `--mx-layout-splitter-grip-bg` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `layout.splitter-grip.radius` | `--mx-layout-splitter-grip-radius` | `radius.full` | `9999px` |
| `layout.splitter-grip.active.bg` | `--mx-layout-splitter-grip-active-bg` | `color.accent.solid` | `#c24523` |
| `layout.splitter-grip.disabled.bg` | `--mx-layout-splitter-grip-disabled-bg` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `list.item-height` | `--mx-list-item-height` | `control.height.md` | `2rem` |
| `list.container.max-height` | `--mx-list-container-max-height` | `` | `20rem` |
| `list.container.gap` | `--mx-list-container-gap` | `` | `initial` |
| `list.container.margin` | `--mx-list-container-margin` | `` | `initial` |
| `list.container.padding-block` | `--mx-list-container-padding-block` | `` | `initial` |
| `list.container.padding-inline` | `--mx-list-container-padding-inline` | `` | `initial` |
| `list.item.padding-inline` | `--mx-list-item-padding-inline` | `control.padding.md` | `0.6875rem` |
| `list.item.gap` | `--mx-list-item-gap` | `control.gap` | `0.5rem` |
| `list.item.radius` | `--mx-list-item-radius` | `item.radius` | `0.25rem` |
| `list.item.font-size` | `--mx-list-item-font-size` | `` | `1em` |
| `list.item.hover.bg` | `--mx-list-item-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `list.item.pressed.bg` | `--mx-list-item-pressed-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `list.item.active.bg` | `--mx-list-item-active-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `list.item.active.color` | `--mx-list-item-active-color` | `` | `currentcolor` |
| `list.item.selected.bg` | `--mx-list-item-selected-bg` | `color.selection.bg` | `#f5f4f0` |
| `list.item.selected.shadow` | `--mx-list-item-selected-shadow` | `effect.selection` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0px 1px 0px 0px rgb(0 0 0 / 0.3)` |
| `list.item.selected.glow` | `--mx-list-item-selected-glow` | `` | `inset 0px 0px 0px 1px rgb(0 0 0 / 0.12)` |
| `list.item.selected.color` | `--mx-list-item-selected-color` | `color.selection.fg` | `#1d1c1a` |
| `list.item.selected-hover.bg` | `--mx-list-item-selected-hover-bg` | `color.selection.bg` | `#f5f4f0` |
| `list.item.selected-pressed.bg` | `--mx-list-item-selected-pressed-bg` | `color.selection.bg` | `#f5f4f0` |
| `list.item.disabled.color` | `--mx-list-item-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `list.item.select-all.font-weight` | `--mx-list-item-select-all-font-weight` | `font.weight.medium` | `500` |
| `list.indicator.width` | `--mx-list-indicator-width` | `indicator.thickness` | `0px` |
| `list.indicator.height` | `--mx-list-indicator-height` | `indicator.length` | `0rem` |
| `list.indicator.bg` | `--mx-list-indicator-bg` | `color.selection.indicator` | `rgb(0 0 0 / 0)` |
| `list.indicator.radius` | `--mx-list-indicator-radius` | `indicator.radius` | `0px` |
| `list.indicator.multiple.display` | `--mx-list-indicator-multiple-display` | `` | `none` |
| `list.check.color` | `--mx-list-check-color` | `color.selection.indicator` | `rgb(0 0 0 / 0)` |
| `list.mark.size` | `--mx-list-mark-size` | `icon.size.sm` | `0.75rem` |
| `list.mark.icon` | `--mx-list-mark-icon` | `` | `var(--mx-icon-check)` |
| `list.icon.size` | `--mx-list-icon-size` | `icon.size.md` | `1rem` |
| `list.header.padding-inline` | `--mx-list-header-padding-inline` | `control.padding.md` | `0.6875rem` |
| `list.header.padding-bottom` | `--mx-list-header-padding-bottom` | `space.1` | `0.25rem` |
| `list.header.color` | `--mx-list-header-color` | `color.fg.secondary` | `#5e5c55` |
| `list.header.font-size` | `--mx-list-header-font-size` | `font.size.caption` | `0.75rem` |
| `list.header.font-weight` | `--mx-list-header-font-weight` | `font.weight.semibold` | `600` |
| `list.select-all-divider.height` | `--mx-list-select-all-divider-height` | `border.width.1` | `1px` |
| `list.select-all-divider.bg` | `--mx-list-select-all-divider-bg` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `list.empty.padding` | `--mx-list-empty-padding` | `control.padding.md` | `0.6875rem` |
| `list.empty.color` | `--mx-list-empty-color` | `color.fg.secondary` | `#5e5c55` |
| `list.group.gap` | `--mx-list-group-gap` | `` | `initial` |
| `listbox.field.variant` | `--mx-listbox-field-variant` | `` | `outline` |
| `listbox.field.label-mode` | `--mx-listbox-field-label-mode` | `` | `top` |
| `listbox.field.box.bg` | `--mx-listbox-field-box-bg` | `color.fill.control.default` | `#f5f4f0` |
| `listbox.field.box.hover.bg` | `--mx-listbox-field-box-hover-bg` | `color.fill.control.default` | `#f5f4f0` |
| `listbox.field.box.focus.bg` | `--mx-listbox-field-box-focus-bg` | `color.bg.surface` | `#f8f7f3` |
| `listbox.field.box.focus.shadow` | `--mx-listbox-field-box-focus-shadow` | `` | `inset 0px 1px 2px 0px rgb(0 0 0 / 0.12)` |
| `listbox.field.box.radius` | `--mx-listbox-field-box-radius` | `radius.md` | `0.375rem` |
| `listbox.field.box.shadow` | `--mx-listbox-field-box-shadow` | `` | `inset 0px 1px 2px 0px rgb(0 0 0 / 0.12)` |
| `listbox.field.box.cursor` | `--mx-listbox-field-box-cursor` | `` | `default` |
| `listbox.field.box.invalid-hover.bg` | `--mx-listbox-field-box-invalid-hover-bg` | `color.fill.control.default` | `#f5f4f0` |
| `listbox.field.box.invalid-focus.bg` | `--mx-listbox-field-box-invalid-focus-bg` | `color.bg.surface` | `#f8f7f3` |
| `listbox.field.frame.border-color` | `--mx-listbox-field-frame-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `listbox.field.frame.hover.border-color` | `--mx-listbox-field-frame-hover-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `listbox.field.frame.hover.border-bottom-color` | `--mx-listbox-field-frame-hover-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `listbox.field.frame.focus.border-color` | `--mx-listbox-field-frame-focus-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `listbox.field.frame.focus.border-bottom-color` | `--mx-listbox-field-frame-focus-border-bottom-color` | `color.accent.solid` | `#c24523` |
| `listbox.field.frame.focus.border-width` | `--mx-listbox-field-frame-focus-border-width` | `border.width.1` | `1px` |
| `listbox.field.frame.border-bottom-color` | `--mx-listbox-field-frame-border-bottom-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `listbox.field.frame.disabled.border-color` | `--mx-listbox-field-frame-disabled-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `listbox.field.indicator.radius` | `--mx-listbox-field-indicator-radius` | `` | `calc(0.375rem - 1px)` |
| `listbox.field.indicator.focus.shadow` | `--mx-listbox-field-indicator-focus-shadow` | `` | `inset 0 -1px 0 0 #c24523` |
| `listbox.field.indicator.invalid-focus.shadow` | `--mx-listbox-field-indicator-invalid-focus-shadow` | `` | `inset 0 -1px 0 0 #b03659` |
| `listbox.field.indicator.readonly-focus.shadow` | `--mx-listbox-field-indicator-readonly-focus-shadow` | `` | `inset 0 -1px 0 0 rgb(0 0 0 / 0.4458)` |
| `listbox.field.indicator.readonly-invalid-focus.shadow` | `--mx-listbox-field-indicator-readonly-invalid-focus-shadow` | `` | `inset 0 -1px 0 0 rgb(0 0 0 / 0.4458)` |
| `listbox.search.variant` | `--mx-listbox-search-variant` | `` | `outline` |
| `listbox.search.size` | `--mx-listbox-search-size` | `` | `sm` |
| `listbox.list.item-height` | `--mx-listbox-list-item-height` | `control.height.md` | `2rem` |
| `listbox.list.item.radius` | `--mx-listbox-list-item-radius` | `item.radius` | `0.25rem` |
| `listbox.list.mark.size` | `--mx-listbox-list-mark-size` | `icon.size.sm` | `0.75rem` |
| `listbox.box.padding` | `--mx-listbox-box-padding` | `space.1` | `0.25rem` |
| `listbox.box.gap` | `--mx-listbox-box-gap` | `space.1` | `0.25rem` |
| `listbox.box.padding-block` | `--mx-listbox-box-padding-block` | `` | `initial` |
| `listbox.box.padding-inline` | `--mx-listbox-box-padding-inline` | `` | `initial` |
| `listbox.check.size` | `--mx-listbox-check-size` | `icon.size.md` | `1rem` |
| `listbox.check.radius` | `--mx-listbox-check-radius` | `radius.xs` | `0.25rem` |
| `listbox.check.border-width` | `--mx-listbox-check-border-width` | `border.width.1` | `1px` |
| `listbox.check.border-color` | `--mx-listbox-check-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `listbox.check.bg` | `--mx-listbox-check-bg` | `color.fill.control.default` | `#f5f4f0` |
| `listbox.check.color` | `--mx-listbox-check-color` | `` | `rgb(0 0 0 / 0)` |
| `listbox.check.checked.color` | `--mx-listbox-check-checked-color` | `color.accent.on-solid` | `#ffffff` |
| `listbox.check.checked.bg` | `--mx-listbox-check-checked-bg` | `color.accent.solid` | `#c24523` |
| `listbox.check.checked.border-color` | `--mx-listbox-check-checked-border-color` | `color.accent.solid` | `#c24523` |
| `listbox.check.disabled.bg` | `--mx-listbox-check-disabled-bg` | `color.fill.control.disabled` | `#ebeae5` |
| `listbox.check.disabled.border-color` | `--mx-listbox-check-disabled-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `listbox.check.checked-disabled.color` | `--mx-listbox-check-checked-disabled-color` | `color.fg.on-accent-disabled` | `#ffffff` |
| `listbox.check.checked-disabled.bg` | `--mx-listbox-check-checked-disabled-bg` | `color.fill.accent-disabled` | `rgb(0 0 0 / 0.2169)` |
| `listbox.check.checked-disabled.border-color` | `--mx-listbox-check-checked-disabled-border-color` | `` | `rgb(0 0 0 / 0)` |
| `listbox.keys.outline-width` | `--mx-listbox-keys-outline-width` | `focus.ring.width` | `2px` |
| `listbox.keys.outline-color` | `--mx-listbox-keys-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `listbox.keys.outline-offset` | `--mx-listbox-keys-outline-offset` | `` | `calc(-1 * 2px)` |
| `listbox.idle.bg` | `--mx-listbox-idle-bg` | `` | `rgb(0 0 0 / 0)` |
| `listbox.container.margin` | `--mx-listbox-container-margin` | `` | `initial` |
| `load-panel.padding` | `--mx-load-panel-padding` | `space.4` | `1rem` |
| `load-panel.gap` | `--mx-load-panel-gap` | `space.3` | `0.75rem` |
| `load-panel.cancel.variant` | `--mx-load-panel-cancel-variant` | `` | `outline` |
| `load-panel.shade.shaded.bg` | `--mx-load-panel-shade-shaded-bg` | `color.bg.smoke` | `rgb(0 0 0 / 0.3)` |
| `load-panel.pane.shown.bg` | `--mx-load-panel-pane-shown-bg` | `color.bg.surface` | `#f8f7f3` |
| `load-panel.pane.shown.border-width` | `--mx-load-panel-pane-shown-border-width` | `border.width.1` | `1px` |
| `load-panel.pane.shown.border-color` | `--mx-load-panel-pane-shown-border-color` | `color.stroke.surface` | `rgb(117 117 117 / 0.4)` |
| `load-panel.pane.shown.radius` | `--mx-load-panel-pane-shown-radius` | `radius.lg` | `0.625rem` |
| `load-panel.pane.shown.shadow` | `--mx-load-panel-pane-shown-shadow` | `elevation.popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `load-panel.pane.shown.padding-block` | `--mx-load-panel-pane-shown-padding-block` | `space.4` | `1rem` |
| `load-panel.pane.shown.padding-inline` | `--mx-load-panel-pane-shown-padding-inline` | `space.5` | `1.25rem` |
| `load-panel.pane.shown.min-width` | `--mx-load-panel-pane-shown-min-width` | `` | `10rem` |
| `load-panel.message.color` | `--mx-load-panel-message-color` | `color.fg.primary` | `#1d1c1a` |
| `load-panel.message.font-size` | `--mx-load-panel-message-font-size` | `font.size.body` | `0.875rem` |
| `lookup.popup-width` | `--mx-lookup-popup-width` | `` | `28rem` |
| `lookup.column-gap` | `--mx-lookup-column-gap` | `space.3` | `0.75rem` |
| `lookup.header.padding-block` | `--mx-lookup-header-padding-block` | `space.1` | `0.25rem` |
| `lookup.header.padding-inline` | `--mx-lookup-header-padding-inline` | `control.padding.md` | `0.6875rem` |
| `lookup.header.font-size` | `--mx-lookup-header-font-size` | `font.size.caption` | `0.75rem` |
| `lookup.header.font-weight` | `--mx-lookup-header-font-weight` | `font.weight.semibold` | `600` |
| `lookup.header.color` | `--mx-lookup-header-color` | `color.fg.secondary` | `#5e5c55` |
| `lookup.header.border-bottom-width` | `--mx-lookup-header-border-bottom-width` | `border.width.1` | `1px` |
| `lookup.header.border-bottom-color` | `--mx-lookup-header-border-bottom-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `menu.item-height` | `--mx-menu-item-height` | `control.height.md` | `2rem` |
| `menu.item-white-space` | `--mx-menu-item-white-space` | `` | `nowrap` |
| `menu.item.padding-inline` | `--mx-menu-item-padding-inline` | `control.padding.md` | `0.6875rem` |
| `menu.item.gap` | `--mx-menu-item-gap` | `control.gap` | `0.5rem` |
| `menu.item.radius` | `--mx-menu-item-radius` | `radius.sm` | `0.25rem` |
| `menu.item.color` | `--mx-menu-item-color` | `color.fg.primary` | `#1d1c1a` |
| `menu.item.font-size` | `--mx-menu-item-font-size` | `font.size.body` | `0.875rem` |
| `menu.item.font-weight` | `--mx-menu-item-font-weight` | `font.weight.regular` | `400` |
| `menu.item.line-height` | `--mx-menu-item-line-height` | `font.line.body` | `1.25rem` |
| `menu.item.highlight.bg` | `--mx-menu-item-highlight-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `menu.item.pressed.bg` | `--mx-menu-item-pressed-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `menu.item.focus.glow` | `--mx-menu-item-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `menu.item.focus.outline-width` | `--mx-menu-item-focus-outline-width` | `focus.ring.width` | `2px` |
| `menu.item.focus.outline-color` | `--mx-menu-item-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `menu.item.focus.outline-offset` | `--mx-menu-item-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `menu.item.disabled.color` | `--mx-menu-item-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `menu.item.accent.color` | `--mx-menu-item-accent-color` | `color.accent.fg` | `#983318` |
| `menu.item.success.color` | `--mx-menu-item-success-color` | `color.success.fg` | `#006402` |
| `menu.item.caution.color` | `--mx-menu-item-caution-color` | `color.caution.fg` | `#754702` |
| `menu.item.danger.color` | `--mx-menu-item-danger-color` | `color.danger.fg` | `#b03659` |
| `menu.item.checked.bg` | `--mx-menu-item-checked-bg` | `` | `initial` |
| `menu.item.first.radius-top` | `--mx-menu-item-first-radius-top` | `` | `initial` |
| `menu.item.last.radius-bottom` | `--mx-menu-item-last-radius-bottom` | `` | `initial` |
| `menu.check.size` | `--mx-menu-check-size` | `icon.size.md` | `1rem` |
| `menu.check.color` | `--mx-menu-check-color` | `` | `initial` |
| `menu.check.disabled.color` | `--mx-menu-check-disabled-color` | `` | `initial` |
| `menu.icon.size` | `--mx-menu-icon-size` | `icon.size.md` | `1rem` |
| `menu.icon.accent.color` | `--mx-menu-icon-accent-color` | `color.accent.fg` | `#983318` |
| `menu.icon.success.color` | `--mx-menu-icon-success-color` | `color.success.fg` | `#006402` |
| `menu.icon.caution.color` | `--mx-menu-icon-caution-color` | `color.caution.fg` | `#754702` |
| `menu.icon.danger.color` | `--mx-menu-icon-danger-color` | `color.danger.fg` | `#b03659` |
| `menu.icon.color` | `--mx-menu-icon-color` | `` | `initial` |
| `menu.icon.disabled.color` | `--mx-menu-icon-disabled-color` | `` | `initial` |
| `menu.check-mark.icon` | `--mx-menu-check-mark-icon` | `` | `var(--mx-icon-check)` |
| `menu.radio-mark.icon` | `--mx-menu-radio-mark-icon` | `` | `var(--mx-icon-radio)` |
| `menu.description.color` | `--mx-menu-description-color` | `color.fg.secondary` | `#5e5c55` |
| `menu.description.font-size` | `--mx-menu-description-font-size` | `font.size.caption` | `0.75rem` |
| `menu.description.disabled.color` | `--mx-menu-description-disabled-color` | `` | `currentcolor` |
| `menu.shortcut.padding-start` | `--mx-menu-shortcut-padding-start` | `space.6` | `1.5rem` |
| `menu.shortcut.color` | `--mx-menu-shortcut-color` | `color.fg.secondary` | `#5e5c55` |
| `menu.shortcut.font-size` | `--mx-menu-shortcut-font-size` | `font.size.caption` | `0.75rem` |
| `menu.shortcut.disabled.color` | `--mx-menu-shortcut-disabled-color` | `` | `currentcolor` |
| `menu.shortcut.display` | `--mx-menu-shortcut-display` | `` | `initial` |
| `menu.arrow.size` | `--mx-menu-arrow-size` | `icon.size.sm` | `0.75rem` |
| `menu.arrow.icon` | `--mx-menu-arrow-icon` | `` | `var(--mx-icon-chevron-end)` |
| `menu.separator.height` | `--mx-menu-separator-height` | `border.width.1` | `1px` |
| `menu.separator.margin-block` | `--mx-menu-separator-margin-block` | `space.1` | `0.25rem` |
| `menu.separator.bg` | `--mx-menu-separator-bg` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `menu.separator.margin-inline` | `--mx-menu-separator-margin-inline` | `` | `initial` |
| `menu.panel.gap` | `--mx-menu-panel-gap` | `` | `initial` |
| `menubar.height` | `--mx-menubar-height` | `bar.height` | `2.25rem` |
| `menubar.item-height` | `--mx-menubar-item-height` | `control.height.md` | `2rem` |
| `menubar.bar.padding-inline` | `--mx-menubar-bar-padding-inline` | `space.1` | `0.25rem` |
| `menubar.bar.gap` | `--mx-menubar-bar-gap` | `space.0` | `0px` |
| `menubar.bar.bg` | `--mx-menubar-bar-bg` | `color.bg.bar` | `#ebeae5` |
| `menubar.bar.radius` | `--mx-menubar-bar-radius` | `radius.md` | `0.375rem` |
| `menubar.item.padding-inline` | `--mx-menubar-item-padding-inline` | `control.padding.md` | `0.6875rem` |
| `menubar.item.gap` | `--mx-menubar-item-gap` | `control.gap` | `0.5rem` |
| `menubar.item.radius` | `--mx-menubar-item-radius` | `radius.sm` | `0.25rem` |
| `menubar.item.color` | `--mx-menubar-item-color` | `color.fg.primary` | `#1d1c1a` |
| `menubar.item.font-size` | `--mx-menubar-item-font-size` | `font.size.body` | `0.875rem` |
| `menubar.item.font-weight` | `--mx-menubar-item-font-weight` | `font.weight.regular` | `400` |
| `menubar.item.line-height` | `--mx-menubar-item-line-height` | `font.line.body` | `1.25rem` |
| `menubar.item.hover.bg` | `--mx-menubar-item-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `menubar.item.hover.color` | `--mx-menubar-item-hover-color` | `` | `initial` |
| `menubar.item.pressed.bg` | `--mx-menubar-item-pressed-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `menubar.item.open.bg` | `--mx-menubar-item-open-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `menubar.item.open.color` | `--mx-menubar-item-open-color` | `` | `initial` |
| `menubar.item.disabled.color` | `--mx-menubar-item-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `menubar.item.focus.glow` | `--mx-menubar-item-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `menubar.item.focus.outline-width` | `--mx-menubar-item-focus-outline-width` | `focus.ring.width` | `2px` |
| `menubar.item.focus.outline-color` | `--mx-menubar-item-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `menubar.item.focus.outline-offset` | `--mx-menubar-item-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `menubar.icon.size` | `--mx-menubar-icon-size` | `icon.size.md` | `1rem` |
| `multi-view.gap` | `--mx-multi-view-gap` | `space.0` | `0px` |
| `multi-view.frame.swipeable.cursor` | `--mx-multi-view-frame-swipeable-cursor` | `` | `grab` |
| `multi-view.frame.dragging.cursor` | `--mx-multi-view-frame-dragging-cursor` | `` | `grabbing` |
| `number-box.spin-layout` | `--mx-number-box-spin-layout` | `` | `stacked` |
| `number-box.spin-order` | `--mx-number-box-spin-order` | `` | `down-up` |
| `number-box.spin-inset` | `--mx-number-box-spin-inset` | `border.width.2` | `2px` |
| `number-box.step.stacked.min-width` | `--mx-number-box-step-stacked-min-width` | `space.5` | `1.25rem` |
| `number-box.step.stacked.padding-inline` | `--mx-number-box-step-stacked-padding-inline` | `` | `0px` |
| `number-box.glyph.up.icon` | `--mx-number-box-glyph-up-icon` | `` | `var(--mx-icon-chevron-up)` |
| `number-box.glyph.down.icon` | `--mx-number-box-glyph-down-icon` | `` | `var(--mx-icon-chevron-down)` |
| `number-box.glyph.inline-up.icon` | `--mx-number-box-glyph-inline-up-icon` | `` | `var(--mx-icon-plus)` |
| `number-box.glyph.inline-down.icon` | `--mx-number-box-glyph-inline-down-icon` | `` | `var(--mx-icon-dash)` |
| `number-box.glyph.stacked.max-height` | `--mx-number-box-glyph-stacked-max-height` | `icon.size.sm` | `0.75rem` |
| `otp-input.input-font-size` | `--mx-otp-input-input-font-size` | `` | `16px` |
| `otp-input.cell-width.sm` | `--mx-otp-input-cell-width-sm` | `` | `36px` |
| `otp-input.cell-width.md` | `--mx-otp-input-cell-width-md` | `` | `44px` |
| `otp-input.cell-width.lg` | `--mx-otp-input-cell-width-lg` | `` | `52px` |
| `otp-input.cell-height.sm` | `--mx-otp-input-cell-height-sm` | `` | `40px` |
| `otp-input.cell-height.md` | `--mx-otp-input-cell-height-md` | `` | `48px` |
| `otp-input.cell-height.lg` | `--mx-otp-input-cell-height-lg` | `` | `56px` |
| `otp-input.font-size.sm` | `--mx-otp-input-font-size-sm` | `font.size.body` | `0.875rem` |
| `otp-input.font-size.md` | `--mx-otp-input-font-size-md` | `font.size.body-large` | `1.125rem` |
| `otp-input.font-size.lg` | `--mx-otp-input-font-size-lg` | `font.size.subtitle` | `1.25rem` |
| `otp-input.field.label-mode` | `--mx-otp-input-field-label-mode` | `` | `top` |
| `otp-input.field.variant` | `--mx-otp-input-field-variant` | `` | `outline` |
| `otp-input.field.padding.sm` | `--mx-otp-input-field-padding-sm` | `` | `0px` |
| `otp-input.field.padding.md` | `--mx-otp-input-field-padding-md` | `` | `0px` |
| `otp-input.field.padding.lg` | `--mx-otp-input-field-padding-lg` | `` | `0px` |
| `otp-input.field.border-width` | `--mx-otp-input-field-border-width` | `` | `0px` |
| `otp-input.field.padding-start.sm` | `--mx-otp-input-field-padding-start-sm` | `` | `0px` |
| `otp-input.field.padding-start.md` | `--mx-otp-input-field-padding-start-md` | `` | `0px` |
| `otp-input.field.padding-start.lg` | `--mx-otp-input-field-padding-start-lg` | `` | `0px` |
| `otp-input.field.padding-end.sm` | `--mx-otp-input-field-padding-end-sm` | `` | `0px` |
| `otp-input.field.padding-end.md` | `--mx-otp-input-field-padding-end-md` | `` | `0px` |
| `otp-input.field.padding-end.lg` | `--mx-otp-input-field-padding-end-lg` | `` | `0px` |
| `otp-input.field.box.bg` | `--mx-otp-input-field-box-bg` | `` | `rgb(0 0 0 / 0)` |
| `otp-input.field.box.hover.bg` | `--mx-otp-input-field-box-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `otp-input.field.box.focus.bg` | `--mx-otp-input-field-box-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `otp-input.field.box.focus.shadow` | `--mx-otp-input-field-box-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `otp-input.field.box.radius` | `--mx-otp-input-field-box-radius` | `` | `0px` |
| `otp-input.field.box.shadow` | `--mx-otp-input-field-box-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `otp-input.field.box.cursor` | `--mx-otp-input-field-box-cursor` | `` | `default` |
| `otp-input.field.box.disabled.bg` | `--mx-otp-input-field-box-disabled-bg` | `` | `rgb(0 0 0 / 0)` |
| `otp-input.field.box.disabled.shadow` | `--mx-otp-input-field-box-disabled-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `otp-input.field.box.invalid-hover.bg` | `--mx-otp-input-field-box-invalid-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `otp-input.field.box.invalid-focus.bg` | `--mx-otp-input-field-box-invalid-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `otp-input.field.box.invalid-focus.shadow` | `--mx-otp-input-field-box-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `otp-input.field.box.readonly-focus.shadow` | `--mx-otp-input-field-box-readonly-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `otp-input.field.box.readonly-invalid-focus.shadow` | `--mx-otp-input-field-box-readonly-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `otp-input.field.frame.display` | `--mx-otp-input-field-frame-display` | `` | `none` |
| `otp-input.field.indicator.display` | `--mx-otp-input-field-indicator-display` | `` | `none` |
| `otp-input.cells.gap` | `--mx-otp-input-cells-gap` | `space.2` | `0.5rem` |
| `otp-input.cell.bg` | `--mx-otp-input-cell-bg` | `color.bg.card` | `#f5f4f0` |
| `otp-input.cell.radius` | `--mx-otp-input-cell-radius` | `radius.md` | `0.375rem` |
| `otp-input.cell.color` | `--mx-otp-input-cell-color` | `color.fg.primary` | `#1d1c1a` |
| `otp-input.cell.border-width` | `--mx-otp-input-cell-border-width` | `` | `1px` |
| `otp-input.cell.border-color` | `--mx-otp-input-cell-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `otp-input.cell.font-weight` | `--mx-otp-input-cell-font-weight` | `font.weight.semibold` | `600` |
| `otp-input.cell.border-bottom-width` | `--mx-otp-input-cell-border-bottom-width` | `control.edge.width` | `2px` |
| `otp-input.cell.border-bottom-color` | `--mx-otp-input-cell-border-bottom-color` | `color.stroke.control.edge` | `rgb(0 0 0 / 0.3)` |
| `otp-input.cell.hover.border-color` | `--mx-otp-input-cell-hover-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `otp-input.cell.filled.border-color` | `--mx-otp-input-cell-filled-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `otp-input.cell.filled.bg` | `--mx-otp-input-cell-filled-bg` | `` | `initial` |
| `otp-input.cell.active.border-color` | `--mx-otp-input-cell-active-border-color` | `color.accent.solid` | `#c24523` |
| `otp-input.cell.active.glow` | `--mx-otp-input-cell-active-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `otp-input.cell.active.outline-width` | `--mx-otp-input-cell-active-outline-width` | `focus.ring.width` | `2px` |
| `otp-input.cell.active.outline-color` | `--mx-otp-input-cell-active-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `otp-input.cell.active.outline-offset` | `--mx-otp-input-cell-active-outline-offset` | `focus.ring.offset` | `1px` |
| `otp-input.cell.active.border-bottom-width` | `--mx-otp-input-cell-active-border-bottom-width` | `` | `initial` |
| `otp-input.cell.active.border-bottom-color` | `--mx-otp-input-cell-active-border-bottom-color` | `` | `initial` |
| `otp-input.cell.active.border-width` | `--mx-otp-input-cell-active-border-width` | `` | `initial` |
| `otp-input.cell.invalid.border-color` | `--mx-otp-input-cell-invalid-border-color` | `color.danger.solid` | `#b03659` |
| `otp-input.cell.invalid-active.border-color` | `--mx-otp-input-cell-invalid-active-border-color` | `color.danger.solid` | `#b03659` |
| `otp-input.cell.readonly.bg` | `--mx-otp-input-cell-readonly-bg` | `color.bg.layer` | `#ebeae5` |
| `otp-input.cell.disabled.bg` | `--mx-otp-input-cell-disabled-bg` | `color.fill.control.disabled` | `#ebeae5` |
| `otp-input.cell.disabled.color` | `--mx-otp-input-cell-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `otp-input.cell.disabled.border-color` | `--mx-otp-input-cell-disabled-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `otp-input.caret.width` | `--mx-otp-input-caret-width` | `` | `2px` |
| `otp-input.caret.height` | `--mx-otp-input-caret-height` | `font.size.body-large` | `1.125rem` |
| `otp-input.caret.bg` | `--mx-otp-input-caret-bg` | `color.accent.solid` | `#c24523` |
| `otp-input.separator.color` | `--mx-otp-input-separator-color` | `color.fg.tertiary` | `#8c8a82` |
| `otp-input.separator.padding-inline` | `--mx-otp-input-separator-padding-inline` | `space.2` | `0.5rem` |
| `pagination.button-size` | `--mx-pagination-button-size` | `` | `sm` |
| `pagination.step-variant` | `--mx-pagination-step-variant` | `` | `ghost` |
| `pagination.page-variant` | `--mx-pagination-page-variant` | `` | `ghost` |
| `pagination.page-tone` | `--mx-pagination-page-tone` | `` | `standard` |
| `pagination.current-variant` | `--mx-pagination-current-variant` | `` | `solid` |
| `pagination.current-tone` | `--mx-pagination-current-tone` | `` | `accent` |
| `pagination.gap` | `--mx-pagination-gap` | `space.1` | `0.25rem` |
| `pagination.step-overlap` | `--mx-pagination-step-overlap` | `` | `0.375rem` |
| `pagination.number-width` | `--mx-pagination-number-width` | `` | `4rem` |
| `pagination.size-width` | `--mx-pagination-size-width` | `` | `5.5rem` |
| `pagination.info.color` | `--mx-pagination-info-color` | `color.fg.secondary` | `#5e5c55` |
| `pagination.info.font-size` | `--mx-pagination-info-font-size` | `font.size.body` | `0.875rem` |
| `pagination.info.padding-inline` | `--mx-pagination-info-padding-inline` | `space.2` | `0.5rem` |
| `popover.offset` | `--mx-popover-offset` | `space.2` | `0.5rem` |
| `popover.enter-offset` | `--mx-popover-enter-offset` | `` | `4px` |
| `popover.header-gap` | `--mx-popover-header-gap` | `space.2` | `0.5rem` |
| `popover.close.variant` | `--mx-popover-close-variant` | `` | `ghost` |
| `popover.surface.bg` | `--mx-popover-surface-bg` | `color.bg.surface` | `#f8f7f3` |
| `popover.surface.border-width` | `--mx-popover-surface-border-width` | `border.width.1` | `1px` |
| `popover.surface.border-color` | `--mx-popover-surface-border-color` | `color.stroke.surface` | `rgb(117 117 117 / 0.4)` |
| `popover.surface.radius` | `--mx-popover-surface-radius` | `radius.lg` | `0.625rem` |
| `popover.surface.shadow` | `--mx-popover-surface-shadow` | `elevation.popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `popover.surface.color` | `--mx-popover-surface-color` | `color.fg.primary` | `#1d1c1a` |
| `popover.surface.font-size` | `--mx-popover-surface-font-size` | `font.size.body` | `0.875rem` |
| `popover.surface.line-height` | `--mx-popover-surface-line-height` | `font.line.body` | `1.25rem` |
| `popover.surface.max-width` | `--mx-popover-surface-max-width` | `` | `24rem` |
| `popover.surface.focus.glow` | `--mx-popover-surface-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `popover.surface.focus.outline-width` | `--mx-popover-surface-focus-outline-width` | `focus.ring.width` | `2px` |
| `popover.surface.focus.outline-color` | `--mx-popover-surface-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `popover.surface.focus.outline-offset` | `--mx-popover-surface-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `popover.arrow.display` | `--mx-popover-arrow-display` | `` | `block` |
| `popover.arrow.size` | `--mx-popover-arrow-size` | `` | `0.75rem` |
| `popover.arrow.bg` | `--mx-popover-arrow-bg` | `color.bg.surface` | `#f8f7f3` |
| `popover.arrow.border-width` | `--mx-popover-arrow-border-width` | `border.width.1` | `1px` |
| `popover.arrow.border-color` | `--mx-popover-arrow-border-color` | `color.stroke.surface` | `rgb(117 117 117 / 0.4)` |
| `popover.header.padding-block` | `--mx-popover-header-padding-block` | `space.2` | `0.5rem` |
| `popover.header.padding-start` | `--mx-popover-header-padding-start` | `space.3` | `0.75rem` |
| `popover.header.padding-end` | `--mx-popover-header-padding-end` | `space.2` | `0.5rem` |
| `popover.header.border-bottom-width` | `--mx-popover-header-border-bottom-width` | `border.width.1` | `1px` |
| `popover.header.border-bottom-color` | `--mx-popover-header-border-bottom-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `popover.title.font-weight` | `--mx-popover-title-font-weight` | `font.weight.semibold` | `600` |
| `popover.title.color` | `--mx-popover-title-color` | `color.fg.primary` | `#1d1c1a` |
| `popover.body.padding` | `--mx-popover-body-padding` | `space.3` | `0.75rem` |
| `popup.offset` | `--mx-popup-offset` | `space.1` | `0.25rem` |
| `popup.list-box.box.bg` | `--mx-popup-list-box-box-bg` | `` | `rgb(0 0 0 / 0)` |
| `popup.list-box.box.hover.bg` | `--mx-popup-list-box-box-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `popup.list-box.box.focus.bg` | `--mx-popup-list-box-box-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `popup.list-box.box.focus.shadow` | `--mx-popup-list-box-box-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `popup.list-box.box.shadow` | `--mx-popup-list-box-box-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `popup.list-box.box.invalid-hover.bg` | `--mx-popup-list-box-box-invalid-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `popup.list-box.box.invalid-focus.bg` | `--mx-popup-list-box-box-invalid-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `popup.list-box.box.invalid-focus.shadow` | `--mx-popup-list-box-box-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `popup.list-box.box.readonly-focus.shadow` | `--mx-popup-list-box-box-readonly-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `popup.list-box.box.disabled.shadow` | `--mx-popup-list-box-box-disabled-shadow` | `` | `inset 0px 1px 2px 0px rgb(0 0 0 / 0.12)` |
| `popup.list-box.box.readonly-invalid-focus.shadow` | `--mx-popup-list-box-box-readonly-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `popup.list-box.frame.display` | `--mx-popup-list-box-frame-display` | `` | `none` |
| `popup.list-box.indicator.display` | `--mx-popup-list-box-indicator-display` | `` | `none` |
| `popup.with-list.surface.padding-block` | `--mx-popup-with-list-surface-padding-block` | `space.1` | `0.25rem` |
| `popup.with-list.surface.padding-inline` | `--mx-popup-with-list-surface-padding-inline` | `` | `initial` |
| `popup.list.item-height` | `--mx-popup-list-item-height` | `control.height.md` | `2rem` |
| `popup.list.container.margin` | `--mx-popup-list-container-margin` | `` | `initial` |
| `popup.list.container.padding-block` | `--mx-popup-list-container-padding-block` | `` | `initial` |
| `popup.list.container.padding-inline` | `--mx-popup-list-container-padding-inline` | `` | `initial` |
| `popup.list.item.radius` | `--mx-popup-list-item-radius` | `item.radius` | `0.25rem` |
| `popup.list-box-space.container.margin` | `--mx-popup-list-box-space-container-margin` | `` | `0px` |
| `popup.list-box-space.box.padding-block` | `--mx-popup-list-box-space-box-padding-block` | `space.1` | `0.25rem` |
| `popup.list-box-space.box.padding-inline` | `--mx-popup-list-box-space-box-padding-inline` | `space.1` | `0.25rem` |
| `popup.surface.padding-block` | `--mx-popup-surface-padding-block` | `space.1` | `0.25rem` |
| `popup.surface.padding` | `--mx-popup-surface-padding` | `space.1` | `0.25rem` |
| `popup.surface.bg` | `--mx-popup-surface-bg` | `color.bg.surface` | `#f8f7f3` |
| `popup.surface.border-width` | `--mx-popup-surface-border-width` | `border.width.1` | `1px` |
| `popup.surface.border-color` | `--mx-popup-surface-border-color` | `color.stroke.surface` | `rgb(117 117 117 / 0.4)` |
| `popup.surface.radius` | `--mx-popup-surface-radius` | `radius.lg` | `0.625rem` |
| `popup.surface.shadow` | `--mx-popup-surface-shadow` | `elevation.popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `popup.surface.color` | `--mx-popup-surface-color` | `color.fg.primary` | `#1d1c1a` |
| `popup.surface.focus.glow` | `--mx-popup-surface-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `popup.surface.focus.outline-width` | `--mx-popup-surface-focus-outline-width` | `focus.ring.width` | `2px` |
| `popup.surface.focus.outline-color` | `--mx-popup-surface-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `popup.surface.focus.outline-offset` | `--mx-popup-surface-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `popup.surface.padding-inline` | `--mx-popup-surface-padding-inline` | `` | `initial` |
| `progress.active-gap` | `--mx-progress-active-gap` | `` | `0px` |
| `progress.dot-size` | `--mx-progress-dot-size` | `` | `0.25rem` |
| `progress.stop-inset` | `--mx-progress-stop-inset` | `` | `0px` |
| `progress.runner-length` | `--mx-progress-runner-length` | `` | `40%` |
| `progress.runner-duration` | `--mx-progress-runner-duration` | `` | `calc(250ms * 7)` |
| `progress.gap` | `--mx-progress-gap` | `space.2` | `0.5rem` |
| `progress.head-gap` | `--mx-progress-head-gap` | `space.1` | `0.25rem` |
| `progress.width` | `--mx-progress-width` | `` | `16rem` |
| `progress.thickness.sm` | `--mx-progress-thickness-sm` | `` | `0.125rem` |
| `progress.thickness.md` | `--mx-progress-thickness-md` | `` | `0.25rem` |
| `progress.thickness.lg` | `--mx-progress-thickness-lg` | `` | `0.5rem` |
| `progress.rest-thickness.sm` | `--mx-progress-rest-thickness-sm` | `` | `0.125rem` |
| `progress.rest-thickness.md` | `--mx-progress-rest-thickness-md` | `` | `0.25rem` |
| `progress.rest-thickness.lg` | `--mx-progress-rest-thickness-lg` | `` | `0.5rem` |
| `progress.wave-amplitude` | `--mx-progress-wave-amplitude` | `` | `0px` |
| `progress.wave-length` | `--mx-progress-wave-length` | `` | `40px` |
| `progress.wave-speed` | `--mx-progress-wave-speed` | `` | `calc(250ms * 4 / 3)` |
| `progress.wave-direction` | `--mx-progress-wave-direction` | `` | `forward` |
| `progress.wave-start` | `--mx-progress-wave-start` | `` | `0.1` |
| `progress.wave-end` | `--mx-progress-wave-end` | `` | `0.95` |
| `progress.wave-grow-duration` | `--mx-progress-wave-grow-duration` | `motion.duration.fast` | `83ms` |
| `progress.ring-size.sm` | `--mx-progress-ring-size-sm` | `icon.size.md` | `1rem` |
| `progress.ring-size.md` | `--mx-progress-ring-size-md` | `` | `1.5rem` |
| `progress.ring-size.lg` | `--mx-progress-ring-size-lg` | `` | `2.5rem` |
| `progress.ring-thickness.sm` | `--mx-progress-ring-thickness-sm` | `border.width.2` | `2px` |
| `progress.ring-thickness.md` | `--mx-progress-ring-thickness-md` | `` | `0.1875rem` |
| `progress.ring-thickness.lg` | `--mx-progress-ring-thickness-lg` | `` | `0.25rem` |
| `progress.ring-active-gap` | `--mx-progress-ring-active-gap` | `` | `0px` |
| `progress.ring-runner-length` | `--mx-progress-ring-runner-length` | `` | `0.25` |
| `progress.ring-turn-duration` | `--mx-progress-ring-turn-duration` | `` | `calc(250ms * 3)` |
| `progress.ring-wave-amplitude` | `--mx-progress-ring-wave-amplitude` | `` | `0px` |
| `progress.ring-wave-length` | `--mx-progress-ring-wave-length` | `` | `15px` |
| `progress.ring-wave-speed` | `--mx-progress-ring-wave-speed` | `` | `calc(250ms * 4 / 3)` |
| `progress.ring-wave-direction` | `--mx-progress-ring-wave-direction` | `` | `forward` |
| `progress.ring-wave-start` | `--mx-progress-ring-wave-start` | `` | `0.1` |
| `progress.ring-wave-end` | `--mx-progress-ring-wave-end` | `` | `0.95` |
| `progress.ring-wave-grow-duration` | `--mx-progress-ring-wave-grow-duration` | `motion.duration.fast` | `83ms` |
| `progress.accent` | `--mx-progress-accent` | `color.accent.solid` | `#c24523` |
| `progress.accent-subtle` | `--mx-progress-accent-subtle` | `color.accent.subtle` | `#fbe6de` |
| `progress.neutral` | `--mx-progress-neutral` | `color.fg.secondary` | `#5e5c55` |
| `progress.neutral-subtle` | `--mx-progress-neutral-subtle` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `progress.success` | `--mx-progress-success` | `color.success.fg` | `#006402` |
| `progress.success-subtle` | `--mx-progress-success-subtle` | `color.success.subtle` | `#dff6dd` |
| `progress.caution` | `--mx-progress-caution` | `color.caution.fg` | `#754702` |
| `progress.caution-subtle` | `--mx-progress-caution-subtle` | `color.caution.subtle` | `#fff4ce` |
| `progress.danger` | `--mx-progress-danger` | `color.danger.solid` | `#b03659` |
| `progress.danger-subtle` | `--mx-progress-danger-subtle` | `color.danger.subtle` | `#fde7e9` |
| `progress.track.bg` | `--mx-progress-track-bg` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `progress.track.radius` | `--mx-progress-track-radius` | `radius.full` | `9999px` |
| `progress.bar.radius` | `--mx-progress-bar-radius` | `radius.full` | `9999px` |
| `progress.ring.color` | `--mx-progress-ring-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `progress.label.color` | `--mx-progress-label-color` | `color.fg.primary` | `#1d1c1a` |
| `progress.label.font-size` | `--mx-progress-label-font-size` | `` | `1em` |
| `progress.label.font-weight` | `--mx-progress-label-font-weight` | `font.weight.medium` | `500` |
| `progress.value.color` | `--mx-progress-value-color` | `color.fg.secondary` | `#5e5c55` |
| `progress.value.font-size` | `--mx-progress-value-font-size` | `font.size.caption` | `0.75rem` |
| `progress.value.font-weight` | `--mx-progress-value-font-weight` | `font.weight.regular` | `400` |
| `progress.rest.display` | `--mx-progress-rest-display` | `` | `initial` |
| `progress.rest.bg` | `--mx-progress-rest-bg` | `` | `initial` |
| `progress.rest.radius` | `--mx-progress-rest-radius` | `` | `initial` |
| `progress.rest.indeterminate.display` | `--mx-progress-rest-indeterminate-display` | `` | `initial` |
| `progress.stop.display` | `--mx-progress-stop-display` | `` | `initial` |
| `qr-code.size` | `--mx-qr-code-size` | `` | `160px` |
| `qr-code.sheet.bg` | `--mx-qr-code-sheet-bg` | `` | `#ffffff` |
| `qr-code.sheet.color` | `--mx-qr-code-sheet-color` | `` | `#000000` |
| `qr-code.sheet.radius` | `--mx-qr-code-sheet-radius` | `radius.md` | `0.375rem` |
| `qr-code.logo.radius` | `--mx-qr-code-logo-radius` | `radius.xs` | `0.25rem` |
| `qr-code.logo.bg` | `--mx-qr-code-logo-bg` | `` | `#ffffff` |
| `radiogroup.gap` | `--mx-radiogroup-gap` | `space.2` | `0.5rem` |
| `radiogroup.column-gap` | `--mx-radiogroup-column-gap` | `space.6` | `1.5rem` |
| `radiogroup.help-gap` | `--mx-radiogroup-help-gap` | `space.1` | `0.25rem` |
| `radiogroup.size.sm` | `--mx-radiogroup-size-sm` | `` | `0.875rem` |
| `radiogroup.size.md` | `--mx-radiogroup-size-md` | `icon.size.md` | `1rem` |
| `radiogroup.size.lg` | `--mx-radiogroup-size-lg` | `icon.size.lg` | `1.25rem` |
| `radiogroup.dot-size.sm` | `--mx-radiogroup-dot-size-sm` | `` | `0.375rem` |
| `radiogroup.dot-size.md` | `--mx-radiogroup-dot-size-md` | `` | `0.4375rem` |
| `radiogroup.dot-size.lg` | `--mx-radiogroup-dot-size-lg` | `` | `0.5625rem` |
| `radiogroup.dot-size-hover.sm` | `--mx-radiogroup-dot-size-hover-sm` | `` | `0.375rem` |
| `radiogroup.dot-size-hover.md` | `--mx-radiogroup-dot-size-hover-md` | `` | `0.4375rem` |
| `radiogroup.dot-size-hover.lg` | `--mx-radiogroup-dot-size-hover-lg` | `` | `0.5625rem` |
| `radiogroup.dot-size-pressed.sm` | `--mx-radiogroup-dot-size-pressed-sm` | `` | `0.375rem` |
| `radiogroup.dot-size-pressed.md` | `--mx-radiogroup-dot-size-pressed-md` | `` | `0.4375rem` |
| `radiogroup.dot-size-pressed.lg` | `--mx-radiogroup-dot-size-pressed-lg` | `` | `0.5625rem` |
| `radiogroup.height.sm` | `--mx-radiogroup-height-sm` | `control.height.sm` | `1.5rem` |
| `radiogroup.height.md` | `--mx-radiogroup-height-md` | `control.height.md` | `2rem` |
| `radiogroup.height.lg` | `--mx-radiogroup-height-lg` | `control.height.lg` | `2.5rem` |
| `radiogroup.font-size.sm` | `--mx-radiogroup-font-size-sm` | `font.size.caption` | `0.75rem` |
| `radiogroup.font-size.md` | `--mx-radiogroup-font-size-md` | `font.size.body` | `0.875rem` |
| `radiogroup.font-size.lg` | `--mx-radiogroup-font-size-lg` | `font.size.body-large` | `1.125rem` |
| `radiogroup.press-offset` | `--mx-radiogroup-press-offset` | `control.press.offset` | `1px` |
| `radiogroup.focus-scope` | `--mx-radiogroup-focus-scope` | `` | `box` |
| `radiogroup.field.label-mode` | `--mx-radiogroup-field-label-mode` | `` | `top` |
| `radiogroup.field.variant` | `--mx-radiogroup-field-variant` | `` | `outline` |
| `radiogroup.field.padding.sm` | `--mx-radiogroup-field-padding-sm` | `` | `0px` |
| `radiogroup.field.padding.md` | `--mx-radiogroup-field-padding-md` | `` | `0px` |
| `radiogroup.field.padding.lg` | `--mx-radiogroup-field-padding-lg` | `` | `0px` |
| `radiogroup.field.border-width` | `--mx-radiogroup-field-border-width` | `` | `0px` |
| `radiogroup.field.padding-start.sm` | `--mx-radiogroup-field-padding-start-sm` | `` | `0px` |
| `radiogroup.field.padding-start.md` | `--mx-radiogroup-field-padding-start-md` | `` | `0px` |
| `radiogroup.field.padding-start.lg` | `--mx-radiogroup-field-padding-start-lg` | `` | `0px` |
| `radiogroup.field.padding-end.sm` | `--mx-radiogroup-field-padding-end-sm` | `` | `0px` |
| `radiogroup.field.padding-end.md` | `--mx-radiogroup-field-padding-end-md` | `` | `0px` |
| `radiogroup.field.padding-end.lg` | `--mx-radiogroup-field-padding-end-lg` | `` | `0px` |
| `radiogroup.field.box.bg` | `--mx-radiogroup-field-box-bg` | `` | `rgb(0 0 0 / 0)` |
| `radiogroup.field.box.hover.bg` | `--mx-radiogroup-field-box-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `radiogroup.field.box.focus.bg` | `--mx-radiogroup-field-box-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `radiogroup.field.box.focus.shadow` | `--mx-radiogroup-field-box-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `radiogroup.field.box.radius` | `--mx-radiogroup-field-box-radius` | `` | `0px` |
| `radiogroup.field.box.shadow` | `--mx-radiogroup-field-box-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `radiogroup.field.box.cursor` | `--mx-radiogroup-field-box-cursor` | `` | `default` |
| `radiogroup.field.box.disabled.bg` | `--mx-radiogroup-field-box-disabled-bg` | `` | `rgb(0 0 0 / 0)` |
| `radiogroup.field.box.disabled.shadow` | `--mx-radiogroup-field-box-disabled-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `radiogroup.field.box.invalid-hover.bg` | `--mx-radiogroup-field-box-invalid-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `radiogroup.field.box.invalid-focus.bg` | `--mx-radiogroup-field-box-invalid-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `radiogroup.field.box.invalid-focus.shadow` | `--mx-radiogroup-field-box-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `radiogroup.field.box.readonly-focus.shadow` | `--mx-radiogroup-field-box-readonly-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `radiogroup.field.box.readonly-invalid-focus.shadow` | `--mx-radiogroup-field-box-readonly-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `radiogroup.field.frame.display` | `--mx-radiogroup-field-frame-display` | `` | `none` |
| `radiogroup.field.indicator.display` | `--mx-radiogroup-field-indicator-display` | `` | `none` |
| `radiogroup.circle.bg` | `--mx-radiogroup-circle-bg` | `color.fill.control.default` | `#f5f4f0` |
| `radiogroup.circle.border-width` | `--mx-radiogroup-circle-border-width` | `border.width.1` | `1px` |
| `radiogroup.circle.border-color` | `--mx-radiogroup-circle-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `radiogroup.circle.radius` | `--mx-radiogroup-circle-radius` | `radius.full` | `9999px` |
| `radiogroup.circle.shadow` | `--mx-radiogroup-circle-shadow` | `` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0 1px 0 rgb(0 0 0 / 0.3)` |
| `radiogroup.circle.checked.bg` | `--mx-radiogroup-circle-checked-bg` | `color.accent.solid` | `#c24523` |
| `radiogroup.circle.checked.border-color` | `--mx-radiogroup-circle-checked-border-color` | `color.accent.solid` | `#c24523` |
| `radiogroup.circle.checked.shadow` | `--mx-radiogroup-circle-checked-shadow` | `` | `0 1px 0 rgb(0 0 0 / 0.3)` |
| `radiogroup.circle.invalid.border-color` | `--mx-radiogroup-circle-invalid-border-color` | `color.danger.solid` | `#b03659` |
| `radiogroup.circle.invalid.shadow` | `--mx-radiogroup-circle-invalid-shadow` | `` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0 1px 0 #b03659` |
| `radiogroup.circle.checked-invalid.shadow` | `--mx-radiogroup-circle-checked-invalid-shadow` | `` | `0 1px 0 #b03659` |
| `radiogroup.circle.hover.bg` | `--mx-radiogroup-circle-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `radiogroup.circle.hover.border-color` | `--mx-radiogroup-circle-hover-border-color` | `` | `initial` |
| `radiogroup.circle.checked-hover.bg` | `--mx-radiogroup-circle-checked-hover-bg` | `color.accent.solid-hover` | `#b43f20` |
| `radiogroup.circle.checked-hover.border-color` | `--mx-radiogroup-circle-checked-hover-border-color` | `color.accent.solid-hover` | `#b43f20` |
| `radiogroup.circle.invalid-hover.border-color` | `--mx-radiogroup-circle-invalid-hover-border-color` | `color.danger.solid` | `#b03659` |
| `radiogroup.circle.pressed.bg` | `--mx-radiogroup-circle-pressed-bg` | `color.fill.control.tertiary` | `#e1e0da` |
| `radiogroup.circle.pressed.border-color` | `--mx-radiogroup-circle-pressed-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `radiogroup.circle.pressed.shadow` | `--mx-radiogroup-circle-pressed-shadow` | `` | `0 0 #0000` |
| `radiogroup.circle.checked-pressed.bg` | `--mx-radiogroup-circle-checked-pressed-bg` | `color.accent.solid-hover` | `#b43f20` |
| `radiogroup.circle.checked-pressed.border-color` | `--mx-radiogroup-circle-checked-pressed-border-color` | `color.accent.solid-hover` | `#b43f20` |
| `radiogroup.circle.checked-pressed.shadow` | `--mx-radiogroup-circle-checked-pressed-shadow` | `` | `0 0 #0000` |
| `radiogroup.circle.invalid-pressed.border-color` | `--mx-radiogroup-circle-invalid-pressed-border-color` | `color.danger.solid` | `#b03659` |
| `radiogroup.circle.focus.outline-width` | `--mx-radiogroup-circle-focus-outline-width` | `focus.ring.width` | `2px` |
| `radiogroup.circle.focus.outline-color` | `--mx-radiogroup-circle-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `radiogroup.circle.focus.outline-offset` | `--mx-radiogroup-circle-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `radiogroup.circle.focus.glow` | `--mx-radiogroup-circle-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `radiogroup.circle.checked-focus.glow` | `--mx-radiogroup-circle-checked-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `radiogroup.circle.invalid-focus.glow` | `--mx-radiogroup-circle-invalid-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `radiogroup.circle.checked-invalid-focus.glow` | `--mx-radiogroup-circle-checked-invalid-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `radiogroup.circle.pressed-focus.glow` | `--mx-radiogroup-circle-pressed-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `radiogroup.circle.pressed-focus.shadow` | `--mx-radiogroup-circle-pressed-focus-shadow` | `` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0 1px 0 rgb(0 0 0 / 0.3)` |
| `radiogroup.circle.checked-pressed-focus.glow` | `--mx-radiogroup-circle-checked-pressed-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `radiogroup.circle.checked-pressed-focus.shadow` | `--mx-radiogroup-circle-checked-pressed-focus-shadow` | `` | `0 1px 0 rgb(0 0 0 / 0.3)` |
| `radiogroup.circle.disabled.bg` | `--mx-radiogroup-circle-disabled-bg` | `color.fill.control.disabled` | `#ebeae5` |
| `radiogroup.circle.disabled.border-color` | `--mx-radiogroup-circle-disabled-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `radiogroup.circle.disabled.shadow` | `--mx-radiogroup-circle-disabled-shadow` | `` | `0 0 #0000` |
| `radiogroup.circle.checked-disabled.bg` | `--mx-radiogroup-circle-checked-disabled-bg` | `color.fill.accent-disabled` | `rgb(0 0 0 / 0.2169)` |
| `radiogroup.circle.checked-disabled.border-color` | `--mx-radiogroup-circle-checked-disabled-border-color` | `color.fill.accent-disabled` | `rgb(0 0 0 / 0.2169)` |
| `radiogroup.circle.checked-disabled.shadow` | `--mx-radiogroup-circle-checked-disabled-shadow` | `` | `0 0 #0000` |
| `radiogroup.circle.checked-lg.border-width` | `--mx-radiogroup-circle-checked-lg-border-width` | `` | `initial` |
| `radiogroup.dot.radius` | `--mx-radiogroup-dot-radius` | `radius.full` | `9999px` |
| `radiogroup.dot.checked.display` | `--mx-radiogroup-dot-checked-display` | `` | `block` |
| `radiogroup.dot.checked.bg` | `--mx-radiogroup-dot-checked-bg` | `color.accent.on-solid` | `#ffffff` |
| `radiogroup.dot.disabled.bg` | `--mx-radiogroup-dot-disabled-bg` | `color.fg.on-accent-disabled` | `#ffffff` |
| `radiogroup.text.disabled.color` | `--mx-radiogroup-text-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `radiogroup.help.font-size` | `--mx-radiogroup-help-font-size` | `font.size.caption` | `0.75rem` |
| `radiogroup.help.line-height` | `--mx-radiogroup-help-line-height` | `font.line.caption` | `1rem` |
| `radiogroup.help.color` | `--mx-radiogroup-help-color` | `color.fg.secondary` | `#5e5c55` |
| `rating.tone` | `--mx-rating-tone` | `` | `accent` |
| `rating.size.sm` | `--mx-rating-size-sm` | `` | `1rem` |
| `rating.size.md` | `--mx-rating-size-md` | `` | `1.25rem` |
| `rating.size.lg` | `--mx-rating-size-lg` | `` | `1.75rem` |
| `rating.gap.sm` | `--mx-rating-gap-sm` | `` | `0.125rem` |
| `rating.gap.md` | `--mx-rating-gap-md` | `` | `0.25rem` |
| `rating.gap.lg` | `--mx-rating-gap-lg` | `` | `0.25rem` |
| `rating.field.label-mode` | `--mx-rating-field-label-mode` | `` | `top` |
| `rating.field.variant` | `--mx-rating-field-variant` | `` | `outline` |
| `rating.field.padding.sm` | `--mx-rating-field-padding-sm` | `` | `0px` |
| `rating.field.padding.md` | `--mx-rating-field-padding-md` | `` | `0px` |
| `rating.field.padding.lg` | `--mx-rating-field-padding-lg` | `` | `0px` |
| `rating.field.border-width` | `--mx-rating-field-border-width` | `` | `0px` |
| `rating.field.padding-start.sm` | `--mx-rating-field-padding-start-sm` | `` | `0px` |
| `rating.field.padding-start.md` | `--mx-rating-field-padding-start-md` | `` | `0px` |
| `rating.field.padding-start.lg` | `--mx-rating-field-padding-start-lg` | `` | `0px` |
| `rating.field.padding-end.sm` | `--mx-rating-field-padding-end-sm` | `` | `0px` |
| `rating.field.padding-end.md` | `--mx-rating-field-padding-end-md` | `` | `0px` |
| `rating.field.padding-end.lg` | `--mx-rating-field-padding-end-lg` | `` | `0px` |
| `rating.field.box.bg` | `--mx-rating-field-box-bg` | `` | `rgb(0 0 0 / 0)` |
| `rating.field.box.hover.bg` | `--mx-rating-field-box-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `rating.field.box.focus.bg` | `--mx-rating-field-box-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `rating.field.box.focus.shadow` | `--mx-rating-field-box-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `rating.field.box.radius` | `--mx-rating-field-box-radius` | `` | `0px` |
| `rating.field.box.shadow` | `--mx-rating-field-box-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `rating.field.box.cursor` | `--mx-rating-field-box-cursor` | `` | `default` |
| `rating.field.box.disabled.bg` | `--mx-rating-field-box-disabled-bg` | `` | `rgb(0 0 0 / 0)` |
| `rating.field.box.disabled.shadow` | `--mx-rating-field-box-disabled-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `rating.field.box.invalid-hover.bg` | `--mx-rating-field-box-invalid-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `rating.field.box.invalid-focus.bg` | `--mx-rating-field-box-invalid-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `rating.field.box.invalid-focus.shadow` | `--mx-rating-field-box-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `rating.field.box.readonly-focus.shadow` | `--mx-rating-field-box-readonly-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `rating.field.box.readonly-invalid-focus.shadow` | `--mx-rating-field-box-readonly-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `rating.field.frame.display` | `--mx-rating-field-frame-display` | `` | `none` |
| `rating.field.indicator.display` | `--mx-rating-field-indicator-display` | `` | `none` |
| `rating.stars.radius` | `--mx-rating-stars-radius` | `radius.sm` | `0.25rem` |
| `rating.stars.focus.glow` | `--mx-rating-stars-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `rating.stars.focus.outline-width` | `--mx-rating-stars-focus-outline-width` | `focus.ring.width` | `2px` |
| `rating.stars.focus.outline-color` | `--mx-rating-stars-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `rating.stars.focus.outline-offset` | `--mx-rating-stars-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `rating.stars.disabled.opacity` | `--mx-rating-stars-disabled-opacity` | `opacity.disabled` | `0.5` |
| `rating.item.hover.scale` | `--mx-rating-item-hover-scale` | `` | `[object Object]` |
| `rating.star.icon` | `--mx-rating-star-icon` | `` | `var(--mx-icon-star)` |
| `rating.star.bg` | `--mx-rating-star-bg` | `color.fg.tertiary` | `#8c8a82` |
| `rating.fill.icon` | `--mx-rating-fill-icon` | `` | `var(--mx-icon-star-filled)` |
| `rating.fill.bg` | `--mx-rating-fill-bg` | `color.accent.solid` | `#c24523` |
| `rating.fill.accent.bg` | `--mx-rating-fill-accent-bg` | `color.accent.solid` | `#c24523` |
| `rating.fill.neutral.bg` | `--mx-rating-fill-neutral-bg` | `color.fg.primary` | `#1d1c1a` |
| `recurrence-editor.row-gap` | `--mx-recurrence-editor-row-gap` | `space.4` | `1rem` |
| `recurrence-editor.column-gap` | `--mx-recurrence-editor-column-gap` | `space.4` | `1rem` |
| `recurrence-editor.day-button.variant` | `--mx-recurrence-editor-day-button-variant` | `` | `solid` |
| `recurrence-editor.day-button.size` | `--mx-recurrence-editor-day-button-size` | `` | `sm` |
| `recurrence-editor.day-button.face.radius` | `--mx-recurrence-editor-day-button-face-radius` | `radius.md` | `0.375rem` |
| `recurrence-editor.day-button.face.min-width` | `--mx-recurrence-editor-day-button-face-min-width` | `control.height.md` | `2rem` |
| `recurrence-editor.day-button.face.padding-inline` | `--mx-recurrence-editor-day-button-face-padding-inline` | `space.1` | `0.25rem` |
| `recurrence-editor.day-button.face.toggled.bg` | `--mx-recurrence-editor-day-button-face-toggled-bg` | `color.accent.solid` | `#c24523` |
| `recurrence-editor.day-button.face.toggled.color` | `--mx-recurrence-editor-day-button-face-toggled-color` | `color.accent.on-solid` | `#ffffff` |
| `recurrence-editor.day-button.face.toggled-hover.bg` | `--mx-recurrence-editor-day-button-face-toggled-hover-bg` | `color.accent.solid-hover` | `#b43f20` |
| `recurrence-editor.day-button.face.outline-toggled.bg` | `--mx-recurrence-editor-day-button-face-outline-toggled-bg` | `color.accent.solid` | `#c24523` |
| `recurrence-editor.day-button.face.outline-toggled.color` | `--mx-recurrence-editor-day-button-face-outline-toggled-color` | `color.accent.on-solid` | `#ffffff` |
| `recurrence-editor.day-button.face.outline-toggled.border-color` | `--mx-recurrence-editor-day-button-face-outline-toggled-border-color` | `color.accent.solid` | `#c24523` |
| `recurrence-editor.day-button.face.outline-toggled-hover.bg` | `--mx-recurrence-editor-day-button-face-outline-toggled-hover-bg` | `color.accent.solid-hover` | `#b43f20` |
| `recurrence-editor.days-label.color` | `--mx-recurrence-editor-days-label-color` | `color.fg.primary` | `#1d1c1a` |
| `recurrence-editor.days-label.font-weight` | `--mx-recurrence-editor-days-label-font-weight` | `font.weight.medium` | `500` |
| `recurrence-editor.days-label.margin-bottom` | `--mx-recurrence-editor-days-label-margin-bottom` | `space.1` | `0.25rem` |
| `recurrence-editor.days.gap` | `--mx-recurrence-editor-days-gap` | `space.1` | `0.25rem` |
| `recurrence-editor.summary.color` | `--mx-recurrence-editor-summary-color` | `color.fg.secondary` | `#5e5c55` |
| `resizable.edge` | `--mx-resizable-edge` | `space.2` | `0.5rem` |
| `resizable.box.resizing.outline-width` | `--mx-resizable-box-resizing-outline-width` | `border.width.1` | `1px` |
| `resizable.box.resizing.outline-color` | `--mx-resizable-box-resizing-outline-color` | `color.accent.solid` | `#c24523` |
| `resizable.box.resizing.outline-offset` | `--mx-resizable-box-resizing-outline-offset` | `` | `-1px` |
| `resizable.handle.hover.bg` | `--mx-resizable-handle-hover-bg` | `color.accent.subtle` | `#fbe6de` |
| `resizable.handle.active.bg` | `--mx-resizable-handle-active-bg` | `color.accent.subtle` | `#fbe6de` |
| `resizable.grip.size` | `--mx-resizable-grip-size` | `` | `1rem` |
| `resizable.grip.radius` | `--mx-resizable-grip-radius` | `radius.sm` | `0.25rem` |
| `resizable.grip.hover.bg` | `--mx-resizable-grip-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `resizable.grip.pressed.bg` | `--mx-resizable-grip-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `resizable.grip.focus.glow` | `--mx-resizable-grip-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `resizable.grip.focus.outline-width` | `--mx-resizable-grip-focus-outline-width` | `focus.ring.width` | `2px` |
| `resizable.grip.focus.outline-color` | `--mx-resizable-grip-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `resizable.grip.focus.outline-offset` | `--mx-resizable-grip-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `resizable.grip-glyph.size` | `--mx-resizable-grip-glyph-size` | `` | `0.75rem` |
| `resizable.grip-glyph.bg` | `--mx-resizable-grip-glyph-bg` | `color.fg.tertiary` | `#8c8a82` |
| `resizable.grip-glyph.icon` | `--mx-resizable-grip-glyph-icon` | `` | `var(--mx-icon-grip)` |
| `scheduler.height` | `--mx-scheduler-height` | `` | `40rem` |
| `scheduler.ruler-width` | `--mx-scheduler-ruler-width` | `` | `4rem` |
| `scheduler.slot-height` | `--mx-scheduler-slot-height` | `control.height.md` | `2rem` |
| `scheduler.column-min-width` | `--mx-scheduler-column-min-width` | `` | `4rem` |
| `scheduler.column-end-gap` | `--mx-scheduler-column-end-gap` | `space.3` | `0.75rem` |
| `scheduler.lane-size` | `--mx-scheduler-lane-size` | `` | `1.375rem` |
| `scheduler.lane-gap` | `--mx-scheduler-lane-gap` | `` | `0.125rem` |
| `scheduler.month-date-size` | `--mx-scheduler-month-date-size` | `` | `1.75rem` |
| `scheduler.month-date-align` | `--mx-scheduler-month-date-align` | `` | `start` |
| `scheduler.date-number-size` | `--mx-scheduler-date-number-size` | `control.height.sm` | `1.5rem` |
| `scheduler.resize-size` | `--mx-scheduler-resize-size` | `space.2` | `0.5rem` |
| `scheduler.resize-size-touch` | `--mx-scheduler-resize-size-touch` | `space.4` | `1rem` |
| `scheduler.editor-width` | `--mx-scheduler-editor-width` | `` | `34rem` |
| `scheduler.state-inset` | `--mx-scheduler-state-inset` | `space.2` | `0.5rem` |
| `scheduler.timeline-cell-width` | `--mx-scheduler-timeline-cell-width` | `` | `4rem` |
| `scheduler.timeline-resource-width` | `--mx-scheduler-timeline-resource-width` | `` | `10rem` |
| `scheduler.timeline-lane-size` | `--mx-scheduler-timeline-lane-size` | `` | `1.75rem` |
| `scheduler.timeline-row-min-height` | `--mx-scheduler-timeline-row-min-height` | `` | `3rem` |
| `scheduler.agenda-time-width` | `--mx-scheduler-agenda-time-width` | `` | `9rem` |
| `scheduler.phone-bar-size` | `--mx-scheduler-phone-bar-size` | `` | `lg` |
| `scheduler.grip-ring` | `--mx-scheduler-grip-ring` | `color.accent.solid` | `#c24523` |
| `scheduler.grip-ring-mix` | `--mx-scheduler-grip-ring-mix` | `` | `100` |
| `scheduler.touch-target` | `--mx-scheduler-touch-target` | `control.height.lg` | `2.5rem` |
| `scheduler.touch-lane-size` | `--mx-scheduler-touch-lane-size` | `` | `1.75rem` |
| `scheduler.phone-ruler-width` | `--mx-scheduler-phone-ruler-width` | `` | `3rem` |
| `scheduler.phone-column-min-width` | `--mx-scheduler-phone-column-min-width` | `` | `2.5rem` |
| `scheduler.phone-timeline-resource-width` | `--mx-scheduler-phone-timeline-resource-width` | `` | `6rem` |
| `scheduler.swipe-inset` | `--mx-scheduler-swipe-inset` | `space.3` | `0.75rem` |
| `scheduler.appointment-default` | `--mx-scheduler-appointment-default` | `color.accent.solid` | `#c24523` |
| `scheduler.appointment-surface` | `--mx-scheduler-appointment-surface` | `color.bg.surface` | `#f8f7f3` |
| `scheduler.appointment-tint` | `--mx-scheduler-appointment-tint` | `` | `22` |
| `scheduler.appointment-tint-hover` | `--mx-scheduler-appointment-tint-hover` | `` | `32` |
| `scheduler.appointment-foreground` | `--mx-scheduler-appointment-foreground` | `color.fg.primary` | `#1d1c1a` |
| `scheduler.appointment-past-tint` | `--mx-scheduler-appointment-past-tint` | `` | `8` |
| `scheduler.appointment-past-color-mix` | `--mx-scheduler-appointment-past-color-mix` | `` | `45` |
| `scheduler.appointment-text-mix` | `--mx-scheduler-appointment-text-mix` | `` | `0` |
| `scheduler.appointment-text-auto` | `--mx-scheduler-appointment-text-auto` | `` | `0` |
| `scheduler.appointment-time-tone` | `--mx-scheduler-appointment-time-tone` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.appointment-time-tone-hover` | `--mx-scheduler-appointment-time-tone-hover` | `color.fg.primary` | `#1d1c1a` |
| `scheduler.appointment-time-tone-open` | `--mx-scheduler-appointment-time-tone-open` | `color.fg.primary` | `#1d1c1a` |
| `scheduler.appointment-frame-color` | `--mx-scheduler-appointment-frame-color` | `color.bg.surface` | `#f8f7f3` |
| `scheduler.appointment-open-tint` | `--mx-scheduler-appointment-open-tint` | `` | `0` |
| `scheduler.appointment-open-color` | `--mx-scheduler-appointment-open-color` | `color.fg.primary` | `#1d1c1a` |
| `scheduler.appointment-open-color-mix` | `--mx-scheduler-appointment-open-color-mix` | `` | `0` |
| `scheduler.appointment-open-edge-color` | `--mx-scheduler-appointment-open-edge-color` | `color.bg.surface` | `#f8f7f3` |
| `scheduler.appointment-open-edge-mix` | `--mx-scheduler-appointment-open-edge-mix` | `` | `0` |
| `scheduler.appointment-top-width` | `--mx-scheduler-appointment-top-width` | `border.width.1` | `1px` |
| `scheduler.appointment-top-mix` | `--mx-scheduler-appointment-top-mix` | `` | `0` |
| `scheduler.appointment-end-width` | `--mx-scheduler-appointment-end-width` | `border.width.1` | `1px` |
| `scheduler.appointment-end-mix` | `--mx-scheduler-appointment-end-mix` | `` | `0` |
| `scheduler.appointment-bottom-width` | `--mx-scheduler-appointment-bottom-width` | `border.width.1` | `1px` |
| `scheduler.appointment-bottom-mix` | `--mx-scheduler-appointment-bottom-mix` | `` | `0` |
| `scheduler.appointment-start-width` | `--mx-scheduler-appointment-start-width` | `` | `0.1875rem` |
| `scheduler.appointment-start-mix` | `--mx-scheduler-appointment-start-mix` | `` | `100` |
| `scheduler.appointment-continued-start-width` | `--mx-scheduler-appointment-continued-start-width` | `border.width.1` | `1px` |
| `scheduler.chip-background` | `--mx-scheduler-chip-background` | `` | `rgb(0 0 0 / 0)` |
| `scheduler.chip-frame-color` | `--mx-scheduler-chip-frame-color` | `` | `rgb(0 0 0 / 0)` |
| `scheduler.chip-color` | `--mx-scheduler-chip-color` | `color.fg.primary` | `#1d1c1a` |
| `scheduler.chip-text-mix` | `--mx-scheduler-chip-text-mix` | `` | `0` |
| `scheduler.chip-top-width` | `--mx-scheduler-chip-top-width` | `border.width.1` | `1px` |
| `scheduler.chip-top-mix` | `--mx-scheduler-chip-top-mix` | `` | `0` |
| `scheduler.chip-end-width` | `--mx-scheduler-chip-end-width` | `border.width.1` | `1px` |
| `scheduler.chip-end-mix` | `--mx-scheduler-chip-end-mix` | `` | `0` |
| `scheduler.chip-bottom-width` | `--mx-scheduler-chip-bottom-width` | `border.width.1` | `1px` |
| `scheduler.chip-bottom-mix` | `--mx-scheduler-chip-bottom-mix` | `` | `0` |
| `scheduler.chip-start-width` | `--mx-scheduler-chip-start-width` | `` | `0.1875rem` |
| `scheduler.chip-start-mix` | `--mx-scheduler-chip-start-mix` | `` | `100` |
| `scheduler.tooltip-frame-color` | `--mx-scheduler-tooltip-frame-color` | `` | `rgb(0 0 0 / 0)` |
| `scheduler.tooltip-top-width` | `--mx-scheduler-tooltip-top-width` | `` | `0px` |
| `scheduler.tooltip-top-mix` | `--mx-scheduler-tooltip-top-mix` | `` | `0` |
| `scheduler.tooltip-end-width` | `--mx-scheduler-tooltip-end-width` | `` | `0px` |
| `scheduler.tooltip-end-mix` | `--mx-scheduler-tooltip-end-mix` | `` | `0` |
| `scheduler.tooltip-bottom-width` | `--mx-scheduler-tooltip-bottom-width` | `` | `0px` |
| `scheduler.tooltip-bottom-mix` | `--mx-scheduler-tooltip-bottom-mix` | `` | `0` |
| `scheduler.tooltip-start-width` | `--mx-scheduler-tooltip-start-width` | `` | `0.1875rem` |
| `scheduler.tooltip-start-mix` | `--mx-scheduler-tooltip-start-mix` | `` | `100` |
| `scheduler.more-item-frame-color` | `--mx-scheduler-more-item-frame-color` | `` | `rgb(0 0 0 / 0)` |
| `scheduler.more-item-top-width` | `--mx-scheduler-more-item-top-width` | `` | `0px` |
| `scheduler.more-item-top-mix` | `--mx-scheduler-more-item-top-mix` | `` | `0` |
| `scheduler.more-item-end-width` | `--mx-scheduler-more-item-end-width` | `` | `0px` |
| `scheduler.more-item-end-mix` | `--mx-scheduler-more-item-end-mix` | `` | `0` |
| `scheduler.more-item-bottom-width` | `--mx-scheduler-more-item-bottom-width` | `` | `0px` |
| `scheduler.more-item-bottom-mix` | `--mx-scheduler-more-item-bottom-mix` | `` | `0` |
| `scheduler.more-item-start-width` | `--mx-scheduler-more-item-start-width` | `` | `0.1875rem` |
| `scheduler.more-item-start-mix` | `--mx-scheduler-more-item-start-mix` | `` | `100` |
| `scheduler.today-button.variant` | `--mx-scheduler-today-button-variant` | `` | `outline` |
| `scheduler.step-button.variant` | `--mx-scheduler-step-button-variant` | `` | `ghost` |
| `scheduler.title-button.variant` | `--mx-scheduler-title-button-variant` | `` | `ghost` |
| `scheduler.title-button.font-size.sm` | `--mx-scheduler-title-button-font-size-sm` | `font.size.subtitle` | `1.25rem` |
| `scheduler.title-button.face.font-weight` | `--mx-scheduler-title-button-face-font-weight` | `font.weight.semibold` | `600` |
| `scheduler.view-button.variant` | `--mx-scheduler-view-button-variant` | `` | `ghost` |
| `scheduler.state-button.variant` | `--mx-scheduler-state-button-variant` | `` | `outline` |
| `scheduler.state-button.size` | `--mx-scheduler-state-button-size` | `` | `sm` |
| `scheduler.tooltip-button.variant` | `--mx-scheduler-tooltip-button-variant` | `` | `outline` |
| `scheduler.tooltip-button.size` | `--mx-scheduler-tooltip-button-size` | `` | `sm` |
| `scheduler.form-delete.variant` | `--mx-scheduler-form-delete-variant` | `` | `outline` |
| `scheduler.tooltip-popup.surface.padding-block` | `--mx-scheduler-tooltip-popup-surface-padding-block` | `space.1` | `0.25rem` |
| `scheduler.tooltip-popup.surface.padding-inline` | `--mx-scheduler-tooltip-popup-surface-padding-inline` | `` | `initial` |
| `scheduler.more-popup.surface.padding-block` | `--mx-scheduler-more-popup-surface-padding-block` | `space.1` | `0.25rem` |
| `scheduler.more-popup.surface.padding-inline` | `--mx-scheduler-more-popup-surface-padding-inline` | `` | `initial` |
| `scheduler.today-icon-button.variant` | `--mx-scheduler-today-icon-button-variant` | `` | `ghost` |
| `scheduler.view-menu-button.variant` | `--mx-scheduler-view-menu-button-variant` | `` | `ghost` |
| `scheduler.tooltip-sheet.body.padding` | `--mx-scheduler-tooltip-sheet-body-padding` | `space.2` | `0.5rem` |
| `scheduler.form-sheet.body.padding` | `--mx-scheduler-form-sheet-body-padding` | `space.4` | `1rem` |
| `scheduler.scheduler.bg` | `--mx-scheduler-scheduler-bg` | `color.bg.surface` | `#f8f7f3` |
| `scheduler.scheduler.border-width` | `--mx-scheduler-scheduler-border-width` | `border.width.1` | `1px` |
| `scheduler.scheduler.border-color` | `--mx-scheduler-scheduler-border-color` | `color.stroke.card` | `rgb(0 0 0 / 0.08)` |
| `scheduler.scheduler.radius` | `--mx-scheduler-scheduler-radius` | `radius.md` | `0.375rem` |
| `scheduler.scheduler.color` | `--mx-scheduler-scheduler-color` | `color.fg.primary` | `#1d1c1a` |
| `scheduler.scheduler.print.radius` | `--mx-scheduler-scheduler-print-radius` | `` | `0px` |
| `scheduler.scheduler.print.border-width` | `--mx-scheduler-scheduler-print-border-width` | `` | `0px` |
| `scheduler.bar.padding` | `--mx-scheduler-bar-padding` | `space.1` | `0.25rem` |
| `scheduler.bar.gap` | `--mx-scheduler-bar-gap` | `space.1` | `0.25rem` |
| `scheduler.bar.bg` | `--mx-scheduler-bar-bg` | `color.bg.bar` | `#ebeae5` |
| `scheduler.bar.border-bottom-width` | `--mx-scheduler-bar-border-bottom-width` | `border.width.1` | `1px` |
| `scheduler.bar.border-color` | `--mx-scheduler-bar-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `scheduler.bar.phone.border-bottom-width` | `--mx-scheduler-bar-phone-border-bottom-width` | `` | `initial` |
| `scheduler.bar.phone.bg` | `--mx-scheduler-bar-phone-bg` | `` | `initial` |
| `scheduler.head.bg` | `--mx-scheduler-head-bg` | `color.bg.surface` | `#f8f7f3` |
| `scheduler.head.border-bottom-width` | `--mx-scheduler-head-border-bottom-width` | `border.width.1` | `1px` |
| `scheduler.head.border-color` | `--mx-scheduler-head-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `scheduler.date.padding` | `--mx-scheduler-date-padding` | `space.1` | `0.25rem` |
| `scheduler.date.gap` | `--mx-scheduler-date-gap` | `space.1` | `0.25rem` |
| `scheduler.date.border-start-width` | `--mx-scheduler-date-border-start-width` | `border.width.1` | `1px` |
| `scheduler.date.border-color` | `--mx-scheduler-date-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `scheduler.date.color` | `--mx-scheduler-date-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.date.font-size` | `--mx-scheduler-date-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.weekday.today.color` | `--mx-scheduler-weekday-today-color` | `color.accent.fg` | `#983318` |
| `scheduler.day-number.radius` | `--mx-scheduler-day-number-radius` | `radius.full` | `9999px` |
| `scheduler.day-number.color` | `--mx-scheduler-day-number-color` | `color.fg.primary` | `#1d1c1a` |
| `scheduler.day-number.font-size` | `--mx-scheduler-day-number-font-size` | `font.size.subtitle` | `1.25rem` |
| `scheduler.day-number.today.bg` | `--mx-scheduler-day-number-today-bg` | `color.accent.solid` | `#c24523` |
| `scheduler.day-number.today.color` | `--mx-scheduler-day-number-today-color` | `color.accent.on-solid` | `#ffffff` |
| `scheduler.day-number.month.font-size` | `--mx-scheduler-day-number-month-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.day-number.outside.color` | `--mx-scheduler-day-number-outside-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.day-number.scale.min-width` | `--mx-scheduler-day-number-scale-min-width` | `` | `1.5rem` |
| `scheduler.day-number.scale.height` | `--mx-scheduler-day-number-scale-height` | `` | `1.5rem` |
| `scheduler.day-number.scale.font-size` | `--mx-scheduler-day-number-scale-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.day-number.agenda.min-width` | `--mx-scheduler-day-number-agenda-min-width` | `` | `2rem` |
| `scheduler.day-number.agenda.height` | `--mx-scheduler-day-number-agenda-height` | `` | `2rem` |
| `scheduler.day-number.agenda.font-size` | `--mx-scheduler-day-number-agenda-font-size` | `` | `initial` |
| `scheduler.all-day.border-top-width` | `--mx-scheduler-all-day-border-top-width` | `border.width.1` | `1px` |
| `scheduler.all-day.border-color` | `--mx-scheduler-all-day-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `scheduler.all-day-label.padding-inline` | `--mx-scheduler-all-day-label-padding-inline` | `space.1` | `0.25rem` |
| `scheduler.all-day-label.color` | `--mx-scheduler-all-day-label-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.all-day-label.font-size` | `--mx-scheduler-all-day-label-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.hour.padding-end` | `--mx-scheduler-hour-padding-end` | `space.1` | `0.25rem` |
| `scheduler.hour.color` | `--mx-scheduler-hour-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.hour.font-size` | `--mx-scheduler-hour-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.time-row.border-top-width` | `--mx-scheduler-time-row-border-top-width` | `border.width.1` | `1px` |
| `scheduler.time-row.border-color` | `--mx-scheduler-time-row-border-color` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `scheduler.time-row.hour.border-top-color` | `--mx-scheduler-time-row-hour-border-top-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `scheduler.cell.border-start-width` | `--mx-scheduler-cell-border-start-width` | `border.width.1` | `1px` |
| `scheduler.cell.border-color` | `--mx-scheduler-cell-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `scheduler.cell.today.bg` | `--mx-scheduler-cell-today-bg` | `color.accent.subtle` | `#fbe6de` |
| `scheduler.cell.off.bg` | `--mx-scheduler-cell-off-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `scheduler.cell.holiday.bg` | `--mx-scheduler-cell-holiday-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `scheduler.cell.month.padding-inline` | `--mx-scheduler-cell-month-padding-inline` | `` | `0.125rem` |
| `scheduler.cell.outside.bg` | `--mx-scheduler-cell-outside-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `scheduler.cell.month-holiday.bg` | `--mx-scheduler-cell-month-holiday-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `scheduler.cell.week-start.border-start-width` | `--mx-scheduler-cell-week-start-border-start-width` | `` | `0px` |
| `scheduler.cell.blocked.bg` | `--mx-scheduler-cell-blocked-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `scheduler.cell.hover.bg` | `--mx-scheduler-cell-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `scheduler.cell.selected.bg` | `--mx-scheduler-cell-selected-bg` | `color.selection.bg` | `#f5f4f0` |
| `scheduler.cell.focus.glow` | `--mx-scheduler-cell-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `scheduler.cell.focus.outline-width` | `--mx-scheduler-cell-focus-outline-width` | `focus.ring.width` | `2px` |
| `scheduler.cell.focus.outline-color` | `--mx-scheduler-cell-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `scheduler.cell.focus.outline-offset` | `--mx-scheduler-cell-focus-outline-offset` | `` | `calc(-1 * 2px)` |
| `scheduler.cell.line.border-start-color` | `--mx-scheduler-cell-line-border-start-color` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `scheduler.cell.line-hour.border-start-color` | `--mx-scheduler-cell-line-hour-border-start-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `scheduler.cell.line-day.border-start-color` | `--mx-scheduler-cell-line-day-border-start-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `scheduler.now.height` | `--mx-scheduler-now-height` | `border.width.2` | `2px` |
| `scheduler.now.bg` | `--mx-scheduler-now-bg` | `color.danger.solid` | `#b03659` |
| `scheduler.now-dot.size` | `--mx-scheduler-now-dot-size` | `` | `0px` |
| `scheduler.now-dot.bg` | `--mx-scheduler-now-dot-bg` | `color.danger.solid` | `#b03659` |
| `scheduler.now-dot.radius` | `--mx-scheduler-now-dot-radius` | `` | `50%` |
| `scheduler.weekdays.bg` | `--mx-scheduler-weekdays-bg` | `color.bg.surface` | `#f8f7f3` |
| `scheduler.weekdays.border-bottom-width` | `--mx-scheduler-weekdays-border-bottom-width` | `border.width.1` | `1px` |
| `scheduler.weekdays.border-color` | `--mx-scheduler-weekdays-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `scheduler.weekdays.color` | `--mx-scheduler-weekdays-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.weekdays.font-size` | `--mx-scheduler-weekdays-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.weekday-name.padding` | `--mx-scheduler-weekday-name-padding` | `space.1` | `0.25rem` |
| `scheduler.week-row.border-top-width` | `--mx-scheduler-week-row-border-top-width` | `border.width.1` | `1px` |
| `scheduler.week-row.border-color` | `--mx-scheduler-week-row-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `scheduler.week-row.first.border-top-width` | `--mx-scheduler-week-row-first-border-top-width` | `` | `0px` |
| `scheduler.appointment.padding-block` | `--mx-scheduler-appointment-padding-block` | `` | `0.125rem` |
| `scheduler.appointment.padding-inline` | `--mx-scheduler-appointment-padding-inline` | `space.1` | `0.25rem` |
| `scheduler.appointment.radius` | `--mx-scheduler-appointment-radius` | `radius.sm` | `0.25rem` |
| `scheduler.appointment.font-size` | `--mx-scheduler-appointment-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.appointment.focus.glow` | `--mx-scheduler-appointment-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `scheduler.appointment.focus.outline-width` | `--mx-scheduler-appointment-focus-outline-width` | `focus.ring.width` | `2px` |
| `scheduler.appointment.focus.outline-color` | `--mx-scheduler-appointment-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `scheduler.appointment.disabled.opacity` | `--mx-scheduler-appointment-disabled-opacity` | `opacity.disabled` | `0.5` |
| `scheduler.appointment.timed-before.radius-top` | `--mx-scheduler-appointment-timed-before-radius-top` | `` | `0px` |
| `scheduler.appointment.timed-after.radius-bottom` | `--mx-scheduler-appointment-timed-after-radius-bottom` | `` | `0px` |
| `scheduler.appointment.bar-before.radius-start` | `--mx-scheduler-appointment-bar-before-radius-start` | `` | `0px` |
| `scheduler.appointment.bar-after.radius-end` | `--mx-scheduler-appointment-bar-after-radius-end` | `` | `0px` |
| `scheduler.appointment.draggable.cursor` | `--mx-scheduler-appointment-draggable-cursor` | `` | `grab` |
| `scheduler.appointment.draft.shadow` | `--mx-scheduler-appointment-draft-shadow` | `elevation.popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `scheduler.appointment.draft.opacity` | `--mx-scheduler-appointment-draft-opacity` | `` | `0.9` |
| `scheduler.appointment.draft.cursor` | `--mx-scheduler-appointment-draft-cursor` | `` | `grabbing` |
| `scheduler.appointment.invalid.outline-style` | `--mx-scheduler-appointment-invalid-outline-style` | `` | `dashed` |
| `scheduler.appointment.invalid.outline-width` | `--mx-scheduler-appointment-invalid-outline-width` | `border.width.2` | `2px` |
| `scheduler.appointment.invalid.outline-color` | `--mx-scheduler-appointment-invalid-outline-color` | `color.danger.solid` | `#b03659` |
| `scheduler.appointment.invalid.cursor` | `--mx-scheduler-appointment-invalid-cursor` | `` | `not-allowed` |
| `scheduler.appointment.saving.opacity` | `--mx-scheduler-appointment-saving-opacity` | `` | `0.7` |
| `scheduler.appointment.saving.cursor` | `--mx-scheduler-appointment-saving-cursor` | `` | `progress` |
| `scheduler.appointment.line-before.radius-start` | `--mx-scheduler-appointment-line-before-radius-start` | `` | `0px` |
| `scheduler.appointment.line-after.radius-end` | `--mx-scheduler-appointment-line-after-radius-end` | `` | `0px` |
| `scheduler.appointment.lifted.shadow` | `--mx-scheduler-appointment-lifted-shadow` | `elevation.dialog` | `0px 32px 64px 0px rgb(0 0 0 / 0.24), 0px 0px 8px 0px rgb(0 0 0 / 0.2)` |
| `scheduler.appointment.lifted.opacity` | `--mx-scheduler-appointment-lifted-opacity` | `` | `1` |
| `scheduler.appointment.lifted.scale` | `--mx-scheduler-appointment-lifted-scale` | `` | `1.02` |
| `scheduler.appointment.selected.shadow` | `--mx-scheduler-appointment-selected-shadow` | `elevation.card` | `0px 1px 2px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `scheduler.appointment-content.gap` | `--mx-scheduler-appointment-content-gap` | `` | `0.125rem` |
| `scheduler.appointment-content.row.gap` | `--mx-scheduler-appointment-content-row-gap` | `space.1` | `0.25rem` |
| `scheduler.appointment-text.font-weight` | `--mx-scheduler-appointment-text-font-weight` | `font.weight.medium` | `500` |
| `scheduler.tooltip.width` | `--mx-scheduler-tooltip-width` | `` | `18rem` |
| `scheduler.tooltip.padding` | `--mx-scheduler-tooltip-padding` | `space.3` | `0.75rem` |
| `scheduler.tooltip.gap` | `--mx-scheduler-tooltip-gap` | `space.2` | `0.5rem` |
| `scheduler.tooltip-title.font-size` | `--mx-scheduler-tooltip-title-font-size` | `font.size.subtitle` | `1.25rem` |
| `scheduler.tooltip-title.font-weight` | `--mx-scheduler-tooltip-title-font-weight` | `font.weight.semibold` | `600` |
| `scheduler.tooltip-detail.color` | `--mx-scheduler-tooltip-detail-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.tooltip-repeat.color` | `--mx-scheduler-tooltip-repeat-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.series-mark.display` | `--mx-scheduler-series-mark-display` | `` | `block` |
| `scheduler.series-mark.width` | `--mx-scheduler-series-mark-width` | `icon.size.sm` | `0.75rem` |
| `scheduler.series-mark.margin-start` | `--mx-scheduler-series-mark-margin-start` | `space.1` | `0.25rem` |
| `scheduler.series-mark.icon` | `--mx-scheduler-series-mark-icon` | `` | `var(--mx-icon-repeat)` |
| `scheduler.series-mark.opacity` | `--mx-scheduler-series-mark-opacity` | `` | `initial` |
| `scheduler.exception-mark.display` | `--mx-scheduler-exception-mark-display` | `` | `block` |
| `scheduler.exception-mark.width` | `--mx-scheduler-exception-mark-width` | `icon.size.sm` | `0.75rem` |
| `scheduler.exception-mark.margin-start` | `--mx-scheduler-exception-mark-margin-start` | `space.1` | `0.25rem` |
| `scheduler.exception-mark.icon` | `--mx-scheduler-exception-mark-icon` | `` | `var(--mx-icon-repeat-off)` |
| `scheduler.exception-mark.opacity` | `--mx-scheduler-exception-mark-opacity` | `` | `initial` |
| `scheduler.tooltip-actions.gap` | `--mx-scheduler-tooltip-actions-gap` | `space.2` | `0.5rem` |
| `scheduler.more.padding-inline` | `--mx-scheduler-more-padding-inline` | `space.1` | `0.25rem` |
| `scheduler.more.radius` | `--mx-scheduler-more-radius` | `radius.sm` | `0.25rem` |
| `scheduler.more.color` | `--mx-scheduler-more-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.more.font-size` | `--mx-scheduler-more-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.more.hover.bg` | `--mx-scheduler-more-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `scheduler.more.focus.glow` | `--mx-scheduler-more-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `scheduler.more.focus.outline-width` | `--mx-scheduler-more-focus-outline-width` | `focus.ring.width` | `2px` |
| `scheduler.more.focus.outline-color` | `--mx-scheduler-more-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `scheduler.more-list.width` | `--mx-scheduler-more-list-width` | `` | `16rem` |
| `scheduler.more-list.padding` | `--mx-scheduler-more-list-padding` | `space.2` | `0.5rem` |
| `scheduler.more-list.gap` | `--mx-scheduler-more-list-gap` | `space.2` | `0.5rem` |
| `scheduler.more-title.font-weight` | `--mx-scheduler-more-title-font-weight` | `font.weight.semibold` | `600` |
| `scheduler.more-item.padding-block` | `--mx-scheduler-more-item-padding-block` | `` | `0.125rem` |
| `scheduler.more-item.padding-inline` | `--mx-scheduler-more-item-padding-inline` | `space.1` | `0.25rem` |
| `scheduler.more-item.gap` | `--mx-scheduler-more-item-gap` | `space.1` | `0.25rem` |
| `scheduler.more-item.radius` | `--mx-scheduler-more-item-radius` | `radius.sm` | `0.25rem` |
| `scheduler.more-item.color` | `--mx-scheduler-more-item-color` | `color.fg.primary` | `#1d1c1a` |
| `scheduler.more-item.font-size` | `--mx-scheduler-more-item-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.more-item.hover.bg` | `--mx-scheduler-more-item-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `scheduler.more-item.focus.glow` | `--mx-scheduler-more-item-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `scheduler.more-item.focus.outline-width` | `--mx-scheduler-more-item-focus-outline-width` | `focus.ring.width` | `2px` |
| `scheduler.more-item.focus.outline-color` | `--mx-scheduler-more-item-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `scheduler.more-time.color` | `--mx-scheduler-more-time-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.group-header.padding` | `--mx-scheduler-group-header-padding` | `space.1` | `0.25rem` |
| `scheduler.group-header.border-start-width` | `--mx-scheduler-group-header-border-start-width` | `border.width.1` | `1px` |
| `scheduler.group-header.border-bottom-width` | `--mx-scheduler-group-header-border-bottom-width` | `border.width.1` | `1px` |
| `scheduler.group-header.border-color` | `--mx-scheduler-group-header-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `scheduler.group-header.color` | `--mx-scheduler-group-header-color` | `color.fg.primary` | `#1d1c1a` |
| `scheduler.group-header.font-size` | `--mx-scheduler-group-header-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.group-header.font-weight` | `--mx-scheduler-group-header-font-weight` | `font.weight.semibold` | `600` |
| `scheduler.group-header.inner.color` | `--mx-scheduler-group-header-inner-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.group-header.inner.font-weight` | `--mx-scheduler-group-header-inner-font-weight` | `font.weight.regular` | `400` |
| `scheduler.group-header.inner.font-size` | `--mx-scheduler-group-header-inner-font-size` | `` | `initial` |
| `scheduler.group-header.padding-block` | `--mx-scheduler-group-header-padding-block` | `` | `initial` |
| `scheduler.group-header.padding-inline` | `--mx-scheduler-group-header-padding-inline` | `` | `initial` |
| `scheduler.group-swatch.display` | `--mx-scheduler-group-swatch-display` | `` | `block` |
| `scheduler.group-swatch.width` | `--mx-scheduler-group-swatch-width` | `` | `0.5rem` |
| `scheduler.group-swatch.height` | `--mx-scheduler-group-swatch-height` | `` | `0.5rem` |
| `scheduler.group-swatch.radius` | `--mx-scheduler-group-swatch-radius` | `radius.full` | `9999px` |
| `scheduler.group-swatch.margin-end` | `--mx-scheduler-group-swatch-margin-end` | `space.1` | `0.25rem` |
| `scheduler.group-divider.display` | `--mx-scheduler-group-divider-display` | `` | `block` |
| `scheduler.group-divider.width` | `--mx-scheduler-group-divider-width` | `border.width.2` | `2px` |
| `scheduler.group-divider.bg` | `--mx-scheduler-group-divider-bg` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `scheduler.group-divider.inner.display` | `--mx-scheduler-group-divider-inner-display` | `` | `none` |
| `scheduler.unavailable.display` | `--mx-scheduler-unavailable-display` | `` | `block` |
| `scheduler.unavailable.image` | `--mx-scheduler-unavailable-image` | `` | `repeating-linear-gradient(135deg, rgb(0 0 0 / 0.1) 0 1px, transparent 1px 0.5rem)` |
| `scheduler.drop-mark.display` | `--mx-scheduler-drop-mark-display` | `` | `block` |
| `scheduler.drop-mark.width` | `--mx-scheduler-drop-mark-width` | `icon.size.sm` | `0.75rem` |
| `scheduler.drop-mark.margin-end` | `--mx-scheduler-drop-mark-margin-end` | `space.1` | `0.25rem` |
| `scheduler.drop-mark.icon` | `--mx-scheduler-drop-mark-icon` | `` | `var(--mx-icon-blocked)` |
| `scheduler.resource-swatch.display` | `--mx-scheduler-resource-swatch-display` | `` | `block` |
| `scheduler.resource-swatch.width` | `--mx-scheduler-resource-swatch-width` | `` | `0.75rem` |
| `scheduler.resource-swatch.height` | `--mx-scheduler-resource-swatch-height` | `` | `0.75rem` |
| `scheduler.resource-swatch.radius` | `--mx-scheduler-resource-swatch-radius` | `radius.full` | `9999px` |
| `scheduler.tooltip-resource-label.margin-end` | `--mx-scheduler-tooltip-resource-label-margin-end` | `space.1` | `0.25rem` |
| `scheduler.tooltip-resource-label.font-weight` | `--mx-scheduler-tooltip-resource-label-font-weight` | `font.weight.semibold` | `600` |
| `scheduler.tooltip-resource-item.gap` | `--mx-scheduler-tooltip-resource-item-gap` | `space.1` | `0.25rem` |
| `scheduler.tooltip-resource-item.margin-end` | `--mx-scheduler-tooltip-resource-item-margin-end` | `space.2` | `0.5rem` |
| `scheduler.state.gap` | `--mx-scheduler-state-gap` | `space.2` | `0.5rem` |
| `scheduler.state.bg` | `--mx-scheduler-state-bg` | `color.bg.surface` | `#f8f7f3` |
| `scheduler.state.radius` | `--mx-scheduler-state-radius` | `radius.md` | `0.375rem` |
| `scheduler.state.shadow` | `--mx-scheduler-state-shadow` | `elevation.popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `scheduler.state.danger.color` | `--mx-scheduler-state-danger-color` | `color.danger.fg` | `#b03659` |
| `scheduler.timeline-row.border-top-width` | `--mx-scheduler-timeline-row-border-top-width` | `border.width.1` | `1px` |
| `scheduler.timeline-row.border-color` | `--mx-scheduler-timeline-row-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `scheduler.timeline-row.first.border-top-width` | `--mx-scheduler-timeline-row-first-border-top-width` | `` | `0px` |
| `scheduler.timeline-divider.display` | `--mx-scheduler-timeline-divider-display` | `` | `block` |
| `scheduler.timeline-divider.height` | `--mx-scheduler-timeline-divider-height` | `border.width.2` | `2px` |
| `scheduler.timeline-divider.bg` | `--mx-scheduler-timeline-divider-bg` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `scheduler.timeline-divider.inner.display` | `--mx-scheduler-timeline-divider-inner-display` | `` | `none` |
| `scheduler.resource-cell.padding-block` | `--mx-scheduler-resource-cell-padding-block` | `space.1` | `0.25rem` |
| `scheduler.resource-cell.padding-inline` | `--mx-scheduler-resource-cell-padding-inline` | `space.2` | `0.5rem` |
| `scheduler.resource-cell.bg` | `--mx-scheduler-resource-cell-bg` | `color.bg.surface` | `#f8f7f3` |
| `scheduler.resource-cell.border-top-width` | `--mx-scheduler-resource-cell-border-top-width` | `border.width.1` | `1px` |
| `scheduler.resource-cell.border-end-width` | `--mx-scheduler-resource-cell-border-end-width` | `border.width.1` | `1px` |
| `scheduler.resource-cell.border-color` | `--mx-scheduler-resource-cell-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `scheduler.resource-cell.color` | `--mx-scheduler-resource-cell-color` | `color.fg.primary` | `#1d1c1a` |
| `scheduler.resource-cell.font-size` | `--mx-scheduler-resource-cell-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.resource-cell.font-weight` | `--mx-scheduler-resource-cell-font-weight` | `font.weight.semibold` | `600` |
| `scheduler.resource-cell.inner.color` | `--mx-scheduler-resource-cell-inner-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.resource-cell.inner.font-weight` | `--mx-scheduler-resource-cell-inner-font-weight` | `font.weight.regular` | `400` |
| `scheduler.resource-cell.inner.font-size` | `--mx-scheduler-resource-cell-inner-font-size` | `` | `initial` |
| `scheduler.resource-cell.first.border-top-width` | `--mx-scheduler-resource-cell-first-border-top-width` | `` | `0px` |
| `scheduler.resource-cell.continued.border-top-width` | `--mx-scheduler-resource-cell-continued-border-top-width` | `` | `0px` |
| `scheduler.timeline-corner.bg` | `--mx-scheduler-timeline-corner-bg` | `color.bg.surface` | `#f8f7f3` |
| `scheduler.timeline-corner.border-end-width` | `--mx-scheduler-timeline-corner-border-end-width` | `border.width.1` | `1px` |
| `scheduler.timeline-corner.border-color` | `--mx-scheduler-timeline-corner-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `scheduler.timeline-corner-label.padding-block` | `--mx-scheduler-timeline-corner-label-padding-block` | `space.1` | `0.25rem` |
| `scheduler.timeline-corner-label.padding-inline` | `--mx-scheduler-timeline-corner-label-padding-inline` | `space.2` | `0.5rem` |
| `scheduler.timeline-corner-label.color` | `--mx-scheduler-timeline-corner-label-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.timeline-corner-label.font-size` | `--mx-scheduler-timeline-corner-label-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.scale.bg` | `--mx-scheduler-scale-bg` | `color.bg.surface` | `#f8f7f3` |
| `scheduler.scale.border-bottom-width` | `--mx-scheduler-scale-border-bottom-width` | `border.width.1` | `1px` |
| `scheduler.scale.border-color` | `--mx-scheduler-scale-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `scheduler.scale-upper.padding-block` | `--mx-scheduler-scale-upper-padding-block` | `space.1` | `0.25rem` |
| `scheduler.scale-upper.padding-inline` | `--mx-scheduler-scale-upper-padding-inline` | `space.2` | `0.5rem` |
| `scheduler.scale-upper.border-start-width` | `--mx-scheduler-scale-upper-border-start-width` | `border.width.1` | `1px` |
| `scheduler.scale-upper.border-color` | `--mx-scheduler-scale-upper-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `scheduler.scale-upper.color` | `--mx-scheduler-scale-upper-color` | `color.fg.primary` | `#1d1c1a` |
| `scheduler.scale-upper.font-size` | `--mx-scheduler-scale-upper-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.scale-upper.font-weight` | `--mx-scheduler-scale-upper-font-weight` | `font.weight.semibold` | `600` |
| `scheduler.scale-upper.today.color` | `--mx-scheduler-scale-upper-today-color` | `color.accent.fg` | `#983318` |
| `scheduler.scale-lower.padding-block` | `--mx-scheduler-scale-lower-padding-block` | `space.1` | `0.25rem` |
| `scheduler.scale-lower.padding-inline` | `--mx-scheduler-scale-lower-padding-inline` | `space.1` | `0.25rem` |
| `scheduler.scale-lower.border-top-width` | `--mx-scheduler-scale-lower-border-top-width` | `border.width.1` | `1px` |
| `scheduler.scale-lower.border-start-width` | `--mx-scheduler-scale-lower-border-start-width` | `border.width.1` | `1px` |
| `scheduler.scale-lower.border-color` | `--mx-scheduler-scale-lower-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `scheduler.scale-lower.color` | `--mx-scheduler-scale-lower-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.scale-lower.font-size` | `--mx-scheduler-scale-lower-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.scale-lower.day-start.border-start-color` | `--mx-scheduler-scale-lower-day-start-border-start-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `scheduler.scale-lower.today.color` | `--mx-scheduler-scale-lower-today-color` | `color.accent.fg` | `#983318` |
| `scheduler.agenda.padding-inline` | `--mx-scheduler-agenda-padding-inline` | `space.3` | `0.75rem` |
| `scheduler.agenda.padding-block` | `--mx-scheduler-agenda-padding-block` | `space.2` | `0.5rem` |
| `scheduler.agenda-group.padding-block` | `--mx-scheduler-agenda-group-padding-block` | `space.2` | `0.5rem` |
| `scheduler.agenda-group.gap` | `--mx-scheduler-agenda-group-gap` | `space.1` | `0.25rem` |
| `scheduler.agenda-group.border-top-width` | `--mx-scheduler-agenda-group-border-top-width` | `border.width.1` | `1px` |
| `scheduler.agenda-group.border-color` | `--mx-scheduler-agenda-group-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `scheduler.agenda-group.first.border-top-width` | `--mx-scheduler-agenda-group-first-border-top-width` | `` | `0px` |
| `scheduler.agenda-resource.padding-block` | `--mx-scheduler-agenda-resource-padding-block` | `space.1` | `0.25rem` |
| `scheduler.agenda-resource.color` | `--mx-scheduler-agenda-resource-color` | `color.fg.primary` | `#1d1c1a` |
| `scheduler.agenda-resource.font-size` | `--mx-scheduler-agenda-resource-font-size` | `font.size.body` | `0.875rem` |
| `scheduler.agenda-resource.font-weight` | `--mx-scheduler-agenda-resource-font-weight` | `font.weight.semibold` | `600` |
| `scheduler.agenda-resource.padding-inline` | `--mx-scheduler-agenda-resource-padding-inline` | `` | `initial` |
| `scheduler.agenda-day.gap` | `--mx-scheduler-agenda-day-gap` | `space.2` | `0.5rem` |
| `scheduler.agenda-day.padding-block` | `--mx-scheduler-agenda-day-padding-block` | `space.1` | `0.25rem` |
| `scheduler.agenda-day.padding-inline` | `--mx-scheduler-agenda-day-padding-inline` | `` | `initial` |
| `scheduler.agenda-weekday.color` | `--mx-scheduler-agenda-weekday-color` | `color.fg.primary` | `#1d1c1a` |
| `scheduler.agenda-weekday.font-size` | `--mx-scheduler-agenda-weekday-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.agenda-weekday.font-weight` | `--mx-scheduler-agenda-weekday-font-weight` | `font.weight.semibold` | `600` |
| `scheduler.agenda-weekday.today.color` | `--mx-scheduler-agenda-weekday-today-color` | `color.accent.fg` | `#983318` |
| `scheduler.agenda-weekday.text-transform` | `--mx-scheduler-agenda-weekday-text-transform` | `` | `initial` |
| `scheduler.agenda-month.color` | `--mx-scheduler-agenda-month-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.agenda-month.font-size` | `--mx-scheduler-agenda-month-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.agenda-row.padding-block` | `--mx-scheduler-agenda-row-padding-block` | `space.1` | `0.25rem` |
| `scheduler.agenda-row.padding-inline` | `--mx-scheduler-agenda-row-padding-inline` | `space.2` | `0.5rem` |
| `scheduler.agenda-row.radius` | `--mx-scheduler-agenda-row-radius` | `radius.sm` | `0.25rem` |
| `scheduler.agenda-row.hover.bg` | `--mx-scheduler-agenda-row-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `scheduler.agenda-row.selected.bg` | `--mx-scheduler-agenda-row-selected-bg` | `color.selection.bg` | `#f5f4f0` |
| `scheduler.agenda-row.focus.glow` | `--mx-scheduler-agenda-row-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `scheduler.agenda-row.focus.outline-width` | `--mx-scheduler-agenda-row-focus-outline-width` | `focus.ring.width` | `2px` |
| `scheduler.agenda-row.focus.outline-color` | `--mx-scheduler-agenda-row-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `scheduler.agenda-row.focus.outline-offset` | `--mx-scheduler-agenda-row-focus-outline-offset` | `` | `calc(-1 * 2px)` |
| `scheduler.agenda-row.past.color` | `--mx-scheduler-agenda-row-past-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.agenda-row.disabled.opacity` | `--mx-scheduler-agenda-row-disabled-opacity` | `opacity.disabled` | `0.5` |
| `scheduler.agenda-content.gap` | `--mx-scheduler-agenda-content-gap` | `space.2` | `0.5rem` |
| `scheduler.agenda-time.color` | `--mx-scheduler-agenda-time-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.agenda-time.font-size` | `--mx-scheduler-agenda-time-font-size` | `font.size.caption` | `0.75rem` |
| `scheduler.agenda-dot.display` | `--mx-scheduler-agenda-dot-display` | `` | `block` |
| `scheduler.agenda-dot.size` | `--mx-scheduler-agenda-dot-size` | `` | `0.625rem` |
| `scheduler.agenda-dot.radius` | `--mx-scheduler-agenda-dot-radius` | `radius.full` | `9999px` |
| `scheduler.agenda-dot.width` | `--mx-scheduler-agenda-dot-width` | `` | `initial` |
| `scheduler.agenda-dot.height` | `--mx-scheduler-agenda-dot-height` | `` | `initial` |
| `scheduler.agenda-text.color` | `--mx-scheduler-agenda-text-color` | `color.fg.primary` | `#1d1c1a` |
| `scheduler.agenda-text.font-size` | `--mx-scheduler-agenda-text-font-size` | `font.size.body` | `0.875rem` |
| `scheduler.agenda-text.font-weight` | `--mx-scheduler-agenda-text-font-weight` | `font.weight.medium` | `500` |
| `scheduler.agenda-empty.padding` | `--mx-scheduler-agenda-empty-padding` | `space.6` | `1.5rem` |
| `scheduler.agenda-empty.color` | `--mx-scheduler-agenda-empty-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.agenda-empty.font-size` | `--mx-scheduler-agenda-empty-font-size` | `font.size.body` | `0.875rem` |
| `scheduler.resize-grip.width` | `--mx-scheduler-resize-grip-width` | `` | `0.75rem` |
| `scheduler.resize-grip.height` | `--mx-scheduler-resize-grip-height` | `` | `0.75rem` |
| `scheduler.resize-grip.radius` | `--mx-scheduler-resize-grip-radius` | `radius.full` | `9999px` |
| `scheduler.resize-grip.bg` | `--mx-scheduler-resize-grip-bg` | `color.bg.surface` | `#f8f7f3` |
| `scheduler.resize-grip.border-width` | `--mx-scheduler-resize-grip-border-width` | `border.width.2` | `2px` |
| `scheduler.resize-grip.active.scale` | `--mx-scheduler-resize-grip-active-scale` | `` | `1.25` |
| `scheduler.resize-grip.shadow` | `--mx-scheduler-resize-grip-shadow` | `` | `initial` |
| `scheduler.swipe-edge.width` | `--mx-scheduler-swipe-edge-width` | `` | `2.5rem` |
| `scheduler.swipe-edge.height` | `--mx-scheduler-swipe-edge-height` | `` | `2.5rem` |
| `scheduler.swipe-edge.radius` | `--mx-scheduler-swipe-edge-radius` | `radius.full` | `9999px` |
| `scheduler.swipe-edge.bg` | `--mx-scheduler-swipe-edge-bg` | `color.bg.surface` | `#f8f7f3` |
| `scheduler.swipe-edge.color` | `--mx-scheduler-swipe-edge-color` | `color.fg.secondary` | `#5e5c55` |
| `scheduler.swipe-edge.shadow` | `--mx-scheduler-swipe-edge-shadow` | `elevation.card` | `0px 1px 2px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `scheduler.swipe-edge.ready.bg` | `--mx-scheduler-swipe-edge-ready-bg` | `color.accent.solid` | `#c24523` |
| `scheduler.swipe-edge.ready.color` | `--mx-scheduler-swipe-edge-ready-color` | `color.accent.on-solid` | `#ffffff` |
| `scheduler.swipe-edge.border-width` | `--mx-scheduler-swipe-edge-border-width` | `border.width.1` | `1px` |
| `scheduler.swipe-edge.border-color` | `--mx-scheduler-swipe-edge-border-color` | `color.stroke.card` | `rgb(0 0 0 / 0.08)` |
| `scheduler.swipe-icon.display` | `--mx-scheduler-swipe-icon-display` | `` | `block` |
| `scheduler.swipe-icon.width` | `--mx-scheduler-swipe-icon-width` | `icon.size.md` | `1rem` |
| `scheduler.swipe-icon.height` | `--mx-scheduler-swipe-icon-height` | `icon.size.md` | `1rem` |
| `scheduler.swipe-icon.icon` | `--mx-scheduler-swipe-icon-icon` | `` | `var(--mx-icon-chevron-end)` |
| `scheduler.swipe-icon.previous.icon` | `--mx-scheduler-swipe-icon-previous-icon` | `` | `var(--mx-icon-chevron-start)` |
| `scroll-view.panel-height` | `--mx-scroll-view-panel-height` | `` | `3rem` |
| `scroll-view.panel-gap` | `--mx-scroll-view-panel-gap` | `space.2` | `0.5rem` |
| `scroll-view.box.focus.glow` | `--mx-scroll-view-box-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `scroll-view.box.focus.outline-width` | `--mx-scroll-view-box-focus-outline-width` | `focus.ring.width` | `2px` |
| `scroll-view.box.focus.outline-color` | `--mx-scroll-view-box-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `scroll-view.box.focus.outline-offset` | `--mx-scroll-view-box-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `scroll-view.pull.color` | `--mx-scroll-view-pull-color` | `color.fg.secondary` | `#5e5c55` |
| `scroll-view.pull.font-size` | `--mx-scroll-view-pull-font-size` | `font.size.caption` | `0.75rem` |
| `scroll-view.pull.refreshing.color` | `--mx-scroll-view-pull-refreshing-color` | `color.fg.primary` | `#1d1c1a` |
| `scroll-view.bottom.color` | `--mx-scroll-view-bottom-color` | `color.fg.secondary` | `#5e5c55` |
| `scroll-view.bottom.font-size` | `--mx-scroll-view-bottom-font-size` | `font.size.caption` | `0.75rem` |
| `sheet.font-family` | `--mx-sheet-font-family` | `font.family.sans` | `Archivo, system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif` |
| `sheet.inset` | `--mx-sheet-inset` | `` | `0px` |
| `sheet.top-gap` | `--mx-sheet-top-gap` | `space.10` | `2.5rem` |
| `sheet.peek-height` | `--mx-sheet-peek-height` | `` | `6rem` |
| `sheet.handle-area` | `--mx-sheet-handle-area` | `space.6` | `1.5rem` |
| `sheet.close-button.variant` | `--mx-sheet-close-button-variant` | `` | `ghost` |
| `sheet.close-button.tone` | `--mx-sheet-close-button-tone` | `` | `standard` |
| `sheet.close-button.size` | `--mx-sheet-close-button-size` | `` | `sm` |
| `sheet.list-box.box.bg` | `--mx-sheet-list-box-box-bg` | `` | `rgb(0 0 0 / 0)` |
| `sheet.list-box.box.hover.bg` | `--mx-sheet-list-box-box-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `sheet.list-box.box.focus.bg` | `--mx-sheet-list-box-box-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `sheet.list-box.box.focus.shadow` | `--mx-sheet-list-box-box-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `sheet.list-box.box.shadow` | `--mx-sheet-list-box-box-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `sheet.list-box.box.invalid-hover.bg` | `--mx-sheet-list-box-box-invalid-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `sheet.list-box.box.invalid-focus.bg` | `--mx-sheet-list-box-box-invalid-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `sheet.list-box.box.invalid-focus.shadow` | `--mx-sheet-list-box-box-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `sheet.list-box.box.readonly-focus.shadow` | `--mx-sheet-list-box-box-readonly-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `sheet.list-box.box.disabled.shadow` | `--mx-sheet-list-box-box-disabled-shadow` | `` | `inset 0px 1px 2px 0px rgb(0 0 0 / 0.12)` |
| `sheet.list-box.box.readonly-invalid-focus.shadow` | `--mx-sheet-list-box-box-readonly-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `sheet.list-box.frame.display` | `--mx-sheet-list-box-frame-display` | `` | `none` |
| `sheet.list-box.indicator.display` | `--mx-sheet-list-box-indicator-display` | `` | `none` |
| `sheet.scrim.bg` | `--mx-sheet-scrim-bg` | `color.bg.smoke` | `rgb(0 0 0 / 0.3)` |
| `sheet.panel.max-width` | `--mx-sheet-panel-max-width` | `` | `40rem` |
| `sheet.panel.bg` | `--mx-sheet-panel-bg` | `color.bg.surface` | `#f8f7f3` |
| `sheet.panel.border-width` | `--mx-sheet-panel-border-width` | `border.width.1` | `1px` |
| `sheet.panel.border-bottom-width` | `--mx-sheet-panel-border-bottom-width` | `` | `0px` |
| `sheet.panel.border-color` | `--mx-sheet-panel-border-color` | `color.stroke.surface` | `rgb(117 117 117 / 0.4)` |
| `sheet.panel.radius` | `--mx-sheet-panel-radius` | `radius.xl` | `0.875rem` |
| `sheet.panel.radius-bottom` | `--mx-sheet-panel-radius-bottom` | `` | `0px` |
| `sheet.panel.shadow` | `--mx-sheet-panel-shadow` | `elevation.dialog` | `0px 32px 64px 0px rgb(0 0 0 / 0.24), 0px 0px 8px 0px rgb(0 0 0 / 0.2)` |
| `sheet.panel.color` | `--mx-sheet-panel-color` | `color.fg.primary` | `#1d1c1a` |
| `sheet.panel.font-size` | `--mx-sheet-panel-font-size` | `font.size.body` | `0.875rem` |
| `sheet.panel.line-height` | `--mx-sheet-panel-line-height` | `font.line.body` | `1.25rem` |
| `sheet.panel.full.radius-top` | `--mx-sheet-panel-full-radius-top` | `` | `0px` |
| `sheet.handle.radius` | `--mx-sheet-handle-radius` | `radius.md` | `0.375rem` |
| `sheet.handle.focus.glow` | `--mx-sheet-handle-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `sheet.handle.focus.outline-width` | `--mx-sheet-handle-focus-outline-width` | `focus.ring.width` | `2px` |
| `sheet.handle.focus.outline-color` | `--mx-sheet-handle-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `sheet.handle.focus.outline-offset` | `--mx-sheet-handle-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `sheet.grip.width` | `--mx-sheet-grip-width` | `` | `2rem` |
| `sheet.grip.height` | `--mx-sheet-grip-height` | `space.1` | `0.25rem` |
| `sheet.grip.bg` | `--mx-sheet-grip-bg` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `sheet.grip.radius` | `--mx-sheet-grip-radius` | `radius.full` | `9999px` |
| `sheet.header.padding-block` | `--mx-sheet-header-padding-block` | `space.2` | `0.5rem` |
| `sheet.header.padding-inline` | `--mx-sheet-header-padding-inline` | `space.4` | `1rem` |
| `sheet.header.gap` | `--mx-sheet-header-gap` | `space.2` | `0.5rem` |
| `sheet.title.font-size` | `--mx-sheet-title-font-size` | `font.size.subtitle` | `1.25rem` |
| `sheet.title.font-weight` | `--mx-sheet-title-font-weight` | `font.weight.semibold` | `600` |
| `sheet.title.line-height` | `--mx-sheet-title-line-height` | `font.line.subtitle` | `1.75rem` |
| `sheet.body.padding` | `--mx-sheet-body-padding` | `space.4` | `1rem` |
| `sheet.body.focus.outline-width` | `--mx-sheet-body-focus-outline-width` | `focus.ring.width` | `2px` |
| `sheet.body.focus.outline-color` | `--mx-sheet-body-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `sheet.body.focus.outline-offset` | `--mx-sheet-body-focus-outline-offset` | `` | `calc(2px * -1)` |
| `sheet.footer.padding` | `--mx-sheet-footer-padding` | `space.3` | `0.75rem` |
| `sheet.footer.gap` | `--mx-sheet-footer-gap` | `space.2` | `0.5rem` |
| `sheet.footer.border-top-width` | `--mx-sheet-footer-border-top-width` | `border.width.1` | `1px` |
| `sheet.footer.border-top-color` | `--mx-sheet-footer-border-top-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `signature.width` | `--mx-signature-width` | `` | `420px` |
| `signature.height` | `--mx-signature-height` | `` | `160px` |
| `signature.guide-inset` | `--mx-signature-guide-inset` | `space.6` | `1.5rem` |
| `signature.actions-inset` | `--mx-signature-actions-inset` | `space.1` | `0.25rem` |
| `signature.field.label-mode` | `--mx-signature-field-label-mode` | `` | `top` |
| `signature.field.variant` | `--mx-signature-field-variant` | `` | `outline` |
| `signature.field.padding.sm` | `--mx-signature-field-padding-sm` | `` | `0px` |
| `signature.field.padding.md` | `--mx-signature-field-padding-md` | `` | `0px` |
| `signature.field.padding.lg` | `--mx-signature-field-padding-lg` | `` | `0px` |
| `signature.field.border-width` | `--mx-signature-field-border-width` | `` | `0px` |
| `signature.field.padding-start.sm` | `--mx-signature-field-padding-start-sm` | `` | `0px` |
| `signature.field.padding-start.md` | `--mx-signature-field-padding-start-md` | `` | `0px` |
| `signature.field.padding-start.lg` | `--mx-signature-field-padding-start-lg` | `` | `0px` |
| `signature.field.padding-end.sm` | `--mx-signature-field-padding-end-sm` | `` | `0px` |
| `signature.field.padding-end.md` | `--mx-signature-field-padding-end-md` | `` | `0px` |
| `signature.field.padding-end.lg` | `--mx-signature-field-padding-end-lg` | `` | `0px` |
| `signature.field.box.bg` | `--mx-signature-field-box-bg` | `` | `rgb(0 0 0 / 0)` |
| `signature.field.box.hover.bg` | `--mx-signature-field-box-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `signature.field.box.focus.bg` | `--mx-signature-field-box-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `signature.field.box.focus.shadow` | `--mx-signature-field-box-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `signature.field.box.radius` | `--mx-signature-field-box-radius` | `` | `0px` |
| `signature.field.box.shadow` | `--mx-signature-field-box-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `signature.field.box.cursor` | `--mx-signature-field-box-cursor` | `` | `default` |
| `signature.field.box.disabled.bg` | `--mx-signature-field-box-disabled-bg` | `` | `rgb(0 0 0 / 0)` |
| `signature.field.box.disabled.shadow` | `--mx-signature-field-box-disabled-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `signature.field.box.invalid-hover.bg` | `--mx-signature-field-box-invalid-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `signature.field.box.invalid-focus.bg` | `--mx-signature-field-box-invalid-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `signature.field.box.invalid-focus.shadow` | `--mx-signature-field-box-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `signature.field.box.readonly-focus.shadow` | `--mx-signature-field-box-readonly-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `signature.field.box.readonly-invalid-focus.shadow` | `--mx-signature-field-box-readonly-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `signature.field.frame.display` | `--mx-signature-field-frame-display` | `` | `none` |
| `signature.field.indicator.display` | `--mx-signature-field-indicator-display` | `` | `none` |
| `signature.pad.bg` | `--mx-signature-pad-bg` | `color.bg.card` | `#f5f4f0` |
| `signature.pad.color` | `--mx-signature-pad-color` | `color.fg.primary` | `#1d1c1a` |
| `signature.pad.radius` | `--mx-signature-pad-radius` | `radius.lg` | `0.625rem` |
| `signature.pad.border-width` | `--mx-signature-pad-border-width` | `` | `1px` |
| `signature.pad.border-color` | `--mx-signature-pad-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `signature.pad.cursor` | `--mx-signature-pad-cursor` | `` | `crosshair` |
| `signature.pad.border-bottom-width` | `--mx-signature-pad-border-bottom-width` | `control.edge.width` | `2px` |
| `signature.pad.border-bottom-color` | `--mx-signature-pad-border-bottom-color` | `color.stroke.control.edge` | `rgb(0 0 0 / 0.3)` |
| `signature.pad.focus.glow` | `--mx-signature-pad-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `signature.pad.focus.outline-width` | `--mx-signature-pad-focus-outline-width` | `focus.ring.width` | `2px` |
| `signature.pad.focus.outline-color` | `--mx-signature-pad-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `signature.pad.focus.outline-offset` | `--mx-signature-pad-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `signature.pad.invalid.border-color` | `--mx-signature-pad-invalid-border-color` | `color.danger.solid` | `#b03659` |
| `signature.pad.readonly.cursor` | `--mx-signature-pad-readonly-cursor` | `` | `default` |
| `signature.pad.disabled.bg` | `--mx-signature-pad-disabled-bg` | `color.fill.control.disabled` | `#ebeae5` |
| `signature.pad.disabled.cursor` | `--mx-signature-pad-disabled-cursor` | `` | `default` |
| `signature.pad.disabled.color` | `--mx-signature-pad-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `signature.guide.border-top-width` | `--mx-signature-guide-border-top-width` | `` | `1px` |
| `signature.guide.border-color` | `--mx-signature-guide-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `signature.placeholder.color` | `--mx-signature-placeholder-color` | `color.fg.secondary` | `#5e5c55` |
| `signature.placeholder.font-size` | `--mx-signature-placeholder-font-size` | `font.size.body` | `0.875rem` |
| `skeleton.animation` | `--mx-skeleton-animation` | `` | `wave` |
| `skeleton.duration` | `--mx-skeleton-duration` | `` | `calc(250ms * 6)` |
| `skeleton.easing` | `--mx-skeleton-easing` | `motion.easing.standard` | `cubic-bezier(0.33, 0, 0.67, 1)` |
| `skeleton.wave-mix` | `--mx-skeleton-wave-mix` | `` | `8%` |
| `skeleton.pulse-dim` | `--mx-skeleton-pulse-dim` | `` | `0.55` |
| `skeleton.line-height` | `--mx-skeleton-line-height` | `` | `0.75rem` |
| `skeleton.line-gap` | `--mx-skeleton-line-gap` | `` | `0.625rem` |
| `skeleton.last-line` | `--mx-skeleton-last-line` | `` | `60%` |
| `skeleton.circle-size` | `--mx-skeleton-circle-size` | `` | `2.5rem` |
| `skeleton.rect-height` | `--mx-skeleton-rect-height` | `` | `6rem` |
| `skeleton.bone.bg` | `--mx-skeleton-bone-bg` | `color.fill.neutral` | `#ebeae5` |
| `skeleton.bone.color` | `--mx-skeleton-bone-color` | `color.fg.primary` | `#1d1c1a` |
| `skeleton.bone.text.radius` | `--mx-skeleton-bone-text-radius` | `radius.xs` | `0.25rem` |
| `skeleton.bone.rect.radius` | `--mx-skeleton-bone-rect-radius` | `radius.md` | `0.375rem` |
| `skeleton.bone.circle.radius` | `--mx-skeleton-bone-circle-radius` | `radius.full` | `9999px` |
| `slider.hit-size` | `--mx-slider-hit-size` | `control.height.lg` | `2.5rem` |
| `slider.vertical-length` | `--mx-slider-vertical-length` | `` | `10rem` |
| `slider.track-gap` | `--mx-slider-track-gap` | `` | `0px` |
| `slider.origin-gap` | `--mx-slider-origin-gap` | `` | `0px` |
| `slider.stop-inset` | `--mx-slider-stop-inset` | `` | `0px` |
| `slider.tick-length` | `--mx-slider-tick-length` | `` | `0.375rem` |
| `slider.tick-width` | `--mx-slider-tick-width` | `border.width.1` | `1px` |
| `slider.tick-offset` | `--mx-slider-tick-offset` | `` | `0px` |
| `slider.tick-gap` | `--mx-slider-tick-gap` | `space.1` | `0.25rem` |
| `slider.tick-label-width` | `--mx-slider-tick-label-width` | `` | `3rem` |
| `slider.tick-label-room` | `--mx-slider-tick-label-room` | `` | `0px` |
| `slider.tick-line-height` | `--mx-slider-tick-line-height` | `font.line.caption` | `1rem` |
| `slider.bubble-gap` | `--mx-slider-bubble-gap` | `space.2` | `0.5rem` |
| `slider.bubble-arrow-size` | `--mx-slider-bubble-arrow-size` | `` | `0px` |
| `slider.track-thickness.sm` | `--mx-slider-track-thickness-sm` | `` | `0.1875rem` |
| `slider.track-thickness.md` | `--mx-slider-track-thickness-md` | `` | `0.25rem` |
| `slider.track-thickness.lg` | `--mx-slider-track-thickness-lg` | `` | `0.375rem` |
| `slider.active-thickness.sm` | `--mx-slider-active-thickness-sm` | `` | `0.1875rem` |
| `slider.active-thickness.md` | `--mx-slider-active-thickness-md` | `` | `0.25rem` |
| `slider.active-thickness.lg` | `--mx-slider-active-thickness-lg` | `` | `0.375rem` |
| `slider.thumb-width.sm` | `--mx-slider-thumb-width-sm` | `` | `1rem` |
| `slider.thumb-width.md` | `--mx-slider-thumb-width-md` | `` | `1.25rem` |
| `slider.thumb-width.lg` | `--mx-slider-thumb-width-lg` | `` | `1.5rem` |
| `slider.thumb-height.sm` | `--mx-slider-thumb-height-sm` | `` | `1rem` |
| `slider.thumb-height.md` | `--mx-slider-thumb-height-md` | `` | `1.25rem` |
| `slider.thumb-height.lg` | `--mx-slider-thumb-height-lg` | `` | `1.5rem` |
| `slider.thumb-core-size.sm` | `--mx-slider-thumb-core-size-sm` | `` | `0.375rem` |
| `slider.thumb-core-size.md` | `--mx-slider-thumb-core-size-md` | `` | `0.5rem` |
| `slider.thumb-core-size.lg` | `--mx-slider-thumb-core-size-lg` | `` | `0.625rem` |
| `slider.field.label-mode` | `--mx-slider-field-label-mode` | `` | `top` |
| `slider.field.variant` | `--mx-slider-field-variant` | `` | `outline` |
| `slider.field.padding.sm` | `--mx-slider-field-padding-sm` | `` | `0px` |
| `slider.field.padding.md` | `--mx-slider-field-padding-md` | `` | `0px` |
| `slider.field.padding.lg` | `--mx-slider-field-padding-lg` | `` | `0px` |
| `slider.field.border-width` | `--mx-slider-field-border-width` | `` | `0px` |
| `slider.field.padding-start.sm` | `--mx-slider-field-padding-start-sm` | `` | `0px` |
| `slider.field.padding-start.md` | `--mx-slider-field-padding-start-md` | `` | `0px` |
| `slider.field.padding-start.lg` | `--mx-slider-field-padding-start-lg` | `` | `0px` |
| `slider.field.padding-end.sm` | `--mx-slider-field-padding-end-sm` | `` | `0px` |
| `slider.field.padding-end.md` | `--mx-slider-field-padding-end-md` | `` | `0px` |
| `slider.field.padding-end.lg` | `--mx-slider-field-padding-end-lg` | `` | `0px` |
| `slider.field.box.bg` | `--mx-slider-field-box-bg` | `` | `rgb(0 0 0 / 0)` |
| `slider.field.box.hover.bg` | `--mx-slider-field-box-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `slider.field.box.focus.bg` | `--mx-slider-field-box-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `slider.field.box.focus.shadow` | `--mx-slider-field-box-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `slider.field.box.radius` | `--mx-slider-field-box-radius` | `` | `0px` |
| `slider.field.box.shadow` | `--mx-slider-field-box-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `slider.field.box.cursor` | `--mx-slider-field-box-cursor` | `` | `default` |
| `slider.field.box.disabled.bg` | `--mx-slider-field-box-disabled-bg` | `` | `rgb(0 0 0 / 0)` |
| `slider.field.box.disabled.shadow` | `--mx-slider-field-box-disabled-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `slider.field.box.invalid-hover.bg` | `--mx-slider-field-box-invalid-hover-bg` | `` | `rgb(0 0 0 / 0)` |
| `slider.field.box.invalid-focus.bg` | `--mx-slider-field-box-invalid-focus-bg` | `` | `rgb(0 0 0 / 0)` |
| `slider.field.box.invalid-focus.shadow` | `--mx-slider-field-box-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `slider.field.box.readonly-focus.shadow` | `--mx-slider-field-box-readonly-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `slider.field.box.readonly-invalid-focus.shadow` | `--mx-slider-field-box-readonly-invalid-focus-shadow` | `` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `slider.field.frame.display` | `--mx-slider-field-frame-display` | `` | `none` |
| `slider.field.indicator.display` | `--mx-slider-field-indicator-display` | `` | `none` |
| `slider.track.bg` | `--mx-slider-track-bg` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `slider.track.radius` | `--mx-slider-track-radius` | `radius.full` | `9999px` |
| `slider.track.disabled.bg` | `--mx-slider-track-disabled-bg` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `slider.track.before.radius-end` | `--mx-slider-track-before-radius-end` | `radius.full` | `9999px` |
| `slider.track.after.radius-start` | `--mx-slider-track-after-radius-start` | `radius.full` | `9999px` |
| `slider.active.bg` | `--mx-slider-active-bg` | `color.accent.solid` | `#c24523` |
| `slider.active.radius` | `--mx-slider-active-radius` | `radius.full` | `9999px` |
| `slider.active.from-start.radius-start` | `--mx-slider-active-from-start-radius-start` | `radius.full` | `9999px` |
| `slider.active.to-end.radius-end` | `--mx-slider-active-to-end-radius-end` | `radius.full` | `9999px` |
| `slider.active.readonly.bg` | `--mx-slider-active-readonly-bg` | `color.fg.secondary` | `#5e5c55` |
| `slider.active.disabled.bg` | `--mx-slider-active-disabled-bg` | `color.fg.disabled` | `#a2a098` |
| `slider.knob.bg` | `--mx-slider-knob-bg` | `color.fill.control.default` | `#f5f4f0` |
| `slider.knob.border-width` | `--mx-slider-knob-border-width` | `border.width.1` | `1px` |
| `slider.knob.border-color` | `--mx-slider-knob-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `slider.knob.border-bottom-width` | `--mx-slider-knob-border-bottom-width` | `control.edge.width` | `2px` |
| `slider.knob.border-bottom-color` | `--mx-slider-knob-border-bottom-color` | `color.stroke.control.edge` | `rgb(0 0 0 / 0.3)` |
| `slider.knob.radius` | `--mx-slider-knob-radius` | `radius.full` | `9999px` |
| `slider.knob.shadow` | `--mx-slider-knob-shadow` | `effect.control` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7)` |
| `slider.knob.focus.outline-width` | `--mx-slider-knob-focus-outline-width` | `focus.ring.width` | `2px` |
| `slider.knob.focus.outline-color` | `--mx-slider-knob-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `slider.knob.focus.outline-offset` | `--mx-slider-knob-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `slider.knob.focus.glow` | `--mx-slider-knob-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `slider.knob.focus.width` | `--mx-slider-knob-focus-width` | `` | `initial` |
| `slider.knob.disabled.bg` | `--mx-slider-knob-disabled-bg` | `color.fill.control.disabled` | `#ebeae5` |
| `slider.knob.disabled.border-color` | `--mx-slider-knob-disabled-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `slider.knob.disabled.shadow` | `--mx-slider-knob-disabled-shadow` | `` | `0 0 #0000` |
| `slider.knob.pressed.width` | `--mx-slider-knob-pressed-width` | `` | `initial` |
| `slider.core.bg` | `--mx-slider-core-bg` | `color.accent.solid` | `#c24523` |
| `slider.core.radius` | `--mx-slider-core-radius` | `radius.full` | `9999px` |
| `slider.core.hover.scale` | `--mx-slider-core-hover-scale` | `` | `1.25` |
| `slider.core.pressed.scale` | `--mx-slider-core-pressed-scale` | `` | `0.85` |
| `slider.core.readonly.bg` | `--mx-slider-core-readonly-bg` | `color.fg.secondary` | `#5e5c55` |
| `slider.core.disabled.bg` | `--mx-slider-core-disabled-bg` | `color.fg.disabled` | `#a2a098` |
| `slider.core.display` | `--mx-slider-core-display` | `` | `initial` |
| `slider.bubble.padding-block` | `--mx-slider-bubble-padding-block` | `space.1` | `0.25rem` |
| `slider.bubble.padding-inline` | `--mx-slider-bubble-padding-inline` | `space.2` | `0.5rem` |
| `slider.bubble.font-size` | `--mx-slider-bubble-font-size` | `font.size.caption` | `0.75rem` |
| `slider.bubble.line-height` | `--mx-slider-bubble-line-height` | `font.line.caption` | `1rem` |
| `slider.bubble.color` | `--mx-slider-bubble-color` | `color.accent.on-solid` | `#ffffff` |
| `slider.bubble.bg` | `--mx-slider-bubble-bg` | `color.accent.solid` | `#c24523` |
| `slider.bubble.border-width` | `--mx-slider-bubble-border-width` | `` | `0px` |
| `slider.bubble.border-color` | `--mx-slider-bubble-border-color` | `` | `rgb(0 0 0 / 0)` |
| `slider.bubble.radius` | `--mx-slider-bubble-radius` | `radius.sm` | `0.25rem` |
| `slider.bubble.shadow` | `--mx-slider-bubble-shadow` | `shadow.4` | `0px 2px 4px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `slider.tick.bg` | `--mx-slider-tick-bg` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `slider.tick.radius` | `--mx-slider-tick-radius` | `` | `0px` |
| `slider.tick.active.bg` | `--mx-slider-tick-active-bg` | `` | `initial` |
| `slider.tick.first.display` | `--mx-slider-tick-first-display` | `` | `initial` |
| `slider.tick.last.display` | `--mx-slider-tick-last-display` | `` | `initial` |
| `slider.tick-label.color` | `--mx-slider-tick-label-color` | `color.fg.secondary` | `#5e5c55` |
| `slider.tick-label.font-size` | `--mx-slider-tick-label-font-size` | `font.size.caption` | `0.75rem` |
| `slider.tick-label.disabled.color` | `--mx-slider-tick-label-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `slider.stop.display` | `--mx-slider-stop-display` | `` | `initial` |
| `slider.stop.size` | `--mx-slider-stop-size` | `` | `initial` |
| `slider.stop.radius` | `--mx-slider-stop-radius` | `` | `initial` |
| `slider.stop.bg` | `--mx-slider-stop-bg` | `` | `initial` |
| `slider.stop.active.bg` | `--mx-slider-stop-active-bg` | `` | `initial` |
| `sortable.gap` | `--mx-sortable-gap` | `space.1` | `0.25rem` |
| `sortable.container.target.bg` | `--mx-sortable-container-target-bg` | `color.accent.subtle` | `#fbe6de` |
| `sortable.item.sortable.cursor` | `--mx-sortable-item-sortable-cursor` | `` | `grab` |
| `sortable.item.dragging.opacity` | `--mx-sortable-item-dragging-opacity` | `` | `0.4` |
| `sortable.item.focus.glow` | `--mx-sortable-item-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `sortable.item.focus.outline-width` | `--mx-sortable-item-focus-outline-width` | `focus.ring.width` | `2px` |
| `sortable.item.focus.outline-color` | `--mx-sortable-item-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `sortable.item.focus.outline-offset` | `--mx-sortable-item-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `sortable.line.height` | `--mx-sortable-line-height` | `` | `2px` |
| `sortable.line.radius` | `--mx-sortable-line-radius` | `radius.full` | `9999px` |
| `sortable.line.bg` | `--mx-sortable-line-bg` | `color.accent.solid` | `#c24523` |
| `sortable.ghost.radius` | `--mx-sortable-ghost-radius` | `radius.md` | `0.375rem` |
| `sortable.ghost.shadow` | `--mx-sortable-ghost-shadow` | `elevation.popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `sortable.ghost.opacity` | `--mx-sortable-ghost-opacity` | `` | `0.9` |
| `speed-dial.inset` | `--mx-speed-dial-inset` | `space.6` | `1.5rem` |
| `speed-dial.gap` | `--mx-speed-dial-gap` | `space.3` | `0.75rem` |
| `speed-dial.label-gap` | `--mx-speed-dial-label-gap` | `space.3` | `0.75rem` |
| `speed-dial.main.size` | `--mx-speed-dial-main-size` | `` | `3rem` |
| `speed-dial.main.radius` | `--mx-speed-dial-main-radius` | `radius.full` | `9999px` |
| `speed-dial.main.bg` | `--mx-speed-dial-main-bg` | `color.accent.solid` | `#c24523` |
| `speed-dial.main.color` | `--mx-speed-dial-main-color` | `color.accent.on-solid` | `#ffffff` |
| `speed-dial.main.shadow` | `--mx-speed-dial-main-shadow` | `shadow.4` | `0px 2px 4px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `speed-dial.main.gap` | `--mx-speed-dial-main-gap` | `space.2` | `0.5rem` |
| `speed-dial.main.hover.bg` | `--mx-speed-dial-main-hover-bg` | `color.accent.solid-hover` | `#b43f20` |
| `speed-dial.main.hover.cursor` | `--mx-speed-dial-main-hover-cursor` | `` | `pointer` |
| `speed-dial.main.pressed.bg` | `--mx-speed-dial-main-pressed-bg` | `color.accent.solid-hover` | `#b43f20` |
| `speed-dial.main.focus.glow` | `--mx-speed-dial-main-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `speed-dial.main.focus.outline-width` | `--mx-speed-dial-main-focus-outline-width` | `focus.ring.width` | `2px` |
| `speed-dial.main.focus.outline-color` | `--mx-speed-dial-main-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `speed-dial.main.focus.outline-offset` | `--mx-speed-dial-main-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `speed-dial.main.disabled.opacity` | `--mx-speed-dial-main-disabled-opacity` | `opacity.disabled` | `0.5` |
| `speed-dial.main.extended.width` | `--mx-speed-dial-main-extended-width` | `` | `auto` |
| `speed-dial.main.extended.padding` | `--mx-speed-dial-main-extended-padding` | `space.4` | `1rem` |
| `speed-dial.main-glyph.size` | `--mx-speed-dial-main-glyph-size` | `` | `1.25rem` |
| `speed-dial.main-glyph.bg` | `--mx-speed-dial-main-glyph-bg` | `color.accent.on-solid` | `#ffffff` |
| `speed-dial.main-text.font-weight` | `--mx-speed-dial-main-text-font-weight` | `font.weight.semibold` | `600` |
| `speed-dial.action.size` | `--mx-speed-dial-action-size` | `` | `2.625rem` |
| `speed-dial.action.radius` | `--mx-speed-dial-action-radius` | `radius.full` | `9999px` |
| `speed-dial.action.bg` | `--mx-speed-dial-action-bg` | `color.fill.control.default` | `#f5f4f0` |
| `speed-dial.action.color` | `--mx-speed-dial-action-color` | `color.fg.primary` | `#1d1c1a` |
| `speed-dial.action.hover.bg` | `--mx-speed-dial-action-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `speed-dial.action.hover.cursor` | `--mx-speed-dial-action-hover-cursor` | `` | `pointer` |
| `speed-dial.action.pressed.bg` | `--mx-speed-dial-action-pressed-bg` | `color.fill.control.tertiary` | `#e1e0da` |
| `speed-dial.action.focus.glow` | `--mx-speed-dial-action-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `speed-dial.action.focus.outline-width` | `--mx-speed-dial-action-focus-outline-width` | `focus.ring.width` | `2px` |
| `speed-dial.action.focus.outline-color` | `--mx-speed-dial-action-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `speed-dial.action.focus.outline-offset` | `--mx-speed-dial-action-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `speed-dial.action.disabled.opacity` | `--mx-speed-dial-action-disabled-opacity` | `opacity.disabled` | `0.5` |
| `speed-dial.action.border-width` | `--mx-speed-dial-action-border-width` | `border.width.1` | `1px` |
| `speed-dial.action.border-color` | `--mx-speed-dial-action-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `speed-dial.action.shadow` | `--mx-speed-dial-action-shadow` | `` | `initial` |
| `speed-dial.action-icon.size` | `--mx-speed-dial-action-icon-size` | `` | `1.25rem` |
| `speed-dial.action-icon.bg` | `--mx-speed-dial-action-icon-bg` | `color.fg.primary` | `#1d1c1a` |
| `speed-dial.label.bg` | `--mx-speed-dial-label-bg` | `color.bg.glass` | `rgb(248 247 243 / 0.78)` |
| `speed-dial.label.color` | `--mx-speed-dial-label-color` | `color.fg.primary` | `#1d1c1a` |
| `speed-dial.label.radius` | `--mx-speed-dial-label-radius` | `radius.sm` | `0.25rem` |
| `speed-dial.label.padding` | `--mx-speed-dial-label-padding` | `space.2` | `0.5rem` |
| `speed-dial.label.font-size` | `--mx-speed-dial-label-font-size` | `font.size.caption` | `0.75rem` |
| `speed-dial.label.shadow` | `--mx-speed-dial-label-shadow` | `elevation.card` | `0px 1px 2px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `speed-dial.label.border-width` | `--mx-speed-dial-label-border-width` | `border.width.1` | `1px` |
| `speed-dial.label.border-color` | `--mx-speed-dial-label-border-color` | `color.stroke.card` | `rgb(0 0 0 / 0.08)` |
| `spinner.gap` | `--mx-spinner-gap` | `space.2` | `0.5rem` |
| `spinner.cover-padding` | `--mx-spinner-cover-padding` | `space.4` | `1rem` |
| `spinner.cover-background` | `--mx-spinner-cover-background` | `color.bg.glass` | `rgb(248 247 243 / 0.78)` |
| `spinner.size.sm` | `--mx-spinner-size-sm` | `icon.size.md` | `1rem` |
| `spinner.size.md` | `--mx-spinner-size-md` | `` | `1.5rem` |
| `spinner.size.lg` | `--mx-spinner-size-lg` | `` | `2.5rem` |
| `spinner.ring-width.sm` | `--mx-spinner-ring-width-sm` | `border.width.2` | `2px` |
| `spinner.ring-width.md` | `--mx-spinner-ring-width-md` | `` | `0.1875rem` |
| `spinner.ring-width.lg` | `--mx-spinner-ring-width-lg` | `` | `0.25rem` |
| `spinner.ring-style` | `--mx-spinner-ring-style` | `` | `solid` |
| `spinner.duration` | `--mx-spinner-duration` | `` | `calc(250ms * 3)` |
| `spinner.fg` | `--mx-spinner-fg` | `color.fg.secondary` | `#5e5c55` |
| `spinner.track-color` | `--mx-spinner-track-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `spinner.accent` | `--mx-spinner-accent` | `color.accent.solid` | `#c24523` |
| `spinner.neutral` | `--mx-spinner-neutral` | `color.fg.secondary` | `#5e5c55` |
| `spinner.success` | `--mx-spinner-success` | `color.success.fg` | `#006402` |
| `spinner.caution` | `--mx-spinner-caution` | `color.caution.fg` | `#754702` |
| `spinner.danger` | `--mx-spinner-danger` | `color.danger.solid` | `#b03659` |
| `spinner.radius` | `--mx-spinner-radius` | `radius.full` | `9999px` |
| `spinner.cover-fg` | `--mx-spinner-cover-fg` | `color.fg.primary` | `#1d1c1a` |
| `spinner.focus-width` | `--mx-spinner-focus-width` | `focus.ring.width` | `2px` |
| `spinner.focus-offset` | `--mx-spinner-focus-offset` | `` | `calc(2px * -1)` |
| `spinner.focus-color` | `--mx-spinner-focus-color` | `focus.ring.color` | `#1d1c1a` |
| `spinner.focus-halo` | `--mx-spinner-focus-halo` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `spinner.shape-size.sm` | `--mx-spinner-shape-size-sm` | `icon.size.md` | `1rem` |
| `spinner.shape-size.md` | `--mx-spinner-shape-size-md` | `` | `1.5rem` |
| `spinner.shape-size.lg` | `--mx-spinner-shape-size-lg` | `` | `2.5rem` |
| `spinner.shape-1` | `--mx-spinner-shape-1` | `` | `var(--mx-shape-soft-burst)` |
| `spinner.shape-2` | `--mx-spinner-shape-2` | `` | `var(--mx-shape-cookie-9)` |
| `spinner.shape-3` | `--mx-spinner-shape-3` | `` | `var(--mx-shape-pentagon)` |
| `spinner.shape-4` | `--mx-spinner-shape-4` | `` | `var(--mx-shape-pill)` |
| `spinner.shape-5` | `--mx-spinner-shape-5` | `` | `var(--mx-shape-sunny)` |
| `spinner.shape-6` | `--mx-spinner-shape-6` | `` | `var(--mx-shape-cookie-4)` |
| `spinner.shape-7` | `--mx-spinner-shape-7` | `` | `var(--mx-shape-oval)` |
| `spinner.morph-duration` | `--mx-spinner-morph-duration` | `` | `calc(250ms * 15)` |
| `spinner.morph-easing` | `--mx-spinner-morph-easing` | `` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `spinner.spin-duration` | `--mx-spinner-spin-duration` | `` | `calc(250ms * 9)` |
| `spinner.box.contained.bg` | `--mx-spinner-box-contained-bg` | `` | `initial` |
| `spinner.box.contained.radius` | `--mx-spinner-box-contained-radius` | `` | `initial` |
| `spinner.box.contained.padding` | `--mx-spinner-box-contained-padding` | `` | `initial` |
| `spinner.ring.display` | `--mx-spinner-ring-display` | `` | `initial` |
| `spinner.shape.display` | `--mx-spinner-shape-display` | `` | `initial` |
| `spinner.shape.contained.bg` | `--mx-spinner-shape-contained-bg` | `` | `initial` |
| `spinner.shape.contained.scale` | `--mx-spinner-shape-contained-scale` | `` | `initial` |
| `splitter.size` | `--mx-splitter-size` | `space.2` | `0.5rem` |
| `splitter.line-width` | `--mx-splitter-line-width` | `border.width.1` | `1px` |
| `splitter.active-width` | `--mx-splitter-active-width` | `border.width.2` | `2px` |
| `splitter.grip-length` | `--mx-splitter-grip-length` | `space.6` | `1.5rem` |
| `splitter.grip-thickness` | `--mx-splitter-grip-thickness` | `space.1` | `0.25rem` |
| `splitter.handle.focus.glow` | `--mx-splitter-handle-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `splitter.handle.focus.outline-width` | `--mx-splitter-handle-focus-outline-width` | `focus.ring.width` | `2px` |
| `splitter.handle.focus.outline-color` | `--mx-splitter-handle-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `splitter.handle.focus.outline-offset` | `--mx-splitter-handle-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `splitter.line.bg` | `--mx-splitter-line-bg` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `splitter.line.active.bg` | `--mx-splitter-line-active-bg` | `color.accent.solid` | `#c24523` |
| `splitter.grip.bg` | `--mx-splitter-grip-bg` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `splitter.grip.radius` | `--mx-splitter-grip-radius` | `radius.full` | `9999px` |
| `splitter.grip.active.bg` | `--mx-splitter-grip-active-bg` | `color.accent.solid` | `#c24523` |
| `splitter.grip.disabled.bg` | `--mx-splitter-grip-disabled-bg` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `splitter.fold.size` | `--mx-splitter-fold-size` | `` | `1rem` |
| `splitter.fold.radius` | `--mx-splitter-fold-radius` | `radius.sm` | `0.25rem` |
| `splitter.fold.hover.bg` | `--mx-splitter-fold-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `splitter.fold.hover.cursor` | `--mx-splitter-fold-hover-cursor` | `` | `pointer` |
| `splitter.fold.pressed.bg` | `--mx-splitter-fold-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `splitter.fold.focus.glow` | `--mx-splitter-fold-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `splitter.fold.focus.outline-width` | `--mx-splitter-fold-focus-outline-width` | `focus.ring.width` | `2px` |
| `splitter.fold.focus.outline-color` | `--mx-splitter-fold-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `splitter.fold.focus.outline-offset` | `--mx-splitter-fold-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `splitter.fold-glyph.size` | `--mx-splitter-fold-glyph-size` | `` | `0.625rem` |
| `splitter.fold-glyph.bg` | `--mx-splitter-fold-glyph-bg` | `color.fg.secondary` | `#5e5c55` |
| `stepper.font-size.sm` | `--mx-stepper-font-size-sm` | `font.size.caption` | `0.75rem` |
| `stepper.font-size.md` | `--mx-stepper-font-size-md` | `font.size.body` | `0.875rem` |
| `stepper.font-size.lg` | `--mx-stepper-font-size-lg` | `` | `1rem` |
| `stepper.description-font-size` | `--mx-stepper-description-font-size` | `font.size.caption` | `0.75rem` |
| `stepper.gap` | `--mx-stepper-gap` | `space.2` | `0.5rem` |
| `stepper.line-gap` | `--mx-stepper-line-gap` | `space.2` | `0.5rem` |
| `stepper.line-min-length` | `--mx-stepper-line-min-length` | `` | `1rem` |
| `stepper.size.sm` | `--mx-stepper-size-sm` | `` | `1.5rem` |
| `stepper.size.md` | `--mx-stepper-size-md` | `` | `1.75rem` |
| `stepper.size.lg` | `--mx-stepper-size-lg` | `` | `2.25rem` |
| `stepper.padding.sm` | `--mx-stepper-padding-sm` | `` | `0.25rem` |
| `stepper.padding.md` | `--mx-stepper-padding-md` | `` | `0.375rem` |
| `stepper.padding.lg` | `--mx-stepper-padding-lg` | `` | `0.5rem` |
| `stepper.step.radius` | `--mx-stepper-step-radius` | `radius.sm` | `0.25rem` |
| `stepper.step.color` | `--mx-stepper-step-color` | `color.fg.secondary` | `#5e5c55` |
| `stepper.step.hover.bg` | `--mx-stepper-step-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `stepper.step.hover.cursor` | `--mx-stepper-step-hover-cursor` | `` | `pointer` |
| `stepper.step.pressed.bg` | `--mx-stepper-step-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `stepper.step.focus.glow` | `--mx-stepper-step-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `stepper.step.focus.outline-width` | `--mx-stepper-step-focus-outline-width` | `focus.ring.width` | `2px` |
| `stepper.step.focus.outline-color` | `--mx-stepper-step-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `stepper.step.focus.outline-offset` | `--mx-stepper-step-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `stepper.step.disabled.color` | `--mx-stepper-step-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `stepper.step.current.color` | `--mx-stepper-step-current-color` | `color.fg.primary` | `#1d1c1a` |
| `stepper.step.done.color` | `--mx-stepper-step-done-color` | `color.fg.primary` | `#1d1c1a` |
| `stepper.indicator.radius` | `--mx-stepper-indicator-radius` | `radius.full` | `9999px` |
| `stepper.indicator.bg` | `--mx-stepper-indicator-bg` | `color.fill.control.default` | `#f5f4f0` |
| `stepper.indicator.border-width` | `--mx-stepper-indicator-border-width` | `` | `1px` |
| `stepper.indicator.border-color` | `--mx-stepper-indicator-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `stepper.indicator.color` | `--mx-stepper-indicator-color` | `color.fg.secondary` | `#5e5c55` |
| `stepper.indicator.font-size` | `--mx-stepper-indicator-font-size` | `font.size.caption` | `0.75rem` |
| `stepper.indicator.font-weight` | `--mx-stepper-indicator-font-weight` | `font.weight.semibold` | `600` |
| `stepper.indicator.current.bg` | `--mx-stepper-indicator-current-bg` | `color.accent.solid` | `#c24523` |
| `stepper.indicator.current.border-color` | `--mx-stepper-indicator-current-border-color` | `color.accent.solid` | `#c24523` |
| `stepper.indicator.current.color` | `--mx-stepper-indicator-current-color` | `color.accent.on-solid` | `#ffffff` |
| `stepper.indicator.done.bg` | `--mx-stepper-indicator-done-bg` | `color.accent.solid` | `#c24523` |
| `stepper.indicator.done.border-color` | `--mx-stepper-indicator-done-border-color` | `color.accent.solid` | `#c24523` |
| `stepper.indicator.done.color` | `--mx-stepper-indicator-done-color` | `color.accent.on-solid` | `#ffffff` |
| `stepper.indicator.error.bg` | `--mx-stepper-indicator-error-bg` | `color.danger.solid` | `#b03659` |
| `stepper.indicator.error.border-color` | `--mx-stepper-indicator-error-border-color` | `color.danger.solid` | `#b03659` |
| `stepper.indicator.error.color` | `--mx-stepper-indicator-error-color` | `color.danger.on-solid` | `#ffffff` |
| `stepper.indicator.disabled.border-color` | `--mx-stepper-indicator-disabled-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `stepper.indicator.disabled.color` | `--mx-stepper-indicator-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `stepper.indicator.disabled.bg` | `--mx-stepper-indicator-disabled-bg` | `` | `initial` |
| `stepper.mark.done.icon` | `--mx-stepper-mark-done-icon` | `` | `var(--mx-icon-check)` |
| `stepper.mark.done.bg` | `--mx-stepper-mark-done-bg` | `color.accent.on-solid` | `#ffffff` |
| `stepper.mark.error.icon` | `--mx-stepper-mark-error-icon` | `` | `var(--mx-icon-danger)` |
| `stepper.mark.error.bg` | `--mx-stepper-mark-error-bg` | `color.danger.on-solid` | `#ffffff` |
| `stepper.label.current.font-weight` | `--mx-stepper-label-current-font-weight` | `font.weight.semibold` | `600` |
| `stepper.label.error.color` | `--mx-stepper-label-error-color` | `color.danger.fg` | `#b03659` |
| `stepper.description.color` | `--mx-stepper-description-color` | `color.fg.secondary` | `#5e5c55` |
| `stepper.description.disabled.color` | `--mx-stepper-description-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `stepper.note.color` | `--mx-stepper-note-color` | `color.fg.secondary` | `#5e5c55` |
| `stepper.line.height` | `--mx-stepper-line-height` | `` | `2px` |
| `stepper.line.bg` | `--mx-stepper-line-bg` | `color.stroke.control.secondary` | `rgb(0 0 0 / 0.2)` |
| `stepper.line.done.bg` | `--mx-stepper-line-done-bg` | `color.accent.solid` | `#c24523` |
| `stepper.line.radius` | `--mx-stepper-line-radius` | `` | `initial` |
| `switch.thumb-inset` | `--mx-switch-thumb-inset` | `space.1` | `0.25rem` |
| `switch.gap` | `--mx-switch-gap` | `space.2` | `0.5rem` |
| `switch.text-padding` | `--mx-switch-text-padding` | `space.2` | `0.5rem` |
| `switch.track-width.sm` | `--mx-switch-track-width-sm` | `` | `2rem` |
| `switch.track-width.md` | `--mx-switch-track-width-md` | `` | `2.5rem` |
| `switch.track-width.lg` | `--mx-switch-track-width-lg` | `` | `3rem` |
| `switch.track-height.sm` | `--mx-switch-track-height-sm` | `` | `1rem` |
| `switch.track-height.md` | `--mx-switch-track-height-md` | `` | `1.25rem` |
| `switch.track-height.lg` | `--mx-switch-track-height-lg` | `` | `1.5rem` |
| `switch.height.sm` | `--mx-switch-height-sm` | `control.height.sm` | `1.5rem` |
| `switch.height.md` | `--mx-switch-height-md` | `control.height.md` | `2rem` |
| `switch.height.lg` | `--mx-switch-height-lg` | `control.height.lg` | `2.5rem` |
| `switch.font-size.sm` | `--mx-switch-font-size-sm` | `font.size.caption` | `0.75rem` |
| `switch.font-size.md` | `--mx-switch-font-size-md` | `font.size.body` | `0.875rem` |
| `switch.font-size.lg` | `--mx-switch-font-size-lg` | `font.size.body-large` | `1.125rem` |
| `switch.thumb-stretch` | `--mx-switch-thumb-stretch` | `space.1` | `0.25rem` |
| `switch.thumb-size.sm` | `--mx-switch-thumb-size-sm` | `` | `calc(1rem - 2 * 0.25rem)` |
| `switch.thumb-size.md` | `--mx-switch-thumb-size-md` | `` | `calc(1.25rem - 2 * 0.25rem)` |
| `switch.thumb-size.lg` | `--mx-switch-thumb-size-lg` | `` | `calc(1.5rem - 2 * 0.25rem)` |
| `switch.thumb-size-checked.sm` | `--mx-switch-thumb-size-checked-sm` | `` | `calc(1rem - 2 * 0.25rem)` |
| `switch.thumb-size-checked.md` | `--mx-switch-thumb-size-checked-md` | `` | `calc(1.25rem - 2 * 0.25rem)` |
| `switch.thumb-size-checked.lg` | `--mx-switch-thumb-size-checked-lg` | `` | `calc(1.5rem - 2 * 0.25rem)` |
| `switch.thumb-size-hover.sm` | `--mx-switch-thumb-size-hover-sm` | `` | `calc(1rem - 2 * 0.25rem)` |
| `switch.thumb-size-hover.md` | `--mx-switch-thumb-size-hover-md` | `` | `calc(1.25rem - 2 * 0.25rem)` |
| `switch.thumb-size-hover.lg` | `--mx-switch-thumb-size-hover-lg` | `` | `calc(1.5rem - 2 * 0.25rem)` |
| `switch.thumb-size-pressed.sm` | `--mx-switch-thumb-size-pressed-sm` | `` | `calc(1rem - 2 * 0.25rem)` |
| `switch.thumb-size-pressed.md` | `--mx-switch-thumb-size-pressed-md` | `` | `calc(1.25rem - 2 * 0.25rem)` |
| `switch.thumb-size-pressed.lg` | `--mx-switch-thumb-size-pressed-lg` | `` | `calc(1.5rem - 2 * 0.25rem)` |
| `switch.track.bg` | `--mx-switch-track-bg` | `color.fill.control.default` | `#f5f4f0` |
| `switch.track.border-width` | `--mx-switch-track-border-width` | `border.width.1` | `1px` |
| `switch.track.border-color` | `--mx-switch-track-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `switch.track.radius` | `--mx-switch-track-radius` | `radius.full` | `9999px` |
| `switch.track.checked.bg` | `--mx-switch-track-checked-bg` | `color.accent.solid` | `#c24523` |
| `switch.track.checked.border-color` | `--mx-switch-track-checked-border-color` | `color.accent.solid` | `#c24523` |
| `switch.track.invalid.border-color` | `--mx-switch-track-invalid-border-color` | `color.danger.solid` | `#b03659` |
| `switch.track.hover.bg` | `--mx-switch-track-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `switch.track.checked-hover.bg` | `--mx-switch-track-checked-hover-bg` | `color.accent.solid-hover` | `#b43f20` |
| `switch.track.pressed.bg` | `--mx-switch-track-pressed-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `switch.track.checked-pressed.bg` | `--mx-switch-track-checked-pressed-bg` | `color.accent.solid-hover` | `#b43f20` |
| `switch.track.focus.outline-width` | `--mx-switch-track-focus-outline-width` | `focus.ring.width` | `2px` |
| `switch.track.focus.outline-color` | `--mx-switch-track-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `switch.track.focus.outline-offset` | `--mx-switch-track-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `switch.track.focus.glow` | `--mx-switch-track-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `switch.track.disabled.bg` | `--mx-switch-track-disabled-bg` | `color.fill.control.disabled` | `#ebeae5` |
| `switch.track.disabled.border-color` | `--mx-switch-track-disabled-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `switch.track.checked-disabled.bg` | `--mx-switch-track-checked-disabled-bg` | `color.fill.accent-disabled` | `rgb(0 0 0 / 0.2169)` |
| `switch.track.checked-disabled.border-color` | `--mx-switch-track-checked-disabled-border-color` | `` | `rgb(0 0 0 / 0)` |
| `switch.thumb.bg` | `--mx-switch-thumb-bg` | `color.fg.secondary` | `#5e5c55` |
| `switch.thumb.radius` | `--mx-switch-thumb-radius` | `radius.full` | `9999px` |
| `switch.thumb.checked.bg` | `--mx-switch-thumb-checked-bg` | `color.accent.on-solid` | `#ffffff` |
| `switch.thumb.disabled.bg` | `--mx-switch-thumb-disabled-bg` | `color.fg.disabled` | `#a2a098` |
| `switch.thumb.checked-disabled.bg` | `--mx-switch-thumb-checked-disabled-bg` | `color.fg.on-accent-disabled` | `#ffffff` |
| `switch.thumb.hover.bg` | `--mx-switch-thumb-hover-bg` | `` | `initial` |
| `switch.thumb.checked-hover.bg` | `--mx-switch-thumb-checked-hover-bg` | `` | `initial` |
| `switch.text.font-size` | `--mx-switch-text-font-size` | `font.size.caption` | `0.75rem` |
| `switch.text.line-height` | `--mx-switch-text-line-height` | `` | `1` |
| `switch.text.color` | `--mx-switch-text-color` | `color.fg.secondary` | `#5e5c55` |
| `switch.text.checked.color` | `--mx-switch-text-checked-color` | `color.accent.on-solid` | `#ffffff` |
| `switch.text.disabled.color` | `--mx-switch-text-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `switch.text.checked-disabled.color` | `--mx-switch-text-checked-disabled-color` | `color.fg.on-accent-disabled` | `#ffffff` |
| `switch.side-text.line-height` | `--mx-switch-side-text-line-height` | `` | `1` |
| `switch.side-text.color` | `--mx-switch-side-text-color` | `color.fg.primary` | `#1d1c1a` |
| `switch.side-text.disabled.color` | `--mx-switch-side-text-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `tabdocs.tabs-height` | `--mx-tabdocs-tabs-height` | `control.height.md` | `2rem` |
| `tabdocs.tab-inset` | `--mx-tabdocs-tab-inset` | `control.padding.sm` | `0.5rem` |
| `tabdocs.tab-spacing` | `--mx-tabdocs-tab-spacing` | `control.gap` | `0.5rem` |
| `tabdocs.title-max` | `--mx-tabdocs-title-max` | `` | `16rem` |
| `tabdocs.title-min` | `--mx-tabdocs-title-min` | `` | `2.5rem` |
| `tabdocs.preview-font-style` | `--mx-tabdocs-preview-font-style` | `` | `italic` |
| `tabdocs.indicator-inset` | `--mx-tabdocs-indicator-inset` | `` | `0px` |
| `tabdocs.indicator-inset-start` | `--mx-tabdocs-indicator-inset-start` | `` | `0px` |
| `tabdocs.indicator-inset-end` | `--mx-tabdocs-indicator-inset-end` | `` | `auto` |
| `tabdocs.icon-room` | `--mx-tabdocs-icon-room` | `icon.size.md` | `1rem` |
| `tabdocs.close-room` | `--mx-tabdocs-close-room` | `icon.size.md` | `1rem` |
| `tabdocs.pin-room` | `--mx-tabdocs-pin-room` | `icon.size.md` | `1rem` |
| `tabdocs.scroll-back-rotate` | `--mx-tabdocs-scroll-back-rotate` | `` | `90deg` |
| `tabdocs.scroll-forward-rotate` | `--mx-tabdocs-scroll-forward-rotate` | `` | `-90deg` |
| `tabdocs.actions-padding` | `--mx-tabdocs-actions-padding` | `space.1` | `0.25rem` |
| `tabdocs.sash-thickness` | `--mx-tabdocs-sash-thickness` | `space.1` | `0.25rem` |
| `tabdocs.bar-button-size` | `--mx-tabdocs-bar-button-size` | `` | `1.5rem` |
| `tabdocs.bar-button-padding` | `--mx-tabdocs-bar-button-padding` | `space.1` | `0.25rem` |
| `tabdocs.bar-button-gap` | `--mx-tabdocs-bar-button-gap` | `` | `0.125rem` |
| `tabdocs.bar-icon-size` | `--mx-tabdocs-bar-icon-size` | `` | `0.875rem` |
| `tabdocs.menu-width` | `--mx-tabdocs-menu-width` | `` | `18rem` |
| `tabdocs.menu-max-height` | `--mx-tabdocs-menu-max-height` | `` | `20rem` |
| `tabdocs.menu-search-height` | `--mx-tabdocs-menu-search-height` | `control.height.md` | `2rem` |
| `tabdocs.menu-search-font-size` | `--mx-tabdocs-menu-search-font-size` | `font.size.body` | `0.875rem` |
| `tabdocs.drag-copy-max-width` | `--mx-tabdocs-drag-copy-max-width` | `` | `24rem` |
| `tabdocs.floating-min-width` | `--mx-tabdocs-floating-min-width` | `` | `16rem` |
| `tabdocs.floating-min-height` | `--mx-tabdocs-floating-min-height` | `` | `9rem` |
| `tabdocs.window-resize-edge` | `--mx-tabdocs-window-resize-edge` | `space.2` | `0.5rem` |
| `tabdocs.folded-pin-rotate` | `--mx-tabdocs-folded-pin-rotate` | `` | `90deg` |
| `tabdocs.folded-tab-height` | `--mx-tabdocs-folded-tab-height` | `control.height.md` | `2rem` |
| `tabdocs.guide-room` | `--mx-tabdocs-guide-room` | `control.height.lg` | `2.5rem` |
| `tabdocs.guide-spacing` | `--mx-tabdocs-guide-spacing` | `` | `0.25` |
| `tabdocs.focus-width` | `--mx-tabdocs-focus-width` | `focus.ring.width` | `2px` |
| `tabdocs.focus-offset` | `--mx-tabdocs-focus-offset` | `focus.ring.offset` | `1px` |
| `tabdocs.touch-tab-height` | `--mx-tabdocs-touch-tab-height` | `control.height.lg` | `2.5rem` |
| `tabdocs.touch-close-size` | `--mx-tabdocs-touch-close-size` | `control.height.sm` | `1.5rem` |
| `tabdocs.touch-bar-button-size` | `--mx-tabdocs-touch-bar-button-size` | `control.height.lg` | `2.5rem` |
| `tabdocs.phone-row-height` | `--mx-tabdocs-phone-row-height` | `control.height.lg` | `2.5rem` |
| `tabdocs.tools-padding` | `--mx-tabdocs-tools-padding` | `space.1` | `0.25rem` |
| `tabdocs.phone-list-row-height` | `--mx-tabdocs-phone-list-row-height` | `control.height.lg` | `2.5rem` |
| `tabdocs.phone-list-preview-font-style` | `--mx-tabdocs-phone-list-preview-font-style` | `` | `italic` |
| `tabdocs.menu-search.label-mode` | `--mx-tabdocs-menu-search-label-mode` | `` | `hidden` |
| `tabdocs.menu-search.height.md` | `--mx-tabdocs-menu-search-height-md` | `control.height.md` | `2rem` |
| `tabdocs.menu-search.font-size.md` | `--mx-tabdocs-menu-search-font-size-md` | `font.size.body` | `0.875rem` |
| `tabdocs.menu-search.border-width` | `--mx-tabdocs-menu-search-border-width` | `border.width.1` | `1px` |
| `tabdocs.menu-search.box.bg` | `--mx-tabdocs-menu-search-box-bg` | `color.fill.control.default` | `#f5f4f0` |
| `tabdocs.menu-search.box.radius` | `--mx-tabdocs-menu-search-box-radius` | `radius.md` | `0.375rem` |
| `tabdocs.menu-search.frame.display` | `--mx-tabdocs-menu-search-frame-display` | `` | `flex` |
| `tabdocs.phone-search.label-mode` | `--mx-tabdocs-phone-search-label-mode` | `` | `hidden` |
| `tabdocs.phone-search.variant` | `--mx-tabdocs-phone-search-variant` | `` | `outline` |
| `tabdocs.phone-search.notch` | `--mx-tabdocs-phone-search-notch` | `` | `none` |
| `tabdocs.phone-close.variant` | `--mx-tabdocs-phone-close-variant` | `` | `ghost` |
| `tabdocs.phone-close.size` | `--mx-tabdocs-phone-close-size` | `` | `lg` |
| `tabdocs.phone-count.variant` | `--mx-tabdocs-phone-count-variant` | `` | `outline` |
| `tabdocs.phone-count.size` | `--mx-tabdocs-phone-count-size` | `` | `lg` |
| `tabdocs.actions.bar.bg` | `--mx-tabdocs-actions-bar-bg` | `` | `rgb(0 0 0 / 0)` |
| `tabdocs.actions-small.bar.gap` | `--mx-tabdocs-actions-small-bar-gap` | `` | `0.125rem` |
| `tabdocs.actions-button.variant` | `--mx-tabdocs-actions-button-variant` | `` | `ghost` |
| `tabdocs.actions-button.size` | `--mx-tabdocs-actions-button-size` | `` | `sm` |
| `tabdocs.actions-small-button.height.sm` | `--mx-tabdocs-actions-small-button-height-sm` | `` | `1.5rem` |
| `tabdocs.actions-small-button.padding.sm` | `--mx-tabdocs-actions-small-button-padding-sm` | `space.1` | `0.25rem` |
| `tabdocs.actions-small-button.icon.size` | `--mx-tabdocs-actions-small-button-icon-size` | `` | `0.875rem` |
| `tabdocs.actions-small-count.padding.sm` | `--mx-tabdocs-actions-small-count-padding-sm` | `` | `0px` |
| `tabdocs.tool-drawer.body.padding` | `--mx-tabdocs-tool-drawer-body-padding` | `` | `0px` |
| `tabdocs.tool-drawer-start-end.size` | `--mx-tabdocs-tool-drawer-start-end-size` | `` | `80%` |
| `tabdocs.tool-drawer-top-bottom.size` | `--mx-tabdocs-tool-drawer-top-bottom-size` | `` | `45%` |
| `tabdocs.tool-sheet.body.padding` | `--mx-tabdocs-tool-sheet-body-padding` | `` | `0px` |
| `tabdocs.window-sheet.body.padding` | `--mx-tabdocs-window-sheet-body-padding` | `` | `0px` |
| `tabdocs.manager.bg` | `--mx-tabdocs-manager-bg` | `color.bg.layer` | `#ebeae5` |
| `tabdocs.manager.color` | `--mx-tabdocs-manager-color` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.group.bg` | `--mx-tabdocs-group-bg` | `color.bg.card` | `#f5f4f0` |
| `tabdocs.group.border-color` | `--mx-tabdocs-group-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `tabdocs.group.second.border-start-width` | `--mx-tabdocs-group-second-border-start-width` | `border.width.1` | `1px` |
| `tabdocs.bar.bg` | `--mx-tabdocs-bar-bg` | `color.bg.bar` | `#ebeae5` |
| `tabdocs.bar.border-bottom-width` | `--mx-tabdocs-bar-border-bottom-width` | `border.width.1` | `1px` |
| `tabdocs.bar.border-color` | `--mx-tabdocs-bar-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `tabdocs.bar.dragging.opacity` | `--mx-tabdocs-bar-dragging-opacity` | `opacity.disabled` | `0.5` |
| `tabdocs.pinned.border-color` | `--mx-tabdocs-pinned-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `tabdocs.pinned.row.border-bottom-width` | `--mx-tabdocs-pinned-row-border-bottom-width` | `border.width.1` | `1px` |
| `tabdocs.scroll.min-width` | `--mx-tabdocs-scroll-min-width` | `control.height.sm` | `1.5rem` |
| `tabdocs.scroll.min-height` | `--mx-tabdocs-scroll-min-height` | `control.height.sm` | `1.5rem` |
| `tabdocs.scroll.radius` | `--mx-tabdocs-scroll-radius` | `radius.sm` | `0.25rem` |
| `tabdocs.scroll.color` | `--mx-tabdocs-scroll-color` | `color.fg.secondary` | `#5e5c55` |
| `tabdocs.scroll.hover.bg` | `--mx-tabdocs-scroll-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `tabdocs.scroll.hover.color` | `--mx-tabdocs-scroll-hover-color` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.scroll.pressed.bg` | `--mx-tabdocs-scroll-pressed-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `tabdocs.scroll.pressed.color` | `--mx-tabdocs-scroll-pressed-color` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.scroll.end.color` | `--mx-tabdocs-scroll-end-color` | `color.fg.disabled` | `#a2a098` |
| `tabdocs.scroll-icon.icon` | `--mx-tabdocs-scroll-icon-icon` | `` | `var(--mx-icon-chevron-down)` |
| `tabdocs.scrollbar.height` | `--mx-tabdocs-scrollbar-height` | `space.1` | `0.25rem` |
| `tabdocs.thumb.bg` | `--mx-tabdocs-thumb-bg` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `tabdocs.thumb.radius` | `--mx-tabdocs-thumb-radius` | `radius.full` | `9999px` |
| `tabdocs.thumb.hover.bg` | `--mx-tabdocs-thumb-hover-bg` | `color.fg.secondary` | `#5e5c55` |
| `tabdocs.count.font-size` | `--mx-tabdocs-count-font-size` | `font.size.caption` | `0.75rem` |
| `tabdocs.count.font-weight` | `--mx-tabdocs-count-font-weight` | `font.weight.semibold` | `600` |
| `tabdocs.tab.border-end-width` | `--mx-tabdocs-tab-border-end-width` | `border.width.1` | `1px` |
| `tabdocs.tab.border-end-color` | `--mx-tabdocs-tab-border-end-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `tabdocs.tab.color` | `--mx-tabdocs-tab-color` | `color.fg.secondary` | `#5e5c55` |
| `tabdocs.tab.font-size` | `--mx-tabdocs-tab-font-size` | `font.size.body` | `0.875rem` |
| `tabdocs.tab.font-weight` | `--mx-tabdocs-tab-font-weight` | `font.weight.regular` | `400` |
| `tabdocs.tab.line-height` | `--mx-tabdocs-tab-line-height` | `font.line.body` | `1.25rem` |
| `tabdocs.tab.hover.bg` | `--mx-tabdocs-tab-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `tabdocs.tab.hover.color` | `--mx-tabdocs-tab-hover-color` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.tab.selected.bg` | `--mx-tabdocs-tab-selected-bg` | `color.bg.card` | `#f5f4f0` |
| `tabdocs.tab.selected.color` | `--mx-tabdocs-tab-selected-color` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.tab.focus.glow` | `--mx-tabdocs-tab-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `tabdocs.tab.focus.outline-width` | `--mx-tabdocs-tab-focus-outline-width` | `focus.ring.width` | `2px` |
| `tabdocs.tab.focus.outline-color` | `--mx-tabdocs-tab-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `tabdocs.tab.focus.outline-offset` | `--mx-tabdocs-tab-focus-outline-offset` | `` | `calc(2px * -1)` |
| `tabdocs.tab.dragging.opacity` | `--mx-tabdocs-tab-dragging-opacity` | `opacity.disabled` | `0.5` |
| `tabdocs.tab.title.border-end-color` | `--mx-tabdocs-tab-title-border-end-color` | `` | `rgb(0 0 0 / 0)` |
| `tabdocs.tab.title.color` | `--mx-tabdocs-tab-title-color` | `color.fg.secondary` | `#5e5c55` |
| `tabdocs.tab.title.font-weight` | `--mx-tabdocs-tab-title-font-weight` | `font.weight.semibold` | `600` |
| `tabdocs.tab.title.bg` | `--mx-tabdocs-tab-title-bg` | `` | `initial` |
| `tabdocs.tab.title-active.color` | `--mx-tabdocs-tab-title-active-color` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.indicator.height` | `--mx-tabdocs-indicator-height` | `border.width.2` | `2px` |
| `tabdocs.indicator.selected.bg` | `--mx-tabdocs-indicator-selected-bg` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `tabdocs.indicator.active.bg` | `--mx-tabdocs-indicator-active-bg` | `color.accent.solid` | `#c24523` |
| `tabdocs.indicator.title.bg` | `--mx-tabdocs-indicator-title-bg` | `` | `initial` |
| `tabdocs.title.warning.color` | `--mx-tabdocs-title-warning-color` | `color.caution.fg` | `#754702` |
| `tabdocs.title.danger.color` | `--mx-tabdocs-title-danger-color` | `color.danger.fg` | `#b03659` |
| `tabdocs.title.success.color` | `--mx-tabdocs-title-success-color` | `color.success.fg` | `#006402` |
| `tabdocs.title.accent.color` | `--mx-tabdocs-title-accent-color` | `color.accent.fg` | `#983318` |
| `tabdocs.letter.font-weight` | `--mx-tabdocs-letter-font-weight` | `font.weight.semibold` | `600` |
| `tabdocs.pin.radius` | `--mx-tabdocs-pin-radius` | `radius.sm` | `0.25rem` |
| `tabdocs.pin.color` | `--mx-tabdocs-pin-color` | `color.fg.secondary` | `#5e5c55` |
| `tabdocs.pin.hover.bg` | `--mx-tabdocs-pin-hover-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `tabdocs.pin.hover.color` | `--mx-tabdocs-pin-hover-color` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.description.color` | `--mx-tabdocs-description-color` | `color.fg.secondary` | `#5e5c55` |
| `tabdocs.description.font-size` | `--mx-tabdocs-description-font-size` | `font.size.caption` | `0.75rem` |
| `tabdocs.badge.height` | `--mx-tabdocs-badge-height` | `icon.size.md` | `1rem` |
| `tabdocs.badge.min-width` | `--mx-tabdocs-badge-min-width` | `icon.size.md` | `1rem` |
| `tabdocs.badge.padding-inline` | `--mx-tabdocs-badge-padding-inline` | `space.1` | `0.25rem` |
| `tabdocs.badge.bg` | `--mx-tabdocs-badge-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `tabdocs.badge.radius` | `--mx-tabdocs-badge-radius` | `radius.full` | `9999px` |
| `tabdocs.badge.color` | `--mx-tabdocs-badge-color` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.badge.font-size` | `--mx-tabdocs-badge-font-size` | `font.size.caption` | `0.75rem` |
| `tabdocs.badge.dot.size` | `--mx-tabdocs-badge-dot-size` | `` | `0.5rem` |
| `tabdocs.badge.dot.min-width` | `--mx-tabdocs-badge-dot-min-width` | `` | `0px` |
| `tabdocs.badge.dot.padding-inline` | `--mx-tabdocs-badge-dot-padding-inline` | `` | `0px` |
| `tabdocs.badge.dot.bg` | `--mx-tabdocs-badge-dot-bg` | `color.accent.solid` | `#c24523` |
| `tabdocs.badge.warning.bg` | `--mx-tabdocs-badge-warning-bg` | `color.caution.subtle` | `#fff4ce` |
| `tabdocs.badge.warning.color` | `--mx-tabdocs-badge-warning-color` | `color.caution.fg` | `#754702` |
| `tabdocs.badge.danger.bg` | `--mx-tabdocs-badge-danger-bg` | `color.danger.subtle` | `#fde7e9` |
| `tabdocs.badge.danger.color` | `--mx-tabdocs-badge-danger-color` | `color.danger.fg` | `#b03659` |
| `tabdocs.badge.success.bg` | `--mx-tabdocs-badge-success-bg` | `color.success.subtle` | `#dff6dd` |
| `tabdocs.badge.success.color` | `--mx-tabdocs-badge-success-color` | `color.success.fg` | `#006402` |
| `tabdocs.badge.accent.bg` | `--mx-tabdocs-badge-accent-bg` | `color.accent.subtle` | `#fbe6de` |
| `tabdocs.badge.accent.color` | `--mx-tabdocs-badge-accent-color` | `color.accent.fg` | `#983318` |
| `tabdocs.badge.warning-dot.bg` | `--mx-tabdocs-badge-warning-dot-bg` | `color.caution.fg` | `#754702` |
| `tabdocs.badge.danger-dot.bg` | `--mx-tabdocs-badge-danger-dot-bg` | `color.danger.fg` | `#b03659` |
| `tabdocs.badge.success-dot.bg` | `--mx-tabdocs-badge-success-dot-bg` | `color.success.fg` | `#006402` |
| `tabdocs.badge.accent-dot.bg` | `--mx-tabdocs-badge-accent-dot-bg` | `color.accent.fg` | `#983318` |
| `tabdocs.close.radius` | `--mx-tabdocs-close-radius` | `radius.sm` | `0.25rem` |
| `tabdocs.close.color` | `--mx-tabdocs-close-color` | `color.fg.secondary` | `#5e5c55` |
| `tabdocs.close.hover.bg` | `--mx-tabdocs-close-hover-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `tabdocs.close.hover.color` | `--mx-tabdocs-close-hover-color` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.dirty.size` | `--mx-tabdocs-dirty-size` | `` | `0.5rem` |
| `tabdocs.dirty.bg` | `--mx-tabdocs-dirty-bg` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.dirty.radius` | `--mx-tabdocs-dirty-radius` | `radius.full` | `9999px` |
| `tabdocs.panel.focus.glow` | `--mx-tabdocs-panel-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `tabdocs.panel.focus.outline-width` | `--mx-tabdocs-panel-focus-outline-width` | `focus.ring.width` | `2px` |
| `tabdocs.panel.focus.outline-color` | `--mx-tabdocs-panel-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `tabdocs.panel.focus.outline-offset` | `--mx-tabdocs-panel-focus-outline-offset` | `` | `calc(2px * -1)` |
| `tabdocs.empty.padding` | `--mx-tabdocs-empty-padding` | `space.4` | `1rem` |
| `tabdocs.empty.color` | `--mx-tabdocs-empty-color` | `color.fg.secondary` | `#5e5c55` |
| `tabdocs.empty.font-size` | `--mx-tabdocs-empty-font-size` | `font.size.body` | `0.875rem` |
| `tabdocs.sash.focus.glow` | `--mx-tabdocs-sash-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `tabdocs.sash.focus.outline-width` | `--mx-tabdocs-sash-focus-outline-width` | `focus.ring.width` | `2px` |
| `tabdocs.sash.focus.outline-color` | `--mx-tabdocs-sash-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `tabdocs.sash.focus.outline-offset` | `--mx-tabdocs-sash-focus-outline-offset` | `` | `calc(2px * -1)` |
| `tabdocs.sash-line.width` | `--mx-tabdocs-sash-line-width` | `border.width.1` | `1px` |
| `tabdocs.sash-line.bg` | `--mx-tabdocs-sash-line-bg` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `tabdocs.sash-line.across.width` | `--mx-tabdocs-sash-line-across-width` | `` | `auto` |
| `tabdocs.sash-line.across.height` | `--mx-tabdocs-sash-line-across-height` | `border.width.1` | `1px` |
| `tabdocs.sash-line.active.width` | `--mx-tabdocs-sash-line-active-width` | `border.width.2` | `2px` |
| `tabdocs.sash-line.active.bg` | `--mx-tabdocs-sash-line-active-bg` | `color.accent.solid` | `#c24523` |
| `tabdocs.sash-line.across-active.width` | `--mx-tabdocs-sash-line-across-active-width` | `` | `auto` |
| `tabdocs.sash-line.across-active.height` | `--mx-tabdocs-sash-line-across-active-height` | `border.width.2` | `2px` |
| `tabdocs.ghost.bg` | `--mx-tabdocs-ghost-bg` | `color.bg.card` | `#f5f4f0` |
| `tabdocs.ghost.border-width` | `--mx-tabdocs-ghost-border-width` | `border.width.1` | `1px` |
| `tabdocs.ghost.border-color` | `--mx-tabdocs-ghost-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `tabdocs.ghost.radius` | `--mx-tabdocs-ghost-radius` | `radius.sm` | `0.25rem` |
| `tabdocs.ghost.shadow` | `--mx-tabdocs-ghost-shadow` | `elevation.popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `tabdocs.ghost.color` | `--mx-tabdocs-ghost-color` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.ghost.copy.outline-width` | `--mx-tabdocs-ghost-copy-outline-width` | `border.width.2` | `2px` |
| `tabdocs.ghost.copy.outline-color` | `--mx-tabdocs-ghost-copy-outline-color` | `color.accent.solid` | `#c24523` |
| `tabdocs.ghost.refused.opacity` | `--mx-tabdocs-ghost-refused-opacity` | `opacity.disabled` | `0.5` |
| `tabdocs.drop.border-width` | `--mx-tabdocs-drop-border-width` | `border.width.2` | `2px` |
| `tabdocs.drop.border-color` | `--mx-tabdocs-drop-border-color` | `color.accent.solid` | `#c24523` |
| `tabdocs.drop.radius` | `--mx-tabdocs-drop-radius` | `radius.sm` | `0.25rem` |
| `tabdocs.drop-fill.bg` | `--mx-tabdocs-drop-fill-bg` | `color.accent.subtle` | `#fbe6de` |
| `tabdocs.drop-fill.opacity` | `--mx-tabdocs-drop-fill-opacity` | `opacity.disabled` | `0.5` |
| `tabdocs.insert.width` | `--mx-tabdocs-insert-width` | `border.width.2` | `2px` |
| `tabdocs.insert.bg` | `--mx-tabdocs-insert-bg` | `color.accent.solid` | `#c24523` |
| `tabdocs.window.bg` | `--mx-tabdocs-window-bg` | `color.bg.surface` | `#f8f7f3` |
| `tabdocs.window.border-width` | `--mx-tabdocs-window-border-width` | `border.width.1` | `1px` |
| `tabdocs.window.border-color` | `--mx-tabdocs-window-border-color` | `color.stroke.surface` | `rgb(117 117 117 / 0.4)` |
| `tabdocs.window.radius` | `--mx-tabdocs-window-radius` | `radius.md` | `0.375rem` |
| `tabdocs.window.shadow` | `--mx-tabdocs-window-shadow` | `elevation.window-inactive` | `0px 4px 8px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `tabdocs.window.active.shadow` | `--mx-tabdocs-window-active-shadow` | `elevation.window` | `0px 14px 28px 0px rgb(0 0 0 / 0.24), 0px 0px 8px 0px rgb(0 0 0 / 0.2)` |
| `tabdocs.window.maximized.radius` | `--mx-tabdocs-window-maximized-radius` | `` | `0px` |
| `tabdocs.area.bg` | `--mx-tabdocs-area-bg` | `color.bg.layer` | `#ebeae5` |
| `tabdocs.area.folded.border-color` | `--mx-tabdocs-area-folded-border-color` | `color.stroke.surface` | `rgb(117 117 117 / 0.4)` |
| `tabdocs.area.folded.shadow` | `--mx-tabdocs-area-folded-shadow` | `elevation.popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `tabdocs.area.folded-left.border-end-width` | `--mx-tabdocs-area-folded-left-border-end-width` | `border.width.1` | `1px` |
| `tabdocs.area.folded-right.border-start-width` | `--mx-tabdocs-area-folded-right-border-start-width` | `border.width.1` | `1px` |
| `tabdocs.area.folded-top.border-bottom-width` | `--mx-tabdocs-area-folded-top-border-bottom-width` | `border.width.1` | `1px` |
| `tabdocs.area.folded-bottom.border-top-width` | `--mx-tabdocs-area-folded-bottom-border-top-width` | `border.width.1` | `1px` |
| `tabdocs.area.presented.border-width` | `--mx-tabdocs-area-presented-border-width` | `` | `initial` |
| `tabdocs.area.presented.shadow` | `--mx-tabdocs-area-presented-shadow` | `` | `initial` |
| `tabdocs.autohide.padding` | `--mx-tabdocs-autohide-padding` | `space.1` | `0.25rem` |
| `tabdocs.autohide.gap` | `--mx-tabdocs-autohide-gap` | `space.1` | `0.25rem` |
| `tabdocs.autohide.bg` | `--mx-tabdocs-autohide-bg` | `color.bg.bar` | `#ebeae5` |
| `tabdocs.autohide.border-color` | `--mx-tabdocs-autohide-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `tabdocs.autohide.left.border-end-width` | `--mx-tabdocs-autohide-left-border-end-width` | `border.width.1` | `1px` |
| `tabdocs.autohide.right.border-start-width` | `--mx-tabdocs-autohide-right-border-start-width` | `border.width.1` | `1px` |
| `tabdocs.autohide.top.border-bottom-width` | `--mx-tabdocs-autohide-top-border-bottom-width` | `border.width.1` | `1px` |
| `tabdocs.autohide.bottom.border-top-width` | `--mx-tabdocs-autohide-bottom-border-top-width` | `border.width.1` | `1px` |
| `tabdocs.autohide-tab.padding-inline` | `--mx-tabdocs-autohide-tab-padding-inline` | `control.padding.sm` | `0.5rem` |
| `tabdocs.autohide-tab.gap` | `--mx-tabdocs-autohide-tab-gap` | `control.gap` | `0.5rem` |
| `tabdocs.autohide-tab.radius` | `--mx-tabdocs-autohide-tab-radius` | `radius.sm` | `0.25rem` |
| `tabdocs.autohide-tab.color` | `--mx-tabdocs-autohide-tab-color` | `color.fg.secondary` | `#5e5c55` |
| `tabdocs.autohide-tab.font-size` | `--mx-tabdocs-autohide-tab-font-size` | `font.size.body` | `0.875rem` |
| `tabdocs.autohide-tab.line-height` | `--mx-tabdocs-autohide-tab-line-height` | `font.line.body` | `1.25rem` |
| `tabdocs.autohide-tab.group-start.margin-start` | `--mx-tabdocs-autohide-tab-group-start-margin-start` | `space.3` | `0.75rem` |
| `tabdocs.autohide-tab.hover.bg` | `--mx-tabdocs-autohide-tab-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `tabdocs.autohide-tab.hover.color` | `--mx-tabdocs-autohide-tab-hover-color` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.autohide-tab.open.bg` | `--mx-tabdocs-autohide-tab-open-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `tabdocs.autohide-tab.open.color` | `--mx-tabdocs-autohide-tab-open-color` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.autohide-tab.focus.glow` | `--mx-tabdocs-autohide-tab-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `tabdocs.autohide-tab.focus.outline-width` | `--mx-tabdocs-autohide-tab-focus-outline-width` | `focus.ring.width` | `2px` |
| `tabdocs.autohide-tab.focus.outline-color` | `--mx-tabdocs-autohide-tab-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `tabdocs.autohide-tab.focus.outline-offset` | `--mx-tabdocs-autohide-tab-focus-outline-offset` | `` | `calc(2px * -1)` |
| `tabdocs.autohide-indicator.height` | `--mx-tabdocs-autohide-indicator-height` | `border.width.2` | `2px` |
| `tabdocs.autohide-indicator.bg` | `--mx-tabdocs-autohide-indicator-bg` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `tabdocs.autohide-indicator.radius` | `--mx-tabdocs-autohide-indicator-radius` | `radius.sm` | `0.25rem` |
| `tabdocs.autohide-indicator.open.bg` | `--mx-tabdocs-autohide-indicator-open-bg` | `color.accent.solid` | `#c24523` |
| `tabdocs.guide.bg` | `--mx-tabdocs-guide-bg` | `color.bg.surface` | `#f8f7f3` |
| `tabdocs.guide.border-width` | `--mx-tabdocs-guide-border-width` | `border.width.1` | `1px` |
| `tabdocs.guide.border-color` | `--mx-tabdocs-guide-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `tabdocs.guide.radius` | `--mx-tabdocs-guide-radius` | `radius.sm` | `0.25rem` |
| `tabdocs.guide.shadow` | `--mx-tabdocs-guide-shadow` | `elevation.popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `tabdocs.guide.color` | `--mx-tabdocs-guide-color` | `color.fg.secondary` | `#5e5c55` |
| `tabdocs.guide.pointed.bg` | `--mx-tabdocs-guide-pointed-bg` | `color.accent.solid` | `#c24523` |
| `tabdocs.guide.pointed.border-color` | `--mx-tabdocs-guide-pointed-border-color` | `color.accent.solid` | `#c24523` |
| `tabdocs.guide.pointed.color` | `--mx-tabdocs-guide-pointed-color` | `color.accent.on-solid` | `#ffffff` |
| `tabdocs.guide-icon.size` | `--mx-tabdocs-guide-icon-size` | `icon.size.lg` | `1.25rem` |
| `tabdocs.list.gap` | `--mx-tabdocs-list-gap` | `space.1` | `0.25rem` |
| `tabdocs.list-dirty.size` | `--mx-tabdocs-list-dirty-size` | `space.2` | `0.5rem` |
| `tabdocs.list-dirty.bg` | `--mx-tabdocs-list-dirty-bg` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.list-dirty.radius` | `--mx-tabdocs-list-dirty-radius` | `radius.full` | `9999px` |
| `tabdocs.phone-bar.padding-inline` | `--mx-tabdocs-phone-bar-padding-inline` | `space.2` | `0.5rem` |
| `tabdocs.phone-bar.gap` | `--mx-tabdocs-phone-bar-gap` | `space.1` | `0.25rem` |
| `tabdocs.phone-bar.bg` | `--mx-tabdocs-phone-bar-bg` | `color.bg.bar` | `#ebeae5` |
| `tabdocs.phone-bar.border-bottom-width` | `--mx-tabdocs-phone-bar-border-bottom-width` | `border.width.1` | `1px` |
| `tabdocs.phone-bar.border-color` | `--mx-tabdocs-phone-bar-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `tabdocs.phone-title.padding-inline` | `--mx-tabdocs-phone-title-padding-inline` | `space.2` | `0.5rem` |
| `tabdocs.phone-title.gap` | `--mx-tabdocs-phone-title-gap` | `space.2` | `0.5rem` |
| `tabdocs.phone-title.radius` | `--mx-tabdocs-phone-title-radius` | `radius.md` | `0.375rem` |
| `tabdocs.phone-title.color` | `--mx-tabdocs-phone-title-color` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.phone-title.font-size` | `--mx-tabdocs-phone-title-font-size` | `font.size.body-large` | `1.125rem` |
| `tabdocs.phone-title.font-weight` | `--mx-tabdocs-phone-title-font-weight` | `font.weight.semibold` | `600` |
| `tabdocs.phone-title.line-height` | `--mx-tabdocs-phone-title-line-height` | `font.line.body-large` | `1.5rem` |
| `tabdocs.phone-title.hover.bg` | `--mx-tabdocs-phone-title-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `tabdocs.phone-title.focus.glow` | `--mx-tabdocs-phone-title-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `tabdocs.phone-title.focus.outline-width` | `--mx-tabdocs-phone-title-focus-outline-width` | `focus.ring.width` | `2px` |
| `tabdocs.phone-title.focus.outline-color` | `--mx-tabdocs-phone-title-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `tabdocs.phone-title.focus.outline-offset` | `--mx-tabdocs-phone-title-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `tabdocs.phone-dirty.size` | `--mx-tabdocs-phone-dirty-size` | `space.2` | `0.5rem` |
| `tabdocs.phone-dirty.bg` | `--mx-tabdocs-phone-dirty-bg` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.phone-dirty.radius` | `--mx-tabdocs-phone-dirty-radius` | `radius.full` | `9999px` |
| `tabdocs.phone-tools.gap` | `--mx-tabdocs-phone-tools-gap` | `space.1` | `0.25rem` |
| `tabdocs.phone-tools.bg` | `--mx-tabdocs-phone-tools-bg` | `color.bg.bar` | `#ebeae5` |
| `tabdocs.phone-tools.border-top-width` | `--mx-tabdocs-phone-tools-border-top-width` | `border.width.1` | `1px` |
| `tabdocs.phone-tools.border-color` | `--mx-tabdocs-phone-tools-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `tabdocs.phone-tool.min-width` | `--mx-tabdocs-phone-tool-min-width` | `` | `4rem` |
| `tabdocs.phone-tool.min-height` | `--mx-tabdocs-phone-tool-min-height` | `control.height.lg` | `2.5rem` |
| `tabdocs.phone-tool.padding` | `--mx-tabdocs-phone-tool-padding` | `space.1` | `0.25rem` |
| `tabdocs.phone-tool.gap` | `--mx-tabdocs-phone-tool-gap` | `space.1` | `0.25rem` |
| `tabdocs.phone-tool.radius` | `--mx-tabdocs-phone-tool-radius` | `radius.md` | `0.375rem` |
| `tabdocs.phone-tool.color` | `--mx-tabdocs-phone-tool-color` | `color.fg.secondary` | `#5e5c55` |
| `tabdocs.phone-tool.font-size` | `--mx-tabdocs-phone-tool-font-size` | `font.size.caption` | `0.75rem` |
| `tabdocs.phone-tool.line-height` | `--mx-tabdocs-phone-tool-line-height` | `font.line.caption` | `1rem` |
| `tabdocs.phone-tool.hover.bg` | `--mx-tabdocs-phone-tool-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `tabdocs.phone-tool.hover.color` | `--mx-tabdocs-phone-tool-hover-color` | `color.fg.primary` | `#1d1c1a` |
| `tabdocs.phone-tool.open.bg` | `--mx-tabdocs-phone-tool-open-bg` | `color.selection.bg` | `#f5f4f0` |
| `tabdocs.phone-tool.open.shadow` | `--mx-tabdocs-phone-tool-open-shadow` | `effect.selection` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0px 1px 0px 0px rgb(0 0 0 / 0.3)` |
| `tabdocs.phone-tool.open.glow` | `--mx-tabdocs-phone-tool-open-glow` | `` | `inset 0px 0px 0px 1px rgb(0 0 0 / 0.12)` |
| `tabdocs.phone-tool.open.color` | `--mx-tabdocs-phone-tool-open-color` | `color.selection.fg` | `#1d1c1a` |
| `tabdocs.phone-tool.focus.glow` | `--mx-tabdocs-phone-tool-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `tabdocs.phone-tool.focus.outline-width` | `--mx-tabdocs-phone-tool-focus-outline-width` | `focus.ring.width` | `2px` |
| `tabdocs.phone-tool.focus.outline-color` | `--mx-tabdocs-phone-tool-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `tabdocs.phone-tool.focus.outline-offset` | `--mx-tabdocs-phone-tool-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `tabdocs.phone-tool-icon.size` | `--mx-tabdocs-phone-tool-icon-size` | `icon.size.md` | `1rem` |
| `tabdocs.phone-tool-icon.font-weight` | `--mx-tabdocs-phone-tool-icon-font-weight` | `font.weight.semibold` | `600` |
| `tabdocs.list-search.margin-bottom` | `--mx-tabdocs-list-search-margin-bottom` | `space.3` | `0.75rem` |
| `tabdocs.list-sections.gap` | `--mx-tabdocs-list-sections-gap` | `space.3` | `0.75rem` |
| `tabdocs.list-head.padding-inline` | `--mx-tabdocs-list-head-padding-inline` | `space.3` | `0.75rem` |
| `tabdocs.list-head.color` | `--mx-tabdocs-list-head-color` | `color.fg.secondary` | `#5e5c55` |
| `tabdocs.list-head.font-size` | `--mx-tabdocs-list-head-font-size` | `font.size.caption` | `0.75rem` |
| `tabdocs.list-head.font-weight` | `--mx-tabdocs-list-head-font-weight` | `font.weight.semibold` | `600` |
| `tabdocs.list-row.bg` | `--mx-tabdocs-list-row-bg` | `color.bg.surface` | `#f8f7f3` |
| `tabdocs.list-row.radius` | `--mx-tabdocs-list-row-radius` | `radius.md` | `0.375rem` |
| `tabdocs.list-row.swiping.bg` | `--mx-tabdocs-list-row-swiping-bg` | `color.danger.subtle` | `#fde7e9` |
| `tabdocs.list-row.lifted.shadow` | `--mx-tabdocs-list-row-lifted-shadow` | `elevation.popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `tabdocs.list-open.padding-inline` | `--mx-tabdocs-list-open-padding-inline` | `space.3` | `0.75rem` |
| `tabdocs.list-open.gap` | `--mx-tabdocs-list-open-gap` | `space.3` | `0.75rem` |
| `tabdocs.list-open.radius` | `--mx-tabdocs-list-open-radius` | `radius.md` | `0.375rem` |
| `tabdocs.list-open.font-size` | `--mx-tabdocs-list-open-font-size` | `font.size.body-large` | `1.125rem` |
| `tabdocs.list-open.line-height` | `--mx-tabdocs-list-open-line-height` | `font.line.body-large` | `1.5rem` |
| `tabdocs.list-open.hover.bg` | `--mx-tabdocs-list-open-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `tabdocs.list-open.current.bg` | `--mx-tabdocs-list-open-current-bg` | `color.selection.bg` | `#f5f4f0` |
| `tabdocs.list-open.current.shadow` | `--mx-tabdocs-list-open-current-shadow` | `effect.selection` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0px 1px 0px 0px rgb(0 0 0 / 0.3)` |
| `tabdocs.list-open.current.glow` | `--mx-tabdocs-list-open-current-glow` | `` | `inset 0px 0px 0px 1px rgb(0 0 0 / 0.12)` |
| `tabdocs.list-open.current.color` | `--mx-tabdocs-list-open-current-color` | `color.selection.fg` | `#1d1c1a` |
| `tabdocs.list-open.focus.glow` | `--mx-tabdocs-list-open-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `tabdocs.list-open.focus.outline-width` | `--mx-tabdocs-list-open-focus-outline-width` | `focus.ring.width` | `2px` |
| `tabdocs.list-open.focus.outline-color` | `--mx-tabdocs-list-open-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `tabdocs.list-open.focus.outline-offset` | `--mx-tabdocs-list-open-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `tabdocs.list-description.color` | `--mx-tabdocs-list-description-color` | `color.fg.secondary` | `#5e5c55` |
| `tabdocs.list-description.font-size` | `--mx-tabdocs-list-description-font-size` | `font.size.body` | `0.875rem` |
| `tabdocs.list-close.size` | `--mx-tabdocs-list-close-size` | `control.height.lg` | `2.5rem` |
| `tabdocs.list-close.radius` | `--mx-tabdocs-list-close-radius` | `radius.md` | `0.375rem` |
| `tabdocs.list-close.color` | `--mx-tabdocs-list-close-color` | `color.fg.secondary` | `#5e5c55` |
| `tabdocs.list-close.hover.bg` | `--mx-tabdocs-list-close-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `tabdocs.list-close.focus.glow` | `--mx-tabdocs-list-close-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `tabdocs.list-close.focus.outline-width` | `--mx-tabdocs-list-close-focus-outline-width` | `focus.ring.width` | `2px` |
| `tabdocs.list-close.focus.outline-color` | `--mx-tabdocs-list-close-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `tabdocs.list-close.focus.outline-offset` | `--mx-tabdocs-list-close-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `tabdocs.list-empty.padding` | `--mx-tabdocs-list-empty-padding` | `space.3` | `0.75rem` |
| `tabdocs.list-empty.color` | `--mx-tabdocs-list-empty-color` | `color.fg.secondary` | `#5e5c55` |
| `tabs.pill-gap` | `--mx-tabs-pill-gap` | `space.1` | `0.25rem` |
| `tabs.curve-display` | `--mx-tabs-curve-display` | `` | `none` |
| `tabs.curve-size` | `--mx-tabs-curve-size` | `` | `0px` |
| `tabs.curve-frame-width` | `--mx-tabs-curve-frame-width` | `` | `0px` |
| `tabs.curve-frame-color` | `--mx-tabs-curve-frame-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `tabs.tab-overlap` | `--mx-tabs-tab-overlap` | `` | `0px` |
| `tabs.indicator-offset` | `--mx-tabs-indicator-offset` | `` | `0px` |
| `tabs.indicator-inset-vertical` | `--mx-tabs-indicator-inset-vertical` | `space.1` | `0.25rem` |
| `tabs.close-pull` | `--mx-tabs-close-pull` | `` | `0.5` |
| `tabs.scroll-back-rotate` | `--mx-tabs-scroll-back-rotate` | `` | `90deg` |
| `tabs.scroll-forward-rotate` | `--mx-tabs-scroll-forward-rotate` | `` | `-90deg` |
| `tabs.scroll-up-rotate` | `--mx-tabs-scroll-up-rotate` | `` | `180deg` |
| `tabs.scroll-down-rotate` | `--mx-tabs-scroll-down-rotate` | `` | `0deg` |
| `tabs.vertical-width` | `--mx-tabs-vertical-width` | `` | `10rem` |
| `tabs.font-size.sm` | `--mx-tabs-font-size-sm` | `font.size.caption` | `0.75rem` |
| `tabs.font-size.md` | `--mx-tabs-font-size-md` | `font.size.body` | `0.875rem` |
| `tabs.font-size.lg` | `--mx-tabs-font-size-lg` | `font.size.body-large` | `1.125rem` |
| `tabs.line-height.sm` | `--mx-tabs-line-height-sm` | `font.line.caption` | `1rem` |
| `tabs.line-height.md` | `--mx-tabs-line-height-md` | `font.line.body` | `1.25rem` |
| `tabs.line-height.lg` | `--mx-tabs-line-height-lg` | `font.line.body-large` | `1.5rem` |
| `tabs.height.sm` | `--mx-tabs-height-sm` | `control.height.sm` | `1.5rem` |
| `tabs.height.md` | `--mx-tabs-height-md` | `control.height.md` | `2rem` |
| `tabs.height.lg` | `--mx-tabs-height-lg` | `control.height.lg` | `2.5rem` |
| `tabs.padding.sm` | `--mx-tabs-padding-sm` | `control.padding.sm` | `0.5rem` |
| `tabs.padding.md` | `--mx-tabs-padding-md` | `control.padding.md` | `0.6875rem` |
| `tabs.padding.lg` | `--mx-tabs-padding-lg` | `control.padding.lg` | `1rem` |
| `tabs.indicator-inset.sm` | `--mx-tabs-indicator-inset-sm` | `control.padding.sm` | `0.5rem` |
| `tabs.indicator-inset.md` | `--mx-tabs-indicator-inset-md` | `control.padding.md` | `0.6875rem` |
| `tabs.indicator-inset.lg` | `--mx-tabs-indicator-inset-lg` | `control.padding.lg` | `1rem` |
| `tabs.pill-height.sm` | `--mx-tabs-pill-height-sm` | `control.height.sm` | `1.5rem` |
| `tabs.pill-height.md` | `--mx-tabs-pill-height-md` | `control.height.md` | `2rem` |
| `tabs.pill-height.lg` | `--mx-tabs-pill-height-lg` | `control.height.lg` | `2.5rem` |
| `tabs.container.color` | `--mx-tabs-container-color` | `color.fg.primary` | `#1d1c1a` |
| `tabs.strip.border-bottom-width` | `--mx-tabs-strip-border-bottom-width` | `border.width.1` | `1px` |
| `tabs.strip.border-color` | `--mx-tabs-strip-border-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `tabs.strip.bottom.border-top-width` | `--mx-tabs-strip-bottom-border-top-width` | `border.width.1` | `1px` |
| `tabs.strip.bottom.border-bottom-width` | `--mx-tabs-strip-bottom-border-bottom-width` | `` | `0px` |
| `tabs.strip.start.border-end-width` | `--mx-tabs-strip-start-border-end-width` | `border.width.1` | `1px` |
| `tabs.strip.start.border-bottom-width` | `--mx-tabs-strip-start-border-bottom-width` | `` | `0px` |
| `tabs.strip.end.border-bottom-width` | `--mx-tabs-strip-end-border-bottom-width` | `` | `0px` |
| `tabs.strip.end.border-start-width` | `--mx-tabs-strip-end-border-start-width` | `border.width.1` | `1px` |
| `tabs.strip.pill.bg` | `--mx-tabs-strip-pill-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `tabs.strip.pill.border-bottom-width` | `--mx-tabs-strip-pill-border-bottom-width` | `` | `0px` |
| `tabs.strip.pill.radius` | `--mx-tabs-strip-pill-radius` | `radius.md` | `0.375rem` |
| `tabs.strip.pill.border-width` | `--mx-tabs-strip-pill-border-width` | `` | `initial` |
| `tabs.list.pill.padding` | `--mx-tabs-list-pill-padding` | `space.1` | `0.25rem` |
| `tabs.scroll.min-width` | `--mx-tabs-scroll-min-width` | `control.height.sm` | `1.5rem` |
| `tabs.scroll.min-height` | `--mx-tabs-scroll-min-height` | `control.height.sm` | `1.5rem` |
| `tabs.scroll.radius` | `--mx-tabs-scroll-radius` | `radius.md` | `0.375rem` |
| `tabs.scroll.color` | `--mx-tabs-scroll-color` | `color.fg.secondary` | `#5e5c55` |
| `tabs.scroll.hover.bg` | `--mx-tabs-scroll-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `tabs.scroll.hover.color` | `--mx-tabs-scroll-hover-color` | `color.fg.primary` | `#1d1c1a` |
| `tabs.scroll.pressed.bg` | `--mx-tabs-scroll-pressed-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `tabs.scroll.pressed.color` | `--mx-tabs-scroll-pressed-color` | `color.fg.primary` | `#1d1c1a` |
| `tabs.scroll.end.color` | `--mx-tabs-scroll-end-color` | `color.fg.disabled` | `#a2a098` |
| `tabs.scroll-icon.size` | `--mx-tabs-scroll-icon-size` | `icon.size.sm` | `0.75rem` |
| `tabs.scroll-icon.icon` | `--mx-tabs-scroll-icon-icon` | `` | `var(--mx-icon-chevron-down)` |
| `tabs.tab.gap` | `--mx-tabs-tab-gap` | `control.gap` | `0.5rem` |
| `tabs.tab.color` | `--mx-tabs-tab-color` | `color.fg.secondary` | `#5e5c55` |
| `tabs.tab.font-weight` | `--mx-tabs-tab-font-weight` | `font.weight.medium` | `500` |
| `tabs.tab.pill.radius` | `--mx-tabs-tab-pill-radius` | `radius.md` | `0.375rem` |
| `tabs.tab.pill.radius-bottom` | `--mx-tabs-tab-pill-radius-bottom` | `radius.md` | `0.375rem` |
| `tabs.tab.hover.bg` | `--mx-tabs-tab-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `tabs.tab.hover.color` | `--mx-tabs-tab-hover-color` | `color.fg.primary` | `#1d1c1a` |
| `tabs.tab.pill-hover.bg` | `--mx-tabs-tab-pill-hover-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `tabs.tab.pressed.bg` | `--mx-tabs-tab-pressed-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `tabs.tab.pressed.color` | `--mx-tabs-tab-pressed-color` | `color.fg.primary` | `#1d1c1a` |
| `tabs.tab.pill-pressed.bg` | `--mx-tabs-tab-pill-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `tabs.tab.selected.color` | `--mx-tabs-tab-selected-color` | `color.fg.primary` | `#1d1c1a` |
| `tabs.tab.pill-selected.bg` | `--mx-tabs-tab-pill-selected-bg` | `color.fill.control.default` | `#f5f4f0` |
| `tabs.tab.pill-selected.shadow` | `--mx-tabs-tab-pill-selected-shadow` | `` | `inset 0px calc(2px * -1) 0px 0px rgb(0 0 0 / 0.3)` |
| `tabs.tab.pill-selected.glow` | `--mx-tabs-tab-pill-selected-glow` | `` | `inset 0px 0px 0px 1px rgb(0 0 0 / 0.12)` |
| `tabs.tab.disabled.color` | `--mx-tabs-tab-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `tabs.tab.focus.glow` | `--mx-tabs-tab-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `tabs.tab.focus.outline-width` | `--mx-tabs-tab-focus-outline-width` | `focus.ring.width` | `2px` |
| `tabs.tab.focus.outline-color` | `--mx-tabs-tab-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `tabs.tab.focus.outline-offset` | `--mx-tabs-tab-focus-outline-offset` | `` | `calc(2px * -1)` |
| `tabs.tab.radius` | `--mx-tabs-tab-radius` | `` | `initial` |
| `tabs.icon.size` | `--mx-tabs-icon-size` | `icon.size.md` | `1rem` |
| `tabs.badge.height` | `--mx-tabs-badge-height` | `icon.size.md` | `1rem` |
| `tabs.badge.min-width` | `--mx-tabs-badge-min-width` | `icon.size.md` | `1rem` |
| `tabs.badge.padding-inline` | `--mx-tabs-badge-padding-inline` | `space.1` | `0.25rem` |
| `tabs.badge.bg` | `--mx-tabs-badge-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `tabs.badge.radius` | `--mx-tabs-badge-radius` | `radius.full` | `9999px` |
| `tabs.badge.color` | `--mx-tabs-badge-color` | `color.fg.primary` | `#1d1c1a` |
| `tabs.badge.font-size` | `--mx-tabs-badge-font-size` | `font.size.caption` | `0.75rem` |
| `tabs.badge.line-height` | `--mx-tabs-badge-line-height` | `` | `1` |
| `tabs.badge.pill-selected.bg` | `--mx-tabs-badge-pill-selected-bg` | `color.accent.solid` | `#c24523` |
| `tabs.badge.pill-selected.color` | `--mx-tabs-badge-pill-selected-color` | `color.accent.on-solid` | `#ffffff` |
| `tabs.close.size` | `--mx-tabs-close-size` | `icon.size.md` | `1rem` |
| `tabs.close.radius` | `--mx-tabs-close-radius` | `radius.sm` | `0.25rem` |
| `tabs.close.color` | `--mx-tabs-close-color` | `color.fg.secondary` | `#5e5c55` |
| `tabs.close.hover.bg` | `--mx-tabs-close-hover-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `tabs.close.hover.color` | `--mx-tabs-close-hover-color` | `color.fg.primary` | `#1d1c1a` |
| `tabs.close.pressed.bg` | `--mx-tabs-close-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `tabs.close.pressed.color` | `--mx-tabs-close-pressed-color` | `color.fg.primary` | `#1d1c1a` |
| `tabs.close.disabled.color` | `--mx-tabs-close-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `tabs.close.disabled.bg` | `--mx-tabs-close-disabled-bg` | `` | `initial` |
| `tabs.close-icon.size` | `--mx-tabs-close-icon-size` | `icon.size.sm` | `0.75rem` |
| `tabs.close-icon.icon` | `--mx-tabs-close-icon-icon` | `` | `var(--mx-icon-dismiss)` |
| `tabs.indicator.height` | `--mx-tabs-indicator-height` | `border.width.2` | `2px` |
| `tabs.indicator.radius` | `--mx-tabs-indicator-radius` | `radius.full` | `9999px` |
| `tabs.indicator.radius-bottom` | `--mx-tabs-indicator-radius-bottom` | `radius.full` | `9999px` |
| `tabs.indicator.vertical.width` | `--mx-tabs-indicator-vertical-width` | `border.width.2` | `2px` |
| `tabs.indicator.vertical.height` | `--mx-tabs-indicator-vertical-height` | `` | `auto` |
| `tabs.indicator.selected.bg` | `--mx-tabs-indicator-selected-bg` | `color.accent.solid` | `#c24523` |
| `tabs.indicator.selected-disabled.bg` | `--mx-tabs-indicator-selected-disabled-bg` | `color.fg.disabled` | `#a2a098` |
| `tabs.panel.padding` | `--mx-tabs-panel-padding` | `space.4` | `1rem` |
| `tabs.panel.pill-across.padding-inline` | `--mx-tabs-panel-pill-across-padding-inline` | `` | `0px` |
| `tabs.panel.focus.glow` | `--mx-tabs-panel-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `tabs.panel.focus.outline-width` | `--mx-tabs-panel-focus-outline-width` | `focus.ring.width` | `2px` |
| `tabs.panel.focus.outline-color` | `--mx-tabs-panel-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `tabs.panel.focus.outline-offset` | `--mx-tabs-panel-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `tabs.panel.bg` | `--mx-tabs-panel-bg` | `` | `initial` |
| `tabs.panel.radius-bottom` | `--mx-tabs-panel-radius-bottom` | `` | `initial` |
| `tagbox.inset` | `--mx-tagbox-inset` | `space.1` | `0.25rem` |
| `tagbox.input-min-width` | `--mx-tagbox-input-min-width` | `` | `4rem` |
| `tagbox.tags.gap` | `--mx-tagbox-tags-gap` | `space.1` | `0.25rem` |
| `tagbox.tag.max-width` | `--mx-tagbox-tag-max-width` | `` | `12rem` |
| `tagbox.tag.padding-start` | `--mx-tagbox-tag-padding-start` | `space.2` | `0.5rem` |
| `tagbox.tag.padding-end` | `--mx-tagbox-tag-padding-end` | `space.1` | `0.25rem` |
| `tagbox.tag.gap` | `--mx-tagbox-tag-gap` | `space.1` | `0.25rem` |
| `tagbox.tag.font-size` | `--mx-tagbox-tag-font-size` | `font.size.caption` | `0.75rem` |
| `tagbox.tag.color` | `--mx-tagbox-tag-color` | `color.fg.primary` | `#1d1c1a` |
| `tagbox.tag.bg` | `--mx-tagbox-tag-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `tagbox.tag.border-width` | `--mx-tagbox-tag-border-width` | `border.width.1` | `1px` |
| `tagbox.tag.border-color` | `--mx-tagbox-tag-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `tagbox.tag.radius` | `--mx-tagbox-tag-radius` | `radius.full` | `9999px` |
| `tagbox.tag.more.padding-inline` | `--mx-tagbox-tag-more-padding-inline` | `space.2` | `0.5rem` |
| `tagbox.tag.more.color` | `--mx-tagbox-tag-more-color` | `color.fg.secondary` | `#5e5c55` |
| `tagbox.tag.loading.color` | `--mx-tagbox-tag-loading-color` | `color.fg.secondary` | `#5e5c55` |
| `tagbox.tag.focus.outline-width` | `--mx-tagbox-tag-focus-outline-width` | `focus.ring.width` | `2px` |
| `tagbox.tag.focus.outline-color` | `--mx-tagbox-tag-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `tagbox.tag.focus.outline-offset` | `--mx-tagbox-tag-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `tagbox.tag.focus.glow` | `--mx-tagbox-tag-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `tagbox.tag.hover.bg` | `--mx-tagbox-tag-hover-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `tagbox.tag.disabled.color` | `--mx-tagbox-tag-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `tagbox.tag.disabled.border-color` | `--mx-tagbox-tag-disabled-border-color` | `` | `initial` |
| `tagbox.remove.size` | `--mx-tagbox-remove-size` | `icon.size.md` | `1rem` |
| `tagbox.remove.color` | `--mx-tagbox-remove-color` | `color.fg.secondary` | `#5e5c55` |
| `tagbox.remove.radius` | `--mx-tagbox-remove-radius` | `radius.full` | `9999px` |
| `tagbox.remove.hover.color` | `--mx-tagbox-remove-hover-color` | `color.fg.primary` | `#1d1c1a` |
| `tagbox.remove.hover.bg` | `--mx-tagbox-remove-hover-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `tagbox.remove-glyph.size` | `--mx-tagbox-remove-glyph-size` | `icon.size.sm` | `0.75rem` |
| `tagbox.remove-glyph.icon` | `--mx-tagbox-remove-glyph-icon` | `` | `var(--mx-icon-dismiss)` |
| `tagbox.arrow-glyph.icon` | `--mx-tagbox-arrow-glyph-icon` | `` | `var(--mx-icon-chevron-down)` |
| `tagbox.arrow-glyph.open.rotate` | `--mx-tagbox-arrow-glyph-open-rotate` | `` | `0.5turn` |
| `text-area.line-height.sm` | `--mx-text-area-line-height-sm` | `font.line.caption` | `1rem` |
| `text-area.line-height.md` | `--mx-text-area-line-height-md` | `font.line.body` | `1.25rem` |
| `text-area.line-height.lg` | `--mx-text-area-line-height-lg` | `font.line.body-large` | `1.5rem` |
| `text-box.reveal.shown.color` | `--mx-text-box-reveal-shown-color` | `color.fg.primary` | `#1d1c1a` |
| `text-box.reveal-glyph.icon` | `--mx-text-box-reveal-glyph-icon` | `` | `var(--mx-icon-eye-open)` |
| `text-box.reveal-glyph.shown.icon` | `--mx-text-box-reveal-glyph-shown-icon` | `` | `var(--mx-icon-eye-closed)` |
| `tile-view.gap` | `--mx-tile-view-gap` | `space.3` | `0.75rem` |
| `tile-view.tile.radius` | `--mx-tile-view-tile-radius` | `radius.md` | `0.375rem` |
| `tile-view.tile.bg` | `--mx-tile-view-tile-bg` | `color.bg.card` | `#f5f4f0` |
| `tile-view.tile.color` | `--mx-tile-view-tile-color` | `color.fg.primary` | `#1d1c1a` |
| `tile-view.tile.padding` | `--mx-tile-view-tile-padding` | `space.3` | `0.75rem` |
| `tile-view.tile.hover.bg` | `--mx-tile-view-tile-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `tile-view.tile.hover.cursor` | `--mx-tile-view-tile-hover-cursor` | `` | `pointer` |
| `tile-view.tile.pressed.bg` | `--mx-tile-view-tile-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `tile-view.tile.focus.glow` | `--mx-tile-view-tile-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `tile-view.tile.focus.outline-width` | `--mx-tile-view-tile-focus-outline-width` | `focus.ring.width` | `2px` |
| `tile-view.tile.focus.outline-color` | `--mx-tile-view-tile-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `tile-view.tile.focus.outline-offset` | `--mx-tile-view-tile-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `tile-view.tile.selected.bg` | `--mx-tile-view-tile-selected-bg` | `color.accent.subtle` | `#fbe6de` |
| `tile-view.tile.selected.border-color` | `--mx-tile-view-tile-selected-border-color` | `color.accent.solid` | `#c24523` |
| `tile-view.tile.selected.color` | `--mx-tile-view-tile-selected-color` | `color.accent.fg` | `#983318` |
| `tile-view.tile.disabled.color` | `--mx-tile-view-tile-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `tile-view.tile.disabled.cursor` | `--mx-tile-view-tile-disabled-cursor` | `` | `default` |
| `tile-view.tile.dragging.opacity` | `--mx-tile-view-tile-dragging-opacity` | `` | `0.4` |
| `tile-view.tile.target.outline-width` | `--mx-tile-view-tile-target-outline-width` | `border.width.2` | `2px` |
| `tile-view.tile.target.outline-color` | `--mx-tile-view-tile-target-outline-color` | `color.accent.solid` | `#c24523` |
| `tile-view.tile.target.outline-offset` | `--mx-tile-view-tile-target-outline-offset` | `` | `-2px` |
| `tile-view.tile.border-width` | `--mx-tile-view-tile-border-width` | `border.width.1` | `1px` |
| `tile-view.tile.border-color` | `--mx-tile-view-tile-border-color` | `color.stroke.card` | `rgb(0 0 0 / 0.08)` |
| `tile-view.tile.shadow` | `--mx-tile-view-tile-shadow` | `` | `initial` |
| `tile-view.ghost.radius` | `--mx-tile-view-ghost-radius` | `radius.md` | `0.375rem` |
| `tile-view.ghost.shadow` | `--mx-tile-view-ghost-shadow` | `elevation.popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `tile-view.ghost.opacity` | `--mx-tile-view-ghost-opacity` | `` | `0.9` |
| `timeline.gap` | `--mx-timeline-gap` | `space.4` | `1rem` |
| `timeline.dot-gap` | `--mx-timeline-dot-gap` | `space.3` | `0.75rem` |
| `timeline.track-gap` | `--mx-timeline-track-gap` | `space.6` | `1.5rem` |
| `timeline.row-gap` | `--mx-timeline-row-gap` | `space.3` | `0.75rem` |
| `timeline.mark-size` | `--mx-timeline-mark-size` | `` | `1.25rem` |
| `timeline.line-thickness` | `--mx-timeline-line-thickness` | `border.width.2` | `2px` |
| `timeline.line.bg` | `--mx-timeline-line-bg` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `timeline.dot.radius` | `--mx-timeline-dot-radius` | `radius.full` | `9999px` |
| `timeline.dot.bg` | `--mx-timeline-dot-bg` | `color.fill.control.default` | `#f5f4f0` |
| `timeline.dot.border-width` | `--mx-timeline-dot-border-width` | `border.width.2` | `2px` |
| `timeline.dot.border-color` | `--mx-timeline-dot-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `timeline.dot.accent.bg` | `--mx-timeline-dot-accent-bg` | `color.accent.solid` | `#c24523` |
| `timeline.dot.accent.border-color` | `--mx-timeline-dot-accent-border-color` | `color.accent.solid` | `#c24523` |
| `timeline.dot.success.bg` | `--mx-timeline-dot-success-bg` | `color.success.solid` | `#006402` |
| `timeline.dot.success.border-color` | `--mx-timeline-dot-success-border-color` | `color.success.solid` | `#006402` |
| `timeline.dot.caution.bg` | `--mx-timeline-dot-caution-bg` | `color.caution.solid` | `#754702` |
| `timeline.dot.caution.border-color` | `--mx-timeline-dot-caution-border-color` | `color.caution.solid` | `#754702` |
| `timeline.dot.danger.bg` | `--mx-timeline-dot-danger-bg` | `color.danger.solid` | `#b03659` |
| `timeline.dot.danger.border-color` | `--mx-timeline-dot-danger-border-color` | `color.danger.solid` | `#b03659` |
| `timeline.dot.info.bg` | `--mx-timeline-dot-info-bg` | `color.info.solid` | `#5e5c55` |
| `timeline.dot.info.border-color` | `--mx-timeline-dot-info-border-color` | `color.info.solid` | `#5e5c55` |
| `timeline.dot-glyph.size` | `--mx-timeline-dot-glyph-size` | `` | `0.625rem` |
| `timeline.dot-glyph.bg` | `--mx-timeline-dot-glyph-bg` | `color.fg.secondary` | `#5e5c55` |
| `timeline.dot-glyph.accent.bg` | `--mx-timeline-dot-glyph-accent-bg` | `color.accent.on-solid` | `#ffffff` |
| `timeline.dot-glyph.success.bg` | `--mx-timeline-dot-glyph-success-bg` | `color.success.on-solid` | `#ffffff` |
| `timeline.dot-glyph.caution.bg` | `--mx-timeline-dot-glyph-caution-bg` | `color.caution.on-solid` | `#ffffff` |
| `timeline.dot-glyph.danger.bg` | `--mx-timeline-dot-glyph-danger-bg` | `color.danger.on-solid` | `#ffffff` |
| `timeline.dot-glyph.info.bg` | `--mx-timeline-dot-glyph-info-bg` | `color.info.on-solid` | `#e1e0da` |
| `timeline.card.radius` | `--mx-timeline-card-radius` | `radius.md` | `0.375rem` |
| `timeline.card.bg` | `--mx-timeline-card-bg` | `color.bg.card` | `#f5f4f0` |
| `timeline.card.color` | `--mx-timeline-card-color` | `color.fg.primary` | `#1d1c1a` |
| `timeline.card.padding` | `--mx-timeline-card-padding` | `space.3` | `0.75rem` |
| `timeline.card.gap` | `--mx-timeline-card-gap` | `space.1` | `0.25rem` |
| `timeline.card.pressable.cursor` | `--mx-timeline-card-pressable-cursor` | `` | `pointer` |
| `timeline.card.hover.bg` | `--mx-timeline-card-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `timeline.card.pressed.bg` | `--mx-timeline-card-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `timeline.card.focus.glow` | `--mx-timeline-card-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `timeline.card.focus.outline-width` | `--mx-timeline-card-focus-outline-width` | `focus.ring.width` | `2px` |
| `timeline.card.focus.outline-color` | `--mx-timeline-card-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `timeline.card.focus.outline-offset` | `--mx-timeline-card-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `timeline.card.border-width` | `--mx-timeline-card-border-width` | `border.width.1` | `1px` |
| `timeline.card.border-color` | `--mx-timeline-card-border-color` | `color.stroke.card` | `rgb(0 0 0 / 0.08)` |
| `timeline.card.shadow` | `--mx-timeline-card-shadow` | `` | `initial` |
| `timeline.flag.radius` | `--mx-timeline-flag-radius` | `radius.md` | `0.375rem` |
| `timeline.flag.padding` | `--mx-timeline-flag-padding` | `space.2` | `0.5rem` |
| `timeline.flag.gap` | `--mx-timeline-flag-gap` | `space.1` | `0.25rem` |
| `timeline.flag.color` | `--mx-timeline-flag-color` | `color.fg.secondary` | `#5e5c55` |
| `timeline.flag.hover.bg` | `--mx-timeline-flag-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `timeline.flag.hover.cursor` | `--mx-timeline-flag-hover-cursor` | `` | `pointer` |
| `timeline.flag.pressed.bg` | `--mx-timeline-flag-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `timeline.flag.focus.glow` | `--mx-timeline-flag-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `timeline.flag.focus.outline-width` | `--mx-timeline-flag-focus-outline-width` | `focus.ring.width` | `2px` |
| `timeline.flag.focus.outline-color` | `--mx-timeline-flag-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `timeline.flag.focus.outline-offset` | `--mx-timeline-flag-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `timeline.flag.selected.color` | `--mx-timeline-flag-selected-color` | `color.accent.fg` | `#983318` |
| `timeline.date.color` | `--mx-timeline-date-color` | `color.fg.secondary` | `#5e5c55` |
| `timeline.date.font-size` | `--mx-timeline-date-font-size` | `font.size.caption` | `0.75rem` |
| `timeline.date.selected.color` | `--mx-timeline-date-selected-color` | `color.accent.fg` | `#983318` |
| `timeline.date.selected.font-weight` | `--mx-timeline-date-selected-font-weight` | `font.weight.semibold` | `600` |
| `timeline.title.font-weight` | `--mx-timeline-title-font-weight` | `font.weight.semibold` | `600` |
| `timeline.description.color` | `--mx-timeline-description-color` | `color.fg.secondary` | `#5e5c55` |
| `timeline.detail.radius` | `--mx-timeline-detail-radius` | `radius.md` | `0.375rem` |
| `timeline.detail.bg` | `--mx-timeline-detail-bg` | `color.bg.card` | `#f5f4f0` |
| `timeline.detail.color` | `--mx-timeline-detail-color` | `color.fg.primary` | `#1d1c1a` |
| `timeline.detail.padding` | `--mx-timeline-detail-padding` | `space.3` | `0.75rem` |
| `timeline.detail.gap` | `--mx-timeline-detail-gap` | `space.1` | `0.25rem` |
| `timeline.detail.border-width` | `--mx-timeline-detail-border-width` | `border.width.1` | `1px` |
| `timeline.detail.border-color` | `--mx-timeline-detail-border-color` | `color.stroke.card` | `rgb(0 0 0 / 0.08)` |
| `timeline.detail.shadow` | `--mx-timeline-detail-shadow` | `` | `initial` |
| `timeline.nav.size` | `--mx-timeline-nav-size` | `` | `2rem` |
| `timeline.nav.radius` | `--mx-timeline-nav-radius` | `radius.full` | `9999px` |
| `timeline.nav.bg` | `--mx-timeline-nav-bg` | `color.fill.control.default` | `#f5f4f0` |
| `timeline.nav.color` | `--mx-timeline-nav-color` | `color.fg.primary` | `#1d1c1a` |
| `timeline.nav.hover.bg` | `--mx-timeline-nav-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `timeline.nav.hover.cursor` | `--mx-timeline-nav-hover-cursor` | `` | `pointer` |
| `timeline.nav.pressed.bg` | `--mx-timeline-nav-pressed-bg` | `color.fill.control.tertiary` | `#e1e0da` |
| `timeline.nav.focus.glow` | `--mx-timeline-nav-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `timeline.nav.focus.outline-width` | `--mx-timeline-nav-focus-outline-width` | `focus.ring.width` | `2px` |
| `timeline.nav.focus.outline-color` | `--mx-timeline-nav-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `timeline.nav.focus.outline-offset` | `--mx-timeline-nav-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `timeline.nav.disabled.opacity` | `--mx-timeline-nav-disabled-opacity` | `opacity.disabled` | `0.5` |
| `timeline.nav-glyph.size` | `--mx-timeline-nav-glyph-size` | `` | `1rem` |
| `timeline.nav-glyph.bg` | `--mx-timeline-nav-glyph-bg` | `color.fg.primary` | `#1d1c1a` |
| `toast.width` | `--mx-toast-width` | `` | `22rem` |
| `toast.inset` | `--mx-toast-inset` | `space.4` | `1rem` |
| `toast.buttons-align` | `--mx-toast-buttons-align` | `` | `center` |
| `toast.slide` | `--mx-toast-slide` | `space.6` | `1.5rem` |
| `toast.slide-inline` | `--mx-toast-slide-inline` | `` | `0px` |
| `toast.action.variant` | `--mx-toast-action-variant` | `` | `outline` |
| `toast.action.size` | `--mx-toast-action-size` | `` | `sm` |
| `toast.action.face.bg` | `--mx-toast-action-face-bg` | `color.fill.control.default` | `#f5f4f0` |
| `toast.action.face.hover.bg` | `--mx-toast-action-face-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `toast.action.face.hover.color` | `--mx-toast-action-face-hover-color` | `` | `initial` |
| `toast.action.face.hover.image` | `--mx-toast-action-face-hover-image` | `` | `initial` |
| `toast.action.face.pressed.bg` | `--mx-toast-action-face-pressed-bg` | `color.fill.control.tertiary` | `#e1e0da` |
| `toast.action.face.pressed.color` | `--mx-toast-action-face-pressed-color` | `color.fg.primary` | `#1d1c1a` |
| `toast.action.face.pressed.image` | `--mx-toast-action-face-pressed-image` | `` | `initial` |
| `toast.action.face.color` | `--mx-toast-action-face-color` | `color.fg.primary` | `#1d1c1a` |
| `toast.action.face.outline.color` | `--mx-toast-action-face-outline-color` | `color.fg.primary` | `#1d1c1a` |
| `toast.action.face.outline.border-color` | `--mx-toast-action-face-outline-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `toast.action.face.ghost.color` | `--mx-toast-action-face-ghost-color` | `color.fg.primary` | `#1d1c1a` |
| `toast.action.face.outline-hover.color` | `--mx-toast-action-face-outline-hover-color` | `` | `initial` |
| `toast.action.face.outline-hover.bg` | `--mx-toast-action-face-outline-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `toast.action.face.ghost-hover.color` | `--mx-toast-action-face-ghost-hover-color` | `` | `initial` |
| `toast.action.face.ghost-hover.bg` | `--mx-toast-action-face-ghost-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `toast.action.face.outline-pressed.color` | `--mx-toast-action-face-outline-pressed-color` | `` | `initial` |
| `toast.action.face.outline-pressed.bg` | `--mx-toast-action-face-outline-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `toast.action.face.ghost-pressed.color` | `--mx-toast-action-face-ghost-pressed-color` | `` | `initial` |
| `toast.action.face.ghost-pressed.bg` | `--mx-toast-action-face-ghost-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `toast.action.face.focus.image` | `--mx-toast-action-face-focus-image` | `` | `initial` |
| `toast.close.variant` | `--mx-toast-close-variant` | `` | `ghost` |
| `toast.close.size` | `--mx-toast-close-size` | `` | `sm` |
| `toast.close.face.bg` | `--mx-toast-close-face-bg` | `color.fill.control.default` | `#f5f4f0` |
| `toast.close.face.hover.bg` | `--mx-toast-close-face-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `toast.close.face.hover.color` | `--mx-toast-close-face-hover-color` | `` | `initial` |
| `toast.close.face.hover.image` | `--mx-toast-close-face-hover-image` | `` | `initial` |
| `toast.close.face.pressed.bg` | `--mx-toast-close-face-pressed-bg` | `color.fill.control.tertiary` | `#e1e0da` |
| `toast.close.face.pressed.color` | `--mx-toast-close-face-pressed-color` | `color.fg.primary` | `#1d1c1a` |
| `toast.close.face.pressed.image` | `--mx-toast-close-face-pressed-image` | `` | `initial` |
| `toast.close.face.color` | `--mx-toast-close-face-color` | `color.fg.primary` | `#1d1c1a` |
| `toast.close.face.outline.color` | `--mx-toast-close-face-outline-color` | `color.fg.primary` | `#1d1c1a` |
| `toast.close.face.outline.border-color` | `--mx-toast-close-face-outline-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `toast.close.face.ghost.color` | `--mx-toast-close-face-ghost-color` | `color.fg.primary` | `#1d1c1a` |
| `toast.close.face.outline-hover.color` | `--mx-toast-close-face-outline-hover-color` | `` | `initial` |
| `toast.close.face.outline-hover.bg` | `--mx-toast-close-face-outline-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `toast.close.face.ghost-hover.color` | `--mx-toast-close-face-ghost-hover-color` | `` | `initial` |
| `toast.close.face.ghost-hover.bg` | `--mx-toast-close-face-ghost-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `toast.close.face.outline-pressed.color` | `--mx-toast-close-face-outline-pressed-color` | `` | `initial` |
| `toast.close.face.outline-pressed.bg` | `--mx-toast-close-face-outline-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `toast.close.face.ghost-pressed.color` | `--mx-toast-close-face-ghost-pressed-color` | `` | `initial` |
| `toast.close.face.ghost-pressed.bg` | `--mx-toast-close-face-ghost-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `toast.close.face.focus.image` | `--mx-toast-close-face-focus-image` | `` | `initial` |
| `toast.stack.gap` | `--mx-toast-stack-gap` | `space.2` | `0.5rem` |
| `toast.surface.padding` | `--mx-toast-surface-padding` | `space.3` | `0.75rem` |
| `toast.surface.gap` | `--mx-toast-surface-gap` | `space.3` | `0.75rem` |
| `toast.surface.bg` | `--mx-toast-surface-bg` | `color.bg.surface` | `#f8f7f3` |
| `toast.surface.border-width` | `--mx-toast-surface-border-width` | `border.width.1` | `1px` |
| `toast.surface.border-color` | `--mx-toast-surface-border-color` | `color.stroke.surface` | `rgb(117 117 117 / 0.4)` |
| `toast.surface.radius` | `--mx-toast-surface-radius` | `radius.lg` | `0.625rem` |
| `toast.surface.shadow` | `--mx-toast-surface-shadow` | `elevation.toast` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `toast.surface.color` | `--mx-toast-surface-color` | `color.fg.primary` | `#1d1c1a` |
| `toast.surface.font-size` | `--mx-toast-surface-font-size` | `font.size.body` | `0.875rem` |
| `toast.surface.line-height` | `--mx-toast-surface-line-height` | `font.line.body` | `1.25rem` |
| `toast.surface.focus.outline-width` | `--mx-toast-surface-focus-outline-width` | `focus.ring.width` | `2px` |
| `toast.surface.focus.outline-color` | `--mx-toast-surface-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `toast.surface.focus.outline-offset` | `--mx-toast-surface-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `toast.surface.success.bg` | `--mx-toast-surface-success-bg` | `` | `initial` |
| `toast.surface.caution.bg` | `--mx-toast-surface-caution-bg` | `` | `initial` |
| `toast.surface.danger.bg` | `--mx-toast-surface-danger-bg` | `` | `initial` |
| `toast.icon.size` | `--mx-toast-icon-size` | `icon.size.md` | `1rem` |
| `toast.icon.color` | `--mx-toast-icon-color` | `color.fg.secondary` | `#5e5c55` |
| `toast.icon.success.color` | `--mx-toast-icon-success-color` | `color.success.fg` | `#006402` |
| `toast.icon.caution.color` | `--mx-toast-icon-caution-color` | `color.caution.fg` | `#754702` |
| `toast.icon.danger.color` | `--mx-toast-icon-danger-color` | `color.danger.fg` | `#b03659` |
| `toast.mark.icon` | `--mx-toast-mark-icon` | `` | `var(--mx-icon-info)` |
| `toast.mark.success.icon` | `--mx-toast-mark-success-icon` | `` | `var(--mx-icon-success)` |
| `toast.mark.caution.icon` | `--mx-toast-mark-caution-icon` | `` | `var(--mx-icon-caution)` |
| `toast.mark.danger.icon` | `--mx-toast-mark-danger-icon` | `` | `var(--mx-icon-danger)` |
| `toast.title.color` | `--mx-toast-title-color` | `color.fg.primary` | `#1d1c1a` |
| `toast.title.font-size` | `--mx-toast-title-font-size` | `font.size.body` | `0.875rem` |
| `toast.title.font-weight` | `--mx-toast-title-font-weight` | `font.weight.semibold` | `600` |
| `toast.message.color` | `--mx-toast-message-color` | `color.fg.primary` | `#1d1c1a` |
| `toolbar.height` | `--mx-toolbar-height` | `bar.height` | `2.25rem` |
| `toolbar.button.variant` | `--mx-toolbar-button-variant` | `` | `ghost` |
| `toolbar.button.size` | `--mx-toolbar-button-size` | `` | `md` |
| `toolbar.button.face.toggled.bg` | `--mx-toolbar-button-face-toggled-bg` | `color.fill.control.tertiary` | `#e1e0da` |
| `toolbar.button.face.toggled.color` | `--mx-toolbar-button-face-toggled-color` | `` | `initial` |
| `toolbar.button.face.toggled-hover.bg` | `--mx-toolbar-button-face-toggled-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `toolbar.button.face.outline-toggled.bg` | `--mx-toolbar-button-face-outline-toggled-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `toolbar.button.face.outline-toggled.color` | `--mx-toolbar-button-face-outline-toggled-color` | `` | `initial` |
| `toolbar.button.face.ghost-toggled.bg` | `--mx-toolbar-button-face-ghost-toggled-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `toolbar.button.face.ghost-toggled.color` | `--mx-toolbar-button-face-ghost-toggled-color` | `` | `initial` |
| `toolbar.button.face.outline-toggled-hover.bg` | `--mx-toolbar-button-face-outline-toggled-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `toolbar.button.face.outline-toggled-hover.color` | `--mx-toolbar-button-face-outline-toggled-hover-color` | `` | `initial` |
| `toolbar.button.face.ghost-toggled-hover.bg` | `--mx-toolbar-button-face-ghost-toggled-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `toolbar.button.face.ghost-toggled-hover.color` | `--mx-toolbar-button-face-ghost-toggled-hover-color` | `` | `initial` |
| `toolbar.more.chevron.display` | `--mx-toolbar-more-chevron-display` | `` | `none` |
| `toolbar.bar.padding` | `--mx-toolbar-bar-padding` | `space.1` | `0.25rem` |
| `toolbar.bar.gap` | `--mx-toolbar-bar-gap` | `space.1` | `0.25rem` |
| `toolbar.bar.bg` | `--mx-toolbar-bar-bg` | `color.bg.bar` | `#ebeae5` |
| `toolbar.bar.radius` | `--mx-toolbar-bar-radius` | `radius.md` | `0.375rem` |
| `toolbar.bar.padding-block` | `--mx-toolbar-bar-padding-block` | `` | `initial` |
| `toolbar.bar.padding-inline` | `--mx-toolbar-bar-padding-inline` | `` | `initial` |
| `toolbar.separator.width` | `--mx-toolbar-separator-width` | `border.width.1` | `1px` |
| `toolbar.separator.margin-block` | `--mx-toolbar-separator-margin-block` | `space.1` | `0.25rem` |
| `toolbar.separator.bg` | `--mx-toolbar-separator-bg` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `toolbar.separator.vertical.width` | `--mx-toolbar-separator-vertical-width` | `` | `auto` |
| `toolbar.separator.vertical.height` | `--mx-toolbar-separator-vertical-height` | `border.width.1` | `1px` |
| `toolbar.separator.vertical.margin-block` | `--mx-toolbar-separator-vertical-margin-block` | `` | `0px` |
| `toolbar.separator.vertical.margin-inline` | `--mx-toolbar-separator-vertical-margin-inline` | `space.1` | `0.25rem` |
| `tooltip.offset` | `--mx-tooltip-offset` | `space.1` | `0.25rem` |
| `tooltip.enter-offset` | `--mx-tooltip-enter-offset` | `` | `0px` |
| `tooltip.text-align` | `--mx-tooltip-text-align` | `` | `start` |
| `tooltip.surface.max-width` | `--mx-tooltip-surface-max-width` | `` | `20rem` |
| `tooltip.surface.padding-block` | `--mx-tooltip-surface-padding-block` | `space.1` | `0.25rem` |
| `tooltip.surface.padding-inline` | `--mx-tooltip-surface-padding-inline` | `space.2` | `0.5rem` |
| `tooltip.surface.bg` | `--mx-tooltip-surface-bg` | `color.bg.surface` | `#f8f7f3` |
| `tooltip.surface.border-width` | `--mx-tooltip-surface-border-width` | `border.width.1` | `1px` |
| `tooltip.surface.border-color` | `--mx-tooltip-surface-border-color` | `color.stroke.surface` | `rgb(117 117 117 / 0.4)` |
| `tooltip.surface.radius` | `--mx-tooltip-surface-radius` | `radius.md` | `0.375rem` |
| `tooltip.surface.shadow` | `--mx-tooltip-surface-shadow` | `elevation.tooltip` | `0px 4px 8px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `tooltip.surface.color` | `--mx-tooltip-surface-color` | `color.fg.primary` | `#1d1c1a` |
| `tooltip.surface.font-size` | `--mx-tooltip-surface-font-size` | `font.size.caption` | `0.75rem` |
| `tooltip.surface.font-weight` | `--mx-tooltip-surface-font-weight` | `font.weight.regular` | `400` |
| `tooltip.surface.line-height` | `--mx-tooltip-surface-line-height` | `font.line.caption` | `1rem` |
| `treeview.line-height.sm` | `--mx-treeview-line-height-sm` | `font.line.caption` | `1rem` |
| `treeview.line-height.md` | `--mx-treeview-line-height-md` | `font.line.body` | `1.25rem` |
| `treeview.line-height.lg` | `--mx-treeview-line-height-lg` | `font.line.body-large` | `1.5rem` |
| `treeview.row-height.sm` | `--mx-treeview-row-height-sm` | `control.height.sm` | `1.5rem` |
| `treeview.row-height.md` | `--mx-treeview-row-height-md` | `control.height.md` | `2rem` |
| `treeview.row-height.lg` | `--mx-treeview-row-height-lg` | `control.height.lg` | `2.5rem` |
| `treeview.padding.sm` | `--mx-treeview-padding-sm` | `control.padding.sm` | `0.5rem` |
| `treeview.padding.md` | `--mx-treeview-padding-md` | `control.padding.md` | `0.6875rem` |
| `treeview.padding.lg` | `--mx-treeview-padding-lg` | `control.padding.lg` | `1rem` |
| `treeview.font-size.sm` | `--mx-treeview-font-size-sm` | `font.size.caption` | `0.75rem` |
| `treeview.font-size.md` | `--mx-treeview-font-size-md` | `font.size.body` | `0.875rem` |
| `treeview.font-size.lg` | `--mx-treeview-font-size-lg` | `font.size.body-large` | `1.125rem` |
| `treeview.indent.sm` | `--mx-treeview-indent-sm` | `space.4` | `1rem` |
| `treeview.indent.md` | `--mx-treeview-indent-md` | `space.5` | `1.25rem` |
| `treeview.indent.lg` | `--mx-treeview-indent-lg` | `space.6` | `1.5rem` |
| `treeview.row-spacing` | `--mx-treeview-row-spacing` | `` | `0px` |
| `treeview.line-width` | `--mx-treeview-line-width` | `border.width.1` | `1px` |
| `treeview.line-color` | `--mx-treeview-line-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `treeview.elbow-length` | `--mx-treeview-elbow-length` | `` | `0px` |
| `treeview.elbow-color` | `--mx-treeview-elbow-color` | `` | `rgb(0 0 0 / 0)` |
| `treeview.expander-plate` | `--mx-treeview-expander-plate` | `icon.size.md` | `1rem` |
| `treeview.expander-rotate-open` | `--mx-treeview-expander-rotate-open` | `` | `90deg` |
| `treeview.spinner-duration` | `--mx-treeview-spinner-duration` | `` | `750ms` |
| `treeview.search.variant` | `--mx-treeview-search-variant` | `` | `outline` |
| `treeview.search.label-mode` | `--mx-treeview-search-label-mode` | `` | `hidden` |
| `treeview.search.size` | `--mx-treeview-search-size` | `` | `sm` |
| `treeview.container.gap` | `--mx-treeview-container-gap` | `space.2` | `0.5rem` |
| `treeview.container.color` | `--mx-treeview-container-color` | `color.fg.primary` | `#1d1c1a` |
| `treeview.empty.color` | `--mx-treeview-empty-color` | `color.fg.secondary` | `#5e5c55` |
| `treeview.row.gap` | `--mx-treeview-row-gap` | `space.1` | `0.25rem` |
| `treeview.row.radius` | `--mx-treeview-row-radius` | `item.radius` | `0.25rem` |
| `treeview.row.hover.bg` | `--mx-treeview-row-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `treeview.row.pressed.bg` | `--mx-treeview-row-pressed-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `treeview.row.selected.bg` | `--mx-treeview-row-selected-bg` | `color.selection.bg` | `#f5f4f0` |
| `treeview.row.selected.shadow` | `--mx-treeview-row-selected-shadow` | `effect.selection` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0px 1px 0px 0px rgb(0 0 0 / 0.3)` |
| `treeview.row.selected.glow` | `--mx-treeview-row-selected-glow` | `` | `inset 0px 0px 0px 1px rgb(0 0 0 / 0.12)` |
| `treeview.row.selected.color` | `--mx-treeview-row-selected-color` | `color.selection.fg` | `#1d1c1a` |
| `treeview.row.selected-hover.bg` | `--mx-treeview-row-selected-hover-bg` | `color.selection.bg` | `#f5f4f0` |
| `treeview.row.focus.glow` | `--mx-treeview-row-focus-glow` | `focus.ring.halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` |
| `treeview.row.focus.outline-width` | `--mx-treeview-row-focus-outline-width` | `focus.ring.width` | `2px` |
| `treeview.row.focus.outline-color` | `--mx-treeview-row-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `treeview.row.focus.outline-offset` | `--mx-treeview-row-focus-outline-offset` | `` | `calc(2px * -1)` |
| `treeview.row.disabled.color` | `--mx-treeview-row-disabled-color` | `color.fg.disabled` | `#a2a098` |
| `treeview.indicator.width` | `--mx-treeview-indicator-width` | `indicator.thickness` | `0px` |
| `treeview.indicator.height` | `--mx-treeview-indicator-height` | `indicator.length` | `0rem` |
| `treeview.indicator.margin-end` | `--mx-treeview-indicator-margin-end` | `` | `auto` |
| `treeview.indicator.bg` | `--mx-treeview-indicator-bg` | `color.selection.indicator` | `rgb(0 0 0 / 0)` |
| `treeview.indicator.radius` | `--mx-treeview-indicator-radius` | `indicator.radius` | `0px` |
| `treeview.expander.color` | `--mx-treeview-expander-color` | `color.fg.secondary` | `#5e5c55` |
| `treeview.expander-icon.icon` | `--mx-treeview-expander-icon-icon` | `` | `var(--mx-icon-chevron-end)` |
| `treeview.spinner.size` | `--mx-treeview-spinner-size` | `icon.size.sm` | `0.75rem` |
| `treeview.spinner.border-width` | `--mx-treeview-spinner-border-width` | `border.width.2` | `2px` |
| `treeview.spinner.border-end-color` | `--mx-treeview-spinner-border-end-color` | `` | `rgb(0 0 0 / 0)` |
| `treeview.spinner.radius` | `--mx-treeview-spinner-radius` | `radius.full` | `9999px` |
| `treeview.check.size` | `--mx-treeview-check-size` | `icon.size.md` | `1rem` |
| `treeview.check.bg` | `--mx-treeview-check-bg` | `color.fill.control.default` | `#f5f4f0` |
| `treeview.check.border-width` | `--mx-treeview-check-border-width` | `border.width.1` | `1px` |
| `treeview.check.border-color` | `--mx-treeview-check-border-color` | `color.stroke.control.strong` | `rgb(0 0 0 / 0.4458)` |
| `treeview.check.radius` | `--mx-treeview-check-radius` | `radius.xs` | `0.25rem` |
| `treeview.check.shadow` | `--mx-treeview-check-shadow` | `` | `0px 1px 0px 0px rgb(0 0 0 / 0.3)` |
| `treeview.check.glow` | `--mx-treeview-check-glow` | `effect.control` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7)` |
| `treeview.check.color` | `--mx-treeview-check-color` | `color.accent.on-solid` | `#ffffff` |
| `treeview.check.hover.bg` | `--mx-treeview-check-hover-bg` | `color.fill.control.secondary` | `#ebeae5` |
| `treeview.check.checked.bg` | `--mx-treeview-check-checked-bg` | `color.accent.solid` | `#c24523` |
| `treeview.check.checked.border-color` | `--mx-treeview-check-checked-border-color` | `color.accent.solid` | `#c24523` |
| `treeview.check.checked.shadow` | `--mx-treeview-check-checked-shadow` | `` | `0px 1px 0px 0px rgb(0 0 0 / 0.4)` |
| `treeview.check.checked-hover.bg` | `--mx-treeview-check-checked-hover-bg` | `color.accent.solid-hover` | `#b43f20` |
| `treeview.check.disabled.bg` | `--mx-treeview-check-disabled-bg` | `color.fill.control.disabled` | `#ebeae5` |
| `treeview.check.disabled.border-color` | `--mx-treeview-check-disabled-border-color` | `color.stroke.control.default` | `rgb(0 0 0 / 0.12)` |
| `treeview.check.disabled.shadow` | `--mx-treeview-check-disabled-shadow` | `` | `0 0 #0000` |
| `treeview.check.disabled.glow` | `--mx-treeview-check-disabled-glow` | `` | `0 0 #0000` |
| `treeview.check.disabled.color` | `--mx-treeview-check-disabled-color` | `color.fg.on-accent-disabled` | `#ffffff` |
| `treeview.check.checked-disabled.bg` | `--mx-treeview-check-checked-disabled-bg` | `color.fill.accent-disabled` | `rgb(0 0 0 / 0.2169)` |
| `treeview.check.checked-disabled.border-color` | `--mx-treeview-check-checked-disabled-border-color` | `` | `rgb(0 0 0 / 0)` |
| `treeview.mark.size` | `--mx-treeview-mark-size` | `icon.size.sm` | `0.75rem` |
| `treeview.icon.size` | `--mx-treeview-icon-size` | `icon.size.md` | `1rem` |
| `treeview.error.gap` | `--mx-treeview-error-gap` | `space.1` | `0.25rem` |
| `treeview.error.color` | `--mx-treeview-error-color` | `color.danger.fg` | `#b03659` |
| `treeview.error.font-size` | `--mx-treeview-error-font-size` | `font.size.caption` | `0.75rem` |
| `treeview.retry.padding-inline` | `--mx-treeview-retry-padding-inline` | `space.1` | `0.25rem` |
| `treeview.retry.radius` | `--mx-treeview-retry-radius` | `radius.sm` | `0.25rem` |
| `treeview.retry.color` | `--mx-treeview-retry-color` | `color.accent.fg` | `#983318` |
| `treeview.retry.text-decoration` | `--mx-treeview-retry-text-decoration` | `` | `underline` |
| `validation-summary.gap` | `--mx-validation-summary-gap` | `space.2` | `0.5rem` |
| `validation-summary.line-gap` | `--mx-validation-summary-line-gap` | `space.1` | `0.25rem` |
| `validation-summary.box.bg` | `--mx-validation-summary-box-bg` | `color.danger.subtle` | `#fde7e9` |
| `validation-summary.box.border-width` | `--mx-validation-summary-box-border-width` | `border.width.1` | `1px` |
| `validation-summary.box.border-color` | `--mx-validation-summary-box-border-color` | `color.danger.solid` | `#b03659` |
| `validation-summary.box.radius` | `--mx-validation-summary-box-radius` | `radius.md` | `0.375rem` |
| `validation-summary.box.padding` | `--mx-validation-summary-box-padding` | `space.3` | `0.75rem` |
| `validation-summary.icon.icon` | `--mx-validation-summary-icon-icon` | `` | `var(--mx-icon-danger)` |
| `validation-summary.icon.size` | `--mx-validation-summary-icon-size` | `` | `1rem` |
| `validation-summary.icon.bg` | `--mx-validation-summary-icon-bg` | `color.danger.fg` | `#b03659` |
| `validation-summary.header.color` | `--mx-validation-summary-header-color` | `color.danger.fg` | `#b03659` |
| `validation-summary.header.font-weight` | `--mx-validation-summary-header-font-weight` | `font.weight.semibold` | `600` |
| `validation-summary.item.color` | `--mx-validation-summary-item-color` | `color.danger.fg` | `#b03659` |
| `validation-summary.item.radius` | `--mx-validation-summary-item-radius` | `radius.xs` | `0.25rem` |
| `validation-summary.item.hover.text-decoration` | `--mx-validation-summary-item-hover-text-decoration` | `` | `underline` |
| `validation-summary.item.hover.cursor` | `--mx-validation-summary-item-hover-cursor` | `` | `pointer` |
| `validation-summary.item.focus.glow` | `--mx-validation-summary-item-focus-glow` | `focus.ring.halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` |
| `validation-summary.item.focus.outline-width` | `--mx-validation-summary-item-focus-outline-width` | `focus.ring.width` | `2px` |
| `validation-summary.item.focus.outline-color` | `--mx-validation-summary-item-focus-outline-color` | `focus.ring.color` | `#1d1c1a` |
| `validation-summary.item.focus.outline-offset` | `--mx-validation-summary-item-focus-outline-offset` | `focus.ring.offset` | `1px` |
| `window.font-family` | `--mx-window-font-family` | `font.family.sans` | `Archivo, system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif` |
| `window.title-align` | `--mx-window-title-align` | `` | `start` |
| `window.min-width` | `--mx-window-min-width` | `` | `16rem` |
| `window.min-height` | `--mx-window-min-height` | `` | `6rem` |
| `window.viewport-margin` | `--mx-window-viewport-margin` | `space.4` | `1rem` |
| `window.resize-edge` | `--mx-window-resize-edge` | `space.2` | `0.5rem` |
| `window.enter-offset` | `--mx-window-enter-offset` | `space.4` | `1rem` |
| `window.message-width` | `--mx-window-message-width` | `` | `28rem` |
| `window.tools-order` | `--mx-window-tools-order` | `` | `0` |
| `window.bar-height` | `--mx-window-bar-height` | `bar.height` | `2.25rem` |
| `window.tool-button.variant` | `--mx-window-tool-button-variant` | `` | `ghost` |
| `window.tool-button.tone` | `--mx-window-tool-button-tone` | `` | `standard` |
| `window.tool-button.size` | `--mx-window-tool-button-size` | `` | `sm` |
| `window.close-button.variant` | `--mx-window-close-button-variant` | `` | `ghost` |
| `window.close-button.tone` | `--mx-window-close-button-tone` | `` | `standard` |
| `window.close-button.size` | `--mx-window-close-button-size` | `` | `sm` |
| `window.close-button.face.outline-hover.color` | `--mx-window-close-button-face-outline-hover-color` | `` | `initial` |
| `window.close-button.face.outline-hover.bg` | `--mx-window-close-button-face-outline-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `window.close-button.face.ghost-hover.color` | `--mx-window-close-button-face-ghost-hover-color` | `` | `initial` |
| `window.close-button.face.ghost-hover.bg` | `--mx-window-close-button-face-ghost-hover-bg` | `color.fill.subtle.secondary` | `rgb(0 0 0 / 0.0373)` |
| `window.close-button.face.outline-pressed.color` | `--mx-window-close-button-face-outline-pressed-color` | `` | `initial` |
| `window.close-button.face.outline-pressed.bg` | `--mx-window-close-button-face-outline-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `window.close-button.face.ghost-pressed.color` | `--mx-window-close-button-face-ghost-pressed-color` | `` | `initial` |
| `window.close-button.face.ghost-pressed.bg` | `--mx-window-close-button-face-ghost-pressed-bg` | `color.fill.subtle.tertiary` | `rgb(0 0 0 / 0.0241)` |
| `window.chip.variant` | `--mx-window-chip-variant` | `` | `outline` |
| `window.chip.tone` | `--mx-window-chip-tone` | `` | `standard` |
| `window.chip.size` | `--mx-window-chip-size` | `` | `sm` |
| `window.footer-button.variant` | `--mx-window-footer-button-variant` | `` | `solid` |
| `window.footer-button.size` | `--mx-window-footer-button-size` | `` | `md` |
| `window.footer-button.face.outline.color` | `--mx-window-footer-button-face-outline-color` | `color.fg.primary` | `#1d1c1a` |
| `window.footer-button.face.ghost.color` | `--mx-window-footer-button-face-ghost-color` | `color.fg.primary` | `#1d1c1a` |
| `window.footer-button.face.outline-hover.color` | `--mx-window-footer-button-face-outline-hover-color` | `` | `initial` |
| `window.footer-button.face.ghost-hover.color` | `--mx-window-footer-button-face-ghost-hover-color` | `` | `initial` |
| `window.footer-button.face.outline-pressed.color` | `--mx-window-footer-button-face-outline-pressed-color` | `` | `initial` |
| `window.footer-button.face.ghost-pressed.color` | `--mx-window-footer-button-face-ghost-pressed-color` | `` | `initial` |
| `window.footer-main-button.variant` | `--mx-window-footer-main-button-variant` | `` | `solid` |
| `window.footer-main-button.size` | `--mx-window-footer-main-button-size` | `` | `md` |
| `window.scrim.bg` | `--mx-window-scrim-bg` | `color.bg.smoke` | `rgb(0 0 0 / 0.3)` |
| `window.surface.bg` | `--mx-window-surface-bg` | `color.bg.surface` | `#f8f7f3` |
| `window.surface.border-width` | `--mx-window-surface-border-width` | `border.width.1` | `1px` |
| `window.surface.border-color` | `--mx-window-surface-border-color` | `color.stroke.surface` | `rgb(117 117 117 / 0.4)` |
| `window.surface.radius` | `--mx-window-surface-radius` | `radius.lg` | `0.625rem` |
| `window.surface.shadow` | `--mx-window-surface-shadow` | `elevation.window-inactive` | `0px 4px 8px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `window.surface.color` | `--mx-window-surface-color` | `color.fg.primary` | `#1d1c1a` |
| `window.surface.font-size` | `--mx-window-surface-font-size` | `font.size.body` | `0.875rem` |
| `window.surface.font-weight` | `--mx-window-surface-font-weight` | `font.weight.regular` | `400` |
| `window.surface.line-height` | `--mx-window-surface-line-height` | `font.line.body` | `1.25rem` |
| `window.surface.active.shadow` | `--mx-window-surface-active-shadow` | `elevation.window` | `0px 14px 28px 0px rgb(0 0 0 / 0.24), 0px 0px 8px 0px rgb(0 0 0 / 0.2)` |
| `window.surface.dialog.shadow` | `--mx-window-surface-dialog-shadow` | `elevation.dialog` | `0px 32px 64px 0px rgb(0 0 0 / 0.24), 0px 0px 8px 0px rgb(0 0 0 / 0.2)` |
| `window.surface.maximized.radius` | `--mx-window-surface-maximized-radius` | `` | `0px` |
| `window.bar.padding-end` | `--mx-window-bar-padding-end` | `space.1` | `0.25rem` |
| `window.bar.padding-start` | `--mx-window-bar-padding-start` | `space.3` | `0.75rem` |
| `window.bar.gap` | `--mx-window-bar-gap` | `space.2` | `0.5rem` |
| `window.bar.bg` | `--mx-window-bar-bg` | `color.bg.bar` | `#ebeae5` |
| `window.bar.border-bottom-width` | `--mx-window-bar-border-bottom-width` | `border.width.1` | `1px` |
| `window.bar.border-bottom-color` | `--mx-window-bar-border-bottom-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `window.bar.color` | `--mx-window-bar-color` | `color.fg.secondary` | `#5e5c55` |
| `window.bar.active.color` | `--mx-window-bar-active-color` | `color.fg.primary` | `#1d1c1a` |
| `window.bar.dialog.color` | `--mx-window-bar-dialog-color` | `color.fg.primary` | `#1d1c1a` |
| `window.icon.size` | `--mx-window-icon-size` | `icon.size.md` | `1rem` |
| `window.title.font-size` | `--mx-window-title-font-size` | `font.size.body` | `0.875rem` |
| `window.title.font-weight` | `--mx-window-title-font-weight` | `font.weight.semibold` | `600` |
| `window.title.line-height` | `--mx-window-title-line-height` | `font.line.body` | `1.25rem` |
| `window.tools.gap` | `--mx-window-tools-gap` | `space.1` | `0.25rem` |
| `window.body.padding` | `--mx-window-body-padding` | `space.5` | `1.25rem` |
| `window.body.bg` | `--mx-window-body-bg` | `` | `initial` |
| `window.footer.padding-block` | `--mx-window-footer-padding-block` | `space.4` | `1rem` |
| `window.footer.padding-inline` | `--mx-window-footer-padding-inline` | `space.5` | `1.25rem` |
| `window.footer.gap` | `--mx-window-footer-gap` | `space.2` | `0.5rem` |
| `window.footer.border-top-width` | `--mx-window-footer-border-top-width` | `border.width.1` | `1px` |
| `window.footer.border-top-color` | `--mx-window-footer-border-top-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |
| `window.footer.padding` | `--mx-window-footer-padding` | `` | `initial` |
| `window.footer.bg` | `--mx-window-footer-bg` | `` | `initial` |
| `window.message.gap` | `--mx-window-message-gap` | `space.3` | `0.75rem` |
| `window.message-icon.size` | `--mx-window-message-icon-size` | `icon.size.lg` | `1.25rem` |
| `window.message-icon.color` | `--mx-window-message-icon-color` | `color.accent.fg` | `#983318` |
| `window.message-icon.success.color` | `--mx-window-message-icon-success-color` | `color.success.fg` | `#006402` |
| `window.message-icon.caution.color` | `--mx-window-message-icon-caution-color` | `color.caution.fg` | `#754702` |
| `window.message-icon.danger.color` | `--mx-window-message-icon-danger-color` | `color.danger.fg` | `#b03659` |
| `wizard.gap` | `--mx-wizard-gap` | `space.4` | `1rem` |
| `wizard.bar-gap` | `--mx-wizard-bar-gap` | `space.2` | `0.5rem` |
| `wizard.rail-width` | `--mx-wizard-rail-width` | `` | `14rem` |
| `wizard.previous.variant` | `--mx-wizard-previous-variant` | `` | `outline` |
| `wizard.next.variant` | `--mx-wizard-next-variant` | `` | `solid` |
| `wizard.next.tone` | `--mx-wizard-next-tone` | `` | `accent` |
| `wizard.bar.padding-top` | `--mx-wizard-bar-padding-top` | `space.3` | `0.75rem` |
| `wizard.bar.border-top-width` | `--mx-wizard-bar-border-top-width` | `` | `1px` |
| `wizard.bar.border-top-color` | `--mx-wizard-bar-border-top-color` | `color.stroke.divider` | `rgb(0 0 0 / 0.1)` |

## Semantic ({semantic.length} per theme)

Semantic tokens are the only layer a theme redefines. Switch the theme at the top of the page to see the swatches change. The design system build verifies every text and background pair against WCAG AA in light and dark themes, and against AAA in high contrast.

| Token | CSS variable | Light | Dark | High contrast |
| --- | --- | --- | --- | --- |
| `color.accent.solid` | `--mx-color-accent-solid` | `#c24523` | `#ff8f66` | `#d6b4fd` |
| `color.accent.solid-hover` | `--mx-color-accent-solid-hover` | `#b43f20` | `#ff9f7c` | `#e4ccfe` |
| `color.accent.solid-pressed` | `--mx-color-accent-solid-pressed` | `#a1381c` | `#f2855c` | `#d6b4fd` |
| `color.accent.on-solid` | `--mx-color-accent-on-solid` | `#ffffff` | `#1d1c1a` | `#000000` |
| `color.accent.fg` | `--mx-color-accent-fg` | `#983318` | `#ffb89c` | `#c7c7ff` |
| `color.accent.subtle` | `--mx-color-accent-subtle` | `#fbe6de` | `#45271d` | `#000000` |
| `color.accent.on-subtle` | `--mx-color-accent-on-subtle` | `#983318` | `#ffb89c` | `#c7c7ff` |
| `color.success.fg` | `--mx-color-success-fg` | `#006402` | `#6dc43a` | `#3ff23f` |
| `color.success.subtle` | `--mx-color-success-subtle` | `#dff6dd` | `#393d1b` | `#000000` |
| `color.success.solid` | `--mx-color-success-solid` | `#006402` | `#6dc43a` | `#3ff23f` |
| `color.success.on-solid` | `--mx-color-success-on-solid` | `#ffffff` | `#000000` | `#000000` |
| `color.caution.fg` | `--mx-color-caution-fg` | `#754702` | `#fce100` | `#ffee32` |
| `color.caution.subtle` | `--mx-color-caution-subtle` | `#fff4ce` | `#433519` | `#000000` |
| `color.caution.solid` | `--mx-color-caution-solid` | `#754702` | `#fce100` | `#ffee32` |
| `color.caution.on-solid` | `--mx-color-caution-on-solid` | `#ffffff` | `#000000` | `#000000` |
| `color.bg.canvas` | `--mx-color-bg-canvas` | `#e1e0da` | `#232220` | `#000000` |
| `color.bg.layer` | `--mx-color-bg-layer` | `#ebeae5` | `#2b2a27` | `#000000` |
| `color.bg.card` | `--mx-color-bg-card` | `#f5f4f0` | `#2e2d2a` | `#000000` |
| `color.bg.surface` | `--mx-color-bg-surface` | `#f8f7f3` | `#2e2d2a` | `#000000` |
| `color.bg.bar` | `--mx-color-bg-bar` | `#ebeae5` | `#2b2a27` | `#000000` |
| `color.bg.container` | `--mx-color-bg-container` | `#f8f7f3` | `#2e2d2a` | `#000000` |
| `color.bg.container-high` | `--mx-color-bg-container-high` | `#f8f7f3` | `#2e2d2a` | `#000000` |
| `color.bg.header` | `--mx-color-bg-header` | `#ebeae5` | `#2b2a27` | `#000000` |
| `color.bg.group` | `--mx-color-bg-group` | `#ebeae5` | `#2b2a27` | `#000000` |
| `color.bg.glass` | `--mx-color-bg-glass` | `rgb(248 247 243 / 0.78)` | `rgb(46 45 42 / 0.72)` | `#000000` |
| `color.bg.smoke` | `--mx-color-bg-smoke` | `rgb(0 0 0 / 0.3)` | `rgb(0 0 0 / 0.3)` | `rgb(0 0 0 / 0.6)` |
| `color.fill.control.default` | `--mx-color-fill-control-default` | `#f5f4f0` | `#383733` | `#000000` |
| `color.fill.control.secondary` | `--mx-color-fill-control-secondary` | `#ebeae5` | `#434240` | `#000000` |
| `color.fill.control.tertiary` | `--mx-color-fill-control-tertiary` | `#e1e0da` | `#2e2d2a` | `#000000` |
| `color.fill.control.disabled` | `--mx-color-fill-control-disabled` | `#ebeae5` | `#2e2d2a` | `#000000` |
| `color.fill.control.solid` | `--mx-color-fill-control-solid` | `#f5f4f0` | `#383733` | `#000000` |
| `color.fill.control-alt.default` | `--mx-color-fill-control-alt-default` | `#f5f4f0` | `#383733` | `#000000` |
| `color.fill.control-alt.secondary` | `--mx-color-fill-control-alt-secondary` | `#ebeae5` | `#434240` | `#000000` |
| `color.fill.control-alt.tertiary` | `--mx-color-fill-control-alt-tertiary` | `#e1e0da` | `#2e2d2a` | `#000000` |
| `color.fill.control-alt.disabled` | `--mx-color-fill-control-alt-disabled` | `#ebeae5` | `#2e2d2a` | `#000000` |
| `color.fill.input.focus` | `--mx-color-fill-input-focus` | `#f5f4f0` | `#383733` | `#000000` |
| `color.fill.input.disabled` | `--mx-color-fill-input-disabled` | `#ebeae5` | `#2e2d2a` | `#000000` |
| `color.fill.subtle.secondary` | `--mx-color-fill-subtle-secondary` | `rgb(0 0 0 / 0.0373)` | `rgb(255 255 255 / 0.0605)` | `#3a3a3a` |
| `color.fill.subtle.tertiary` | `--mx-color-fill-subtle-tertiary` | `rgb(0 0 0 / 0.0241)` | `rgb(255 255 255 / 0.0419)` | `#555555` |
| `color.fill.accent-disabled` | `--mx-color-fill-accent-disabled` | `rgb(0 0 0 / 0.2169)` | `rgb(255 255 255 / 0.1581)` | `#000000` |
| `color.fill.neutral` | `--mx-color-fill-neutral` | `#ebeae5` | `#434240` | `#000000` |
| `color.fg.primary` | `--mx-color-fg-primary` | `#1d1c1a` | `#ffffff` | `#ffffff` |
| `color.fg.secondary` | `--mx-color-fg-secondary` | `#5e5c55` | `#d0cfc9` | `#e0e0e0` |
| `color.fg.tertiary` | `--mx-color-fg-tertiary` | `#8c8a82` | `#9b9991` | `#e0e0e0` |
| `color.fg.disabled` | `--mx-color-fg-disabled` | `#a2a098` | `#74726a` | `#a6a6a6` |
| `color.fg.on-accent-disabled` | `--mx-color-fg-on-accent-disabled` | `#ffffff` | `rgb(255 255 255 / 0.5302)` | `#a6a6a6` |
| `color.stroke.control.default` | `--mx-color-stroke-control-default` | `rgb(0 0 0 / 0.12)` | `rgb(255 255 255 / 0.1)` | `#ffffff` |
| `color.stroke.control.secondary` | `--mx-color-stroke-control-secondary` | `rgb(0 0 0 / 0.2)` | `rgb(255 255 255 / 0.14)` | `#ffffff` |
| `color.stroke.control.strong` | `--mx-color-stroke-control-strong` | `rgb(0 0 0 / 0.4458)` | `rgb(255 255 255 / 0.5442)` | `#ffffff` |
| `color.stroke.control.edge` | `--mx-color-stroke-control-edge` | `rgb(0 0 0 / 0.3)` | `rgb(0 0 0 / 0.5)` | `#ffffff` |
| `color.stroke.on-accent-bottom` | `--mx-color-stroke-on-accent-bottom` | `rgb(0 0 0 / 0.4)` | `rgb(0 0 0 / 0.14)` | `#ffffff` |
| `color.stroke.card` | `--mx-color-stroke-card` | `rgb(0 0 0 / 0.08)` | `rgb(0 0 0 / 0.1)` | `#ffffff` |
| `color.stroke.surface` | `--mx-color-stroke-surface` | `rgb(117 117 117 / 0.4)` | `rgb(117 117 117 / 0.4)` | `#ffffff` |
| `color.stroke.divider` | `--mx-color-stroke-divider` | `rgb(0 0 0 / 0.1)` | `rgb(255 255 255 / 0.0837)` | `#ffffff` |
| `color.highlight.control` | `--mx-color-highlight-control` | `rgb(255 255 255 / 0.7)` | `rgb(255 255 255 / 0.06)` | `#000000` |
| `color.danger.solid` | `--mx-color-danger-solid` | `#b03659` | `#ff99a4` | `#ff8080` |
| `color.danger.solid-hover` | `--mx-color-danger-solid-hover` | `#c13b61` | `#e98d97` | `#ffa0a0` |
| `color.danger.on-solid` | `--mx-color-danger-on-solid` | `#ffffff` | `#000000` | `#000000` |
| `color.danger.fg` | `--mx-color-danger-fg` | `#b03659` | `#ff99a4` | `#ffbcbc` |
| `color.danger.subtle` | `--mx-color-danger-subtle` | `#fde7e9` | `#442726` | `#000000` |
| `color.info.subtle` | `--mx-color-info-subtle` | `#ebeae5` | `#2b2a27` | `#000000` |
| `color.info.solid` | `--mx-color-info-solid` | `#5e5c55` | `#d0cfc9` | `#ffffff` |
| `color.info.on-solid` | `--mx-color-info-on-solid` | `#e1e0da` | `#232220` | `#000000` |
| `color.selection.bg` | `--mx-color-selection-bg` | `#f5f4f0` | `#383733` | `#d6b4fd` |
| `color.selection.fg` | `--mx-color-selection-fg` | `#1d1c1a` | `#ffffff` | `#000000` |
| `color.selection.border` | `--mx-color-selection-border` | `rgb(0 0 0 / 0.12)` | `rgb(255 255 255 / 0.1)` | `rgb(0 0 0 / 0)` |
| `color.selection.indicator` | `--mx-color-selection-indicator` | `rgb(0 0 0 / 0)` | `rgb(0 0 0 / 0)` | `#000000` |
| `color.chart.series-1` | `--mx-color-chart-series-1` | `#c24523` | `#cc5b3c` | `#d6b4fd` |
| `color.chart.series-2` | `--mx-color-chart-series-2` | `#853c70` | `#7c78c2` | `#3ff23f` |
| `color.chart.series-3` | `--mx-color-chart-series-3` | `#008c80` | `#1ea8a8` | `#ffffff` |
| `color.chart.series-4` | `--mx-color-chart-series-4` | `#7d5800` | `#a87a0c` | `#ffa64d` |
| `color.chart.series-5` | `--mx-color-chart-series-5` | `#6f6bb3` | `#ae5f95` | `#66d9ff` |
| `color.chart.series-6` | `--mx-color-chart-series-6` | `#587a30` | `#7ca055` | `#ff8080` |
| `color.chart.series-7` | `--mx-color-chart-series-7` | `#3b80b6` | `#5499d1` | `#ffee32` |
| `color.chart.series-8` | `--mx-color-chart-series-8` | `#a44247` | `#d16a6c` | `#ff9ae0` |
| `color.chart.scale-low` | `--mx-color-chart-scale-low` | `#fbe6e0` | `#3b2923` | `#202020` |
| `color.chart.scale-high` | `--mx-color-chart-scale-high` | `#781d00` | `#ffac96` | `#ffffff` |
| `color.chart.scale-negative` | `--mx-color-chart-scale-negative` | `#ab3511` | `#ea856a` | `#ffa64d` |
| `color.chart.scale-middle` | `--mx-color-chart-scale-middle` | `#eae7e6` | `#353231` | `#202020` |
| `color.chart.scale-positive` | `--mx-color-chart-scale-positive` | `#0465af` | `#60aaf3` | `#66d9ff` |
| `color.chart.grid` | `--mx-color-chart-grid` | `rgb(0 0 0 / 0.1)` | `rgb(255 255 255 / 0.0837)` | `#666666` |
| `focus.ring.color` | `--mx-focus-ring-color` | `#1d1c1a` | `#ffffff` | `#ffffff` |
| `focus.ring.inner` | `--mx-focus-ring-inner` | `rgb(255 255 255 / 0.7)` | `rgb(0 0 0 / 0.7)` | `#000000` |
| `focus.ring.halo` | `--mx-focus-ring-halo` | `0px 0px 0px 1px rgb(255 255 255 / 0.7)` | `0px 0px 0px 1px rgb(0 0 0 / 0.7)` | `0px 0px 0px 1px #000000` |
| `focus.ring.halo-inset` | `--mx-focus-ring-halo-inset` | `inset 0px 0px 0px 3px rgb(255 255 255 / 0.7)` | `inset 0px 0px 0px 3px rgb(0 0 0 / 0.7)` | `inset 0px 0px 0px 3px #000000` |
| `focus.ring.width` | `--mx-focus-ring-width` | `2px` | `2px` | `2px` |
| `focus.ring.offset` | `--mx-focus-ring-offset` | `1px` | `1px` | `1px` |
| `effect.selection` | `--mx-effect-selection` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7), 0px 1px 0px 0px rgb(0 0 0 / 0.3)` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.06), 0px 1px 0px 0px rgb(0 0 0 / 0.5)` | `0px 0px 0px 0px rgb(0 0 0 / 0)` |
| `effect.control` | `--mx-effect-control` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.7)` | `inset 0px 1px 0px 0px rgb(255 255 255 / 0.06)` | `inset 0px 1px 0px 0px #000000` |

## Density ({density.length})

Control heights, padding, gaps, the pressable edge and the bar height. Setting `data-density="compact"` swaps all of them.

| Token | CSS variable | Comfortable | Compact |
| --- | --- | --- | --- |
| `control.height.sm` | `--mx-control-height-sm` | `1.5rem` | `1.25rem` |
| `control.height.md` | `--mx-control-height-md` | `2rem` | `1.5rem` |
| `control.height.lg` | `--mx-control-height-lg` | `2.5rem` | `2rem` |
| `control.padding.sm` | `--mx-control-padding-sm` | `0.5rem` | `0.375rem` |
| `control.padding.md` | `--mx-control-padding-md` | `0.6875rem` | `0.5rem` |
| `control.padding.lg` | `--mx-control-padding-lg` | `1rem` | `0.75rem` |
| `control.gap` | `--mx-control-gap` | `0.5rem` | `0.25rem` |
| `control.edge.width` | `--mx-control-edge-width` | `2px` | `1px` |
| `control.press.offset` | `--mx-control-press-offset` | `1px` | `1px` |
| `bar.height` | `--mx-bar-height` | `2.25rem` | `1.75rem` |

## Design language ({designLanguage.length})

These are the values a design language defines for itself: corner radii, shadows, typography and motion. The names are the same in every language, and `data-design-language` selects which values apply. The values shown here are from Tactile, the default.

| Token | Type | CSS variable | Value |
| --- | --- | --- | --- |
| `radius.none` | dimension | `--mx-radius-none` | `0px` |
| `radius.xs` | dimension | `--mx-radius-xs` | `0.25rem` |
| `radius.sm` | dimension | `--mx-radius-sm` | `0.25rem` |
| `radius.md` | dimension | `--mx-radius-md` | `0.375rem` |
| `radius.lg` | dimension | `--mx-radius-lg` | `0.625rem` |
| `radius.xl` | dimension | `--mx-radius-xl` | `0.875rem` |
| `radius.full` | dimension | `--mx-radius-full` | `9999px` |
| `shadow.2` | shadow | `--mx-shadow-2` | `0px 1px 2px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `shadow.4` | shadow | `--mx-shadow-4` | `0px 2px 4px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `shadow.8` | shadow | `--mx-shadow-8` | `0px 4px 8px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `shadow.16` | shadow | `--mx-shadow-16` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `shadow.28` | shadow | `--mx-shadow-28` | `0px 14px 28px 0px rgb(0 0 0 / 0.24), 0px 0px 8px 0px rgb(0 0 0 / 0.2)` |
| `shadow.64` | shadow | `--mx-shadow-64` | `0px 32px 64px 0px rgb(0 0 0 / 0.24), 0px 0px 8px 0px rgb(0 0 0 / 0.2)` |
| `elevation.card` | shadow | `--mx-elevation-card` | `0px 1px 2px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `elevation.popup` | shadow | `--mx-elevation-popup` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `elevation.tooltip` | shadow | `--mx-elevation-tooltip` | `0px 4px 8px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `elevation.toast` | shadow | `--mx-elevation-toast` | `0px 8px 16px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `elevation.window` | shadow | `--mx-elevation-window` | `0px 14px 28px 0px rgb(0 0 0 / 0.24), 0px 0px 8px 0px rgb(0 0 0 / 0.2)` |
| `elevation.window-inactive` | shadow | `--mx-elevation-window-inactive` | `0px 4px 8px 0px rgb(0 0 0 / 0.14), 0px 0px 2px 0px rgb(0 0 0 / 0.12)` |
| `elevation.dialog` | shadow | `--mx-elevation-dialog` | `0px 32px 64px 0px rgb(0 0 0 / 0.24), 0px 0px 8px 0px rgb(0 0 0 / 0.2)` |
| `font.family.sans` | fontFamily | `--mx-font-family-sans` | `Archivo, system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif` |
| `font.family.display` | fontFamily | `--mx-font-family-display` | `Archivo, system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif` |
| `font.family.mono` | fontFamily | `--mx-font-family-mono` | `'JetBrains Mono', 'Cascadia Mono', Consolas, ui-monospace, Menlo, monospace` |
| `font.size.caption` | dimension | `--mx-font-size-caption` | `0.75rem` |
| `font.size.body` | dimension | `--mx-font-size-body` | `0.875rem` |
| `font.size.body-large` | dimension | `--mx-font-size-body-large` | `1.125rem` |
| `font.size.subtitle` | dimension | `--mx-font-size-subtitle` | `1.25rem` |
| `font.size.title` | dimension | `--mx-font-size-title` | `1.75rem` |
| `font.size.title-large` | dimension | `--mx-font-size-title-large` | `2.5rem` |
| `font.size.display` | dimension | `--mx-font-size-display` | `4.25rem` |
| `font.line.caption` | dimension | `--mx-font-line-caption` | `1rem` |
| `font.line.body` | dimension | `--mx-font-line-body` | `1.25rem` |
| `font.line.body-large` | dimension | `--mx-font-line-body-large` | `1.5rem` |
| `font.line.subtitle` | dimension | `--mx-font-line-subtitle` | `1.75rem` |
| `font.line.title` | dimension | `--mx-font-line-title` | `2.25rem` |
| `font.line.title-large` | dimension | `--mx-font-line-title-large` | `3.25rem` |
| `font.line.display` | dimension | `--mx-font-line-display` | `5.75rem` |
| `font.weight.regular` | fontWeight | `--mx-font-weight-regular` | `400` |
| `font.weight.medium` | fontWeight | `--mx-font-weight-medium` | `500` |
| `font.weight.semibold` | fontWeight | `--mx-font-weight-semibold` | `600` |
| `font.weight.bold` | fontWeight | `--mx-font-weight-bold` | `700` |
| `font.width.display` | number | `--mx-font-width-display` | `112` |
| `font.width.body` | number | `--mx-font-width-body` | `100` |
| `font.width.dense` | number | `--mx-font-width-dense` | `92` |
| `motion.duration.instant` | duration | `--mx-motion-duration-instant` | `0ms` |
| `motion.duration.fast` | duration | `--mx-motion-duration-fast` | `83ms` |
| `motion.duration.normal` | duration | `--mx-motion-duration-normal` | `167ms` |
| `motion.duration.slow` | duration | `--mx-motion-duration-slow` | `250ms` |
| `motion.easing.standard` | cubicBezier | `--mx-motion-easing-standard` | `cubic-bezier(0.33, 0, 0.67, 1)` |
| `motion.easing.in` | cubicBezier | `--mx-motion-easing-in` | `cubic-bezier(0.7, 0, 1, 0.5)` |
| `motion.easing.out` | cubicBezier | `--mx-motion-easing-out` | `cubic-bezier(0, 0, 0, 1)` |
| `scrollbar.size` | dimension | `--mx-scrollbar-size` | `8px` |
| `indicator.thickness` | dimension | `--mx-indicator-thickness` | `0px` |
| `indicator.length` | dimension | `--mx-indicator-length` | `0rem` |
| `indicator.radius` | dimension | `--mx-indicator-radius` | `0px` |
| `selection.border-width` | dimension | `--mx-selection-border-width` | `1px` |
| `item.radius` | dimension | `--mx-item-radius` | `0.25rem` |

## Primitive ({primitive.length})

The shared palette and scales, identical in every design language. Themes and components reference these values and never hardcode them.

| Token | Type | CSS variable | Value |
| --- | --- | --- | --- |
| `color.white` | color | `--mx-color-white` | `#ffffff` |
| `color.black` | color | `--mx-color-black` | `#000000` |
| `color.gray.10` | color | `--mx-color-gray-10` | `#1d1c1a` |
| `color.gray.11` | color | `--mx-color-gray-11` | `#1f1e1b` |
| `color.gray.12` | color | `--mx-color-gray-12` | `#232220` |
| `color.gray.16` | color | `--mx-color-gray-16` | `#2b2a27` |
| `color.gray.17` | color | `--mx-color-gray-17` | `#2e2d2a` |
| `color.gray.22` | color | `--mx-color-gray-22` | `#383733` |
| `color.gray.26` | color | `--mx-color-gray-26` | `#434240` |
| `color.gray.38` | color | `--mx-color-gray-38` | `#5e5c55` |
| `color.gray.45` | color | `--mx-color-gray-45` | `#74726a` |
| `color.gray.54` | color | `--mx-color-gray-54` | `#8c8a82` |
| `color.gray.60` | color | `--mx-color-gray-60` | `#9b9991` |
| `color.gray.63` | color | `--mx-color-gray-63` | `#a2a098` |
| `color.gray.81` | color | `--mx-color-gray-81` | `#d0cfc9` |
| `color.gray.88` | color | `--mx-color-gray-88` | `#e1e0da` |
| `color.gray.93` | color | `--mx-color-gray-93` | `#ebeae5` |
| `color.gray.95` | color | `--mx-color-gray-95` | `#efeee9` |
| `color.gray.97` | color | `--mx-color-gray-97` | `#f5f4f0` |
| `color.gray.98` | color | `--mx-color-gray-98` | `#f8f7f3` |
| `color.accent.dark3` | color | `--mx-color-accent-dark3` | `#6e2410` |
| `color.accent.dark2` | color | `--mx-color-accent-dark2` | `#983318` |
| `color.accent.dark1` | color | `--mx-color-accent-dark1` | `#c24523` |
| `color.accent.dark1-hover` | color | `--mx-color-accent-dark1-hover` | `#b43f20` |
| `color.accent.dark1-pressed` | color | `--mx-color-accent-dark1-pressed` | `#a1381c` |
| `color.accent.base` | color | `--mx-color-accent-base` | `#e4572e` |
| `color.accent.light1` | color | `--mx-color-accent-light1` | `#f06a3f` |
| `color.accent.light2` | color | `--mx-color-accent-light2` | `#ff8f66` |
| `color.accent.light2-hover` | color | `--mx-color-accent-light2-hover` | `#ff9f7c` |
| `color.accent.light2-pressed` | color | `--mx-color-accent-light2-pressed` | `#f2855c` |
| `color.accent.light3` | color | `--mx-color-accent-light3` | `#ffb89c` |
| `color.accent.tint-light` | color | `--mx-color-accent-tint-light` | `#fbe6de` |
| `color.accent.tint-dark` | color | `--mx-color-accent-tint-dark` | `#45271d` |
| `color.critical.light` | color | `--mx-color-critical-light` | `#b03659` |
| `color.critical.light-hover` | color | `--mx-color-critical-light-hover` | `#c13b61` |
| `color.critical.light-bg` | color | `--mx-color-critical-light-bg` | `#fde7e9` |
| `color.critical.dark` | color | `--mx-color-critical-dark` | `#ff99a4` |
| `color.critical.dark-hover` | color | `--mx-color-critical-dark-hover` | `#e98d97` |
| `color.critical.dark-bg` | color | `--mx-color-critical-dark-bg` | `#442726` |
| `color.success.light` | color | `--mx-color-success-light` | `#006402` |
| `color.success.light-bg` | color | `--mx-color-success-light-bg` | `#dff6dd` |
| `color.success.dark` | color | `--mx-color-success-dark` | `#6dc43a` |
| `color.success.dark-bg` | color | `--mx-color-success-dark-bg` | `#393d1b` |
| `color.caution.light` | color | `--mx-color-caution-light` | `#754702` |
| `color.caution.light-bg` | color | `--mx-color-caution-light-bg` | `#fff4ce` |
| `color.caution.dark` | color | `--mx-color-caution-dark` | `#fce100` |
| `color.caution.dark-bg` | color | `--mx-color-caution-dark-bg` | `#433519` |
| `color.contrast.text` | color | `--mx-color-contrast-text` | `#ffffff` |
| `color.contrast.text-muted` | color | `--mx-color-contrast-text-muted` | `#e0e0e0` |
| `color.contrast.highlight` | color | `--mx-color-contrast-highlight` | `#d6b4fd` |
| `color.contrast.highlight-hover` | color | `--mx-color-contrast-highlight-hover` | `#e4ccfe` |
| `color.contrast.link` | color | `--mx-color-contrast-link` | `#c7c7ff` |
| `color.contrast.critical` | color | `--mx-color-contrast-critical` | `#ff8080` |
| `color.contrast.critical-hover` | color | `--mx-color-contrast-critical-hover` | `#ffa0a0` |
| `color.contrast.critical-text` | color | `--mx-color-contrast-critical-text` | `#ffbcbc` |
| `color.contrast.success` | color | `--mx-color-contrast-success` | `#3ff23f` |
| `color.contrast.caution` | color | `--mx-color-contrast-caution` | `#ffee32` |
| `color.contrast.disabled` | color | `--mx-color-contrast-disabled` | `#a6a6a6` |
| `color.contrast.hover` | color | `--mx-color-contrast-hover` | `#3a3a3a` |
| `color.contrast.pressed` | color | `--mx-color-contrast-pressed` | `#555555` |
| `color.ink.5` | color | `--mx-color-ink-5` | `#0e0d0b` |
| `color.ink.8` | color | `--mx-color-ink-8` | `#151411` |
| `color.ink.10` | color | `--mx-color-ink-10` | `#1a1815` |
| `color.ink.12` | color | `--mx-color-ink-12` | `#201e1a` |
| `color.ink.14` | color | `--mx-color-ink-14` | `#262420` |
| `color.ink.17` | color | `--mx-color-ink-17` | `#2e2b26` |
| `color.ivory.42` | color | `--mx-color-ivory-42` | `#6d665b` |
| `color.ivory.58` | color | `--mx-color-ivory-58` | `#968d7e` |
| `color.ivory.78` | color | `--mx-color-ivory-78` | `#cbc2b2` |
| `color.ivory.95` | color | `--mx-color-ivory-95` | `#f4efe5` |
| `color.brass.dark1` | color | `--mx-color-brass-dark1` | `#b8914c` |
| `color.brass.base` | color | `--mx-color-brass-base` | `#d2ab62` |
| `color.brass.light1` | color | `--mx-color-brass-light1` | `#dfbb77` |
| `color.brass.light2` | color | `--mx-color-brass-light2` | `#e9cd96` |
| `color.brass.tint-dark` | color | `--mx-color-brass-tint-dark` | `#2b2318` |
| `color.violet.10` | color | `--mx-color-violet-10` | `#1a0056` |
| `color.violet.18` | color | `--mx-color-violet-18` | `#2f2550` |
| `color.violet.30` | color | `--mx-color-violet-30` | `#4b21bd` |
| `color.violet.40` | color | `--mx-color-violet-40` | `#6442d6` |
| `color.violet.60` | color | `--mx-color-violet-60` | `#9f86ff` |
| `color.violet.90` | color | `--mx-color-violet-90` | `#e7deff` |
| `color.violet.40-hover` | color | `--mx-color-violet-40-hover` | `#7051d9` |
| `color.violet.40-pressed` | color | `--mx-color-violet-40-pressed` | `#7455da` |
| `color.violet.60-hover` | color | `--mx-color-violet-60-hover` | `#947bf1` |
| `color.violet.60-pressed` | color | `--mx-color-violet-60-pressed` | `#9279ee` |
| `color.mauve.4` | color | `--mx-color-mauve-4` | `#0f0d13` |
| `color.mauve.6` | color | `--mx-color-mauve-6` | `#141318` |
| `color.mauve.10` | color | `--mx-color-mauve-10` | `#1c1b20` |
| `color.mauve.12` | color | `--mx-color-mauve-12` | `#201f24` |
| `color.mauve.17` | color | `--mx-color-mauve-17` | `#2b292f` |
| `color.mauve.22` | color | `--mx-color-mauve-22` | `#36343a` |
| `color.mauve.25` | color | `--mx-color-mauve-25` | `#444248` |
| `color.mauve.27` | color | `--mx-color-mauve-27` | `#48454c` |
| `color.mauve.46` | color | `--mx-color-mauve-46` | `#646167` |
| `color.mauve.65` | color | `--mx-color-mauve-65` | `#a8a3aa` |
| `color.mauve.88` | color | `--mx-color-mauve-88` | `#d2cdd5` |
| `color.mauve.89` | color | `--mx-color-mauve-89` | `#d6d1d9` |
| `color.mauve.90` | color | `--mx-color-mauve-90` | `#e6e1e9` |
| `color.mauve.92` | color | `--mx-color-mauve-92` | `#ece6ee` |
| `color.mauve.94` | color | `--mx-color-mauve-94` | `#f1ecf4` |
| `color.mauve.96` | color | `--mx-color-mauve-96` | `#f7f2fa` |
| `color.mauve.98` | color | `--mx-color-mauve-98` | `#fdf7ff` |
| `color.mauve.variant-30` | color | `--mx-color-mauve-variant-30` | `#48454e` |
| `color.mauve.variant-50` | color | `--mx-color-mauve-variant-50` | `#79757f` |
| `color.mauve.variant-60` | color | `--mx-color-mauve-variant-60` | `#938f99` |
| `color.mauve.variant-80` | color | `--mx-color-mauve-variant-80` | `#c9c4cf` |
| `color.dusk.30` | color | `--mx-color-dusk-30` | `#484458` |
| `color.dusk.40` | color | `--mx-color-dusk-40` | `#605b71` |
| `color.dusk.80` | color | `--mx-color-dusk-80` | `#cac3dc` |
| `color.dusk.90` | color | `--mx-color-dusk-90` | `#e6dff9` |
| `color.red.20` | color | `--mx-color-red-20` | `#690005` |
| `color.red.30` | color | `--mx-color-red-30` | `#93000a` |
| `color.red.40` | color | `--mx-color-red-40` | `#ba1a1a` |
| `color.red.80` | color | `--mx-color-red-80` | `#ffb4ab` |
| `color.red.90` | color | `--mx-color-red-90` | `#ffdad6` |
| `color.red.40-hover` | color | `--mx-color-red-40-hover` | `#c02c2c` |
| `color.red.80-hover` | color | `--mx-color-red-80-hover` | `#f3a69e` |
| `color.green.18` | color | `--mx-color-green-18` | `#093413` |
| `color.green.30` | color | `--mx-color-green-30` | `#0f5223` |
| `color.green.70` | color | `--mx-color-green-70` | `#36c450` |
| `color.green.90` | color | `--mx-color-green-90` | `#c4eed0` |
| `color.yellow.15` | color | `--mx-color-yellow-15` | `#3a2900` |
| `color.yellow.40` | color | `--mx-color-yellow-40` | `#7a5900` |
| `color.yellow.80` | color | `--mx-color-yellow-80` | `#ffce22` |
| `color.yellow.95` | color | `--mx-color-yellow-95` | `#fff0c4` |
| `color.lilac.20` | color | `--mx-color-lilac-20` | `#3f1776` |
| `color.lilac.25` | color | `--mx-color-lilac-25` | `#4b2582` |
| `color.lilac.30` | color | `--mx-color-lilac-30` | `#57328e` |
| `color.lilac.32` | color | `--mx-color-lilac-32` | `#5c3793` |
| `color.lilac.36` | color | `--mx-color-lilac-36` | `#66419d` |
| `color.lilac.38` | color | `--mx-color-lilac-38` | `#6b46a3` |
| `color.lilac.42` | color | `--mx-color-lilac-42` | `#7550ad` |
| `color.lilac.75` | color | `--mx-color-lilac-75` | `#cba9ff` |
| `color.lilac.80` | color | `--mx-color-lilac-80` | `#d6baff` |
| `color.lilac.82` | color | `--mx-color-lilac-82` | `#dac1ff` |
| `color.lilac.85` | color | `--mx-color-lilac-85` | `#e1cbff` |
| `color.lilac.90` | color | `--mx-color-lilac-90` | `#ecdcff` |
| `color.lilac.92` | color | `--mx-color-lilac-92` | `#f1e3ff` |
| `color.lavender.6` | color | `--mx-color-lavender-6` | `#151217` |
| `color.lavender.9` | color | `--mx-color-lavender-9` | `#1b191d` |
| `color.lavender.12` | color | `--mx-color-lavender-12` | `#211f23` |
| `color.lavender.14` | color | `--mx-color-lavender-14` | `#252327` |
| `color.lavender.17` | color | `--mx-color-lavender-17` | `#2c292e` |
| `color.lavender.22` | color | `--mx-color-lavender-22` | `#373439` |
| `color.lavender.25` | color | `--mx-color-lavender-25` | `#3d3a3f` |
| `color.lavender.30` | color | `--mx-color-lavender-30` | `#49464b` |
| `color.lavender.35` | color | `--mx-color-lavender-35` | `#555156` |
| `color.lavender.45` | color | `--mx-color-lavender-45` | `#6d696f` |
| `color.lavender.55` | color | `--mx-color-lavender-55` | `#878288` |
| `color.lavender.65` | color | `--mx-color-lavender-65` | `#a19ca2` |
| `color.lavender.78` | color | `--mx-color-lavender-78` | `#c5bfc5` |
| `color.lavender.87` | color | `--mx-color-lavender-87` | `#ded8de` |
| `color.lavender.90` | color | `--mx-color-lavender-90` | `#e7e0e7` |
| `color.lavender.92` | color | `--mx-color-lavender-92` | `#ede6ed` |
| `color.lavender.95` | color | `--mx-color-lavender-95` | `#f5eff5` |
| `color.lavender.96` | color | `--mx-color-lavender-96` | `#f8f2f8` |
| `color.lavender.98` | color | `--mx-color-lavender-98` | `#fef7fe` |
| `color.jade.22` | color | `--mx-color-jade-22` | `#003d28` |
| `color.jade.44` | color | `--mx-color-jade-44` | `#2e7456` |
| `color.jade.86` | color | `--mx-color-jade-86` | `#9ee6c1` |
| `color.jade.96` | color | `--mx-color-jade-96` | `#cdffe2` |
| `color.lemon.22` | color | `--mx-color-lemon-22` | `#403400` |
| `color.lemon.42` | color | `--mx-color-lemon-42` | `#776100` |
| `color.lemon.84` | color | `--mx-color-lemon-84` | `#f7ce1f` |
| `color.lemon.94` | color | `--mx-color-lemon-94` | `#ffedb8` |
| `color.rose.20` | color | `--mx-color-rose-20` | `#67001f` |
| `color.rose.25` | color | `--mx-color-rose-25` | `#7c0027` |
| `color.rose.30` | color | `--mx-color-rose-30` | `#8f0a31` |
| `color.rose.35` | color | `--mx-color-rose-35` | `#9f1b3b` |
| `color.rose.40` | color | `--mx-color-rose-40` | `#b02946` |
| `color.rose.70` | color | `--mx-color-rose-70` | `#ff8796` |
| `color.rose.72` | color | `--mx-color-rose-72` | `#ff909d` |
| `color.rose.78` | color | `--mx-color-rose-78` | `#ffaab2` |
| `color.rose.92` | color | `--mx-color-rose-92` | `#ffe1e3` |
| `space.0` | dimension | `--mx-space-0` | `0px` |
| `space.1` | dimension | `--mx-space-1` | `0.25rem` |
| `space.2` | dimension | `--mx-space-2` | `0.5rem` |
| `space.3` | dimension | `--mx-space-3` | `0.75rem` |
| `space.4` | dimension | `--mx-space-4` | `1rem` |
| `space.5` | dimension | `--mx-space-5` | `1.25rem` |
| `space.6` | dimension | `--mx-space-6` | `1.5rem` |
| `space.8` | dimension | `--mx-space-8` | `2rem` |
| `space.10` | dimension | `--mx-space-10` | `2.5rem` |
| `space.12` | dimension | `--mx-space-12` | `3rem` |
| `space.16` | dimension | `--mx-space-16` | `4rem` |
| `icon.size.sm` | dimension | `--mx-icon-size-sm` | `0.75rem` |
| `icon.size.md` | dimension | `--mx-icon-size-md` | `1rem` |
| `icon.size.lg` | dimension | `--mx-icon-size-lg` | `1.25rem` |
| `border.width.1` | dimension | `--mx-border-width-1` | `1px` |
| `border.width.2` | dimension | `--mx-border-width-2` | `2px` |
| `opacity.disabled` | number | `--mx-opacity-disabled` | `0.5` |
| `z.dropdown` | number | `--mx-z-dropdown` | `1000` |
| `z.sticky` | number | `--mx-z-sticky` | `1100` |
| `z.window` | number | `--mx-z-window` | `1200` |
| `z.overlay` | number | `--mx-z-overlay` | `1300` |
| `z.toast` | number | `--mx-z-toast` | `1400` |

## Using token names in TypeScript

```tsx
import { cssVar } from '@motifx-community/ui/tokens';

cssVar('color.accent.solid');  // 'var(--mx-color-accent-solid)' — a design-system token
// component tokens join as components bring them; names are typo-checked,
// and apps that need only the design system import cssVar from there
```

## Feedback

Loading issues…
