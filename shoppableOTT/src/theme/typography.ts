import { COLORS } from './colors';

export const TYPOGRAPHY = {
  heroTitle: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800' as const,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: COLORS.textSecondary,
  },
  bodyRegular: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  categoryPill: {
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 0.1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
};
