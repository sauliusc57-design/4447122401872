/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#E8873A';
const tintColorDark = '#E8873A';

export const Colors = {
  light: {
    text: '#2C1F0E',
    background: '#FDF6EE',
    tint: tintColorLight,
    icon: '#9C886C',
    tabIconDefault: '#9C886C',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F5ECD8',
    background: '#1C1612',
    tint: tintColorDark,
    icon: '#9C886C',
    tabIconDefault: '#9C886C',
    tabIconSelected: tintColorDark,
  },
};

// Shared light/dark color palettes used across all screens and components.
// All keys are a superset of every per-screen color object they replace.
export const lightColors = {
  background: '#FDF6EE',
  card: '#FFFAF4',
  border: '#E8D5B7',
  // text hierarchy
  title: '#2C1F0E',
  text: '#2C1F0E',
  subtitle: '#5C4A2E',
  label: '#5C4A2E',
  value: '#2C1F0E',
  message: '#5C4A2E',
  meta: '#5C4A2E',
  notes: '#5C4A2E',
  category: '#5C4A2E',
  destination: '#5C4A2E',
  dateLabel: '#5C4A2E',
  legendFont: '#5C4A2E',
  menuText: '#2C1F0E',
  // section labels
  sectionTitle: '#2C1F0E',
  sectionSubtitle: '#9C886C',
  infoLabel: '#5C4A2E',
  infoValue: '#2C1F0E',
  // cards
  cardTitle: '#2C1F0E',
  cardMeta: '#5C4A2E',
  cardDate: '#5C4A2E',
  cardNotes: '#5C4A2E',
  // muted / placeholder
  placeholder: '#9C886C',
  icon: '#9C886C',
  chevron: '#9C886C',
  yearLabel: '#9C886C',
  placeholderBg: '#E8D5B7',
  placeholderText: '#9C886C',
  // empty states
  emptyTitle: '#2C1F0E',
  emptyText: '#5C4A2E',
  // chips
  chipBg: '#FDF6EE',
  chipBorder: '#9C886C',
  chipText: '#2C1F0E',
  chipSelectedBg: '#E8873A',
  chipSelectedText: '#FFFFFF',
  // accent / action
  clearText: '#E8873A',
  // iOS date picker
  iosDoneText: '#2C1F0E',
  iosDoneBorder: '#E8D5B7',
  // pill / badge
  metaPillBg: '#FDF6EE',
  metaPillText: '#2C1F0E',
  memoryBadgeBg: '#FFF3E8',
  memoryBadgeText: '#E8873A',
  // misc
  categoryDot: '#E8D5B7',
  // progress / targets
  progressText: '#2C1F0E',
  progressTrack: '#E8D5B7',
  subText: '#5C4A2E',
  summary: '#2C1F0E',
  statusUnmet: '#E8D5B7',
  statusUnmetText: '#5C4A2E',
  // charts
  chartLine: 'rgba(232, 135, 58,',
  chartLabel: 'rgba(92, 74, 46,',
  chartDot: '#E8873A',
  pieEmpty: '#E8D5B7',
};

export const darkColors = {
  background: '#1C1612',
  card: '#251E14',
  border: '#3D3020',
  // text hierarchy
  title: '#F5ECD8',
  text: '#F5ECD8',
  subtitle: '#D4C4A8',
  label: '#D4C4A8',
  value: '#F5ECD8',
  message: '#D4C4A8',
  meta: '#D4C4A8',
  notes: '#D4C4A8',
  category: '#D4C4A8',
  destination: '#D4C4A8',
  dateLabel: '#D4C4A8',
  legendFont: '#D4C4A8',
  menuText: '#F5ECD8',
  // section labels
  sectionTitle: '#F5ECD8',
  sectionSubtitle: '#D4C4A8',
  infoLabel: '#D4C4A8',
  infoValue: '#F5ECD8',
  // cards
  cardTitle: '#F5ECD8',
  cardMeta: '#D4C4A8',
  cardDate: '#D4C4A8',
  cardNotes: '#D4C4A8',
  // muted / placeholder
  placeholder: '#9C886C',
  icon: '#9C886C',
  chevron: '#9C886C',
  yearLabel: '#9C886C',
  placeholderBg: '#251E14',
  placeholderText: '#9C886C',
  // empty states
  emptyTitle: '#F5ECD8',
  emptyText: '#D4C4A8',
  // chips
  chipBg: '#251E14',
  chipBorder: '#3D3020',
  chipText: '#F5ECD8',
  chipSelectedBg: '#E8873A',
  chipSelectedText: '#FFFFFF',
  // accent / action
  clearText: '#E8873A',
  // iOS date picker
  iosDoneText: '#F5ECD8',
  iosDoneBorder: '#3D3020',
  // pill / badge
  metaPillBg: '#1C1612',
  metaPillText: '#F5ECD8',
  memoryBadgeBg: '#3D2810',
  memoryBadgeText: '#E8873A',
  // misc
  categoryDot: '#3D3020',
  // progress / targets
  progressText: '#F5ECD8',
  progressTrack: '#3D3020',
  subText: '#D4C4A8',
  summary: '#F5ECD8',
  statusUnmet: '#3D3020',
  statusUnmetText: '#D4C4A8',
  // charts
  chartLine: 'rgba(232, 135, 58,',
  chartLabel: 'rgba(212, 196, 168,',
  chartDot: '#E8873A',
  pieEmpty: '#3D3020',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
