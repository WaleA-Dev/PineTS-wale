// SPDX-License-Identifier: AGPL-3.0-only

import { parseInputOptions } from '../utils';

export function price(context: any) {
    return (...args: any[]) => {
        const options = parseInputOptions(args);
        return options.defval;
    };
}
