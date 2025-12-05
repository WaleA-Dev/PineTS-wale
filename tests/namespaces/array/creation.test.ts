import { describe, expect, it } from 'vitest';
import { Context, PineTS, Provider } from 'index';

describe('Array Creation', () => {
    it('NEW', async () => {
        const pineTS = new PineTS(Provider.Binance, 'BTCUSDT', 'W', 500, 0, new Date('Jan 20 2025').getTime() - 1);

        const { result } = await pineTS.run((context) => {
            const array = context.array;
            const { close } = context.data;

            const arr = array.new(10, close);
            const size = array.size(arr);

            return {
                size,
            };
        });

        const part_size = result.size.reverse().slice(0, 5);
        const expected_size = [10, 10, 10, 10, 10];

        expect(part_size).toEqual(expected_size);
    });
});
