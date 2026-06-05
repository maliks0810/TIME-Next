import { WidgetInstanceLike, WidgetDefinitionLike } from '../types/widget';
/**
 This util function is used to get a value from config by key.
 If config parameters do not have the value, it will return the value in the definiton default.
 If there is no value in definition default, returns fallback value passed to function.
 */

export const returnConfigOrDefaultByKey = (
    config: WidgetInstanceLike['config'],
    definition: WidgetDefinitionLike['configSchema'],
    key: string,
    fallback: string | number | boolean
) => {
    // If for some reason config is undefined or null
    if (!config) {
        if (!definition) return fallback;
        if (!definition.properties) return fallback;

        // Check for value in definition properties
        return definition.properties[key] || fallback;
    }
    // If for some reason config PARAMS is undefined or null
    if (!config.params) {
        if (!definition) return fallback;
        if (!definition.properties) return fallback;

        // Check for value in definition properties
        return definition.properties[key] || fallback;
    }

    // Return value from config params or the fallback value
    if (config.params[key] !== undefined) return config.params[key];
    return fallback;
};
