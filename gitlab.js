// Only execute if the URL contains both "gitlab" and ".zm"
function shouldExecute() {
    return window.location.href.includes('gitlab') && window.location.href.includes('.zm');
}
//Deleting specific divs to improve the UI
function deleteSpecificDivs() {
    const measureDivs = document.querySelectorAll('.CodeMirror-measure');
    const cursorsDivs = document.querySelectorAll('.CodeMirror-cursors');
    const gutterDivs = document.querySelectorAll('.CodeMirror-gutters');
    const gutterMarker = document.querySelectorAll('.CodeMirror-gutter-wrapper');
    // Selecting all <pre> elements on the page
    measureDivs.forEach(div => div.remove());
    cursorsDivs.forEach(div => div.remove());
    gutterMarker.forEach(div => div.remove());
    gutterDivs.forEach(div => div.remove());
}
function replaceWithTextarea(observer) {
    if (!shouldExecute()) {
        console.log('URL does not match criteria. Script will not execute.');
        observer.disconnect();
        return;
    }

    const codeElement = document.querySelector('code[data-testid="content"]');
    if (codeElement) {
        const textContent = codeElement.innerText;
        const textarea = document.createElement('textarea');
        textarea.value = textContent;
        textarea.style.width = '100%';
        textarea.style.height = '2000px'; // Hardcoded height for now
        const topMostDiv = codeElement.closest('.gl-flex.blob-viewer');
        if (topMostDiv) {
            const parentDiv = topMostDiv.parentNode;
            const containerDiv = document.createElement('div');
            containerDiv.style.position = 'relative';
            containerDiv.appendChild(textarea);
            parentDiv.replaceChild(containerDiv, topMostDiv);

            const htmlElement = document.documentElement;

            if (htmlElement.classList.contains('gl-light')) {

                const themeCSS = document.createElement('link');
                themeCSS.href = chrome.runtime.getURL('themes/xq-light.css');
                themeCSS.rel = 'stylesheet';
                themeCSS.type = 'text/css';
                themeCSS.id = 'codeMirrorCSS';
                document.head.appendChild(themeCSS);

                // Initialize CodeMirror on the textarea
                const editor = CodeMirror.fromTextArea(textarea, {
                    lineNumbers: true,
                    matchBrackets: true,
                    mode: "text/x-ZoomBA",
                    indentUnit: 4,
                    theme: 'xq-light',
                    readOnly: true
                });
                editor.on('blur', function () {
                    editor.save();
                });
                const preElements = document.querySelectorAll('pre');
                // Looing through each <pre> element
                preElements.forEach(pre => {
                    pre.style.backgroundColor = 'white';
                    pre.style.border = 'none';
                    pre.style.padding = '0';
                });
            }

            else {
                const themeCSS = document.createElement('link');
                themeCSS.href = chrome.runtime.getURL('themes/base16-dark.css');
                themeCSS.rel = 'stylesheet';
                themeCSS.type = 'text/css';
                themeCSS.id = 'codeMirrorCSS';
                document.head.appendChild(themeCSS);

                // Initialize CodeMirror on the textarea
                const editor = CodeMirror.fromTextArea(textarea, {
                    lineNumbers: true,
                    matchBrackets: true,
                    mode: "text/x-ZoomBA",
                    indentUnit: 4,
                    theme: 'base16-dark',
                    readOnly: true
                });
                editor.on('blur', function () {
                    editor.save();
                });
                
            }


            // Calling the function to delete specific divs after codemirro has been initialized
            deleteSpecificDivs();

            // Disconnect the observer
            observer.disconnect();
            console.log('Original div replaced with textarea and CodeMirror initialized. Observer disconnected.');
        } else {
            console.log('Top-most div not found.');
        }
    } else {
        // Used to debug
        console.log('Code element with the specified data-testid not found. Continuing to observe...');
    }
}

// Create a MutationObserver instance to watch for dynamically loaded content
const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.addedNodes.length > 0) {
            replaceWithTextarea(observer);
        }
    }
});

// Only start observing if the URL matches the criteria
if (shouldExecute()) {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Also run replaceWithTextarea immediately
    replaceWithTextarea(observer);
} else {
    console.log('URL does not match criteria. Script will not execute.');
}

// Add an event listener to run the script again on any click
document.addEventListener('click', () => {
    if (shouldExecute()) {
        replaceWithTextarea(observer);
    }
});
