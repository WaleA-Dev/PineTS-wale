import { describe, expect, it } from 'vitest';
import { Context, PineTS, Provider } from 'index';

describe('Array Access & Information', () => {
    it('SET, GET, FIRST', async () => {
        const pineTS = new PineTS(Provider.Binance, 'BTCUSDT', 'W', 500, 0, new Date('Jan 20 2025').getTime() - 1);

        const { result } = await pineTS.run((context) => {
            const array = context.array;
            const { close } = context.data;

            const arr = array.new(10, close);

            array.set(arr, 1, 99);

            const arr_val = array.get(arr, 1);
            const first = array.first(arr);

            return {
                arr_val,
                first,
            };
        });

        const part_arr_val = result.arr_val.reverse().slice(0, 5);
        const part_first = result.first.reverse().slice(0, 5);

        const expected_arr_val = [99, 99, 99, 99, 99];
        const expected_first = [101331.57, 94545.06, 98363.61, 93738.2, 95186.27];

        expect(part_arr_val).toEqual(expected_arr_val);
        expect(part_first).toEqual(expected_first);
    });

    it('SET, GET, FIRST from Array Object', async () => {
        const pineTS = new PineTS(Provider.Binance, 'BTCUSDT', 'W', 500, 0, new Date('Jan 20 2025').getTime() - 1);

        const { result } = await pineTS.run((context) => {
            const array = context.array;
            const { close } = context.data;

            const arr = array.new(10, close);

            arr.set(1, 99);

            const arr_val = arr.get(1);
            const first = arr.first();

            return {
                arr_val,
                first,
            };
        });

        const part_arr_val = result.arr_val.reverse().slice(0, 5);
        const part_first = result.first.reverse().slice(0, 5);

        const expected_arr_val = [99, 99, 99, 99, 99];
        const expected_first = [101331.57, 94545.06, 98363.61, 93738.2, 95186.27];

        expect(part_arr_val).toEqual(expected_arr_val);
        expect(part_first).toEqual(expected_first);
    });
});
