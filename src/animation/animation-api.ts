/**
 * Interfaces for the simplified internal JS animation library
 */

// Animated Properties
export interface IAnimatedProps {
    [key: string]: number;
}

// Animation Options
export interface IAnimationOptions {
    duration: number;
    easing: string;
    delay?: number;
    restoreValues?: boolean

    begin?: () => void;
    progress?: () => void;
    complete?: () => void;
}

/**
 * API for controlling animation progress
 */
export interface IAnimationAPI {
    cancel(): void;
    finish(): void;
}
