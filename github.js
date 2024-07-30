/* ATTENTION!!! THIS CODE WONT GIVE YOU AN EXACT COPY OF DEFAULT FONTS PROVIDED BY GITHUB YET. I SEE IT AS A TRIVIAL ISSUE SO I DECIDED I'LL WORK ON IT LATER
WHEN EVERYTHING WORKS SMOOTHLY FIRST.
I have tried to make the entire project as SIMPLE as possible. 

The code is left open-ended just in case for future changes. So nothing added should (hopefully) require refactoring.  

The way this code works is by Initalizing/Updating/Destroying the CodeMirror instance. Since there was syntax highlighting available for all language types except
for zoomba, I destroy the instance everytime a user clicks on files other than those that end in ".zm" since we don't have a need for those, why not just update the
text you ask? It was leading to a 1000 bugs so I just started reinitializing it instead. Plus the extension size non-compressed is 2.6 MB, which only executes if 
the user changes files. So non-existant performance issue for all practical purposes. 
*/

let editor;
let lastFileName = '';
let lastContent = '';

function initOrUpdateCodeMirror() {
    const fileNameElement = document.querySelector('h1[id="file-name-id-wide"]');
    const textarea = document.getElementById("read-only-cursor-text-area");

    if (fileNameElement && textarea) {
        const currentFileName = fileNameElement.textContent.trim();
        const currentContent = textarea.value;

        if (currentFileName.endsWith(".zm")) {
            // Handle .zm files with CodeMirror
            if (currentFileName !== lastFileName || currentContent !== lastContent) {
                lastFileName = currentFileName;
                lastContent = currentContent;

                // Hide the original textarea and line numbers
                textarea.style.display = 'none';
                const lineNumbersDiv = document.querySelector('.react-line-numbers-no-virtualization');
                if (lineNumbersDiv) {
                    lineNumbersDiv.style.display = 'none';
                }

                if (!editor) {
                    // Create CodeMirror instance if it doesn't exist
                    const themeCSS = document.createElement("link");
                    themeCSS.href = chrome.runtime.getURL("themes/base16-dark.css");
                    themeCSS.rel = "stylesheet";
                    themeCSS.type = "text/css";
                    document.head.appendChild(themeCSS);

                    editor = CodeMirror.fromTextArea(textarea, {
                        lineNumbers: true,
                        matchBrackets: true,
                        mode : "text/x-ZoomBA",
                        readOnly: true,
                        tabSize: 8,
                        theme: "base16-dark",
                    });
                } else {
                    // Update existing CodeMirror instance
                    editor.setValue(currentContent);
                }
            }
        } else {
            // Handle non-.zm files by displaying the original textarea
            if (editor) {
                // Destroy the CodeMirror instance
                editor.toTextArea();
                editor = null;
            }
            textarea.style.display = 'block';
            const lineNumbersDiv = document.querySelector('.react-line-numbers-no-virtualization');
            if (lineNumbersDiv) {
                lineNumbersDiv.style.display = 'block';
            }
        }
    }
}

// Function to handle the "Blame" button click
function handleBlameButtonClick() {
    if (editor) {
        // Destroy the CodeMirror instance
        editor.toTextArea();
        editor = null;
    }
    const textarea = document.getElementById("read-only-cursor-text-area");
    if (textarea) {
        textarea.style.display = 'block';
    }
    const lineNumbersDiv = document.querySelector('.react-line-numbers-no-virtualization');
    if (lineNumbersDiv) {
        lineNumbersDiv.style.display = 'block';
    }
}

// Initial setup
initOrUpdateCodeMirror();

// Observe changes in the document
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
            initOrUpdateCodeMirror();
        }
    });
});

// Start observing the body or a specific element
observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});

// Add event listener to the "Blame" button
const blameButton = document.querySelector('button[aria-current="true"]');
if (blameButton) {
    blameButton.addEventListener('click', handleBlameButtonClick);
}
