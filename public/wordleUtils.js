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
    const resp = await fetch("/assets/allowed_words.txt");
    const data = await resp.text();
    const ALLOWED_GUESSES = data.split("\n");
    ALLOWED_GUESSES.forEach((val) => {
        ALLOWED_WORDS_SET.add(val);
    })
    console.log(ALLOWED_WORDS_SET);
}

loadWords();
//isValidWordleWord("SHAKE");