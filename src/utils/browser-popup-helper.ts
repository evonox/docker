import { IRect } from "../common/dimensions";
import { ArrayUtils } from "./ArrayUtils";

/**
 * Default Popup Window CSS style
 */
const DEFAULT_POPUP_WINDOW_STYLE = `
    html {
        overflow: hidden;
        position: fixed;
        width: 100%;
        height: 100%;
    }
    body {
        height: 100%;
        width: 100%;
        padding: 0;
        margin: 0;
        display: grid;
    }
`;

/**
 * Interface for communication with the popup window
 */
export interface IBrowserPopupHelperOptions {
    title: string;
    windowRect: IRect;
    onClosed?: () => void;
    onPopupWindowClosed?: () => void;
    onFocused?: (e: FocusEvent) => void;
    onBlurred?: (e: FocusEvent) => void;
}

/**
 * Browser Helper for opening an HTMLElement inside a popup window
 */
export class BrowserPopupHelper {

    private static isUnloadHandlerAttached = false;
    private static openedPopupWindows: Window[] = [];

    static showElementInBrowserWindow(targetElement: HTMLElement, dependentElements: HTMLElement[] , 
        options: IBrowserPopupHelperOptions): Window {       
        // Open the popup window
        const popupWindow = this.openPopupWindow(options.windowRect);
        // Attach onFocus and onBlur handlers as well as onUnload 
        popupWindow.onfocus = e => options.onFocused?.(e);
        popupWindow.onblur = e => options.onBlurred?.(e);
        popupWindow.onunload = () => {
            ArrayUtils.removeItem(this.openedPopupWindows, popupWindow);            
            options.onPopupWindowClosed?.()
        }
        // Transfer all the necessary CSS styles
        this.transferAllCSSStyles(popupWindow);
        // Apply the window title
        this.applyWindowTitle(popupWindow, options.title);

        // TODO: BACKUP WEB-COMPONENT CSS STYLES & ADOPT THEM

        // Remove & Append the target element to the popup window document
        targetElement.remove();
        targetElement.setAttribute("style", "left: 0; top: 0; width: 100%; height: 100%");
        popupWindow.document.body.appendChild(targetElement);

        // Remove & Append Dependent Elements - e.g. Nested Containers of TabbedPanelContainer
        dependentElements.forEach(element => {
            element.remove()
            popupWindow.document.body.appendChild(element);
        });

        // Add the popup window to the list
        this.openedPopupWindows.push(popupWindow);
        // Finally attach the unload handlers to close all popups
        this.attachMainWindowUnloadHandler();

        return popupWindow;
    }

    // Main window unload handler
    private static attachMainWindowUnloadHandler() {
        if(this.isUnloadHandlerAttached)
            return;
        this.isUnloadHandlerAttached = true;
        window.addEventListener("unload", () => this.closeAllOpenedPopupWindows());
    }

    // Close all popup windows
    private static closeAllOpenedPopupWindows() {
        const popupWindows = [...this.openedPopupWindows];
        for(const popupWindow of popupWindows) {
            // Note: We need to prevent the record behavior
            popupWindow.onunload = undefined;
            popupWindow.close();
        }
        this.openedPopupWindows = [];
    }

    // Creates the <title> element with the panel container title
    private static applyWindowTitle(popupWindow: Window, windowTitle: string) {
        const titleEl = popupWindow.document.createElement("title");
        titleEl.innerText = windowTitle;
        popupWindow.document.head.appendChild(titleEl);
    }

    // Transfers all the CSS styles from the main window
    private static transferAllCSSStyles(popupWindow: Window) {
        // Query all CSS link elements
        const cssStyles = [...document.head.querySelectorAll('link')].map(x => x.cloneNode(true));
        // Adopt the cloned CSS styles into the popup window
        for (const cssStyle of cssStyles) {
            popupWindow.document.head.appendChild(popupWindow.document.adoptNode(cssStyle));
        }
        // Query all inline CSS styles
        const cssInlineStyles = [...document.head.querySelectorAll("style")].map(x => x.cloneNode(true));
        cssInlineStyles.forEach(cssStyle => {
            popupWindow.document.head.appendChild(popupWindow.document.adoptNode(cssStyle));
        })
        // Inject the default CSS popup window style
        const  cssDefaultStyle = popupWindow.document.createElement("style");
        cssDefaultStyle.innerText = DEFAULT_POPUP_WINDOW_STYLE;
        popupWindow.document.head.appendChild(cssDefaultStyle);
    }

    // Opens the new popup window by the given parameters
    private static openPopupWindow(bounds: IRect): Window {
        const featuresString =`popup=yes,left=${bounds.x},top=${bounds.y},width=${bounds.w},height=${bounds.h}`;
        return window.open("about:blank", undefined, featuresString);
    }
}
