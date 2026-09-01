console.log(`Loading WORDLE list client side for word verification`);

let ALLOWED_WORDS_SET = new Set();


function isValidWordleWord(word){
    console.log(ALLOWED_WORDS_SET);
    const word_to_check = word.toLowerCase();
    if(ALLOWED_WORDS_SET.has(word_to_check)){
        console.log(`${word_to_check} is in wordle list`);
        return true;
    }
    else{
        console.log(`${word} is not in wordle list`);
        return false;
    }
}



async function loadWords() {
    const resp = await fetch("https://gist.githubusercontent.com/cfreshman/8b92bc418b43096094cf5d1b0eea8f84/raw/2519c8c22e3274b7a665fe11ab233a96416defc2/nyt-wordle-allowed-guesses-2026-03-06.txt");
    const data = await resp.text();
    const ALLOWED_GUESSES = data.split("\n");
    ALLOWED_GUESSES.forEach((val) => {
        const trimmed_val = val.trim().toLowerCase();
        ALLOWED_WORDS_SET.add(trimmed_val);
    })
}


loadWords().then(() => {
    console.log(`Word list has been loaded successfully`);
})