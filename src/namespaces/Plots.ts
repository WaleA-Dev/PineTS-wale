import { Series } from '../Series';
import { parseArgsForPineParams } from './utils';

const PLOT_SIGNATURE = [
    'series',
    'title',
    'color',
    'linewidth',
    'style',
    'trackprice',
    'histbase',
    'offset',
    'join',
    'editable',
    'show_last',
    'display',
    'format',
    'precision',
    'force_overlay',
];

const PLOT_ARGS_TYPES = {
    series: 'series',
    title: 'string',
    color: 'string',
    linewidth: 'number',
    style: 'string',
    trackprice: 'boolean',
    histbase: 'number',
    offset: 'number',
    join: 'bool',
    editable: 'boolean',
    show_last: 'number',
    display: 'string',
    format: 'string',
    precision: 'number',
    force_overlay: 'boolean',
};

export class PlotHelper {
    constructor(private context: any) {}
    private extractPlotOptions(options: PlotCharOptions) {
        const _options: any = {};
        for (let key in options) {
            _options[key] = Series.from(options[key]).get(0);
        }
        return _options;
    }

    //in the current implementation, plot functions are only used to collect data for the plots array and map it to the market data
    plotchar(series: number[], title: string, options: PlotCharOptions) {
        if (!this.context.plots[title]) {
            this.context.plots[title] = { data: [], options: this.extractPlotOptions(options), title };
        }

        const value = Series.from(series).get(0);

        this.context.plots[title].data.push({
            time: this.context.marketData[this.context.idx].openTime,
            value: value,
            options: { ...this.extractPlotOptions(options), style: 'char' },
        });
    }

    plot(...args) {
        const _parsed = parseArgsForPineParams<PlotOptions>(args, PLOT_SIGNATURE, PLOT_ARGS_TYPES);
        const { series, title, ...others } = _parsed;
        const options = this.extractPlotOptions(others);
        if (!this.context.plots[title]) {
            this.context.plots[title] = { data: [], options, title };
        }

        const value = Series.from(series).get(0);

        this.context.plots[title].data.push({
            time: this.context.marketData[this.context.idx].openTime,
            value: value,
            options: { color: options.color, offset: options.offset },
        });
    }
}

export class HlineHelper {
    constructor(private context: any) {}

    public get style_dashed() {
        return 'dashed';
    }
    public get style_solid() {
        return 'solid';
    }
    public get style_dotted() {
        return 'dotted';
    }

    param(source: any, index: number = 0, name?: string) {
        return Series.from(source).get(index);
    }

    //this will map to hline()
    any(price, title, color, linestyle, linewidth, editable, display) {
        return this.context.pine.plot(price, { title, color, linestyle, linewidth, editable, display });
    }
}
