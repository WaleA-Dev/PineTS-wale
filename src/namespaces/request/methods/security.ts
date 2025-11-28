// SPDX-License-Identifier: AGPL-3.0-only

import { PineTS } from '../../../PineTS.class';
import { Series } from '../../../Series';
import { TIMEFRAMES } from '../utils/TIMEFRAMES';
import { findSecContextIdx } from '../utils/findSecContextIdx';
import { findLTFContextIdx } from '../utils/findLTFContextIdx';

export function security(context: any) {
    return async (
        symbol: any,
        timeframe: any,
        expression: any,
        gaps: boolean | any[] = false,
        lookahead: boolean | any[] = false,
        ignore_invalid_symbol: boolean = false,
        currency: any = null,
        calc_bars_count: any = null
    ) => {
        const _symbol = symbol[0];
        const _timeframe = timeframe[0];
        const _expression = expression[0];
        const _expression_name = expression[1];
        const _barmerge = gaps[0];
        const _lookahead = lookahead[0];

        const ctxTimeframeIdx = TIMEFRAMES.indexOf(context.timeframe);
        const reqTimeframeIdx = TIMEFRAMES.indexOf(_timeframe);

        if (ctxTimeframeIdx == -1 || reqTimeframeIdx == -1) {
            throw new Error('Invalid timeframe');
        }

        if (ctxTimeframeIdx === reqTimeframeIdx) {
            return _expression;
        }

        const isLTF = ctxTimeframeIdx > reqTimeframeIdx;

        const myOpenTime = Series.from(context.data.openTime).get(0);
        const myCloseTime = Series.from(context.data.closeTime).get(0);

        if (context.cache[_expression_name]) {
            const secContext = context.cache[_expression_name];
            const secContextIdx = isLTF
                ? findLTFContextIdx(myOpenTime, myCloseTime, secContext.data.openTime, secContext.data.closeTime, _lookahead, context.eDate)
                : findSecContextIdx(myOpenTime, myCloseTime, secContext.data.openTime, secContext.data.closeTime, _lookahead);
            return secContextIdx == -1 ? NaN : secContext.params[_expression_name][secContextIdx];
        }

        // Add buffer to sDate to ensure bar start is covered
        // For HTF: ensure HTF bar start is covered
        // For LTF: ensure LTF bars covering the start of the Chart bar are covered
        const buffer = 1000 * 60 * 60 * 24 * 30; // 30 days buffer (generous)
        const adjustedSDate = context.sDate ? context.sDate - buffer : undefined;

        // If we have a date range, we shouldn't artificially limit the bars to 1000
        // unless the user explicitly requested a limit.
        const limit = context.sDate && context.eDate ? undefined : context.limit || 1000;

        // We pass undefined for eDate to allow loading full history for the security context
        // This ensures we can correctly resolve historical bars even if the main context is limited
        const pineTS = new PineTS(context.source, _symbol, _timeframe, limit, adjustedSDate, undefined);

        const secContext = await pineTS.run(context.pineTSCode);

        context.cache[_expression_name] = secContext;

        const secContextIdx = isLTF
            ? findLTFContextIdx(myOpenTime, myCloseTime, secContext.data.openTime, secContext.data.closeTime, _lookahead, context.eDate)
            : findSecContextIdx(myOpenTime, myCloseTime, secContext.data.openTime, secContext.data.closeTime, _lookahead);

        return secContextIdx == -1 ? NaN : secContext.params[_expression_name][secContextIdx];
    };
}
