# Code is Work in Progress

### ATTENTION!!!

THIS CODE DOES NOT YET PROVIDE AN EXACT COPY OF THE DEFAULT FONTS PROVIDED BY GITHUB. I VIEW THIS AS A TRIVIAL ISSUE AND PLAN TO ADDRESS IT LATER, ONCE EVERYTHING ELSE IS FUNCTIONING SMOOTHLY.

I have aimed to make the entire project as simple as possible. The code is intentionally left open-ended to accommodate future changes, so any additions should (hopefully) not require refactoring.

### How to Run:

1.  Clone the repository.
2.  Open Chrome and click the button with three vertical dots in the top-right corner of the browser.
3.  Go to Extensions -> Manage Extensions.
4.  Enable Developer Mode (little blue toggle at the top-right corner)
5.  From the new dropdown menu, click "Load unpacked."
6.  Select the folder you cloned, navigate inside it, and click "Select Folder" (Chrome looks at your manifest.json file first).
7.  You should now see syntax highlighting for your .zm files.

### How It Works:

The way this code works is by initalizing/updating/destroying the CodeMirror instance.

Since there was syntax highlighting available for all language types except for zoomba,

I destroy the instance everytime a user clicks on files other than those that end in ".zm" since we don't have a need for those.

why not just update the text you ask? It was leading to a 1000 bugs so I just started reinitializing it instead. Plus the extension size non-compressed is 2.6 MB, which only executes if 
the user changes files. So non-existant performance issue for all practical purposes.
 
### Structure of the Browser Extension:

 __main-script.js__, Contains the main logic of the extension. It selectively looks for files ending in .zm and applies CodeMirror's styling to them.

 __javascript.js__ folder as well as __codemirror-lib.js__ file, These are third-party libraries borrowed for this project. They generally should not be modified unless you are familiar with them. The code is well-documented, so if you choose to modify it, you should be able to do so with a reasonable degree of safety.

 __base16-dark.css__, Contains the styling for the textarea block. This file can also be used to change the colors of the syntax highlighter.

 __manifest.json__, This is the entry point of the extension. Chrome looks for this file first, and anything specified in it is loaded into the browser. It's fairly intuitive if you read the JSON.
