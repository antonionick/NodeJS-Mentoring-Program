export class Initializable<T = unknown> {
    constructor(init: T) {
        this.assignInitValues(init);
    }

    protected assignInitValues(data: T): void {
        Object.assign(this, data);
    }
}
