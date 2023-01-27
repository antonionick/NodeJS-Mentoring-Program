export class EnumUtils {
    public static toArray<T extends object>(enumType: T): T[keyof T][] {
        return Object
            .keys(enumType)
            .filter(key => typeof key === 'string')
            .map(key => (enumType as any)[key]);
    }
}
