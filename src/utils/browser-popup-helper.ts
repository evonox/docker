import { IRect } from "../common/dimensions";
import { IPoint } from "./overlay-helper";

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
    windowOffset: IPoint;
    onClosed?: () => void;
    onPopupWindowClosed?: () => void;
    onFocused?: (e: FocusEvent) => void;
    onBlurred?: (e: FocusEvent) => void;
}

/**
 * Browser Helper for opening an HTMLElement inside a popup window
 */
export class BrowserPopupHelper {

    static showElementInBrowserWindow(targetElement: HTMLElement, dependentElements: HTMLElement[] , 
        options: IBrowserPopupHelperOptions): Window {
        // Compute the new window position and dimensions
        const targetBounds = targetElement.getBoundingClientRect();
        const windowBounds: IRect = {
            x: targetBounds.left + options.windowOffset.x,
            y: targetBounds.top + options.windowOffset.y,
            w: targetBounds.width,
            h: targetBounds.height
        };
        
        // Open the popup window
        const popupWindow = this.openPopupWindow(windowBounds);
        // Attach onFocus and onBlur handlers as well as onUnload 
        popupWindow.onfocus = e => options.onFocused?.(e);
        popupWindow.onblur = e => options.onBlurred?.(e);
        popupWindow.onunload = () => options.onPopupWindowClosed?.();
        // Transfer all the necessary CSS styles
        this.transferAllCSSStyles(popupWindow);
        // Apply the window title
        this.applyWindowTitle(popupWindow, options.title);

        // TODO: BACKUP WEB-COMPONENT CSS STYLES & ADOPT THEM

        // Adopt & Append the target element to the popup window document
        targetElement.remove();
        targetElement = popupWindow.document.adoptNode(targetElement)
        targetElement.setAttribute("style", "left: 0; top: 0; width: 100%; height: 100%");
        popupWindow.document.body.appendChild(targetElement);

        // Adopt & Append Dependent Elements - e.g. Nested Containers of TabbedPanelContainer
        dependentElements.forEach(element => {
            element.remove()
            element = popupWindow.document.adoptNode(element);
            popupWindow.document.body.appendChild(element);
        });

        return popupWindow;
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
        const cssStyles = [...document.head.querySelectorAll('link')].map(x => x.cloneNode());
        // Adopt the cloned CSS styles into the popup window
        for (const cssStyle of cssStyles) {
            popupWindow.document.head.appendChild(popupWindow.document.adoptNode(cssStyle));
        }
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
