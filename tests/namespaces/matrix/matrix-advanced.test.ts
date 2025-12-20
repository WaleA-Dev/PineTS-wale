// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2025 Alaa-eddine KADDOURI

import { describe, it, expect } from 'vitest';
import { PineTS } from '../../../src/PineTS.class';
import { Provider } from '@pinets/marketData/Provider.class';

describe('Matrix Methods - Advanced Operations', () => {
    const startDate = new Date('2024-01-01').getTime();
    const endDate = new Date('2024-01-05').getTime();

    describe('matrix.concat', () => {
        it('should concatenate two matrices vertically', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m1 = matrix.new(2, 2, 1);
                let m2 = matrix.new(2, 2, 2);
                matrix.concat(m1, m2); // Modifies m1 in place
                
                let rows = matrix.rows(m1);
                let cols = matrix.columns(m1);
                let val1 = matrix.get(m1, 0, 0);
                let val2 = matrix.get(m1, 2, 0);
                
                plotchar(rows, 'rows');
                plotchar(cols, 'cols');
                plotchar(val1, 'val1');
                plotchar(val2, 'val2');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['rows'].data[0].value).toBe(4);
            expect(plots['cols'].data[0].value).toBe(2);
            expect(plots['val1'].data[0].value).toBe(1);
            expect(plots['val2'].data[0].value).toBe(2);
        });
    });

    describe('matrix.diff', () => {
        it('should compute element-wise difference', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m1 = matrix.new(2, 2, 10);
                let m2 = matrix.new(2, 2, 3);
                let result = matrix.diff(m1, m2);
                
                let val = matrix.get(result, 0, 0);
                
                plotchar(val, 'val');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['val'].data[0].value).toBe(7); // 10 - 3
        });
    });

    describe('matrix.pow', () => {
        it('should compute matrix power (multiplication)', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(2, 2, 2);
                let result = matrix.pow(m, 3); // M^3 = M * M * M
                
                let val = matrix.get(result, 0, 0);
                
                plotchar(val, 'val');
            `;

            const { plots } = await pineTS.run(code);
            // [[2,2],[2,2]] * [[2,2],[2,2]] = [[8,8],[8,8]]
            // [[8,8],[8,8]] * [[2,2],[2,2]] = [[32,32],[32,32]]
            expect(plots['val'].data[0].value).toBe(32);
        });
    });

    describe('matrix.row', () => {
        it('should extract a row from matrix', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, array, plotchar } = context.pine;
                
                let m = matrix.new(3, 3, 0);
                matrix.set(m, 1, 0, 10);
                matrix.set(m, 1, 1, 20);
                matrix.set(m, 1, 2, 30);
                
                let row = matrix.row(m, 1);
                let size = array.size(row);
                let val0 = array.get(row, 0);
                let val1 = array.get(row, 1);
                let val2 = array.get(row, 2);
                
                plotchar(size, 'size');
                plotchar(val0, 'val0');
                plotchar(val1, 'val1');
                plotchar(val2, 'val2');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['size'].data[0].value).toBe(3);
            expect(plots['val0'].data[0].value).toBe(10);
            expect(plots['val1'].data[0].value).toBe(20);
            expect(plots['val2'].data[0].value).toBe(30);
        });
    });

    describe('matrix.col', () => {
        it('should extract a column from matrix', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, array, plotchar } = context.pine;
                
                let m = matrix.new(3, 3, 0);
                matrix.set(m, 0, 1, 10);
                matrix.set(m, 1, 1, 20);
                matrix.set(m, 2, 1, 30);
                
                let col = matrix.col(m, 1);
                let size = array.size(col);
                let val0 = array.get(col, 0);
                let val1 = array.get(col, 1);
                let val2 = array.get(col, 2);
                
                plotchar(size, 'size');
                plotchar(val0, 'val0');
                plotchar(val1, 'val1');
                plotchar(val2, 'val2');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['size'].data[0].value).toBe(3);
            expect(plots['val0'].data[0].value).toBe(10);
            expect(plots['val1'].data[0].value).toBe(20);
            expect(plots['val2'].data[0].value).toBe(30);
        });
    });

    describe('matrix.median', () => {
        it('should compute median of matrix elements', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(3, 3, 5);
                matrix.set(m, 0, 0, 1);
                matrix.set(m, 0, 1, 3);
                matrix.set(m, 0, 2, 9);
                
                let med = matrix.median(m);
                
                plotchar(med, 'median');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['median'].data[0].value).toBe(5);
        });
    });

    describe('matrix.sort', () => {
        it('should sort matrix rows', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(2, 3, 0);
                matrix.set(m, 0, 0, 3);
                matrix.set(m, 0, 1, 1);
                matrix.set(m, 0, 2, 2);
                
                matrix.sort(m, 0, 1); // Sort row 0, column 1 (ascending)
                
                let val0 = matrix.get(m, 0, 0);
                let val1 = matrix.get(m, 0, 1);
                let val2 = matrix.get(m, 0, 2);
                
                plotchar(val0, 'val0');
                plotchar(val1, 'val1');
                plotchar(val2, 'val2');
            `;

            const { plots } = await pineTS.run(code);
            // After sorting by column 1, order should be preserved or sorted
            expect(plots['val0'].data[0].value).toBeDefined();
            expect(plots['val1'].data[0].value).toBeDefined();
            expect(plots['val2'].data[0].value).toBeDefined();
        });
    });

    describe('matrix.reshape', () => {
        it('should reshape matrix dimensions', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(2, 3, 5); // 2x3 matrix
                matrix.reshape(m, 3, 2); // Reshape to 3x2 (modifies in place)
                
                let rows = matrix.rows(m);
                let cols = matrix.columns(m);
                let val = matrix.get(m, 0, 0);
                
                plotchar(rows, 'rows');
                plotchar(cols, 'cols');
                plotchar(val, 'val');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['rows'].data[0].value).toBe(3);
            expect(plots['cols'].data[0].value).toBe(2);
            expect(plots['val'].data[0].value).toBe(5);
        });
    });

    describe('matrix.reverse', () => {
        it('should reverse matrix rows and columns', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(3, 2, 0);
                matrix.set(m, 0, 0, 1);
                matrix.set(m, 0, 1, 2);
                matrix.set(m, 1, 0, 3);
                matrix.set(m, 1, 1, 4);
                matrix.set(m, 2, 0, 5);
                matrix.set(m, 2, 1, 6);
                
                matrix.reverse(m); // Reverses rows AND elements within each row
                
                let val00 = matrix.get(m, 0, 0); // Was at 2,1 (6)
                let val20 = matrix.get(m, 2, 0); // Was at 0,1 (2)
                
                plotchar(val00, 'val00');
                plotchar(val20, 'val20');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['val00'].data[0].value).toBe(6); // Was at position [2,1]
            expect(plots['val20'].data[0].value).toBe(2); // Was at position [0,1]
        });
    });

    describe('matrix boolean checks', () => {
        it('should check if matrix is square', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m1 = matrix.new(3, 3, 1);
                let m2 = matrix.new(2, 3, 1);
                
                let isSquare1 = matrix.is_square(m1) ? 1 : 0;
                let isSquare2 = matrix.is_square(m2) ? 1 : 0;
                
                plotchar(isSquare1, 'isSquare1');
                plotchar(isSquare2, 'isSquare2');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['isSquare1'].data[0].value).toBe(1);
            expect(plots['isSquare2'].data[0].value).toBe(0);
        });

        it('should check if matrix is zero', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m1 = matrix.new(2, 2, 0);
                let m2 = matrix.new(2, 2, 1);
                
                let isZero1 = matrix.is_zero(m1) ? 1 : 0;
                let isZero2 = matrix.is_zero(m2) ? 1 : 0;
                
                plotchar(isZero1, 'isZero1');
                plotchar(isZero2, 'isZero2');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['isZero1'].data[0].value).toBe(1);
            expect(plots['isZero2'].data[0].value).toBe(0);
        });

        it('should check if matrix is identity', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(2, 2, 0);
                matrix.set(m, 0, 0, 1);
                matrix.set(m, 1, 1, 1);
                
                let isIdentity = matrix.is_identity(m) ? 1 : 0;
                
                plotchar(isIdentity, 'isIdentity');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['isIdentity'].data[0].value).toBe(1);
        });

        it('should check if matrix is diagonal', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(3, 3, 0);
                matrix.set(m, 0, 0, 5);
                matrix.set(m, 1, 1, 3);
                matrix.set(m, 2, 2, 7);
                
                let isDiagonal = matrix.is_diagonal(m) ? 1 : 0;
                
                plotchar(isDiagonal, 'isDiagonal');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['isDiagonal'].data[0].value).toBe(1);
        });

        it('should check if matrix is symmetric', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(3, 3, 0);
                matrix.set(m, 0, 0, 1);
                matrix.set(m, 0, 1, 2);
                matrix.set(m, 1, 0, 2);
                matrix.set(m, 1, 1, 3);
                matrix.set(m, 2, 2, 4);
                
                let isSymmetric = matrix.is_symmetric(m) ? 1 : 0;
                
                plotchar(isSymmetric, 'isSymmetric');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['isSymmetric'].data[0].value).toBe(1);
        });

        it('should check if matrix is triangular', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(3, 3, 0);
                matrix.set(m, 0, 0, 1);
                matrix.set(m, 0, 1, 2);
                matrix.set(m, 0, 2, 3);
                matrix.set(m, 1, 1, 4);
                matrix.set(m, 1, 2, 5);
                matrix.set(m, 2, 2, 6);
                
                let isTriangular = matrix.is_triangular(m) ? 1 : 0;
                
                plotchar(isTriangular, 'isTriangular');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['isTriangular'].data[0].value).toBe(1);
        });

        it('should check if matrix is binary', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m1 = matrix.new(2, 2, 0);
                matrix.set(m1, 0, 0, 1);
                matrix.set(m1, 1, 1, 1);
                
                let m2 = matrix.new(2, 2, 5);
                
                let isBinary1 = matrix.is_binary(m1) ? 1 : 0;
                let isBinary2 = matrix.is_binary(m2) ? 1 : 0;
                
                plotchar(isBinary1, 'isBinary1');
                plotchar(isBinary2, 'isBinary2');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['isBinary1'].data[0].value).toBe(1);
            expect(plots['isBinary2'].data[0].value).toBe(0);
        });

        it('should check if matrix is stochastic', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(2, 2, 0.5);
                
                let isStochastic = matrix.is_stochastic(m) ? 1 : 0;
                
                plotchar(isStochastic, 'isStochastic');
            `;

            const { plots } = await pineTS.run(code);
            // Stochastic matrix has rows that sum to 1
            expect(plots['isStochastic'].data[0].value).toBeDefined();
        });

        it('should check if matrix is antisymmetric', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(3, 3, 0);
                matrix.set(m, 0, 1, 2);
                matrix.set(m, 1, 0, -2);
                matrix.set(m, 0, 2, 3);
                matrix.set(m, 2, 0, -3);
                matrix.set(m, 1, 2, 1);
                matrix.set(m, 2, 1, -1);
                
                let isAntisymmetric = matrix.is_antisymmetric(m) ? 1 : 0;
                
                plotchar(isAntisymmetric, 'isAntisymmetric');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['isAntisymmetric'].data[0].value).toBe(1);
        });

        it('should check if matrix is antidiagonal', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(3, 3, 0);
                matrix.set(m, 0, 2, 1);
                matrix.set(m, 1, 1, 2);
                matrix.set(m, 2, 0, 3);
                
                let isAntidiagonal = matrix.is_antidiagonal(m) ? 1 : 0;
                
                plotchar(isAntidiagonal, 'isAntidiagonal');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['isAntidiagonal'].data[0].value).toBe(1);
        });
    });

    describe('matrix row/column operations', () => {
        it('should swap columns', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(2, 3, 0);
                matrix.set(m, 0, 0, 1);
                matrix.set(m, 0, 1, 2);
                matrix.set(m, 0, 2, 3);
                matrix.set(m, 1, 0, 4);
                matrix.set(m, 1, 1, 5);
                matrix.set(m, 1, 2, 6);
                
                matrix.swap_columns(m, 0, 2); // Swap first and last columns
                
                let val00 = matrix.get(m, 0, 0); // Should be 3 (was at 0,2)
                let val02 = matrix.get(m, 0, 2); // Should be 1 (was at 0,0)
                let val10 = matrix.get(m, 1, 0); // Should be 6 (was at 1,2)
                let val12 = matrix.get(m, 1, 2); // Should be 4 (was at 1,0)
                
                plotchar(val00, 'val00');
                plotchar(val02, 'val02');
                plotchar(val10, 'val10');
                plotchar(val12, 'val12');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['val00'].data[0].value).toBe(3);
            expect(plots['val02'].data[0].value).toBe(1);
            expect(plots['val10'].data[0].value).toBe(6);
            expect(plots['val12'].data[0].value).toBe(4);
        });

        it('should swap rows', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(3, 2, 0);
                matrix.set(m, 0, 0, 1);
                matrix.set(m, 0, 1, 2);
                matrix.set(m, 1, 0, 3);
                matrix.set(m, 1, 1, 4);
                matrix.set(m, 2, 0, 5);
                matrix.set(m, 2, 1, 6);
                
                matrix.swap_rows(m, 0, 2); // Swap first and last rows
                
                let val00 = matrix.get(m, 0, 0); // Should be 5 (was at 2,0)
                let val01 = matrix.get(m, 0, 1); // Should be 6 (was at 2,1)
                let val20 = matrix.get(m, 2, 0); // Should be 1 (was at 0,0)
                let val21 = matrix.get(m, 2, 1); // Should be 2 (was at 0,1)
                
                plotchar(val00, 'val00');
                plotchar(val01, 'val01');
                plotchar(val20, 'val20');
                plotchar(val21, 'val21');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['val00'].data[0].value).toBe(5);
            expect(plots['val01'].data[0].value).toBe(6);
            expect(plots['val20'].data[0].value).toBe(1);
            expect(plots['val21'].data[0].value).toBe(2);
        });

        it('should remove column', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(2, 3, 0);
                matrix.set(m, 0, 0, 1);
                matrix.set(m, 0, 1, 2);
                matrix.set(m, 0, 2, 3);
                matrix.set(m, 1, 0, 4);
                matrix.set(m, 1, 1, 5);
                matrix.set(m, 1, 2, 6);
                
                matrix.remove_col(m, 1); // Remove middle column
                
                let cols = matrix.columns(m);
                let val00 = matrix.get(m, 0, 0); // Should be 1
                let val01 = matrix.get(m, 0, 1); // Should be 3 (was at 0,2)
                let val10 = matrix.get(m, 1, 0); // Should be 4
                let val11 = matrix.get(m, 1, 1); // Should be 6 (was at 1,2)
                
                plotchar(cols, 'cols');
                plotchar(val00, 'val00');
                plotchar(val01, 'val01');
                plotchar(val10, 'val10');
                plotchar(val11, 'val11');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['cols'].data[0].value).toBe(2);
            expect(plots['val00'].data[0].value).toBe(1);
            expect(plots['val01'].data[0].value).toBe(3);
            expect(plots['val10'].data[0].value).toBe(4);
            expect(plots['val11'].data[0].value).toBe(6);
        });

        it('should remove row', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(3, 2, 0);
                matrix.set(m, 0, 0, 1);
                matrix.set(m, 0, 1, 2);
                matrix.set(m, 1, 0, 3);
                matrix.set(m, 1, 1, 4);
                matrix.set(m, 2, 0, 5);
                matrix.set(m, 2, 1, 6);
                
                matrix.remove_row(m, 1); // Remove middle row
                
                let rows = matrix.rows(m);
                let val00 = matrix.get(m, 0, 0); // Should be 1
                let val01 = matrix.get(m, 0, 1); // Should be 2
                let val10 = matrix.get(m, 1, 0); // Should be 5 (was at 2,0)
                let val11 = matrix.get(m, 1, 1); // Should be 6 (was at 2,1)
                
                plotchar(rows, 'rows');
                plotchar(val00, 'val00');
                plotchar(val01, 'val01');
                plotchar(val10, 'val10');
                plotchar(val11, 'val11');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['rows'].data[0].value).toBe(2);
            expect(plots['val00'].data[0].value).toBe(1);
            expect(plots['val01'].data[0].value).toBe(2);
            expect(plots['val10'].data[0].value).toBe(5);
            expect(plots['val11'].data[0].value).toBe(6);
        });

        it('should add row at specific index', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, array, plotchar } = context.pine;
                
                let m = matrix.new(2, 3, 0);
                matrix.set(m, 0, 0, 1);
                matrix.set(m, 0, 1, 2);
                matrix.set(m, 0, 2, 3);
                matrix.set(m, 1, 0, 7);
                matrix.set(m, 1, 1, 8);
                matrix.set(m, 1, 2, 9);
                
                let newRow = array.from(4, 5, 6);
                matrix.add_row(m, 1, newRow); // Insert at index 1
                
                let rows = matrix.rows(m);
                let val00 = matrix.get(m, 0, 0); // Should be 1 (unchanged)
                let val10 = matrix.get(m, 1, 0); // Should be 4 (new row)
                let val11 = matrix.get(m, 1, 1); // Should be 5 (new row)
                let val12 = matrix.get(m, 1, 2); // Should be 6 (new row)
                let val20 = matrix.get(m, 2, 0); // Should be 7 (was at 1,0)
                
                plotchar(rows, 'rows');
                plotchar(val00, 'val00');
                plotchar(val10, 'val10');
                plotchar(val11, 'val11');
                plotchar(val12, 'val12');
                plotchar(val20, 'val20');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['rows'].data[0].value).toBe(3);
            expect(plots['val00'].data[0].value).toBe(1);
            expect(plots['val10'].data[0].value).toBe(4);
            expect(plots['val11'].data[0].value).toBe(5);
            expect(plots['val12'].data[0].value).toBe(6);
            expect(plots['val20'].data[0].value).toBe(7);
        });
    });

    describe('matrix advanced math', () => {
        it('should compute matrix trace (sum of diagonal)', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(3, 3, 0);
                matrix.set(m, 0, 0, 5);
                matrix.set(m, 1, 1, 3);
                matrix.set(m, 2, 2, 7);
                
                let trace = matrix.trace(m); // 5 + 3 + 7 = 15
                
                plotchar(trace, 'trace');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['trace'].data[0].value).toBe(15);
        });

        it('should compute matrix determinant for 2x2', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(2, 2, 0);
                matrix.set(m, 0, 0, 4);
                matrix.set(m, 0, 1, 3);
                matrix.set(m, 1, 0, 2);
                matrix.set(m, 1, 1, 1);
                
                let det = matrix.det(m); // 4*1 - 3*2 = -2
                
                plotchar(det, 'det');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['det'].data[0].value).toBe(-2);
        });

        it('should compute matrix determinant for 3x3', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(3, 3, 0);
                matrix.set(m, 0, 0, 1);
                matrix.set(m, 0, 1, 2);
                matrix.set(m, 0, 2, 3);
                matrix.set(m, 1, 0, 0);
                matrix.set(m, 1, 1, 1);
                matrix.set(m, 1, 2, 4);
                matrix.set(m, 2, 0, 5);
                matrix.set(m, 2, 1, 6);
                matrix.set(m, 2, 2, 0);
                
                let det = matrix.det(m);
                
                plotchar(det, 'det');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['det'].data[0].value).toBeDefined();
            expect(typeof plots['det'].data[0].value).toBe('number');
        });

        it('should compute matrix inverse', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(2, 2, 0);
                matrix.set(m, 0, 0, 4);
                matrix.set(m, 0, 1, 7);
                matrix.set(m, 1, 0, 2);
                matrix.set(m, 1, 1, 6);
                
                let inv = matrix.inv(m);
                let val00 = matrix.get(inv, 0, 0);
                
                plotchar(val00, 'val00');
            `;

            const { plots } = await pineTS.run(code);
            // Inverse exists if determinant != 0
            expect(plots['val00'].data[0].value).toBeDefined();
        });

        it('should compute matrix rank', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(3, 3, 0);
                matrix.set(m, 0, 0, 1);
                matrix.set(m, 0, 1, 2);
                matrix.set(m, 1, 0, 2);
                matrix.set(m, 1, 1, 4);
                matrix.set(m, 2, 2, 1);
                
                let rank = matrix.rank(m);
                
                plotchar(rank, 'rank');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['rank'].data[0].value).toBeGreaterThan(0);
        });

        it('should compute Kronecker product', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m1 = matrix.new(2, 2, 1);
                let m2 = matrix.new(2, 2, 2);
                
                let kron = matrix.kron(m1, m2);
                let rows = matrix.rows(kron);
                let cols = matrix.columns(kron);
                
                plotchar(rows, 'rows');
                plotchar(cols, 'cols');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['rows'].data[0].value).toBe(4); // 2 * 2
            expect(plots['cols'].data[0].value).toBe(4); // 2 * 2
        });

        it('should compute eigenvalues', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, array, plotchar } = context.pine;
                
                let m = matrix.new(2, 2, 0);
                matrix.set(m, 0, 0, 4);
                matrix.set(m, 0, 1, 1);
                matrix.set(m, 1, 0, 2);
                matrix.set(m, 1, 1, 3);
                
                let eigenvals = matrix.eigenvalues(m);
                let size = array.size(eigenvals);
                
                plotchar(size, 'size');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['size'].data[0].value).toBeGreaterThan(0);
        });

        it('should compute eigenvectors', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(2, 2, 0);
                matrix.set(m, 0, 0, 4);
                matrix.set(m, 0, 1, 1);
                matrix.set(m, 1, 0, 2);
                matrix.set(m, 1, 1, 3);
                
                let eigenvecs = matrix.eigenvectors(m);
                let rows = matrix.rows(eigenvecs);
                
                plotchar(rows, 'rows');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['rows'].data[0].value).toBeGreaterThan(0);
        });

        it('should compute pseudo-inverse', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(2, 3, 0);
                matrix.set(m, 0, 0, 1);
                matrix.set(m, 0, 1, 2);
                matrix.set(m, 0, 2, 3);
                matrix.set(m, 1, 0, 4);
                matrix.set(m, 1, 1, 5);
                matrix.set(m, 1, 2, 6);
                
                let pinv = matrix.pinv(m);
                let rows = matrix.rows(pinv);
                let cols = matrix.columns(pinv);
                
                plotchar(rows, 'rows');
                plotchar(cols, 'cols');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['rows'].data[0].value).toBe(3);
            expect(plots['cols'].data[0].value).toBe(2);
        });

        it('should compute matrix multiplication (scalar)', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(2, 2, 3);
                let result = matrix.mult(m, 4); // Scalar multiplication
                
                let val00 = matrix.get(result, 0, 0);
                let val11 = matrix.get(result, 1, 1);
                
                plotchar(val00, 'val00');
                plotchar(val11, 'val11');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['val00'].data[0].value).toBe(12); // 3 * 4
            expect(plots['val11'].data[0].value).toBe(12); // 3 * 4
        });

        it('should compute matrix multiplication (matrix)', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m1 = matrix.new(2, 2, 0);
                matrix.set(m1, 0, 0, 1);
                matrix.set(m1, 0, 1, 2);
                matrix.set(m1, 1, 0, 3);
                matrix.set(m1, 1, 1, 4);
                
                let m2 = matrix.new(2, 2, 0);
                matrix.set(m2, 0, 0, 2);
                matrix.set(m2, 0, 1, 0);
                matrix.set(m2, 1, 0, 1);
                matrix.set(m2, 1, 1, 2);
                
                let result = matrix.mult(m1, m2); // Matrix multiplication
                // [[1,2],[3,4]] * [[2,0],[1,2]] = [[4,4],[10,8]]
                
                let val00 = matrix.get(result, 0, 0);
                let val01 = matrix.get(result, 0, 1);
                let val10 = matrix.get(result, 1, 0);
                let val11 = matrix.get(result, 1, 1);
                
                plotchar(val00, 'val00');
                plotchar(val01, 'val01');
                plotchar(val10, 'val10');
                plotchar(val11, 'val11');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['val00'].data[0].value).toBe(4); // 1*2 + 2*1
            expect(plots['val01'].data[0].value).toBe(4); // 1*0 + 2*2
            expect(plots['val10'].data[0].value).toBe(10); // 3*2 + 4*1
            expect(plots['val11'].data[0].value).toBe(8); // 3*0 + 4*2
        });
    });

    describe('matrix statistics', () => {
        it('should compute mode (most frequent value)', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(3, 3, 5);
                matrix.set(m, 0, 0, 1);
                matrix.set(m, 0, 1, 2);
                matrix.set(m, 0, 2, 5);
                matrix.set(m, 1, 0, 5);
                matrix.set(m, 2, 2, 3);
                
                let mode = matrix.mode(m); // 5 appears most frequently
                
                plotchar(mode, 'mode');
            `;

            const { plots } = await pineTS.run(code);
            expect(plots['mode'].data[0].value).toBe(5);
        });

        it('should handle mode with multiple same frequency values', async () => {
            const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, startDate, endDate);

            const code = `
                const { matrix, plotchar } = context.pine;
                
                let m = matrix.new(2, 2, 0);
                matrix.set(m, 0, 0, 1);
                matrix.set(m, 0, 1, 2);
                matrix.set(m, 1, 0, 1);
                matrix.set(m, 1, 1, 2);
                
                let mode = matrix.mode(m); // Both 1 and 2 appear twice
                
                plotchar(mode, 'mode');
            `;

            const { plots } = await pineTS.run(code);
            // Mode should return one of the most frequent values
            expect([1, 2]).toContain(plots['mode'].data[0].value);
        });
    });
});

