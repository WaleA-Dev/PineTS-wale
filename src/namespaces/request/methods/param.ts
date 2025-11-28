// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function param(context: any) {
    return (source: any, index: any, name?: string) => {
        if (!context.params[name]) context.params[name] = [];

        let val;
        if (source instanceof Series || Array.isArray(source)) {
            val = Series.from(source).get(index || 0);
        } else {
            val = source;
        }

        if (context.params[name].length === 0) {
            context.params[name].push(val);
        } else {
            context.params[name][context.params[name].length - 1] = val;
        }

        return [val, name];
    };
}
