import { ContextMenuConfig } from "../api/ContextMenuConfig";
import { CLOSE_BUTTON_ICON, COLLAPSE_BUTTON_ICON, EXPAND_BUTTON_ICON, MAXIMIZE_BUTTON_ICON, MINIMIZE_BUTTON_ICON, PANEL_ACTION_CLOSE, PANEL_ACTION_COLLAPSE, PANEL_ACTION_EXPAND, PANEL_ACTION_MAXIMIZE, PANEL_ACTION_MINIMIZE, PANEL_ACTION_RESTORE, PANEL_ACTION_SHOW_POPUP, PANEL_ACTION_TOGGLE_PIN, PIN_PANEL_ICON, POPUP_WINDOW_ICON, RESTORE_BUTTON_ICON } from "../core/panel-default-buttons";
import { PanelContainer } from "./PanelContainer";

export class ContextMenuFactory {

    static createDefaultContextMenu(panel: PanelContainer): ContextMenuConfig {
        const labelConfiguration = panel.getDockManager().config.labels;
        const config = new ContextMenuConfig();

        // Check Close Action
        if(panel.isActionAllowed(PANEL_ACTION_CLOSE)) {
            config.appendMenuItem({
                displayOrder: 100,
                icon: CLOSE_BUTTON_ICON,
                title: labelConfiguration.closeLabel,
                actionName: PANEL_ACTION_CLOSE
            });
        }
        // Check Maximize Action        
        if(panel.isActionAllowed(PANEL_ACTION_MAXIMIZE)) {
            config.appendMenuItem({
                displayOrder: 200,
                icon: MAXIMIZE_BUTTON_ICON,
                title: labelConfiguration.maximizeLabel,
                actionName: PANEL_ACTION_MAXIMIZE
            });
        }
        // Check Restore Action
        if(panel.isActionAllowed(PANEL_ACTION_RESTORE)) {
            config.appendMenuItem({
                displayOrder: 300,
                icon: RESTORE_BUTTON_ICON,
                title: labelConfiguration.restoreLabel,
                actionName: PANEL_ACTION_RESTORE
            });            
        }
        // Check Minimize Action
        if(panel.isActionAllowed(PANEL_ACTION_MINIMIZE)) {
            config.appendMenuItem({
                displayOrder: 400,
                icon: MINIMIZE_BUTTON_ICON,
                title: labelConfiguration.minimizeLabel,
                actionName: PANEL_ACTION_MINIMIZE
            });            
        }
        // Check Expand Action
        if(panel.isActionAllowed(PANEL_ACTION_EXPAND)) {
            config.appendMenuItem({
                displayOrder: 500,
                icon: EXPAND_BUTTON_ICON,
                title: labelConfiguration.expandLabel,
                actionName: PANEL_ACTION_EXPAND
            });            
        }
        // Check Collapse Action
        if(panel.isActionAllowed(PANEL_ACTION_COLLAPSE)) {
            config.appendMenuItem({
                displayOrder: 600,
                icon: COLLAPSE_BUTTON_ICON,
                title: labelConfiguration.collapseLabel,
                actionName: PANEL_ACTION_COLLAPSE
            });            
        }
        // Check Show in Popup Window Action
        if(panel.isActionAllowed(PANEL_ACTION_SHOW_POPUP)) {
            config.appendMenuItem({
                displayOrder: 700,
                icon: POPUP_WINDOW_ICON,
                title: labelConfiguration.showInPopupLabel,
                actionName: PANEL_ACTION_SHOW_POPUP
            });            
        }
        // Check Toggle Pin / Unpin Panel
        if(panel.isActionAllowed(PANEL_ACTION_TOGGLE_PIN)) {
            config.appendMenuItem({
                displayOrder: 800,
                icon: PIN_PANEL_ICON,
                title: labelConfiguration.togglePinLabel,
                actionName: PANEL_ACTION_TOGGLE_PIN
            });            
        }

        return config;
    }
}
