console.log(`Loading WORDLE list client side for word verification`);

let ALLOWED_WORDS_SET = new Set();


function isValidWordleWord(word){
    let word_to_check = word.toLowerCase();
    return ALLOWED_WORDS_SET.has(word_to_check)
}



async function loadWords() {
    let resp = await fetch("https://gist.githubusercontent.com/cfreshman/8b92bc418b43096094cf5d1b0eea8f84/raw/2519c8c22e3274b7a665fe11ab233a96416defc2/nyt-wordle-allowed-guesses-2026-03-06.txt");
    let data = await resp.text();
    let ALLOWED_GUESSES = data.split("\n");
    ALLOWED_GUESSES.forEach((val) => {
        let trimmed_val = val.trim().toLowerCase();
        ALLOWED_WORDS_SET.add(trimmed_val);
    })
}


loadWords().then(() => {
    console.log(`Word list has been loaded successfully`);
})