// First, get the element containing the file name
const fileNameElement = document.querySelector('h1[id="file-name-id-wide"]');

// Check if the file name ends with ".zm"
if (fileNameElement && fileNameElement.textContent.trim().endsWith(".zm")) {
    const textarea = document.getElementById("read-only-cursor-text-area");
    if (textarea != null) {
        // Manually hide the textarea
        textarea.style.display = 'none';

        // Hide the div with class 'react-line-numbers-no-virtualization'
        const lineNumbersDiv = document.querySelector('.react-line-numbers-no-virtualization');
        if (lineNumbersDiv != null) {
            lineNumbersDiv.style.display = 'none';
        }

        // Create a link element for the theme CSS file
        var themeCSS = document.createElement("link");
        themeCSS.href = chrome.runtime.getURL("CodeMirror-master/theme/base16-dark.css");
        themeCSS.rel = "stylesheet";
        themeCSS.type = "text/css";

        // Append the link element to the document head
        document.head.appendChild(themeCSS);

        // Initialize CodeMirror editor after the CSS is loaded
        var editor = CodeMirror.fromTextArea(textarea, {
            lineNumbers: true,
            matchBrackets: true,
            mode: "javascript",
            readOnly: true,
            tabSize: 8,
            theme: "base16-dark",
        });
    }
}