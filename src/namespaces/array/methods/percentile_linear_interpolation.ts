// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';
import { Context } from '../../../Context.class';

export function percentile_linear_interpolation(context: Context) {
    return (id: PineArrayObject, percentage: number): number => {
        const array = id.array;
        if (array.length === 0) return NaN;

        const validValues: number[] = [];
        for (const item of array) {
            const val = Number(item);
            if (isNaN(val) || val === null || val === undefined) {
                return NaN; // Propagate NaN if any value is invalid
            }
            validValues.push(val);
        }

        validValues.sort((a, b) => a - b);

        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;

        // Pine Script seems to use the formula: k = (p/100) * N - 0.5
        // This corresponds to the Hazen plotting position definition.
        const k = (percentage / 100) * validValues.length - 0.5;

        // Handle boundaries
        if (k <= 0) return context.precision(validValues[0]);
        if (k >= validValues.length - 1) return context.precision(validValues[validValues.length - 1]);

        const i = Math.floor(k);
        const f = k - i;

        return context.precision(validValues[i] * (1 - f) + validValues[i + 1] * f);
    };
}
