// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function sum(context: any) {
    return (id: PineArrayObject): number => {
        return id.array.reduce((a: number, b: any) => {
            const val = Number(b);
            return isNaN(val) ? a : a + val;
        }, 0);
    };
}
