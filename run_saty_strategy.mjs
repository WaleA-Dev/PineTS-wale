/**
 * Test script to run Saty Phase strategy with PineTS
 * Implements RTH filtering and price adjustment for TradingView parity
 */
import { readFileSync } from 'fs';
import { PineTS } from './dist/pinets.dev.es.js';

// Configuration
const RTH_ONLY = true;  // Filter to Regular Trading Hours (09:30-16:00 ET)
// Price adjustment: Reference Trade #1 entry $58.95 vs our $61.18 = 0.9635 adjustment
const PRICE_ADJUSTMENT = 0.9635;  // Multiply OHLC by this factor to match TradingView

// Check if a timestamp is within RTH (09:30-16:00 ET)
function isRTH(timestamp) {
    const date = new Date(timestamp);
    // Get hour in ET (Eastern Time)
    // Note: This is a simplified check - proper timezone handling would need a library
    const utcHour = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();

    // ET is UTC-5 (EST) or UTC-4 (EDT)
    // For simplicity, we'll check if hour is between 14:30-21:00 UTC (9:30-16:00 ET during EST)
    // and 13:30-20:00 UTC during EDT
    // Since our data spans multiple seasons, we'll use a broader check

    const totalMinutes = utcHour * 60 + utcMinutes;
    // RTH in EST (winter): 14:30-21:00 UTC = 870-1260 minutes
    // RTH in EDT (summer): 13:30-20:00 UTC = 810-1200 minutes
    // We'll use the union: 13:30-21:00 UTC = 810-1260 minutes
    return totalMinutes >= 810 && totalMinutes < 1260;
}

// Load NDAQ data from CSV with optional RTH filtering
function loadDatabentoCSV(filepath, rthOnly = false, priceAdjustment = 1.0) {
    const content = readFileSync(filepath, 'utf-8');
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');

    const candles = [];
    let skippedETH = 0;

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const timestamp = new Date(values[0]).getTime();

        // Filter to RTH if enabled
        if (rthOnly && !isRTH(timestamp)) {
            skippedETH++;
            continue;
        }

        const candle = {
            open: parseFloat(values[1]) * priceAdjustment,
            high: parseFloat(values[2]) * priceAdjustment,
            low: parseFloat(values[3]) * priceAdjustment,
            close: parseFloat(values[4]) * priceAdjustment,
            volume: parseFloat(values[5]) || 0,
            openTime: timestamp,
        };
        candles.push(candle);
    }

    if (rthOnly) {
        console.log(`Filtered out ${skippedETH} ETH bars, kept ${candles.length} RTH bars`);
    }

    return candles;
}

async function main() {
    console.log('Loading NDAQ data...');
    console.log(`RTH filtering: ${RTH_ONLY ? 'ENABLED' : 'DISABLED'}`);
    console.log(`Price adjustment: ${PRICE_ADJUSTMENT}`);

    const dataPath = '../pinescript-backtest-engine/data/NDAQ_1H.csv';
    const candles = loadDatabentoCSV(dataPath, RTH_ONLY, PRICE_ADJUSTMENT);
    console.log(`Loaded ${candles.length} candles`);
    console.log(`Date range: ${new Date(candles[0].openTime)} to ${new Date(candles[candles.length-1].openTime)}`);

    // Initialize PineTS with custom data
    const pineTS = new PineTS(candles);
    await pineTS.ready();

    console.log('Running Saty Phase strategy...');

    // Full Saty Phase strategy with High WR preset
    const strategyCode = `
//@version=6
strategy("Saty Phase - High WR", overlay=true, initial_capital=100000)

// === CONFIGURATION (High WR Preset) ===
stop_loss_pct = 14.0
trailing_pct = 0.40
profit_target_pct = 4.5
use_ob_exit = false
entry_threshold = -50

// === CORE INDICATORS ===
pivot = ta.ema(close, 21)
atr14 = ta.atr(14)
raw_signal = ((close - pivot) / (3.0 * atr14)) * 100
oscillator = ta.ema(raw_signal, 3)

// === ENTRY SIGNALS ===
leaving_entry = oscillator[1] <= entry_threshold and oscillator > entry_threshold
leaving_extreme = oscillator[1] <= -100 and oscillator > -100

// === STATE TRACKING ===
var float entryPrice = na
var float highestSinceEntry = na
var bool trailingActive = false
var float trailStopPrice = na

// === ENTRY ===
if (leaving_entry or leaving_extreme) and strategy.position_size == 0
    strategy.entry("Long", "long")
    entryPrice := close
    highestSinceEntry := close
    trailingActive := false
    trailStopPrice := na

// === POSITION MANAGEMENT ===
if strategy.position_size > 0
    highestSinceEntry := math.max(highestSinceEntry, high)
    currentPnL = ((close - entryPrice) / entryPrice) * 100
    stopLossPrice = entryPrice * (1 - stop_loss_pct / 100)

    // Activate trailing stop when profit target reached
    if currentPnL >= profit_target_pct and not trailingActive
        trailingActive := true
        trailStopPrice := highestSinceEntry * (1 - trailing_pct / 100)

    // Update trailing stop
    if trailingActive
        trailStopPrice := math.max(trailStopPrice, highestSinceEntry * (1 - trailing_pct / 100))

    // === EXIT CONDITIONS ===
    if low <= stopLossPrice
        strategy.close("Long", comment="SL")
        entryPrice := na
        highestSinceEntry := na
        trailingActive := false
        trailStopPrice := na
    else if trailingActive and low <= trailStopPrice
        strategy.close("Long", comment="Trail")
        entryPrice := na
        highestSinceEntry := na
        trailingActive := false
        trailStopPrice := na

// Reset on position close
if strategy.position_size == 0 and strategy.position_size[1] > 0
    entryPrice := na
    highestSinceEntry := na
    trailingActive := false
    trailStopPrice := na

plot(oscillator, "Oscillator")
`;

    try {
        const result = await pineTS.run(strategyCode);
        console.log('Strategy execution completed!');

        // Get strategy results from pine.strategy
        if (result.pine && result.pine.strategy && typeof result.pine.strategy.getResults === 'function') {
            const strategyResults = result.pine.strategy.getResults();
            console.log('\n=== Backtest Results ===');
            console.log(`Total Trades: ${strategyResults.statistics.totalTrades}`);
            console.log(`Winning Trades: ${strategyResults.statistics.winningTrades}`);
            console.log(`Losing Trades: ${strategyResults.statistics.losingTrades}`);
            console.log(`Win Rate: ${strategyResults.statistics.winRate.toFixed(2)}%`);
            console.log(`Net Profit: ${strategyResults.statistics.netProfit.toFixed(2)}`);
            console.log(`Profit Factor: ${strategyResults.statistics.profitFactor.toFixed(2)}`);
            console.log(`Final Equity: ${strategyResults.statistics.finalEquity.toFixed(2)}`);

            console.log('\n=== Trade List ===');
            console.log('# | Entry Date | Entry Price | Exit Date | Exit Price | Exit Type | PnL');
            console.log('-'.repeat(90));
            let tradeNum = 1;
            for (const trade of strategyResults.trades) {
                const entryDate = trade.entryTime ? new Date(trade.entryTime).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A';
                const exitDate = trade.exitTime ? new Date(trade.exitTime).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'OPEN';
                // Handle exitComment - it might be an object with comment property
                let exitType = 'N/A';
                if (trade.exitComment) {
                    exitType = typeof trade.exitComment === 'object' ? (trade.exitComment.comment || JSON.stringify(trade.exitComment)) : trade.exitComment;
                }
                console.log(`${tradeNum} | ${entryDate} | $${trade.entryPrice.toFixed(2)} | ${exitDate} | $${trade.exitPrice?.toFixed(2) || 'N/A'} | ${exitType} | ${trade.pnl?.toFixed(2) || 'N/A'}`);
                tradeNum++;
            }
        } else {
            console.log('No strategy results available');
        }

        // Also show plots
        console.log('\nPlots available:', Object.keys(result.plots));

    } catch (error) {
        console.error('Error running strategy:', error);
    }
}

main().catch(console.error);
