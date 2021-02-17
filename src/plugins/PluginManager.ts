import { Plugin } from "./Plugin";

export class PluginManager {

    private registeredPackages: Map<string, Plugin>;

    constructor() {
        this.registeredPackages = new Map<string, Plugin>();
    }

    public registerPlugin(name: string, plugin: Plugin) {
        this.registeredPackages.set(name, plugin);
        plugin.onEnable();  // Enable the package.
    }

    public installPlugin() {
        
    }
}