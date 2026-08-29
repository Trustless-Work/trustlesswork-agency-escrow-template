/**
 * Viewer style constants — now re-exported from shared design tokens.
 * The viewer pioneered these constants; they now live in the shared module.
 * This file maintains backward compatibility for existing viewer components.
 */
export {
  cardClass as viewerCardClass,
  labelClass as viewerLabelClass,
  mutedClass as viewerMutedClass,
  titleClass as viewerTitleClass,
  chipClass as viewerChipClass,
  primaryButtonClass as viewerPrimaryButtonClass,
  outlineButtonClass as viewerOutlineButtonClass,
  linkClass as viewerLinkClass,
  backLinkClass as viewerBackLinkClass,
} from "@/features/escrow/components/shared/design-tokens";
