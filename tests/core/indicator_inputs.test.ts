import { describe, it, expect } from 'vitest';
import { PineTS } from '../../src/PineTS.class';
import { Provider } from '../../src/marketData/Provider.class';
import { Indicator } from '../../src/Indicator';

describe('PineTS Indicator Inputs', () => {
    it('should pass inputs to the context', async () => {
        const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', '1h');
        
        const inputs = {
            length: 14,
            source: 'close'
        };

        // Use direct property access or implicit injection
        const indicator = new Indicator(($) => {
            return $.inputs;
        }, inputs);

        const context = await pineTS.run(indicator);
        
        expect(context.inputs).toBeDefined();
        expect(context.inputs.length).toBe(14);
        expect(context.inputs.source).toBe('close');
        expect(context.result).toBeDefined();
        // Result is pushed every bar. Result is object inputs.
        // The result property in context stores the return value of the function.
        // If the function returns an object { length: 14, source: 'close' }, then context.result might be an array of objects or an object of arrays?
        // PineTS collects results. If return is object:
        // context.result[key] = []
        
        // Let's inspect how results are collected in PineTS.class.ts
        // if typeof result === 'object' ... for let key in result ... context.result[key].push(val)
        
        expect(context.result.length).toBeDefined();
        expect(context.result.source).toBeDefined();
        
        // Check last value
        expect(context.result.length[context.result.length.length - 1]).toBe(14);
        expect(context.result.source[context.result.source.length - 1]).toBe('close');
    });

    it('should use default inputs if not provided', async () => {
        const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', '1h');
        
        const indicator = new Indicator(($) => {
            return $.inputs;
        });

        const context = await pineTS.run(indicator);
        
        expect(context.inputs).toBeDefined();
        expect(Object.keys(context.inputs).length).toBe(0);
    });

    it('should work with paginated run', async () => {
        const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', '1h');
        
        const inputs = {
            threshold: 50
        };

        const indicator = new Indicator(($) => {
            return $.inputs.threshold;
        }, inputs);

        const iterator = pineTS.run(indicator, undefined, 10);
        let count = 0;
        
        for await (const ctx of iterator) {
            expect(ctx.inputs).toBeDefined();
            expect(ctx.inputs.threshold).toBe(50);
            
            // Result here is scalar return, so context.result is array
            const lastResult = ctx.result[ctx.result.length - 1];
            expect(lastResult).toBe(50);
            
            count++;
            if (count > 2) break;
        }
    });
});
