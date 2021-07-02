"use strict";

var onOutsideClickFunctions = {};

window.blazoredTypeahead = {
    assemblyname: "Blazored.Typeahead",
    setFocus: function (element) {
        if (element && element.focus) element.focus();
    },
    // No need to remove the event listeners later, the browser will clean this up automagically.
    addKeyDownEventListener: function (element) {
        if (element) {
            element.addEventListener('keydown', function (event) {
                var key = event.key;

                if (key === "Enter") {
                    event.preventDefault();
                }
            });
        }
    },
    onOutsideClickClear: function (element) {

        if (element == null) {
            return;
        }

        var bId = "";
        for (var clearCount = 0; clearCount < element.attributes.length; clearCount++) {
            var a = element.attributes[clearCount];
            if (a.name.startsWith('_bl_')) {
                bId = a.name;
                break;
            }
        }

        var func = onOutsideClickFunctions[bId];
        if (func == null || func == "undefined") {
            return;
        }
        window.removeEventListener("click", func);
        onOutsideClickFunctions[bId] = null;
    },
    onOutsideClick: function (searchTextElement, dotnetRef, methodName, clearOnFire) {

        if (searchTextElement == null) {
            return;
        }

        var bId = "";//get the blazor internal ID to distinguish different components
        for (var clearCount = 0; clearCount < searchTextElement.attributes.length; clearCount++) {
            var a = searchTextElement.attributes[clearCount];
            if (a.name.startsWith('_bl_')) {
                bId = a.name;
                break;
            }
        }

        blazoredTypeahead.onOutsideClickClear(searchTextElement); //clean up just in case

        var func = (e) => {
            var parent = e.target;
            while (parent != null) {
                if (parent.classList != null && parent.classList.contains('blazored-typeahead')) {
                    var hasSearch = parent.contains(searchTextElement); //check if this is the same typeahead parent element
                    if (hasSearch) {
                        return; //we're still in the search so don't fire
                    }
                }
                parent = parent.parentNode;
            }

            dotnetRef.invokeMethodAsync(methodName);
            if (clearOnFire) { //could also add a check to see if the search element is missing on the DOM to force cleaning up the function?
                blazoredTypeahead.onOutsideClickClear(searchTextElement);
            }
        };
        onOutsideClickFunctions[bId] = func; //save a reference to the click function
        window.addEventListener("click", func);
    }
};
