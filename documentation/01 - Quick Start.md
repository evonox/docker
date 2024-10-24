# Quick Start Guide

We have prepared the environment in the previous chapter. Now we will have a look at the basic quick start
of how to use the DockerTS Library.

First of all, you need to create and an empty HTML page template that looks similar like in the figure below.

```html
<!DOCTYPE html>
<html>
    <head>
        <title>DockerTS Library</title>
        <style>
            html, body, main {
                padding: 0;     // Remove the user agent's defaults
                margin: 0;      // Remove the user agent's defaults
                height: 100%;   // To make it the same height as the browser window
            }
        </style>
    </head>    
    <body>
        <main id="main"></main>
    </body>
</html>
```
In the figure above we create an empty **main** element which will be the container for our DockerTS Library.

> Do not forget to remove user agent default CSS styles like paddings and margins from the elements 
> as given in the **style** tag. It is also important to include the height property to make the elements
> the same height as the browser window.

Next, we need to tell Webpack that it should use our new HTML page. We need to adjust **webpack.config.js** file as follows:
```javascript
    /* ..... */

    plugins: [
        new HtmlWebpackPlugin({
            title: 'Testing Project',
            template: path.resolve("./path/to/index.html")
        }),
    ],

    /* ..... */
```
Now we can install the DockerTS library.
```bash
npm install docker-ts
```
And we can create our new empty docking view with the following code.
```typescript
import { DockManager } from "docker-ts";

// First get our root element that will serve as the container 
const container = document.getElementById("main");

// Create the facade class for the docking library
const dockManager = new DockManager(container);

// DO NOT FORGET to call initialize
dockManager.initialize();

```
The first class we come across is the **DockManager**. It is the facade class wrapping all the internal
functionality of the docking library. 

Basically, what we need to do is to get reference to the HTMLElement that will work as the container and
pass it to the constructor of **DockManager** class.

Then we need to invoke **initialize()** method and we are ready to go.

What happens, DockManager class will create a special purpose panel called **DocumentManager** that
manages documents. DocumentManager is the only layout facility that is always present and can contain
no panels.

In the next chapter it is described how to create your first panel using the panel factory function.
