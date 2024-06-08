/**
 * This is the main library file
 */

// Re-export the necessary types
export * from "./common/constants";
export * from "./common/declarations";
export * from "./common/enumerations";
export * from "./common/events-api";
export * from "./common/panel-api";
export * from "./common/serialization";

// Re-export the necessary objects
export { DockManager } from "./facade/DockManager";
export { PanelContainer } from "./containers/PanelContainer";
export { TabbedPanelContainer } from "./containers/TabbedPanelContainer";

// Include basic CSS styles
import "./index.css";

// DEBUG: Removed when the library is completed
import { DebugHelper } from "./utils/DebugHelper";
DebugHelper.enableOptimizations(false);
