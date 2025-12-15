// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function __eq(context: any) {
    return (a: any, b: any) => {
        // Unwrap Series
        const valA = Series.from(a).get(0);
        const valB = Series.from(b).get(0);

        if (isNaN(valA) && isNaN(valB)) return true; // Treat NaNs as equal?

        if (isNaN(valA) || isNaN(valB)) return false; // One is NaN, other is not -> False.

        return Math.abs(valA - valB) < 1e-8;
    };
}
