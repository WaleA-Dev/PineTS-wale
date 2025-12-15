// SPDX-License-Identifier: AGPL-3.0-only

export type InputOptions = {
    defval?: any;
    title?: string;
    options?: any[];
    tooltip?: string;
    minval?: number;
    maxval?: number;
    step?: number;
    inline?: string;
    group?: string;
    confirm?: boolean;
    display?: string;
    active?: boolean;
};

export const InputOptionsKeys = ['defval', 'title', 'options', 'tooltip', 'minval', 'maxval', 'step', 'inline', 'group', 'confirm'] as const;
