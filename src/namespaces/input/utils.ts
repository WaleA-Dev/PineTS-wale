import { InputOptions } from './types';
const INPUT_ARGS_OPTIONS = [
    ['defval', 'title', 'tooltip', 'inline', 'group', 'display'],
    ['defval', 'title', 'tooltip', 'group', 'confirm', 'display'],
    ['defval', 'title', 'tooltip', 'inline', 'group', 'confirm', 'display'],
    ['defval', 'title', 'options', 'tooltip', 'inline', 'group', 'confirm', 'display'],
    ['defval', 'title', 'minval', 'maxval', 'step', 'tooltip', 'inline', 'group', 'confirm', 'display'],
];
const INPUT_ARGS_TYPE_CHECK = {
    defval: (arg) => typeof arg !== 'object',
    title: (arg) => typeof arg === 'string',
    tooltip: (arg) => typeof arg === 'string',
    inline: (arg) => typeof arg === 'string',
    group: (arg) => typeof arg === 'string',
    display: (arg) => typeof arg === 'string',
    confirm: (arg) => typeof arg === 'boolean',
    options: (arg) => Array.isArray(arg),
    minval: (arg) => typeof arg === 'number',
    maxval: (arg) => typeof arg === 'number',
    step: (arg) => typeof arg === 'number',
};
export function parseInputOptions(args: any[]) {
    const options: InputOptions = {};

    let options_arg = {};

    const valid = new Array(INPUT_ARGS_OPTIONS.length).fill(true);
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (typeof arg === 'object') {
            options_arg = arg;
            break;
        }

        const curOptions = INPUT_ARGS_OPTIONS.map((e, idx) => (valid[idx] ? e[i] : undefined));

        for (let o = 0; o < curOptions.length; o++) {
            const optionName = curOptions[o];
            if (optionName === undefined) {
                valid[o] = false;
                continue;
            }

            if (INPUT_ARGS_TYPE_CHECK[optionName](arg)) {
                options[optionName] = arg;
            } else {
                valid[o] = false;
            }
        }
    }

    return { ...options_arg, ...options };
}
