ATTENTION!!! THIS CODE WONT GIVE YOU AN EXACT COPY OF DEFAULT FONTS PROVIDED BY GITHUB YET. I SEE IT AS A TRIVIAL ISSUE SO I DECIDED I'LL WORK ON IT LATER
WHEN EVERYTHING WORKS SMOOTHLY FIRST.

I have tried to make the entire project as SIMPLE as possible. 

The code is left open-ended just in case for future changes. So nothing added should (hopefully) require refactoring.  

The way this code works is by Initalizing/Updating/Destroying the CodeMirror instance. Since there was syntax highlighting available for all language types except
for zoomba, I destroy the instance everytime a user clicks on files other than those that end in ".zm" since we don't have a need for those, why not just update the
text you ask? It was leading to a 1000 bugs so I just started reinitializing it instead. Plus the extension size non-compressed is 2.6 MB, which only executes if 
the user changes files. So non-existant performance issue for all practical purposes. 
