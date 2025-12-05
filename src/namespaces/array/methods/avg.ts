// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function avg(context: any) {
    return (id: PineArrayObject): number => {
        let mean = 0;
        let count = 0;
        for (const item of id.array) {
            const val = Number(item);
            if (!isNaN(val)) {
                count++;
                mean += (val - mean) / count;
            }
        }
        if (count === 0) return NaN;
        return mean;
    };
}
