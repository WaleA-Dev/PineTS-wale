// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function percentile_nearest_rank(context: any) {
    return (id: PineArrayObject, percentage: number): number => {
        const array = id.array;
        if (array.length === 0) return NaN;

        const validValues: number[] = [];
        for (const item of array) {
            const val = Number(item);
            if (!isNaN(val) && val !== null && val !== undefined) {
                validValues.push(val);
            }
        }

        if (validValues.length === 0) return NaN;

        validValues.sort((a, b) => a - b);

        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;

        // Nearest Rank Method
        // Use total array length (including NaNs) for calculation to match Pine Script behavior
        // observed in tests where NaNs dilute the percentile rank.
        const totalCount = array.length;
        const rank = Math.ceil((percentage / 100) * totalCount);

        if (rank <= 0) {
            // If P=0, usually return min, but strictly following formula rank=0 is invalid index.
            // If we assume P=0 maps to index 0:
            return validValues[0];
        }

        if (rank > validValues.length) return NaN;

        return validValues[rank - 1];
    };
}


