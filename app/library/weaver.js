'use strict';


module.exports = (stringArray, sortByLength) => {

    sortByLength = sortByLength === true;

    if (sortByLength) {
        stringArray.sort((a, b) => {
            return a.length - b.length;
        });
    }

    let result = [],
        index = 0,
        lastIndex = 0;

    for (let string = 0; string < stringArray.length; string += 1) {
        let chars = stringArray[string].split('');
        for (let char = 0; char < chars.length; char += 1) {
            if (index > 0) {
                result.splice(index, 0, chars[char]);
                index += (lastIndex + 1);
            } else {
                result.push(chars[char]);
            }
        }

        lastIndex += 1;
        index = lastIndex;
    }

    return result.join('');
};