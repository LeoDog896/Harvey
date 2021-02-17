export abstract class Plugin {
    public abstract onEnable(): void;
    public abstract onDisable(): void;
    public onReload(): void {};
}