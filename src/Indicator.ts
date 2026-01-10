// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2025 Alaa-eddine KADDOURI

export class Indicator {
    public source: Function | String;
    public inputs: Record<string, any>;

    constructor(source: Function | String, inputs: Record<string, any> = {}) {
        this.source = source;
        this.inputs = inputs;
    }
}
