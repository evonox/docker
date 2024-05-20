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
In the figure above we create an empty **main ** element which will be the container for our DockerTS Library.

>>> Do not forget to remove user agent default CSS styles like paddings and margins from the elements 
>>> as given in the **style** tag. It is also important to include the height property to make the elements
>>> the same height as the browser window.

