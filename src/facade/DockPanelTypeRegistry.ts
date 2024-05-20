import type { PanelFactoryFunction, ViewInstanceType, ViewKind } from "../common/panel-api";
import type { PanelContainer } from "../containers/PanelContainer";


export interface PanelTypeMetadata {
    name: string;
    viewKind: ViewKind;
    instanceType: ViewInstanceType;
    factoryFn: PanelFactoryFunction;
}

class InstanceRegistry {

    private instances: PanelContainer[] = [];

    constructor(private name: string) {}

    queryInstances(): PanelContainer[] {
        return [...this.instances];
    }

    getPanelTypeName() {
        return this.name;
    }

    containsInstances(): boolean {
        return this.instances.length > 0;
    }

    containsViewInstance(instance: PanelContainer): boolean {
        return this.instances.includes(instance);
    }

    addViewInstance(instance: PanelContainer) {
        if(this.containsViewInstance(instance) === false) {
            this.instances.push(instance);
        }
    }

    removeViewInstance(instance: PanelContainer) {
        const index = this.instances.indexOf(instance);
        if(index >= 0) {
            this.instances.splice(index, 1);
        }
    }
}


export class DockPanelTypeRegistry {

    private panelTypes: PanelTypeMetadata[] = [];
    private instanceRegistries: InstanceRegistry[] = [];

    registerPanelType(metadata: PanelTypeMetadata): void {
        if(this.isPanelTypeRegistered(metadata.name)) {
            throw new Error(`ERROR: Panel type ${metadata.name} is already registered.`);
        }
        this.panelTypes.push(metadata);
        this.instanceRegistries.push(new InstanceRegistry(metadata.name));
    }

    isPanelTypeRegistered(name: string): boolean {
        return this.getPanelTypeMetadata(name) !== undefined;
    }

    getPanelTypeMetadata(name: string): PanelTypeMetadata {
        return this.panelTypes.find(pt => pt.name === name)       ;
    }

    hasPanelTypeAnyInstances(panelTypeName: string) {
        return this.getRegistryByPanelTypeName(panelTypeName).containsInstances();
    }

    registerViewInstance(panelTypeName: string, instance: PanelContainer) {
        const registry = this.getRegistryByPanelTypeName(panelTypeName);
        registry.addViewInstance(instance);
    }

    unregisterViewInstance(instance: PanelContainer) {
        for(const registry of this.instanceRegistries) {
            if(registry.containsViewInstance(instance)) {
                registry.removeViewInstance(instance);
                break;
            }
        }
    }

    getViewInstances(panelTypeName: string): PanelContainer[] {
        const registry = this.getRegistryByPanelTypeName(panelTypeName);
        return registry.queryInstances();
    }

    private getRegistryByPanelTypeName(panelTypeName: string): InstanceRegistry {
        return this.instanceRegistries.find(reg => reg.getPanelTypeName() === panelTypeName);
    }
}
