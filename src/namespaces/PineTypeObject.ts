export class PineTypeObject {
    public get __def__() {
        return this._definition;
    }

    constructor(private _definition: Record<string, string>, public context: any) {
        for (let key in _definition) {
            this[key] = _definition[key];
        }
    }

    copy() {
        return new PineTypeObject(this.__def__, this.context);
    }

    toString() {
        const obj = {};
        for (let key in this.__def__) {
            obj[key] = this[key];
        }
        return JSON.stringify(obj);
    }
}
