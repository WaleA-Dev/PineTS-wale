// SPDX-License-Identifier: AGPL-3.0-only
// Strategy namespace for PineTS - implements Pine Script strategy functions

import { Series } from '../../Series';

export interface StrategyOptions {
    title: string;
    shorttitle?: string;
    overlay?: boolean;
    initial_capital?: number;
    default_qty_type?: string;
    default_qty_value?: number;
    commission_type?: string;
    commission_value?: number;
    pyramiding?: number;
    calc_on_order_fills?: boolean;
    calc_on_every_tick?: boolean;
    max_bars_back?: number;
    backtest_fill_limits_assumption?: number;
    process_orders_on_close?: boolean;
    close_entries_rule?: string;
    margin_long?: number;
    margin_short?: number;
    slippage?: number;
    currency?: string;
    risk_free_rate?: number;
}

export interface Trade {
    id: string;
    direction: 'long' | 'short';
    entryBarIndex: number;
    entryTime: number;
    entryPrice: number;
    exitBarIndex?: number;
    exitTime?: number;
    exitPrice?: number;
    quantity: number;
    pnl?: number;
    pnlPercent?: number;
    entryComment?: string;
    exitComment?: string;
}

export interface StrategyState {
    options: StrategyOptions;
    equity: number;
    positionSize: number;
    positionAvgPrice: number;
    positionEntryName: string;
    trades: Trade[];
    openTrades: Trade[];
    closedTrades: Trade[];
    pendingOrders: any[];
}

export class Strategy {
    private state: StrategyState;
    private context: any;

    // Constants
    public readonly long = 'long';
    public readonly short = 'short';
    public readonly cash = 'cash';
    public readonly fixed = 'fixed';
    public readonly percent_of_equity = 'percent_of_equity';

    public readonly commission = {
        percent: 'percent',
        cash_per_contract: 'cash_per_contract',
        cash_per_order: 'cash_per_order',
    };

    public readonly direction = {
        all: 'all',
        long: 'long',
        short: 'short',
    };

    /**
     * Param helper for series access (used by transpiler)
     */
    public param(source: any, index: any = 0, name?: string): any {
        if (Array.isArray(source)) {
            return source[source.length - 1 - index];
        }
        return source;
    }

    constructor(context: any) {
        this.context = context;
        this.state = {
            options: {
                title: '',
                initial_capital: 100000,
                default_qty_type: 'percent_of_equity',
                default_qty_value: 100,
                commission_type: 'percent',
                commission_value: 0.1,
                pyramiding: 0,
            },
            equity: 100000,
            positionSize: 0,
            positionAvgPrice: 0,
            positionEntryName: '',
            trades: [],
            openTrades: [],
            closedTrades: [],
            pendingOrders: [],
        };
    }

    /**
     * Initialize strategy with options
     */
    public strategy(...args: any[]): void {
        const options = this.parseStrategyOptions(args);
        this.state.options = { ...this.state.options, ...options };
        this.state.equity = options.initial_capital || 100000;
    }

    private parseStrategyOptions(args: any[]): Partial<StrategyOptions> {
        const signature = [
            'title', 'shorttitle', 'overlay', 'format', 'precision', 'scale',
            'pyramiding', 'calc_on_order_fills', 'calc_on_every_tick',
            'max_bars_back', 'backtest_fill_limits_assumption',
            'process_orders_on_close', 'close_entries_rule',
            'initial_capital', 'default_qty_type', 'default_qty_value',
            'currency', 'slippage', 'commission_type', 'commission_value',
            'margin_long', 'margin_short', 'risk_free_rate'
        ];

        const options: Partial<StrategyOptions> = {};

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
                Object.assign(options, arg);
            } else if (i < signature.length) {
                (options as any)[signature[i]] = arg;
            }
        }

        return options;
    }

    // === Position Info ===
    get position_size(): number {
        return this.state.positionSize;
    }

    get position_avg_price(): number {
        return this.state.positionAvgPrice;
    }

    get position_entry_name(): string {
        return this.state.positionEntryName;
    }

    get equity(): number {
        return this.state.equity;
    }

    get initial_capital(): number {
        return this.state.options.initial_capital || 100000;
    }

    // === Trade Statistics ===
    get closedtrades(): number {
        return this.state.closedTrades.length;
    }

    get opentrades(): number {
        return this.state.openTrades.length;
    }

    get wintrades(): number {
        return this.state.closedTrades.filter(t => (t.pnl || 0) > 0).length;
    }

    get losstrades(): number {
        return this.state.closedTrades.filter(t => (t.pnl || 0) < 0).length;
    }

    get netprofit(): number {
        return this.state.closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    }

    get grossprofit(): number {
        return this.state.closedTrades
            .filter(t => (t.pnl || 0) > 0)
            .reduce((sum, t) => sum + (t.pnl || 0), 0);
    }

    get grossloss(): number {
        return Math.abs(this.state.closedTrades
            .filter(t => (t.pnl || 0) < 0)
            .reduce((sum, t) => sum + (t.pnl || 0), 0));
    }

    // === Order Management ===

    /**
     * Get current bar data
     */
    private getCurrentBar(): { open: number; high: number; low: number; close: number; volume: number; openTime: number } | null {
        const barIndex = this.context.idx;
        const data = this.context.data;

        // Access data from Series objects
        const close = data.close?.get?.(0);
        const open = data.open?.get?.(0);
        const high = data.high?.get?.(0);
        const low = data.low?.get?.(0);
        const volume = data.volume?.get?.(0);
        const openTime = data.openTime?.get?.(0);

        if (close === undefined || isNaN(close)) {
            // Try accessing from marketData
            const marketData = this.context.marketData;
            if (marketData && marketData[barIndex]) {
                return marketData[barIndex];
            }
            return null;
        }

        return { open, high, low, close, volume, openTime };
    }

    /**
     * Enter a position
     */
    public entry(id: string, direction: string, qty?: number, limit?: number, stop?: number, oca_name?: string, oca_type?: string, comment?: string, alert_message?: string, disable_alert?: boolean): void {
        const barIndex = this.context.idx;
        const currentBar = this.getCurrentBar();

        if (!currentBar) return;

        // Check if we already have a position
        if (this.state.positionSize !== 0) {
            // Check pyramiding
            const pyramiding = this.state.options.pyramiding || 0;
            if (this.state.openTrades.length >= pyramiding + 1) {
                return;
            }
        }

        // Calculate quantity
        const entryPrice = limit || currentBar.close;
        const calculatedQty = this.calculateQuantity(qty, entryPrice);

        // Create trade
        const trade: Trade = {
            id,
            direction: direction as 'long' | 'short',
            entryBarIndex: barIndex,
            entryTime: currentBar.openTime,
            entryPrice,
            quantity: calculatedQty,
            entryComment: comment,
        };

        this.state.openTrades.push(trade);
        this.state.trades.push(trade);
        this.state.positionSize += direction === 'long' ? calculatedQty : -calculatedQty;
        this.state.positionAvgPrice = entryPrice;
        this.state.positionEntryName = id;

        // Apply commission
        const commission = this.calculateCommission(calculatedQty, entryPrice);
        this.state.equity -= commission;
    }

    /**
     * Close a position
     */
    public close(id?: string, comment?: string | object, qty?: number, qty_percent?: number, alert_message?: string, immediately?: boolean, disable_alert?: boolean): void {
        const barIndex = this.context.idx;
        const currentBar = this.getCurrentBar();

        if (!currentBar) return;
        if (this.state.positionSize === 0) return;

        const exitPrice = currentBar.close;

        // Handle named parameters passed as object (from Pine Script transpilation)
        let actualComment: string | undefined;
        if (typeof comment === 'object' && comment !== null) {
            actualComment = (comment as any).comment;
        } else {
            actualComment = comment as string;
        }

        // Find and close open trades
        const tradesToClose = id
            ? this.state.openTrades.filter(t => t.id === id)
            : [...this.state.openTrades];

        for (const trade of tradesToClose) {
            trade.exitBarIndex = barIndex;
            trade.exitTime = currentBar.openTime;
            trade.exitPrice = exitPrice;
            trade.exitComment = actualComment;

            // Calculate PnL
            const priceDiff = trade.direction === 'long'
                ? exitPrice - trade.entryPrice
                : trade.entryPrice - exitPrice;
            trade.pnl = priceDiff * trade.quantity;
            trade.pnlPercent = (priceDiff / trade.entryPrice) * 100;

            // Apply commission
            const commission = this.calculateCommission(trade.quantity, exitPrice);
            trade.pnl -= commission;

            // Update equity
            this.state.equity += trade.pnl;

            // Move to closed trades
            this.state.closedTrades.push(trade);
            const idx = this.state.openTrades.indexOf(trade);
            if (idx > -1) {
                this.state.openTrades.splice(idx, 1);
            }
        }

        // Update position size
        this.state.positionSize = this.state.openTrades.reduce((sum, t) => {
            return sum + (t.direction === 'long' ? t.quantity : -t.quantity);
        }, 0);

        if (this.state.positionSize === 0) {
            this.state.positionAvgPrice = 0;
            this.state.positionEntryName = '';
        }
    }

    /**
     * Close all positions
     */
    public close_all(comment?: string): void {
        this.close(undefined, comment);
    }

    /**
     * Exit a position with profit target and stop loss
     */
    public exit(id: string, from_entry?: string, qty?: number, qty_percent?: number, profit?: number, limit?: number, loss?: number, stop?: number, trail_price?: number, trail_points?: number, trail_offset?: number, oca_name?: string, comment?: string, comment_profit?: string, comment_loss?: string, comment_trailing?: string, alert_message?: string, alert_profit?: string, alert_loss?: string, alert_trailing?: string, disable_alert?: boolean): void {
        // Exit is handled through close() in simplified implementation
        // Full implementation would manage pending exit orders
        this.close(from_entry, comment);
    }

    /**
     * Cancel pending orders
     */
    public cancel(id: string): void {
        this.state.pendingOrders = this.state.pendingOrders.filter(o => o.id !== id);
    }

    /**
     * Cancel all pending orders
     */
    public cancel_all(): void {
        this.state.pendingOrders = [];
    }

    // === Helper Methods ===

    private calculateQuantity(qty: number | undefined, price: number): number {
        const options = this.state.options;

        if (qty !== undefined) {
            return qty;
        }

        const qtyType = options.default_qty_type || 'percent_of_equity';
        const qtyValue = options.default_qty_value || 100;

        switch (qtyType) {
            case 'percent_of_equity':
                return Math.floor((this.state.equity * (qtyValue / 100)) / price);
            case 'cash':
                return Math.floor(qtyValue / price);
            case 'fixed':
                return qtyValue;
            default:
                return Math.floor((this.state.equity * (qtyValue / 100)) / price);
        }
    }

    private calculateCommission(qty: number, price: number): number {
        const options = this.state.options;
        const commissionType = options.commission_type || 'percent';
        const commissionValue = options.commission_value || 0;

        switch (commissionType) {
            case 'percent':
                return (qty * price * commissionValue) / 100;
            case 'cash_per_contract':
                return qty * commissionValue;
            case 'cash_per_order':
                return commissionValue;
            default:
                return 0;
        }
    }

    // === Results Export ===

    public getResults(): {
        trades: Trade[];
        statistics: {
            totalTrades: number;
            winningTrades: number;
            losingTrades: number;
            winRate: number;
            netProfit: number;
            grossProfit: number;
            grossLoss: number;
            profitFactor: number;
            finalEquity: number;
        };
    } {
        const winningTrades = this.state.closedTrades.filter(t => (t.pnl || 0) > 0).length;
        const losingTrades = this.state.closedTrades.filter(t => (t.pnl || 0) < 0).length;
        const totalTrades = this.state.closedTrades.length;

        return {
            trades: this.state.closedTrades,
            statistics: {
                totalTrades,
                winningTrades,
                losingTrades,
                winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
                netProfit: this.netprofit,
                grossProfit: this.grossprofit,
                grossLoss: this.grossloss,
                profitFactor: this.grossloss > 0 ? this.grossprofit / this.grossloss : 0,
                finalEquity: this.state.equity,
            },
        };
    }

    public getState(): StrategyState {
        return this.state;
    }
}
