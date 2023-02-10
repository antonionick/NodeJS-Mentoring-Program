import { LogInfo } from '@common/models/log-info.models';

export function logInfoData(ResultClass: any): Function {
    return function __logInfoData(
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const sourceValue = descriptor.value;
        descriptor.value = async function __logInfoDataHandler(
            ...args: unknown[]
        ): Promise<any> {
            const startExecution = Date.now();
            const result = await sourceValue.apply(this, args);
            const endExecution = Date.now();

            const updatedResult = new ResultClass({
                ...result,
                logInfo: new LogInfo({
                    className: target.constructor.name,
                    methodName: propertyKey,
                    parameters: args,

                    executionTime: endExecution - startExecution,
                }),
            });
            return updatedResult;
        }
    }
}
