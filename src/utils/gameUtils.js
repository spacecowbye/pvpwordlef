import ANSWER_WORD_LIST from "./wordList.js";
import { Logger } from "./logger.js";


const filename = import.meta.url;
const logger = new Logger(filename);
let allowedWordsSet = new Set();




export const getRandomWordforWordle = () => {

  const n = ANSWER_WORD_LIST.length ;
  const index = Math.floor(Math.random()*n);
  const word = ANSWER_WORD_LIST[index].toLowerCase();
  return word;

}

export const isGuessValid = (attemptedGuess) => {

    if(!attemptedGuess){
      logger.error(`Need to provide ${attemptedGuess}`);
      process.exit(1);
    }
    const cleanedAttemptedGuess = attemptedGuess.trim().toLowerCase();

    return allowedWordsSet.has(cleanedAttemptedGuess);

}

async function loadWords() {
    const resp = await fetch("https://gist.githubusercontent.com/cfreshman/8b92bc418b43096094cf5d1b0eea8f84/raw/2519c8c22e3274b7a665fe11ab233a96416defc2/nyt-wordle-allowed-guesses-2026-03-06.txt");
    const data = await resp.text();
    const ALLOWED_GUESSES = data.split("\n");
    ALLOWED_GUESSES.forEach((val) => {
        const trimmed_val = val.trim().toLowerCase();
        allowedWordsSet.add(trimmed_val);
      })
    
}


export const evaluateGuessAgainstAnswer = (cleaned_guess,WORDLE_ANSWER) => {

    let result = Array(5).fill('absent',0);

    let characters_of_WORDLE_ANSWER = WORDLE_ANSWER.split('');
    let characters_of_cleaned_guesss = cleaned_guess.split('');

    logger.info(`Attempting to find green characters for ${cleaned_guess} vs ${WORDLE_ANSWER}`);
    for(let i =0;i < 5 ; i++){
      const current_char_guess = characters_of_cleaned_guesss[i];
      const current_char_wordle = characters_of_WORDLE_ANSWER[i];

      if(current_char_guess === current_char_wordle){
          result[i] = "correct";
          characters_of_WORDLE_ANSWER[i] = null;
      } 
    }
    logger.info(`Attempting to find yellow characters for ${cleaned_guess} vs ${WORDLE_ANSWER}`);
    for(let i=0 ;i < 5; i++){
      if(result[i] === "correct"){
        //already process 
        continue;
      }
      const idx = characters_of_WORDLE_ANSWER.findIndex((char) => char === characters_of_cleaned_guesss[i]);
      if(idx !== -1){
        result[i] = "present";
        characters_of_WORDLE_ANSWER[idx] = null;
      }
    }
    //payload for player 
    const guessResult = [];
    for(let i = 0 ; i < 5; i++){
      const obj = {
        "letter" : characters_of_cleaned_guesss[i],
        "status" : result[i]
      }
      guessResult.push(obj);
    }

    //payload for opponent
    const oppGuessResult = [];
    for(let i = 0 ; i < 5; i++){
      const obj = {
        "status" : result[i]
      }
      oppGuessResult.push(obj);
    }
    
    return [guessResult,oppGuessResult];
}

await loadWords();