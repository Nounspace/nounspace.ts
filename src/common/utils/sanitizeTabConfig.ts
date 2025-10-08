import { cloneDeep, isArray, isPlainObject } from "lodash";

interface TabConfigSanitizerOptions {
  tabName?: string;
  log?: (message: string, ...details: unknown[]) => void;
  defaultIsPrivate?: boolean;
  requireIsPrivate?: boolean;
}

type TabConfigLike = Record<string, unknown> & {
  fidgetInstanceDatums?: Record<string, unknown> | undefined;
  layoutDetails?: Record<string, unknown> | undefined;
  theme?: Record<string, unknown> | undefined;
  fidgetTrayContents?: unknown;
  isPrivate?: unknown;
};

const warn = (
  options: TabConfigSanitizerOptions,
  reason: string,
  ...details: unknown[]
) => {
  if (options.log) {
    if (options.tabName) {
      options.log(reason, options.tabName, ...details);
    } else {
      options.log(reason, ...details);
    }
  }
};

export function sanitizeTabConfig<T extends Record<string, unknown>>(
  candidate: T | undefined,
  options: TabConfigSanitizerOptions = {},
): (T & { isPrivate?: boolean }) | undefined {
  if (!candidate) {
    return undefined;
  }

  if (!isPlainObject(candidate)) {
    warn(options, "tab config is not a plain object");
    return undefined;
  }

  const {
    fidgetInstanceDatums,
    layoutDetails,
    theme,
    fidgetTrayContents,
  } = candidate as TabConfigLike;

  if (fidgetTrayContents != null && !isArray(fidgetTrayContents)) {
    warn(options, "tab config fidget tray is not an array");
    return undefined;
  }

  if (layoutDetails != null && !isPlainObject(layoutDetails)) {
    warn(options, "tab config layout details is not a plain object");
    return undefined;
  }

  if (theme != null && !isPlainObject(theme)) {
    warn(options, "tab config theme is not a plain object");
    return undefined;
  }

  if (fidgetInstanceDatums != null && !isPlainObject(fidgetInstanceDatums)) {
    warn(options, "tab config fidget datums is not a plain object");
    return undefined;
  }

  if (isPlainObject(fidgetInstanceDatums)) {
    for (const [datumId, datum] of Object.entries(fidgetInstanceDatums)) {
      if (!isPlainObject(datum)) {
        warn(options, "tab config datum is not a plain object", datumId);
        return undefined;
      }

      const configValue = (datum as { config?: unknown }).config;
      if (configValue != null && !isPlainObject(configValue)) {
        warn(
          options,
          "tab config datum config is not a plain object",
          datumId,
        );
        return undefined;
      }
    }
  }

  const sanitized = cloneDeep(candidate) as T & { isPrivate?: boolean };

  if (options.requireIsPrivate || sanitized.isPrivate !== undefined) {
    sanitized.isPrivate = Boolean(sanitized.isPrivate);
  } else if (options.defaultIsPrivate !== undefined) {
    sanitized.isPrivate = options.defaultIsPrivate;
  }

  return sanitized;
}

export type { TabConfigSanitizerOptions };
