// Brand identity strings. ONE source for the app name so the rename (still TBD,
// see docs/README.md naming TODO) is a single edit, not a repo-wide find/replace.
//
// House style: no em dashes in copy. Use a comma or a sentence break instead.

export const BRAND = {
  appName: 'Aura', // TODO(naming): replace once a distinctive, cleared name is chosen.
} as const;

/** Resolve the {AppName} token in a copy string to the real brand name. */
export const withAppName = (s: string): string => s.replaceAll('{AppName}', BRAND.appName);
