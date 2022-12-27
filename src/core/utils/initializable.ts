export abstract class Initializable<T = unknown> {
	protected initialize?(init?: T): void {
		if (init) {
			Object.assign(this, init);
		}
	}
}
