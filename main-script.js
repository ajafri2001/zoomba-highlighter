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
                    themeCSS.href = chrome.runtime.getURL("base16-dark.css");
                    themeCSS.rel = "stylesheet";
                    themeCSS.type = "text/css";
                    document.head.appendChild(themeCSS);

                    editor = CodeMirror.fromTextArea(textarea, {
                        lineNumbers: true,
                        matchBrackets: true,
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
