import { ButtonBar } from "./ButtonBar";
import { TAB_STRIP_DEFAULT_BUTTONS } from "./panel-default-buttons";


/**
 * Button Bar for TabStrip for handling scrolling and showing popup to select a tab page
 */
export class TabStripButtonBar extends ButtonBar {

    protected onInitialized(): void {
        for(const defaultBtnConfig of TAB_STRIP_DEFAULT_BUTTONS) {
            const iconButton = this.constructButtonFromConfig(defaultBtnConfig);
            this.iconButtons.push(iconButton);
        }
    }
}
