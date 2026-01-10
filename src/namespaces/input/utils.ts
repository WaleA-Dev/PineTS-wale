import { parseArgsForPineParams } from '../utils';
import { InputOptions } from './types';
const INPUT_SIGNATURES = [
    ['defval', 'title', 'tooltip', 'inline', 'group', 'display'],
    ['defval', 'title', 'tooltip', 'group', 'confirm', 'display'],
    ['defval', 'title', 'tooltip', 'inline', 'group', 'confirm', 'display'],
    ['defval', 'title', 'options', 'tooltip', 'inline', 'group', 'confirm', 'display'],
    ['defval', 'title', 'minval', 'maxval', 'step', 'tooltip', 'inline', 'group', 'confirm', 'display'],
];

const INPUT_ARGS_TYPES = {
    defval: 'primitive',
    title: 'string',
    tooltip: 'string',
    inline: 'string',
    group: 'string',
    display: 'string',
    confirm: 'boolean',
    options: 'array',
    minval: 'number',
    maxval: 'number',
    step: 'number',
};

export function parseInputOptions(args: any[]): Partial<InputOptions> {
    return parseArgsForPineParams<Partial<InputOptions>>(args, INPUT_SIGNATURES, INPUT_ARGS_TYPES);
}

export function resolveInput(context: any, options: Partial<InputOptions>) {
    // If we have a runtime input value for this title, use it
    // We check against context.inputs if it exists
    if (options.title && context.inputs && context.inputs[options.title] !== undefined) {
        return context.inputs[options.title];
    }
    
    // Otherwise return default value
    return options.defval;
}
