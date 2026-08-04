const WORDLE_LIST_SET = new Set();
console.log(`Loading WORDLE list client side for word verification`);

let ALLOWED_WORDS_SET = new Set();


function isValidWordleWord(word){
    if(WORDLE_LIST_SET.has(word)){
        console.log(`${word} is in wordle list`);
        return true;
    }
    else{
        console.log(`${word} is not in wordle list`);
        return false;
    }
}

async function loadWords() {
    const resp = await fetch("https://gist.githubusercontent.com/cfreshman/cdcdf777450c5b5301e439061d29694c/raw/d7c9e02d45afd26e12a71b4564189a949c29e8a9/wordle-allowed-guesses.txt");
    const data = await resp.text();
    const ALLOWED_GUESSES = data.split("\n");
    ALLOWED_GUESSES.forEach((val) => {
        ALLOWED_WORDS_SET.add(val);
    })
    console.log(ALLOWED_WORDS_SET);
}

loadWords();
//isValidWordleWord("SHAKE");